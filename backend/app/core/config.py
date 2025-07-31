import os
import secrets
from typing import List, Optional, Union

from dotenv import load_dotenv
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AdBuddy.ai"
    PROJECT_DESCRIPTION: str = "Platform for businesses to create and manage ad campaigns"
    VERSION: str = "0.1.0"
    
    # Environment settings
    ENV: str = os.getenv("API_ENV", "development")
    DEBUG: bool = os.getenv("API_DEBUG", "true").lower() == "true"
    HOST: str = os.getenv("API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "adbuddy")
    
    # Tavus
    TAVUS_API_KEY: str = os.getenv("TAVUS_API_KEY", "")
    TAVUS_PERSONA_ID: str = os.getenv("TAVUS_PERSONA_ID", "")
    TAVUS_REPLICA_ID: str = os.getenv("TAVUS_REPLICA_ID", "") 
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # QLoo API
    QLOO_API_BASE_URL: str = os.getenv("QLOO_API_BASE_URL", "https://hackathon.api.qloo.com")
    QLOO_API_KEY: str = os.getenv("QLOO_API_KEY", "")
    
    # Here Maps API
    HERE_API_KEY: str = os.getenv("HERE_API_KEY", "")
    
    # Meta Ads Library API
    META_ADS_API_BASE_URL: str = os.getenv("META_ADS_API_BASE_URL", "https://graph.facebook.com/v19.0")
    META_ADS_API_TOKEN: str = os.getenv("META_ADS_API_TOKEN", "")

    TRACE_LOOP_API_KEY: str =  os.getenv("TRACE_LOOP_API_KEY", "")

    # Resend
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")

    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

settings = Settings()
