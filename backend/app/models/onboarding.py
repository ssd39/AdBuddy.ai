from pydantic import BaseModel
from typing import Literal

class OnboardingProviderSettings(BaseModel):
    provider: Literal["tavus", "openai"] = "tavus"
