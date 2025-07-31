from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId

class TimestampModel(BaseModel):
    """Base model with timestamp fields"""
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
