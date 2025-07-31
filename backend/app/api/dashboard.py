from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.services.auth import get_current_user
from app.db.client import get_async_mongodb_db
from app.models.user import User
from app.models.dashboard import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """
    Get dashboard statistics including:
    - Number of campaigns
    - Number of competitors found
    - Company details
    """
    db = await get_async_mongodb_db()
    
    # Get campaign count - default to 0 if campaigns collection doesn't exist yet
    campaign_count = await db.campaigns.count_documents({"user_id": current_user.id}) if hasattr(db, "campaigns") else 0
    
    # Get competitor count - use the same approach as in similar-companies endpoint
    competitor_count = 0
    comp_result = await db.competitors.find_one(
        {"user_id": current_user.id},
        {"competitors_data": 1, "_id": 0},
        sort=[("created_at", -1)]
    )
    
    if comp_result and "competitors_data" in comp_result:
        competitor_count = len(comp_result["competitors_data"])
    
    # Get company details from user metadata
    user_metadata = current_user.user_metadata or {}
    company_name = user_metadata.get("company_name", current_user.full_name)
    company_details = user_metadata.get("company_details", "")
    
    return {
        "campaign_count": campaign_count,
        "competitor_count": competitor_count,
        "company_details": company_details,
        "company_name": company_name
    }
