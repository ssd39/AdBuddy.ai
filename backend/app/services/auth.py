from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import EmailStr

from app.core.config import settings
from app.db.client import get_async_mongodb_db
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
    # Here we're using MongoDB to store the OTP
    
    db = await get_async_mongodb_db()
    
    # Store OTP with expiration (15 minutes)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    try:
        # Store OTP in MongoDB collection
        await db.otp_codes.insert_one({
            "email": email,
            "code": otp,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.now(timezone.utc)
        })
        
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
    db = await get_async_mongodb_db()
    
    try:
        # Check if OTP is valid
        otp_record = await db.otp_codes.find_one({
            "email": email,
            "code": otp,
            "used": False
        })
        
        if not otp_record:
            return {"success": False, "message": "Invalid OTP"}
        
        expires_at = otp_record["expires_at"]
        
        # Check if OTP is expired
        current_time = datetime.now(timezone.utc)
        
        # Ensure expires_at is timezone-aware
        if not expires_at.tzinfo:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if current_time > expires_at:
            return {"success": False, "message": "OTP expired"}
        
        # Mark OTP as used
        await db.otp_codes.update_one({"_id": otp_record["_id"]}, {"$set": {"used": True}})
        
        # Get or create user
        user = await db.users.find_one({"email": email})
        
        if not user:
            # Create new user with MongoDB ObjectId
            from bson.objectid import ObjectId
            user_id = ObjectId()
            user_data = {
                "_id": user_id,
                "email": email,
                "is_active": True,
                "is_onboarded": False,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(user_data)
            user = user_data
        
        # Create access token with string ID
        user_id_str = str(user["_id"]) if "_id" in user else user["id"] if "id" in user else None
        if not user_id_str:
            return {"success": False, "message": "User ID not found"}
            
        access_token = create_access_token(subject=user_id_str)
        
        # Prepare user for response by converting _id to id string for compatibility with models
        user_copy = dict(user)
        if "_id" in user_copy:
            user_copy["id"] = str(user_copy.pop("_id"))
        
        return {
            "success": True, 
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_copy
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
    db = await get_async_mongodb_db()
    from bson.objectid import ObjectId
    
    # Convert string ID to ObjectId if needed
    user_id = token_data.sub
    if len(user_id) == 24:  # It's likely a hex string that can be converted to ObjectId
        try:
            user_id = ObjectId(user_id)
        except:
            pass
    
    user_data = await db.users.find_one({"_id": user_id})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Convert MongoDB _id to string for compatibility
    user_data["id"] = str(user_data.pop("_id"))
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
