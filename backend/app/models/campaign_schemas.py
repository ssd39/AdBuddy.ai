from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageSchema(BaseModel):
    text: str
    sender: str  # "user" or "ai"
    timestamp: datetime

class CreateCampaignRequest(BaseModel):
    messages: List[MessageSchema]

class CampaignResponse(BaseModel):
    id: str
    title: str
    status: str
    created_at: datetime

class CreateCampaignResponse(BaseModel):
    id: str
    status: str
    message: str

class CampaignStatusResponse(BaseModel):
    id: str
    status: str
    title: str

class ListCampaignsResponse(BaseModel):
    campaigns: List[CampaignResponse]

# Detailed campaign models for the campaign details endpoint
class CampaignObjective(str, Enum):
    """Enumeration of possible campaign objectives."""
    BRAND_AWARENESS = "BRAND_AWARENESS"
    REACH = "REACH"
    TRAFFIC = "TRAFFIC"  # Corresponds to LINK_CLICKS on Instagram
    ENGAGEMENT = "ENGAGEMENT"  # Corresponds to POST_ENGAGEMENT on Instagram
    APP_INSTALLS = "APP_INSTALLS"
    VIDEO_VIEWS = "VIDEO_VIEWS"
    LEAD_GENERATION = "LEAD_GENERATION"
    MESSAGES = "MESSAGES"
    CONVERSIONS = "CONVERSIONS"
    CATALOG_SALES = "CATALOG_SALES"  # Corresponds to PRODUCT_CATALOG_SALES on Instagram
    STORE_TRAFFIC = "STORE_TRAFFIC"
    COMMUNITY_INTERACTION = "COMMUNITY_INTERACTION"  # TikTok specific

class AdStatus(str, Enum):
    """Enumeration for the status of a campaign, ad set, or ad."""
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"

class BudgetMode(str, Enum):
    """Enumeration for budget modes."""
    DAILY = "BUDGET_MODE_DAY"
    LIFETIME = "BUDGET_MODE_TOTAL"
    INFINITE = "BUDGET_MODE_INFINITE"

class BudgetSchema(BaseModel):
    """Defines the budget for a campaign or ad set."""
    mode: BudgetMode = Field(..., description="The type of budget, e.g., daily or lifetime.")
    amount: float = Field(..., gt=0, description="The budget amount.")
    currency: str = Field("USD", description="The ISO 4217 currency code.")

class TargetingSchema(BaseModel):
    """Defines the audience targeting for an ad set."""
    locations: Optional[List[str]] = Field(None, description="List of targeted countries, regions, or cities.")
    age_min: Optional[int] = Field(None, description="Minimum age of the target audience.")
    age_max: Optional[int] = Field(None, description="Maximum age of the target audience.")
    genders: Optional[List[str]] = Field(None, description="Targeted genders (e.g., ['male', 'female']).")
    languages: Optional[List[str]] = Field(None, description="List of targeted language codes.")
    interests: Optional[List[str]] = Field(None, description="List of interests to target.")
    custom_audiences: Optional[List[str]] = Field(None, description="List of custom audience IDs.")

class PlacementSchema(BaseModel):
    """Defines where the ads will be shown."""
    automatic: bool = Field(True, description="Whether to use automatic placements.")
    instagram_positions: Optional[List[str]] = Field(None, description="Specific Instagram placements like 'stream', 'story', 'explore'.")
    tiktok_placements: Optional[List[str]] = Field(None, description="Specific TikTok placements like 'feed', 'topbuzz'.")

class CreativeSchema(BaseModel):
    """Represents the creative content of an ad."""
    ad_format: str = Field(..., description="The format of the ad (e.g., 'IMAGE', 'VIDEO', 'CAROUSEL').")
    primary_text: str = Field(..., description="The main text or caption of the ad.")
    headline: Optional[str] = Field(None, description="The headline of the ad.")
    description: Optional[str] = Field(None, description="A longer description for the ad.")

class AdSetSchema(BaseModel):
    """Represents an ad set (Instagram) or ad group (TikTok)."""
    name: str = Field(..., description="The name of the ad set or ad group.")
    status: AdStatus = Field(AdStatus.PAUSED, description="The status of the ad set.")
    start_time: Optional[datetime] = Field(None, description="The start time for the ad set.")
    end_time: Optional[datetime] = Field(None, description="The end time for the ad set. Required for lifetime budgets.")
    budget: BudgetSchema = Field(..., description="The budget for this ad set.")
    targeting: TargetingSchema = Field(..., description="The targeting criteria for this ad set.")
    placements: PlacementSchema = Field(..., description="The placements for the ads in this set.")
    optimization_goal: str = Field(..., description="The optimization goal for the ad set (e.g., 'REACH', 'CONVERSIONS').")
    creatives: List[CreativeSchema] = Field(..., description="A list of creatives to be used in this ad set.")

class AdCampaignSchema(BaseModel):
    """A comprehensive model for a social media ad campaign."""
    name: str = Field(..., description="The name of the ad campaign.")
    objective: CampaignObjective = Field(..., description="The primary objective of the campaign.")
    status: AdStatus = Field(AdStatus.PAUSED, description="The current status of the campaign.")
    ad_sets: List[AdSetSchema] = Field(..., description="A list of ad sets or ad groups belonging to this campaign.")
    campaign_budget: Optional[BudgetSchema] = Field(None, description="Campaign-level budget (Campaign Budget Optimization).")
    special_ad_category: Optional[str] = Field(None, description="Special ad category for sensitive topics (e.g., 'HOUSING', 'EMPLOYMENT').")
    platform_specific_ids: Optional[Dict[str, str]] = Field(default_factory=dict, description="Dictionary of platform-specific account/page IDs.")

class CreativeIdeaSchema(BaseModel):
    """A creative idea for the campaign"""
    title: str = Field(..., description="Title of the creative idea")
    description: str = Field(..., description="Detailed description of the creative idea")
    target_audience: str = Field(..., description="Description of the target audience for this idea")
    platforms: List[str] = Field(..., description="Recommended platforms for this creative idea")

class TodoItemSchema(BaseModel):
    """A to-do item for the campaign implementation"""
    task: str = Field(..., description="Description of the task to be completed")
    priority: str = Field(..., description="Priority of the task (high, medium, low)")
    notes: Optional[str] = Field(None, description="Additional notes about the task")

class CampaignDetailsResponse(BaseModel):
    """Complete response model for the campaign details endpoint"""
    id: str
    title: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    ad_campaign: Optional[AdCampaignSchema] = None
    campaign_goal: Optional[str] = None
    target_audience_analysis: Optional[str] = None
    creative_ideas: Optional[List[CreativeIdeaSchema]] = None
    todo_list: Optional[List[TodoItemSchema]] = None
    kpis: Optional[List[str]] = None
    budget_allocation_strategy: Optional[str] = None
