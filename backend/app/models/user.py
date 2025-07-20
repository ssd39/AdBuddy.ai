from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

from app.models.base import TimestampModel

class User(TimestampModel):
    """User model"""
    id: str
    email: EmailStr
    is_active: bool = True
    is_onboarded: bool = False
    full_name: Optional[str] = None
    user_metadata: Optional[Dict[str, Any]] = None
    
class UserCreate(BaseModel):
    """Model for user creation"""
    email: EmailStr

class UserInDB(User):
    """User model with additional DB fields"""
    pass

class Token(BaseModel):
    """Token model"""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """Token payload model"""
    sub: str
    exp: datetime

class OTPVerify(BaseModel):
    """OTP verification request model"""
    email: EmailStr
    otp: str
    
class OnboardingRequest(BaseModel):
    """Onboarding request model"""
    full_name: str
