from typing import Any, Dict, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

from app.models.user import User
from app.services.auth import get_current_active_user
from app.db.client import get_async_mongodb_db
from app.core.config import settings
from app.services.transcript_processor import process_conversation_transcript
from app.services.qloo import qloo_service
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Any

router = APIRouter()

async def find_and_store_similar_companies(db: AsyncIOMotorDatabase, user_id: str, user_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Find and store similar companies for a user based on their company information
    
    Args:
        db: MongoDB database connection
        user_id: User ID as string
        user_metadata: User metadata containing company information
        
    Returns:
        Dictionary with results information
    """
    try:
        company_name = user_metadata.get("company_name", "")
        company_details = user_metadata.get("company_details", "")
        
        if not company_name:
            print(f"No company name found in metadata for user {user_id}")
            return {"success": False, "message": "No company information available"}
        
        # Get similar companies using the QLoo service
        similar_companies = await qloo_service.get_similar_companies_from_metadata(
            company_metadata={
                "company_name": company_name,
                "company_details": company_details or ""
            }
        )
        
        # Store competitors in the database
        if similar_companies:
            competitor_entry = {
                "user_id": user_id,
                "competitors_data": similar_companies,
                "source": "qloo",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            # Insert competitor entry
            result = await db.competitors.insert_one(competitor_entry)
            print(f"Stored competitors data with {len(similar_companies)} companies for user {user_id}")
            
            return {
                "success": True, 
                "count": len(similar_companies),
                "insert_id": str(result.inserted_id)
            }
        else:
            print(f"No similar companies found for {company_name}")
            return {"success": False, "message": "No similar companies found"}
                
    except Exception as e:
        print(f"Error finding and storing similar companies: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

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
            db = await get_async_mongodb_db()
            
            # Prepare to store in MongoDB
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
                result = await db.tavus_conversations.insert_one(conversation_db_data)
                print("Database insert result:", result.inserted_id)
                
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
    db = await get_async_mongodb_db()
    
    try:
        print(f"Processing Tavus callback event: {data.event_type}")
        
        # Get conversation by ID
        conversation = await db.tavus_conversations.find_one({"conversation_id": data.conversation_id})
        
        # If conversation not found, log and return
        if not conversation:
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
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc),
                    "transcript": full_transcript,
                    "metadata": {"transcript_structured": transcript_json},
                    "event_type": data.event_type,
                    "webhook_url": data.webhook_url,
                    "is_processed": True
                }
            }
            
            # Update the database
            result = await db.tavus_conversations.update_one(
                {"conversation_id": data.conversation_id},
                update_data
            )
            
            print(f"Updated conversation {data.conversation_id} with transcript")
            
            # Get user ID from the conversation
            user_id = conversation["user_id"]
            
            # Process the transcript to extract company information using OpenAI
            try:
                processing_result = await process_conversation_transcript(data.conversation_id, user_id)
                print(f"Transcript processing result: {processing_result}")
                
                # If processing was not successful, still update onboarding state but log the error
                if not processing_result.get("success"):
                    print(f"Error processing transcript: {processing_result.get('error')}")
            except Exception as e:
                print(f"Error calling transcript processor: {str(e)}")
                import traceback
                print(traceback.format_exc())

            obj_user_id = ObjectId(user_id)
            user_result = await db.users.find_one({"_id": obj_user_id}, {"user_metadata": 1})
            
            if user_result:
                user_metadata = user_result.get("user_metadata", {}) or {}
                
                # Find and store similar companies based on user metadata
                await find_and_store_similar_companies(db, user_id, user_metadata)
                
                # Update metadata with conversation status
                user_metadata["onboarding_state"] = "completed"
                user_metadata["conversation_id"] = data.conversation_id
                
                # Update the user record with the new metadata and set is_onboarded to true
                await db.users.update_one(
                    {"_id": obj_user_id},
                    {
                        "$set": {
                            "user_metadata": user_metadata,
                            "is_onboarded": True,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    }
                )
                
                print(f"Updated user {user_id} onboarding state to completed and is_onboarded to true")

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

@router.post("/process-transcript/{conversation_id}")
async def process_transcript(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Manually process a conversation transcript to extract company information.
    This endpoint is for testing the transcript processing functionality.
    """
    try:
        # Call the transcript processing function
        result = await process_conversation_transcript(conversation_id, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing transcript: {str(e)}"
        )

@router.get("/conversation-status/{conversation_id}")
async def get_conversation_status(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get the status of a Tavus conversation
    """
    db = await get_async_mongodb_db()
    
    try:
        print(f"Checking status for conversation_id: {conversation_id}")        
        # Try to find the conversation just by conversation_id first (more reliable)
        conversation = await db.tavus_conversations.find_one({
            "conversation_id": conversation_id
        })

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
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
