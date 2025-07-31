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

class PaginationInfo(BaseModel):
    """Pagination information for API responses"""
    page: int
    page_size: int
    total_count: int
    total_pages: int

class CompetitorResponse(BaseModel):
    """Response model for competitors data"""
    competitors: List[Dict[str, Any]]
    query_parameters: Dict[str, Any]
    pagination: PaginationInfo
    source: str = "qloo"  # Indicates where the data came from

class CompetitorAdsResponse(BaseModel):
    """Response model for competitor ads data"""
    competitor_ads: Dict[str, List[Dict[str, Any]]]
    query_parameters: Dict[str, Any]
    source: str = "meta_ads_library"  # Indicates where the data came from

@router.get("/similar-companies", response_model=CompetitorResponse)
async def get_similar_companies(
    page: int = 1,
    page_size: int = 9,
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
    
    user_id = current_user.id


    comp_result = await db.competitors.find_one(
        {"user_id": user_id},
        {"competitors_data": 1, "_id": 0},
        sort=[("created_at", -1)]
    )
    
    if not comp_result:
        # If no stored data found, return empty list with pagination info
        return CompetitorResponse(
            competitors=[],
            pagination=PaginationInfo(
                page=1,
                page_size=page_size,
                total_count=0,
                total_pages=0
            ),
            query_parameters={
                "company_name": company_name,
                "page": 1,
                "page_size": page_size
            }
        )
    
    # Get stored similar companies
    all_similar_companies = comp_result["competitors_data"]
    
    # Sort companies by popularity/match score in descending order (highest match first)
    all_similar_companies.sort(key=lambda x: x.get("popularity", 0), reverse=True)
    
    total_count = len(all_similar_companies)
    
    # Calculate pagination info
    total_pages = (total_count + page_size - 1) // page_size  # Ceiling division
    page = max(1, min(page, total_pages))  # Ensure page is within valid range
    
    # Get the paginated slice of competitors
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_companies = all_similar_companies[start_idx:end_idx]
    
    # Return the results
    return CompetitorResponse(
        competitors=paginated_companies,
        pagination=PaginationInfo(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=total_pages
        ),
        query_parameters={
            "company_name": company_name,
            "page": page,
            "page_size": page_size
        }
    )

@router.get("/competitor-ads", response_model=CompetitorAdsResponse)
async def get_competitor_ads(
    company_name: str,
    limit: int = 20,
    current_user: User = Depends(get_current_active_user)
) -> CompetitorAdsResponse:
    """
    Get ads from a specific competitor by company name
    """
    # Check if user is onboarded
    if not current_user.is_onboarded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not onboarded yet. Please complete onboarding first."
        )
    
    # Search for ads directly by company name
    ads = await meta_ads_service.search_ads_by_company_name(company_name, limit=limit)
    
    # Format the response
    competitor_ads = {company_name: ads}
    
    # Return the results
    return CompetitorAdsResponse(
        competitor_ads=competitor_ads,
        query_parameters={
            "company_name": company_name,
            "limit": limit
        }
    )
