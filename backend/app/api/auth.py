from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from app.models.user import User, UserCreate, Token, OTPVerify, OnboardingRequest
from app.services.auth import (
    send_otp_email,
    verify_otp,
    get_current_active_user
)
from app.db.client import get_async_supabase_client

router = APIRouter()


@router.post("/login/otp/send")
async def login_send_otp(user: UserCreate) -> Any:
    """
    Send an OTP code to user's email
    """
    result = await send_otp_email(user.email)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    
    return {"message": "OTP sent successfully. Please check your email."}

@router.post("/login/otp/verify", response_model=Token)
async def login_verify_otp(verify_data: OTPVerify) -> Any:
    """
    Verify OTP and get access token
    """
    try:
        result = await verify_otp(verify_data.email, verify_data.otp)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
        return {
            "access_token": result["access_token"],
            "token_type": result["token_type"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error verifying OTP: {str(e)}"
        )

@router.get("/me", response_model=User)
async def get_user_me(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Get current user information
    """
    return current_user

@router.post("/onboarding", response_model=User)
async def complete_onboarding(
    request: OnboardingRequest,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Complete user onboarding
    """
    
    supabase = await get_async_supabase_client()
    
    try:
        # Update user data
        result = await supabase.table("users").update({
            "full_name": request.full_name,
            "is_onboarded": True
        }).eq("id", current_user.id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user data"
            )
        
        return User(**result.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
