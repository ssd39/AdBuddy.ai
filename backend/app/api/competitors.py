from typing import Dict, List, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson.objectid import ObjectId

from app.models.user import User
from app.services.auth import get_current_active_user
from app.services.qloo import qloo_service
from app.services.meta_ads import meta_ads_service
from app.db.client import get_async_mongodb_db

router = APIRouter()

@router.get("/test")
async def test_qloo_service():
    """
    Test endpoint for QlooService - does not require authentication
    """
    try:
        # Test basic search functionality
        search_results = await qloo_service.search_entity("Apple")
        
        # Test generating parameters from a simple company info
        from app.services.qloo import CompanyInfo
        company_info = CompanyInfo(
            company_name="Test Company",
            industry="Technology",
            location="San Francisco, CA",
            target_audience="Tech professionals"
        )
        
        parameters = await qloo_service.generate_qloo_parameters(company_info)
        params = parameters.to_api_params()
        
        # Return test results
        return {
            "status": "success",
            "search_results": search_results[:2] if search_results else [],
            "parameters": params
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "error_type": type(e).__name__
        }

class CompetitorResponse(BaseModel):
    """Response model for competitors data"""
    competitors: List[Dict[str, Any]]
    query_parameters: Dict[str, Any]
    source: str = "qloo"  # Indicates where the data came from

class CompetitorAdsResponse(BaseModel):
    """Response model for competitor ads data"""
    competitor_ads: Dict[str, List[Dict[str, Any]]]
    query_parameters: Dict[str, Any]
    source: str = "meta_ads_library"  # Indicates where the data came from

@router.get("/similar-companies", response_model=CompetitorResponse)
async def get_similar_companies(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
) -> CompetitorResponse:
    """
    Get similar companies based on the pre-stored competitors data from onboarding
    """
    # Check if user is onboarded
    if not current_user.is_onboarded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not onboarded yet. Please complete onboarding first."
        )
    
    # Check if user_metadata exists and contains company details
    if not current_user.user_metadata or not isinstance(current_user.user_metadata, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User metadata not available. Please complete onboarding first."
        )
    
    # Extract company name from metadata for query parameters
    company_name = current_user.user_metadata.get("company_name")
    
    if not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name not found in user metadata. Please complete onboarding first."
        )

    db = await get_async_mongodb_db()
    
    # Convert string ID to MongoDB ObjectId
    user_id = current_user.id
    mongo_user_id = ObjectId(user_id)

    comp_result = await db.competitors.find_one(
        {"user_id": mongo_user_id},
        {"competitors_data": 1, "_id": 0},
        sort=[("created_at", -1)]
    )
    
    if not comp_result:
        # If no stored data found, return empty list
        return CompetitorResponse(
            competitors=[],
            query_parameters={
                "company_name": company_name,
                "limit": limit
            }
        )
    
    # Get stored similar companies
    similar_companies = comp_result["competitors_data"]
    
    # Apply limit parameter
    if limit and limit < len(similar_companies):
        similar_companies = similar_companies[:limit]
    
    # Return the results
    return CompetitorResponse(
        competitors=similar_companies,
        query_parameters={
            "company_name": company_name,
            "limit": limit
        }
    )

@router.get("/competitor-ads", response_model=CompetitorAdsResponse)
async def get_competitor_ads(
    limit: int = 20,
    ads_per_competitor: int = 5,
    company_ids: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
) -> CompetitorAdsResponse:
    """
    Get ads from competitors based on either specified company IDs or automatically found similar companies
    """
    # Check if user is onboarded
    if not current_user.is_onboarded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not onboarded yet. Please complete onboarding first."
        )
    
    # Check if user_metadata exists
    if not current_user.user_metadata or not isinstance(current_user.user_metadata, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User metadata not available. Please complete onboarding first."
        )
    
    # Extract company metadata
    company_name = current_user.user_metadata.get("company_name")
    company_details = current_user.user_metadata.get("company_details")
    
    if not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name not found in user metadata. Please complete onboarding first."
        )
    
    # Strategy 1: If company_ids are provided, use them
    if company_ids:
        company_id_list = company_ids.split(',')
        competitor_entities = []
        
        # Get details for each company ID
        for company_id in company_id_list:
            company_details = await qloo_service.get_entity_details([company_id])
            if company_details:
                competitor_entities.extend(company_details)
    else:
        # Strategy 2: Use QLoo to find similar companies
        competitor_entities = await qloo_service.get_similar_companies_from_metadata(
            company_metadata={
                "company_name": company_name,
                "company_details": company_details or ""
            },
            limit=10  # Get a reasonable number of competitors
        )
    
    # Get ads for these competitors
    competitor_ads = await meta_ads_service.get_company_ads_from_qloo_entities(
        qloo_entities=competitor_entities,
        limit_per_entity=ads_per_competitor,
        total_limit=limit
    )
    
    # Return the results
    return CompetitorAdsResponse(
        competitor_ads=competitor_ads,
        query_parameters={
            "company_name": company_name,
            "limit": limit,
            "ads_per_competitor": ads_per_competitor
        }
    )
