from typing import Any
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from app.models.user import User, UserCreate, Token, OTPVerify, OnboardingRequest
from app.services.auth import (
    send_otp_email,
    verify_otp,
    get_current_active_user
)
from app.db.client import get_async_mongodb_db

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
    
    db = await get_async_mongodb_db()
    
    try:
        # Convert id to ObjectId if needed
        from bson.objectid import ObjectId
        user_id = current_user.id
        if len(user_id) == 24:
            try:
                user_id = ObjectId(user_id)
            except:
                pass
        
        # Update user data
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "full_name": request.full_name,
                "is_onboarded": True,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user data"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve updated user data"
            )
        
        # Convert MongoDB _id to string for compatibility
        updated_user["id"] = str(updated_user.pop("_id"))
        return User(**updated_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
