from pydantic import BaseModel, Field
from typing import Literal

class AppSettings(BaseModel):
    id: Literal["global_settings"] = "global_settings"
    onboarding_provider: Literal["tavus", "openai"] = "openai"
