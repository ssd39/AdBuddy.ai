from fastapi import APIRouter
from app.api import auth, onboarding, tavus, competitors

router = APIRouter()

# Include auth router
router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include onboarding router
router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])

# Include Tavus router
router.include_router(tavus.router, prefix="/tavus", tags=["tavus"])

# Include competitors router
router.include_router(competitors.router, prefix="/competitors", tags=["competitors"])

# Basic health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "AdBuddy.ai API is running"}