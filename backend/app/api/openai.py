from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional
import time
import requests
import json
from pydantic import BaseModel
from app.services.auth import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()



class RealtimeSessionRequest(BaseModel):
    voice: Optional[str] = "verse"


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
