from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class TimestampModel(BaseModel):
    """Base model with timestamp fields"""
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)