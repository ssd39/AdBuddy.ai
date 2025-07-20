from typing import Any, Dict, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

from app.models.user import User
from app.services.auth import get_current_active_user
from app.db.client import get_supabase_client, get_async_supabase_client
from app.core.config import settings

router = APIRouter()

class CreateConversationRequest(BaseModel):
    """Request model for creating a Tavus conversation"""
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    conversation_name: Optional[str] = None

class ConversationResponse(BaseModel):
    """Response model for Tavus conversation"""
    conversation_id: str
    conversation_url: str
    status: Optional[str] = None

class TranscriptMessage(BaseModel):
    """Model for a single message in a transcript"""
    role: str  # 'user' or 'assistant'
    content: str

class TavusCallbackProperties(BaseModel):
    """Properties model for Tavus callback data"""
    replica_id: Optional[str] = None
    transcript: Optional[list[TranscriptMessage]] = None
    # Add other properties as needed

class TavusCallbackData(BaseModel):
    """Tavus callback data model based on Tavus webhooks documentation"""
    conversation_id: str
    webhook_url: str
    event_type: str  # 'application.transcription_ready', 'system.replica_joined', etc.
    message_type: str  # 'system' or 'application'
    timestamp: str
    properties: Optional[TavusCallbackProperties] = None

@router.post("/create-conversation", response_model=ConversationResponse)
async def create_conversation(
    request: CreateConversationRequest,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a new Tavus conversation for video onboarding
    """
    import httpx
    import uuid
    
    # Generate a unique conversation ID for tracking
    conversation_id = str(uuid.uuid4())
    
    # Define the callback URL for Tavus to notify when the conversation is complete
    callback_url = f"{settings.BACKEND_URL}/api/v1/tavus/callback"
    
    try:
        # Create a conversation in Tavus API
        async with httpx.AsyncClient() as client:
            # Build the request payload according to Tavus API docs
            payload = {
                "persona_id": settings.TAVUS_PERSONA_ID,  # Required field
                "replica_id":   settings.TAVUS_REPLICA_ID,
                "callback_url": callback_url,
                # Use provided conversation name or generate one
                "conversation_name": request.conversation_name or f"Onboarding for {request.email}"
            }
            print(payload)
            
            response = await client.post(
                "https://tavusapi.com/v2/conversations",
                headers={
                    "x-api-key": settings.TAVUS_API_KEY,
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            print(f"Tavus API response status: {response.status_code}")
            print(f"Tavus API response: {response.text}")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create Tavus conversation: {response.text}"
                )
            
            conversation_data = response.json()
            print(conversation_data)
            # Store the conversation in the database
            supabase = await get_async_supabase_client()
            
            # First, check if tavus_conversations table exists and create it if not
            try:
                # Prepare the conversation data
                conversation_db_data = {
                    "user_id": current_user.id,
                    "email": request.email,
                    "status": conversation_data.get("status", "created")
                }
                
                # Add conversation IDs
                if "conversation_id" in conversation_data:
                    conversation_db_data["conversation_id"] = conversation_data["conversation_id"]
                else:
                    # Use our tracking ID if the API doesn't provide one
                    conversation_db_data["conversation_id"] = conversation_id
                    
                # Add conversation URL if available
                if "conversation_url" in conversation_data:
                    conversation_db_data["conversation_url"] = conversation_data["conversation_url"]
                
                # Use UUID for tavus_tracking_id
                # Note: Some databases might require string format for UUID
                try:
                    import uuid
                    uuid_obj = uuid.UUID(conversation_id)
                    conversation_db_data["tavus_tracking_id"] = str(uuid_obj)
                except ValueError:
                    # If not a valid UUID, store as string
                    conversation_db_data["tavus_tracking_id"] = conversation_id
                
                # Add timestamp
                conversation_db_data["created_at"] = datetime.now(timezone.utc).isoformat()
                
                print("Inserting into tavus_conversations table:")
                print(conversation_db_data)
                
                # Insert the record
                result = await supabase.table("tavus_conversations").insert(conversation_db_data).execute()
                print("Database insert result:", result)
                
            except Exception as db_error:
                # Log the error but continue execution
                print(f"Error inserting into database: {str(db_error)}")
                import traceback
                print(traceback.format_exc())
            
            # Prepare the response with safe fallbacks
            response_data = {
                "conversation_id": conversation_data.get("conversation_id", conversation_id),
                "conversation_url": conversation_data.get("conversation_url", ""),
                "status": conversation_data.get("status", "created")
            }
            
            print("Returning response:", response_data)
            return response_data
            
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error creating Tavus conversation: {str(e)}\n{traceback_str}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating Tavus conversation: {str(e)}"
        )

async def process_tavus_callback(data: TavusCallbackData) -> None:
    """
    Process Tavus callback data in the background
    This function only stores the transcript data without any extraction logic
    """
    supabase = await get_async_supabase_client()
    
    try:
        print(f"Processing Tavus callback event: {data.event_type}")
        
        # Get conversation by ID
        conv_result = await supabase.table("tavus_conversations").select("*").eq(
            "conversation_id", data.conversation_id
        ).execute()
        
        # If conversation not found, log and return
        if not conv_result.data or len(conv_result.data) == 0:
            print(f"No conversation found with ID: {data.conversation_id}")
            return
            
        # Process application.transcription_ready events
        if data.event_type == "application.transcription_ready":
            # Get transcript from properties
            transcript_messages = data.properties.transcript if data.properties and data.properties.transcript else []
            
            # Convert transcript messages to string format for storage
            full_transcript = ""
            for msg in transcript_messages:
                full_transcript += f"{msg.role}: {msg.content}\n"
            
            # Also store as JSON for structured access
            transcript_json = [{"role": msg.role, "content": msg.content} for msg in transcript_messages]
            
            # Update conversation with transcript
            update_data = {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "transcript": full_transcript,
                "metadata": {"transcript_structured": transcript_json},
                "event_type": data.event_type,
                "webhook_url": data.webhook_url,
                "is_processed": True
            }
            
            # Update the database
            result = await supabase.table("tavus_conversations").update(update_data).eq(
                "conversation_id", data.conversation_id
            ).execute()
            
            print(f"Updated conversation {data.conversation_id} with transcript")
            
            # Get user ID from the conversation
            user_id = conv_result.data[0]["user_id"]
            # Update user's onboarding state in user_metadata
            user_result = await supabase.table("users").select("user_metadata").eq("id", user_id).execute()
            
            if user_result.data and len(user_result.data) > 0:
                user_metadata = user_result.data[0].get("user_metadata", {}) or {}
                
                # Update metadata with conversation status
                user_metadata["onboarding_state"] = "in_lobby"
                user_metadata["conversation_id"] = data.conversation_id
                
                # Update the user record with the new metadata
                await supabase.table("users").update({
                    "user_metadata": user_metadata,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", user_id).execute()
                
                print(f"Updated user {user_id} onboarding state to in_lobby")
    
    except Exception as e:
        # Log error but don't raise exception since this is a background task
        print(f"Error processing Tavus callback: {str(e)}")

@router.post("/callback")
async def tavus_callback(
    data: TavusCallbackData,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Webhook endpoint for Tavus conversation callbacks
    """
    # Verify that the request is from Tavus (you should implement proper validation)
    # For example, check for a shared secret or signature
    
    print(f"Received Tavus callback for event: {data.event_type}")
    
    # Process the callback data in the background
    background_tasks.add_task(process_tavus_callback, data)
    
    return {"status": "success"}

@router.get("/conversation-status/{conversation_id}")
async def get_conversation_status(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get the status of a Tavus conversation
    """
    supabase = await get_async_supabase_client()
    
    try:
        # Query by conversation_id
        result = await supabase.table("tavus_conversations").select("*").eq(
            "conversation_id", conversation_id
        ).eq("user_id", current_user.id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation = result.data[0]
        
        return {
            "conversation_id": conversation["conversation_id"],
            "status": conversation["status"],
            "is_completed": conversation["status"] == "completed",
            "created_at": conversation["created_at"],
            "completed_at": conversation.get("completed_at")
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting conversation status: {str(e)}"
        )
