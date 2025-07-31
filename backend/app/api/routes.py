from fastapi import APIRouter
from app.api import auth, onboarding, tavus, competitors, dashboard, openai, campaign

router = APIRouter()

# Include auth router
router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include onboarding router
router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])

# Include Tavus router
router.include_router(tavus.router, prefix="/tavus", tags=["tavus"])

# Include competitors router
router.include_router(competitors.router, prefix="/competitors", tags=["competitors"])

# Include dashboard router
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Include OpenAI router
router.include_router(openai.router, prefix="/openai", tags=["openai"])

# Include Campaign router
router.include_router(campaign.router, prefix="/campaigns", tags=["campaigns"])

# Basic health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "AdBuddy.ai API is running"}
