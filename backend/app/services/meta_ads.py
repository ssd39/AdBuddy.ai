import logging
from typing import Dict, List, Any, Optional
import httpx

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class MetaAdsService:
    """Service for interacting with the Meta Ads Library API"""
    
    def __init__(self):
        self.api_base_url = settings.META_ADS_API_BASE_URL
        self.api_token = settings.META_ADS_API_TOKEN
        self.headers = {
            "Content-Type": "application/json"
        }
    
    async def search_ads_by_company_name(
        self, 
        company_name: str, 
        limit: int = 10,
        ad_type: str = "POLITICAL_AND_ISSUE_ADS",
        ad_active_status: str = "ALL",
        search_page_ids: bool = True,
        fields: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for ads by company name using the Meta Ads Library API
        
        Args:
            company_name: Name of the company/advertiser
            limit: Maximum number of results to return
            ad_type: Type of ads to search for
            ad_active_status: Filter by ad status (ALL, ACTIVE, INACTIVE)
            search_page_ids: Whether to search by page IDs
            fields: Fields to include in the response
            
        Returns:
            List of ads
        """
        try:
            url = f"{self.api_base_url}/ads_archive"
            
            # Default fields if not provided
            if fields is None:
                fields = [
                    "id", 
                    "ad_creation_time", 
                    "ad_creative_bodies", 
                    "ad_creative_link_captions", 
                    "ad_creative_link_descriptions",
                    "ad_creative_link_titles",
                    "ad_delivery_start_time",
                    "ad_delivery_stop_time",
                    "ad_snapshot_url",
                    "currency",
                    "funding_entity",
                    "page_name",
                    "page_id",
                    "impressions",
                    "spend"
                ]
            
            params = {
                "access_token": self.api_token,
                "search_terms": company_name,
                "ad_type": ad_type,
                "ad_active_status": ad_active_status,
                "search_page_ids": search_page_ids,
                "fields": ",".join(fields),
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error searching for ads by company '{company_name}': {e}")
            return []
    
    async def search_ads_by_page_id(
        self,
        page_id: str,
        limit: int = 10,
        ad_type: str = "POLITICAL_AND_ISSUE_ADS",
        ad_active_status: str = "ALL",
        fields: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for ads by Facebook Page ID using the Meta Ads Library API
        
        Args:
            page_id: Facebook Page ID
            limit: Maximum number of results to return
            ad_type: Type of ads to search for
            ad_active_status: Filter by ad status (ALL, ACTIVE, INACTIVE)
            fields: Fields to include in the response
            
        Returns:
            List of ads
        """
        try:
            url = f"{self.api_base_url}/ads_archive"
            
            # Default fields if not provided
            if fields is None:
                fields = [
                    "id", 
                    "ad_creation_time", 
                    "ad_creative_bodies", 
                    "ad_creative_link_captions", 
                    "ad_creative_link_descriptions",
                    "ad_creative_link_titles",
                    "ad_delivery_start_time",
                    "ad_delivery_stop_time",
                    "ad_snapshot_url",
                    "currency",
                    "funding_entity",
                    "page_name",
                    "impressions",
                    "spend"
                ]
            
            params = {
                "access_token": self.api_token,
                "search_page_ids": page_id,
                "ad_type": ad_type,
                "ad_active_status": ad_active_status,
                "fields": ",".join(fields),
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error searching for ads by page ID '{page_id}': {e}")
            return []
    
    async def get_company_ads_from_qloo_entities(
        self,
        qloo_entities: List[Dict[str, Any]],
        limit_per_entity: int = 5,
        total_limit: int = 20
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get ads for companies from QLoo entities
        
        Args:
            qloo_entities: List of QLoo entities representing companies
            limit_per_entity: Maximum number of ads to fetch per entity
            total_limit: Total maximum number of ads to return
            
        Returns:
            Dictionary mapping company names to their ads
        """
        try:
            results = {}
            total_ads = 0
            
            for entity in qloo_entities:
                # Extract company name
                company_name = entity.get("name", "")
                
                if not company_name:
                    continue
                
                # Search for ads by company name
                ads = await self.search_ads_by_company_name(company_name, limit=limit_per_entity)
                
                if ads:
                    results[company_name] = ads
                    total_ads += len(ads)
                    
                    # Check if we've reached the total limit
                    if total_ads >= total_limit:
                        break
            
            return results
        except Exception as e:
            logger.error(f"Error getting ads for companies from QLoo entities: {e}")
            return {}

# Instantiate service for easy import
meta_ads_service = MetaAdsService()