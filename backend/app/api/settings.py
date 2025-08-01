from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.settings import AppSettings
from app.db.client import get_async_mongodb_db
from app.services.auth import get_current_active_user # For protected routes
from app.models.user import User

router = APIRouter()

@router.get("/settings", response_model=AppSettings)
async def get_app_settings(db=Depends(get_async_mongodb_db)) -> AppSettings:
    """
    Get global application settings
    """
    settings = await db.settings.find_one({"_id": "global_settings"})
    if settings:
        return AppSettings(**settings)
    return AppSettings()

@router.post("/settings", response_model=AppSettings)
async def set_app_settings(
    settings_data: AppSettings,
    db=Depends(get_async_mongodb_db),
    current_user: User = Depends(get_current_active_user) # Protect this route
) -> AppSettings:
    """
    Set global application settings
    """
    await db.settings.update_one(
        {"_id": "global_settings"},
        {"$set": settings_data.model_dump()},
        upsert=True
    )
    return settings_data
