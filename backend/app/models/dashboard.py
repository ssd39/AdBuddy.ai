from pydantic import BaseModel

class DashboardStats(BaseModel):
    """Dashboard statistics model"""
    campaign_count: int
    competitor_count: int
    company_details: str
    company_name: str
