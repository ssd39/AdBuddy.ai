from typing import Optional
from pydantic import BaseModel

class UpdateOnboardingStateRequest(BaseModel):
    """Request model for updating onboarding state"""
    onboarding_state: str  # 'not_started', 'in_lobby', 'in_call', 'processing', 'completed'
    conversation_id: Optional[str] = None
