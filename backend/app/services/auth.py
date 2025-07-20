from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import EmailStr

from app.core.config import settings
from app.db.client import get_async_supabase_client
from app.models.user import Token, TokenPayload, User, UserInDB
from app.services.email import send_otp_email_with_template

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    import random
    return str(random.randint(100000, 999999))


async def send_otp_email(email: EmailStr) -> Dict[str, Any]:
    """
    Send OTP via email
    """
    
    otp = generate_otp()
    # Store OTP in database or cache with expiration
    # Here we're using Supabase to store the OTP
    
    supabase = await get_async_supabase_client()
    
    # Store OTP with expiration (15 minutes)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    try:
        # Store OTP in a Supabase table
        await supabase.table("otp_codes").insert({
            "email": email,
            "code": otp,
            "expires_at": expires_at.isoformat(),
            "used": False
        }).execute()
        
        # Send email with OTP using our email service
        email_result = await send_otp_email_with_template(email, otp)
        if not email_result["success"]:
            return {"success": False, "message": "Failed to send OTP email"}
        
        return {"success": True, "message": "OTP sent successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

async def verify_otp(email: EmailStr, otp: str) -> Dict[str, Any]:
    """
    Verify OTP code
    """
    supabase = await get_async_supabase_client()
    
    try:
        # Check if OTP is valid
        result = await supabase.table("otp_codes").select("*").eq("email", email).eq("code", otp).eq("used", False).execute()
        
        if not result.data or len(result.data) == 0:
            return {"success": False, "message": "Invalid OTP"}
        
        otp_record = result.data[0]
        expires_at = datetime.fromisoformat(otp_record["expires_at"])
        
        # Check if OTP is expired
        current_time = datetime.now(timezone.utc)
        # Ensure expires_at has timezone info if it doesn't already
        if not hasattr(expires_at, 'tzinfo') or expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if current_time > expires_at:
            return {"success": False, "message": "OTP expired"}
        
        # Mark OTP as used
        await supabase.table("otp_codes").update({"used": True}).eq("id", otp_record["id"]).execute()
        
        # Get or create user
        user_result = await supabase.table("users").select("*").eq("email", email).execute()
        
        if not user_result.data or len(user_result.data) == 0:
            # Create new user
            user_data = {
                "email": email,
                "is_active": True,
                "is_onboarded": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            user_result = await supabase.table("users").insert(user_data).execute()
            user = user_result.data[0]
        else:
            user = user_result.data[0]
        
        # Create access token
        access_token = create_access_token(subject=user["id"])
        
        return {
            "success": True, 
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def create_access_token(subject: str) -> str:
    """
    Create JWT access token
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # When using PyJWT, we should use timestamp for exp claim
    # But our pydantic model takes datetime directly, so we'll use datetime
    to_encode = {
        "sub": subject,
        "exp": expire
    }
    
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get current authenticated user
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # Check token expiration
        current_time = datetime.now(timezone.utc)
        exp_time = token_data.exp
        
        # Ensure exp_time has timezone info if it doesn't already
        if not hasattr(exp_time, 'tzinfo') or exp_time.tzinfo is None:
            exp_time = exp_time.replace(tzinfo=timezone.utc)
            
        if exp_time < current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    supabase = await get_async_supabase_client()
    result = await supabase.table("users").select("*").eq("id", token_data.sub).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user_data = result.data[0]
    return User(**user_data)

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current active user
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user
