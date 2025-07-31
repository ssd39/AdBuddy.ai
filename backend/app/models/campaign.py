from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class Attachment(BaseModel):
    name: str
    type: str
    url: str


class Message(BaseModel):
    id: str = Field(default=None, alias="_id")
    text: str
    sender: str  # "user" or "ai"
    timestamp: datetime = Field(default_factory=datetime.now)
    attachments: Optional[List[Attachment]] = None


class Campaign(BaseModel):
    id: str = Field(default=None, alias="_id")
    user_id: str
    title: str = "Untitled Campaign"
    status: str = "draft"  # draft, active, completed, archived
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    messages: List[Message] = []
    target_audience: Optional[str] = None
    goals: Optional[str] = None
    budget: Optional[str] = None
    creative_preferences: Optional[str] = None
    campaign_type: Optional[str] = None  # search, display, social, etc.

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
