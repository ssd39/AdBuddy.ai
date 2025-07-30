from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson.objectid import ObjectId

from app.models.user import User
from app.services.auth import get_current_active_user
from app.db.client import get_async_mongodb_db
from app.services.email import send_welcome_email
from app.api.models.update_onboarding_state import UpdateOnboardingStateRequest

router = APIRouter()

class OnboardingData(BaseModel):
    """Onboarding data model"""
    full_name: str
    company_name: str
    role: str
    industry: str

@router.get("/status")
async def get_onboarding_status(current_user: User = Depends(get_current_active_user)) -> Dict[str, Any]:
    """
    Get user's onboarding status
    """
    # Start with basic user info
    response = {
        "is_onboarded": current_user.is_onboarded,
        "user_id": current_user.id,
        "email": current_user.email
    }
    
    # Add metadata fields if they exist
    if current_user.user_metadata:
        # Add onboarding state if available
        if "onboarding_state" in current_user.user_metadata:
            response["onboarding_state"] = current_user.user_metadata["onboarding_state"]
        
        # Add conversation ID if available
        if "conversation_id" in current_user.user_metadata:
            response["conversation_id"] = current_user.user_metadata["conversation_id"]
    
    # If onboarding_state isn't set, derive it based on is_onboarded
    if "onboarding_state" not in response:
        if current_user.is_onboarded:
            response["onboarding_state"] = "completed"
        else:
            response["onboarding_state"] = "not_started"
    
    return response

@router.post("/state")
async def update_onboarding_state(
    data: UpdateOnboardingStateRequest,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Update user's onboarding state
    """
    db = await get_async_mongodb_db()
    
    try:
        # Create a dictionary for user_metadata updates
        user_metadata = {}
        
        # If we have the current user metadata, preserve it
        if current_user.user_metadata:
            user_metadata = current_user.user_metadata
        
        # Update the onboarding state in metadata
        user_metadata["onboarding_state"] = data.onboarding_state
        
        # If conversation_id is provided, store it in metadata
        if data.conversation_id:
            user_metadata["conversation_id"] = data.conversation_id
        
        # Update the user record
        user_update = {
            "$set": {
                "user_metadata": user_metadata
            }
        }
        
        # If state is completed, also update is_onboarded flag
        if data.onboarding_state == "completed":
            user_update["$set"]["is_onboarded"] = True

        user_id = current_user.id
        mongo_user_id = ObjectId(user_id)

        # Update user in database
        result = await db.users.update_one({"_id": mongo_user_id}, user_update)
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user data"
            )
        
        # Return success response with updated state
        return {
            "success": True, 
            "user_id": current_user.id,
            "onboarding_state": data.onboarding_state
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
