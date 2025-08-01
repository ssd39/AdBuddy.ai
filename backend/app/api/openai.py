from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Dict, Any, Optional
import time
import requests
import json
from pydantic import BaseModel
from app.services.auth import get_current_user
from app.models.user import User
from app.core.config import settings
from app.services.transcript_processor import process_conversation_transcript
from app.services.qloo import qloo_service
from app.db.client import get_async_mongodb_db
from bson.objectid import ObjectId
from datetime import datetime, timezone
from app.api.tavus import find_and_store_similar_companies

router = APIRouter()



class RealtimeSessionRequest(BaseModel):
    voice: Optional[str] = "verse"

class OnboardingCompleteRequest(BaseModel):
    transcript: str
    conversation_id: str

async def process_openai_transcript(user_id: str, conversation_id: str, transcript: str):
    """
    Process OpenAI transcript in the background
    """
    db = await get_async_mongodb_db()
    
    try:
        # Process the transcript to extract company information using OpenAI
        processing_result = await process_conversation_transcript(user_id=user_id, transcript=transcript)
        print(f"Transcript processing result: {processing_result}")

        if not processing_result.get("success"):
            print(f"Error processing transcript: {processing_result.get('error')}")

        obj_user_id = ObjectId(user_id)
        user_result = await db.users.find_one({"_id": obj_user_id}, {"user_metadata": 1})

        if user_result:
            user_metadata = user_result.get("user_metadata", {}) or {}

            # Find and store similar companies based on user metadata
            await find_and_store_similar_companies(db, user_id, user_metadata)

            # Update metadata with conversation status
            user_metadata["onboarding_state"] = "completed"
            user_metadata["conversation_id"] = conversation_id

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
        print(f"Error processing OpenAI transcript: {str(e)}")
        import traceback
        print(traceback.format_exc())

@router.post("/onboarding/complete")
async def onboarding_complete(
    request: OnboardingCompleteRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Process the transcript from the OpenAI onboarding session
    """
    db = await get_async_mongodb_db()
    user_id = current_user.id

    try:
        # First, update the tavus_conversations collection with transcript data
        conversation_id = request.conversation_id
        full_transcript = request.transcript
        
        # Use upsert operation to either update existing document or create a new one
        current_time = datetime.now(timezone.utc)
        
        # Prepare update document with $set and $setOnInsert
        update_data = {
            # Fields to update if document exists or set if it's new
            "$set": {
                "status": "completed",
                "completed_at": current_time,
                "transcript": full_transcript,
                "is_processed": True
            },
            # Fields to set only if this is a new document
            "$setOnInsert": {
                "user_id": user_id,
                "conversation_id": conversation_id,
                "created_at": current_time
            }
        }
        
        # Perform the upsert operation
        result = await db.tavus_conversations.update_one(
            {"conversation_id": conversation_id},
            update_data,
            upsert=True
        )
        
        if result.upserted_id:
            print(f"Created new conversation record for OpenAI session {conversation_id}")
        else:
            print(f"Updated existing conversation {conversation_id} with transcript")
        
        # Process transcript in the background
        background_tasks.add_task(process_openai_transcript, user_id, conversation_id, full_transcript)

        return {"success": True, "message": "Onboarding transcript received and processing started"}
    except Exception as e:
        print(f"Error in onboarding_complete: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during onboarding completion."
        )

@router.post("/realtime/sessions", response_model=Dict[str, Any])
async def create_realtime_session(request: RealtimeSessionRequest, current_user: User = Depends(get_current_user)):
    """
    Create a session for the OpenAI real-time voice API
    """
    # Get the OpenAI API key from settings
    openai_api_key = settings.OPENAI_API_KEY
    if not openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )
    
    try:
        # Create a session for the real-time API
        headers = {
            "Authorization": f"Bearer {openai_api_key}",
            "Content-Type": "application/json"
        }
        
        # Create the payload for the session request
        payload = {
            "model": "gpt-4o-realtime-preview-2025-06-03",
            "voice": request.voice
        }
        
        # Make the request to OpenAI API
        response = requests.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create real-time session: {response.text}"
            )
        
        return response.json()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating real-time session: {str(e)}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating ephemeral key: {str(e)}"
        )
