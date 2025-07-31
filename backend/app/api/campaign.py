from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson.objectid import ObjectId
from datetime import datetime
import asyncio

from app.db.client import get_async_mongodb_db
from app.services.campaign import campaign_service
from app.models.campaign import Campaign, Message
from app.models.campaign_schemas import (
    CreateCampaignRequest,
    CreateCampaignResponse,
    CampaignStatusResponse,
    ListCampaignsResponse,
    CampaignResponse,
    CampaignDetailsResponse
)
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/create", response_model=CreateCampaignResponse)
async def create_campaign(
    request: CreateCampaignRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new campaign with transcript data from the conversation.
    Sets initial status as 'processing'.
    """
    try:
        # Create campaign object
        campaign = Campaign(
            user_id=current_user.id,
            status="processing",  # Set initial status to processing
            messages=[
                Message(
                    text=msg.text, 
                    sender=msg.sender, 
                    timestamp=msg.timestamp
                ) for msg in request.messages
            ]
        )
        
        # Get database connection
        db = await get_async_mongodb_db()
        
        # Insert campaign into database - exclude the id field as MongoDB will generate it
        result = await db.campaigns.insert_one(campaign.model_dump(exclude={"id"}))
        
        # Get the campaign ID
        campaign_id = str(result.inserted_id)
        
        # Start processing the campaign asynchronously 
        # This runs in the background and doesn't block the API response
        asyncio.create_task(campaign_service.process_campaign(campaign_id))
        
        # Return campaign ID and status
        return CreateCampaignResponse(
            id=campaign_id,
            status="processing",
            message="Campaign created successfully and is being processed"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating campaign: {str(e)}"
        )

@router.get("/status/{campaign_id}", response_model=CampaignStatusResponse)
async def get_campaign_status(
    campaign_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get the current status of a campaign by ID.
    """
    try:
        # Get database connection
        db = await get_async_mongodb_db()
        
        # Find campaign in database
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Check if campaign belongs to current user
        if str(campaign["user_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this campaign"
            )
        
        # Return campaign status
        return CampaignStatusResponse(
            id=campaign_id,
            status=campaign["status"],
            title=campaign["title"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting campaign status: {str(e)}"
        )

@router.get("/details/{campaign_id}", response_model=CampaignDetailsResponse)
async def get_campaign_details(
    campaign_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific campaign by ID.
    Includes all campaign data including audience analysis, creative ideas, etc.
    """
    try:
        # Get database connection
        db = await get_async_mongodb_db()
        
        # Find campaign in database
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Check if campaign belongs to current user
        if str(campaign["user_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this campaign"
            )
        
        # Convert ObjectId to string for JSON serialization
        campaign["id"] = str(campaign["_id"])
        
        # Return campaign details
        return campaign
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting campaign details: {str(e)}"
        )

@router.get("/list", response_model=ListCampaignsResponse)
async def list_campaigns(
    current_user: User = Depends(get_current_user)
):
    """
    List all campaigns belonging to the current user.
    """
    try:
        # Get database connection
        db = await get_async_mongodb_db()
        
        # Find all campaigns for current user
        cursor = db.campaigns.find({"user_id": current_user.id})
        campaigns = await cursor.to_list(length=100)
        
        # Convert campaigns to response model
        campaign_responses = [
            CampaignResponse(
                id=str(campaign["_id"]),
                title=campaign["title"],
                status=campaign["status"],
                created_at=campaign["created_at"]
            )
            for campaign in campaigns
        ]
        
        return ListCampaignsResponse(campaigns=campaign_responses)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing campaigns: {str(e)}"
        )
