from typing import Any, Dict, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

from app.models.user import User
from app.services.auth import get_current_active_user
from app.db.client import get_supabase_client
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

class TavusCallbackData(BaseModel):
    """Tavus callback data model based on Tavus API documentation"""
    conversation_id: str
    status: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    transcript: Optional[str] = None
    recorded_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    completion_url: Optional[str] = None
    conversation_name: Optional[str] = None
    persona_id: Optional[str] = None
    replica_id: Optional[str] = None

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
            supabase = get_supabase_client()
            
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
                result = supabase.table("tavus_conversations").insert(conversation_db_data).execute()
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
    """
    supabase = get_supabase_client()
    
    try:
        # Find the conversation using the Tavus conversation_id
        # Update conversation status
        supabase.table("tavus_conversations").update({
            "status": data.status,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "transcript": data.transcript,
            "duration_seconds": data.duration_seconds,
            "metadata": data.metadata,
            "completion_url": data.completion_url
        }).eq("conversation_id", data.conversation_id).execute()
        
        if data.status == "completed":
            # Extract user information from transcript or metadata
            user_data = {}
            
            # Example: Extract user information from transcript or metadata
            if data.transcript:
                # You could use an AI model to extract structured information
                # For simplicity, we'll just set some basic fields
                user_data["is_onboarded"] = True
                
                # For example, if you detect company information in transcript
                if "company" in data.transcript.lower():
                    # This is oversimplified; you would use more sophisticated extraction
                    company_idx = data.transcript.lower().find("company")
                    if company_idx > 0:
                        # Extract a snippet around the company mention
                        company_text = data.transcript[company_idx:company_idx + 100]
                        user_data["company_name"] = company_text[:30]  # Simple example
            
            # Update user profile with information from the conversation
            if user_data:
                # Get user ID from the conversations table
                conv_result = supabase.table("tavus_conversations").select("user_id").eq(
                    "conversation_id", data.conversation_id
                ).execute()
                
                if conv_result.data and len(conv_result.data) > 0:
                    user_id = conv_result.data[0]["user_id"]
                    
                    # Update user record
                    supabase.table("users").update({
                        "is_onboarded": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }).eq("id", user_id).execute()
                    
                    # Update or create user profile
                    profile_data = {
                        "user_id": user_id,
                        "onboarded_via": "tavus_video",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                    
                    if user_data.get("company_name"):
                        profile_data["company_name"] = user_data["company_name"]
                    
                    # Check if profile exists
                    profile_result = supabase.table("user_profiles").select("*").eq(
                        "user_id", user_id
                    ).execute()
                    
                    if profile_result.data and len(profile_result.data) > 0:
                        # Update existing profile
                        supabase.table("user_profiles").update(profile_data).eq(
                            "user_id", user_id
                        ).execute()
                    else:
                        # Create new profile
                        supabase.table("user_profiles").insert(profile_data).execute()
    
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
    supabase = get_supabase_client()
    
    try:
        # Query by conversation_id
        result = supabase.table("tavus_conversations").select("*").eq(
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