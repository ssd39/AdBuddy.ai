import json
import logging
from typing import Dict, List, Any, Optional, TypedDict, Annotated, Sequence
import httpx

from traceloop.sdk import Traceloop
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END, START
from enum import Enum
from app.core.config import settings

Traceloop.init(
    disable_batch=True,
    api_key=settings.TRACE_LOOP_API_KEY
)

# Configure logging
logger = logging.getLogger(__name__)

class QlooParameterSet(BaseModel):
    """Comprehensive model for QLoo API parameters"""
    # Filter parameters
    filter_type: str = Field(
        description="Type of entities to filter: urn:entity:artist, urn:entity:book, urn:entity:brand, urn:entity:destination, urn:entity:movie, urn:entity:person, urn:entity:place, urn:entity:podcast, urn:entity:tv_show, urn:entity:videogame, urn:heatmap",
        default="urn:entity:brand"
    )
    
    # Filter by tags parameters
    filter_tags: Optional[List[str]] = Field(
        description="Industry tags or categories for filtering. Needs to do tag search step to fill this.",
        default=None
    )
    operator_filter_tags: Optional[str] = Field(
        description="How to combine multiple filter.tags ('union' or 'intersection')",
        default=None
    )
    filter_exclude_tags: Optional[List[str]] = Field(
        description="Tags to exclude from results. Needs to do tag search step to fill this.",
        default=None
    )
    operator_exclude_tags: Optional[str] = Field(
        description="How to combine multiple filter.exclude.tags ('union' or 'intersection')",
        default=None
    )
    
    # Popularity parameters
    filter_popularity_min: Optional[float] = Field(
        description="Minimum popularity percentile (0 to 1)",
        default=None
    )
    filter_popularity_max: Optional[float] = Field(
        description="Maximum popularity percentile (0 to 1)",
        default=None
    )
    
    # Location parameters
    filter_location: Optional[str] = Field(
        description="WKT location (POINT, POLYGON) or locality ID. Needs to do location search step.",
        default=None
    )
    filter_location_lat: Optional[float] = Field(
        description="Location latitude for geographic filtering. Needs to do location search step.",
        default=None
    )
    filter_location_lng: Optional[float] = Field(
        description="Location longitude for geographic filtering. Needs to do location search step.",
        default=None
    )
    filter_location_radius: Optional[int] = Field(
        description="Radius in meters for location filtering",
        default=None
    )
    filter_location_query: Optional[str] = Field(
        description="String query to search for a locality",
        default=None
    )
    filter_location_geohash: Optional[str] = Field(
        description="Geohash prefix to filter by",
        default=None
    )
    filter_exclude_location: Optional[str] = Field(
        description="Location to exclude from results. Needs to do location search step.",
        default=None
    )
    filter_exclude_location_query: Optional[str] = Field(
        description="String query to search for a locality to exclude",
        default=None
    )
    filter_exclude_location_geohash: Optional[str] = Field(
        description="Geohash prefix to exclude",
        default=None
    )
    
    # Geocode parameters
    filter_geocode_admin1_region: Optional[str] = Field(
        description="Filter by admin1_region (state/province)",
        default=None
    )
    filter_geocode_admin2_region: Optional[str] = Field(
        description="Filter by admin2_region (county/borough)",
        default=None
    )
    filter_geocode_country_code: Optional[str] = Field(
        description="Filter by two-letter country code",
        default=None
    )
    filter_geocode_name: Optional[str] = Field(
        description="Filter by locality name (city/town)",
        default=None
    )
    
    # External service parameters
    filter_external_exists: Optional[List[str]] = Field(
        description="Filter by external services (resy, michelin, tablet)",
        default=None
    )
    operator_filter_external_exists: Optional[str] = Field(
        description="How to combine multiple filter.external.exists ('union' or 'intersection')",
        default=None
    )
    filter_external_resy_count_min: Optional[int] = Field(
        description="Minimum Resy rating count",
        default=None
    )
    filter_external_resy_count_max: Optional[int] = Field(
        description="Maximum Resy rating count",
        default=None
    )
    filter_external_resy_rating_min: Optional[float] = Field(
        description="Minimum Resy rating (1-5 scale)",
        default=None
    )
    filter_external_resy_rating_max: Optional[float] = Field(
        description="Maximum Resy rating (1-5 scale)",
        default=None
    )
    filter_external_resy_party_size_min: Optional[int] = Field(
        description="Minimum supported party size",
        default=None
    )
    filter_external_resy_party_size_max: Optional[int] = Field(
        description="Maximum supported party size",
        default=None
    )
    filter_external_tripadvisor_rating_count_min: Optional[int] = Field(
        description="Minimum Tripadvisor review count",
        default=None
    )
    filter_external_tripadvisor_rating_count_max: Optional[int] = Field(
        description="Maximum Tripadvisor review count",
        default=None
    )
    filter_external_tripadvisor_rating_min: Optional[float] = Field(
        description="Minimum Tripadvisor rating (0-5 scale)",
        default=None
    )
    filter_external_tripadvisor_rating_max: Optional[float] = Field(
        description="Maximum Tripadvisor rating (0-5 scale)",
        default=None
    )
    
    # Rating parameters
    filter_rating_min: Optional[float] = Field(
        description="Minimum Qloo rating (0-5 scale)",
        default=None
    )
    filter_rating_max: Optional[float] = Field(
        description="Maximum Qloo rating (0-5 scale)",
        default=None
    )
    filter_properties_business_rating_min: Optional[float] = Field(
        description="Minimum business rating",
        default=None
    )
    filter_properties_business_rating_max: Optional[float] = Field(
        description="Maximum business rating",
        default=None
    )
    
    # Price parameters
    filter_price_level_min: Optional[int] = Field(
        description="Minimum price level (1-4, similar to $ signs)",
        default=None
    )
    filter_price_level_max: Optional[int] = Field(
        description="Maximum price level (1-4, similar to $ signs)",
        default=None
    )
    filter_price_range_from: Optional[int] = Field(
        description="Minimum price in range",
        default=None
    )
    filter_price_range_to: Optional[int] = Field(
        description="Maximum price in range",
        default=None
    )
    filter_price_min: Optional[float] = Field(
        description="Minimum price",
        default=None
    )
    filter_price_max: Optional[float] = Field(
        description="Maximum price",
        default=None
    )
    
    # Content parameters
    filter_content_rating: Optional[str] = Field(
        description="Content rating (G, PG, PG-13, R, NC-17)",
        default=None
    )
    filter_exists: Optional[str] = Field(
        description="Filter to include only entities with specified properties",
        default=None
    )
    filter_hours: Optional[str] = Field(
        description="Day of week the POI must be open",
        default=None
    )
    
    # Date and year parameters
    filter_release_year_min: Optional[int] = Field(
        description="Earliest desired release year",
        default=None
    )
    filter_release_year_max: Optional[int] = Field(
        description="Latest desired release year",
        default=None
    )
    filter_release_date_min: Optional[str] = Field(
        description="Earliest desired release date",
        default=None
    )
    filter_release_date_max: Optional[str] = Field(
        description="Latest desired release date",
        default=None
    )
    filter_publication_year_min: Optional[int] = Field(
        description="Earliest publication year",
        default=None
    )
    filter_publication_year_max: Optional[int] = Field(
        description="Latest publication year",
        default=None
    )
    filter_latest_known_year_min: Optional[int] = Field(
        description="Earliest year of release or update",
        default=None
    )
    filter_latest_known_year_max: Optional[int] = Field(
        description="Latest year of release or update",
        default=None
    )
    filter_finale_year_min: Optional[int] = Field(
        description="Earliest year for final season of a TV show",
        default=None
    )
    filter_finale_year_max: Optional[int] = Field(
        description="Latest year for final season of a TV show",
        default=None
    )
    
    # Demographic parameters
    filter_date_of_birth_min: Optional[str] = Field(
        description="Earliest date of birth for person",
        default=None
    )
    filter_date_of_birth_max: Optional[str] = Field(
        description="Latest date of birth for person",
        default=None
    )
    filter_date_of_death_min: Optional[str] = Field(
        description="Earliest date of death for person",
        default=None
    )
    filter_date_of_death_max: Optional[str] = Field(
        description="Latest date of death for person",
        default=None
    )
    filter_gender: Optional[str] = Field(
        description="Filter by gender identity",
        default=None
    )
    filter_hotel_class_min: Optional[int] = Field(
        description="Minimum hotel class (1-5)",
        default=None
    )
    filter_hotel_class_max: Optional[int] = Field(
        description="Maximum hotel class (1-5)",
        default=None
    )
    
    # Entity filters
    filter_references_brand: Optional[List[str]] = Field(
        description="Brand entity IDs to filter by",
        default=None
    )
    filter_release_country: Optional[List[str]] = Field(
        description="Countries where a movie/TV show was released",
        default=None
    )
    operator_filter_release_country: Optional[str] = Field(
        description="How to combine multiple filter.release_country ('union' or 'intersection')",
        default=None
    )
    filter_results_entities: Optional[str] = Field(
        description="Comma-separated entity IDs to filter results",
        default=None
    )
    filter_exclude_entities: Optional[str] = Field(
        description="Entity IDs to exclude from results",
        default=None
    )
    filter_results_tags: Optional[List[str]] = Field(
        description="Tag IDs to filter results. Needs to do tag search step to fill this.",
        default=None
    )
    filter_parents_types: Optional[str] = Field(
        description="Parental entity types to filter by",
        default=None
    )
    
    # Signal parameters - demographics
    signal_demographics_age: Optional[str] = Field(
        description="Age ranges that influence affinity score. Valid values: 35_and_younger, 36_to_55, 24_and_younger, 25_to_29, 30_to_34, 35_to_44, 45_to_54, 55_and_older",
        default=None
    )
    signal_demographics_age_weight: Optional[float] = Field(
        description="Weight of age-based demographic signals",
        default=None
    )
    signal_demographics_audiences: Optional[List[str]] = Field(
        description="Audiences that influence affinity score. Needs to do audience search step to fill this.",
        default=None
    )
    signal_demographics_audiences_weight: Optional[float] = Field(
        description="Weight of audience-based signals",
        default=None
    )
    signal_demographics_gender: Optional[str] = Field(
        description="Gender to influence affinity score",
        default=None
    )
    signal_demographics_gender_weight: Optional[float] = Field(
        description="Weight of gender-based signals",
        default=None
    )
    
    # Signal parameters - interests
    signal_interests_entities: Optional[List[str]] = Field(
        description="Entity IDs that influence affinity scores",
        default=None
    )
    signal_interests_entities_weight: Optional[float] = Field(
        description="Weight of entity-based signals",
        default=None
    )
    signal_interests_tags: Optional[List[str]] = Field(
        description="Tags that influence affinity scores. Needs to do tag search step to fill this.",
        default=None
    )
    signal_interests_tags_weight: Optional[float] = Field(
        description="Weight of tag-based signals",
        default=None
    )
    
    # Signal parameters - location
    signal_location: Optional[str] = Field(
        description="Geolocation for geospatial results. Needs to do location search step.",
        default=None
    )
    signal_location_radius: Optional[int] = Field(
        description="Radius in meters for signal.location",
        default=None
    )
    signal_location_query: Optional[str] = Field(
        description="String query to search for a locality",
        default=None
    )
    signal_location_weight: Optional[float] = Field(
        description="Weight of location-based signals",
        default=None
    )
    
    # Bias parameters
    bias_trends: Optional[str] = Field(
        description="Level of impact trending entities have on results",
        default=None
    )
    
    # Diversity parameters
    diversify_by: Optional[str] = Field(
        description="Property to use for diversifying results",
        default=None
    )
    diversify_take: Optional[int] = Field(
        description="Number of results per diversification group",
        default=None
    )
    
    # Output parameters
    feature_explainability: Optional[bool] = Field(
        description="Include explainability metadata for recommendations",
        default=None
    )
    output_heatmap_boundary: Optional[str] = Field(
        description="Type of heatmap output (geohashes, city, neighborhood)",
        default=None
    )
    
    # Pagination parameters
    page: Optional[int] = Field(
        description="Page number of results to return",
        default=None
    )
    take: Optional[int] = Field(
        description="Number of results to return per page",
        default=25
    )
    offset: Optional[int] = Field(
        description="Number of results to skip",
        default=None
    )
    
    # Sorting parameters
    sort_by: Optional[str] = Field(
        description="How to sort results ('affinity' or 'distance')",
        default=None
    )
    
    def to_api_params(self) -> Dict[str, str]:
        """Convert to QLoo API parameters"""
        params = {}
        
        # Helper function to add parameters with proper formatting
        def add_param(api_name, value, is_list=False):
            if value is not None:
                if is_list and isinstance(value, list):
                    params[api_name] = ",".join(str(x) for x in value)
                else:
                    params[api_name] = str(value)
        
        # Basic filter parameters
        add_param("filter.type", self.filter_type)
        
        # Tag parameters
        add_param("filter.tags", self.filter_tags, True)
        add_param("operator.filter.tags", self.operator_filter_tags)
        add_param("filter.exclude.tags", self.filter_exclude_tags, True)
        add_param("operator.exclude.tags", self.operator_exclude_tags)
        
        # Popularity parameters
        add_param("filter.popularity.min", self.filter_popularity_min)
        add_param("filter.popularity.max", self.filter_popularity_max)
        
        # Location parameters
        add_param("filter.location", self.filter_location)
        add_param("filter.location.lat", self.filter_location_lat)
        add_param("filter.location.lng", self.filter_location_lng)
        add_param("filter.location.radius", self.filter_location_radius)
        add_param("filter.location.query", self.filter_location_query)
        add_param("filter.location.geohash", self.filter_location_geohash)
        add_param("filter.exclude.location", self.filter_exclude_location)
        add_param("filter.exclude.location.query", self.filter_exclude_location_query)
        add_param("filter.exclude.location.geohash", self.filter_exclude_location_geohash)
        
        # Geocode parameters
        add_param("filter.geocode.admin1_region", self.filter_geocode_admin1_region)
        add_param("filter.geocode.admin2_region", self.filter_geocode_admin2_region)
        add_param("filter.geocode.country_code", self.filter_geocode_country_code)
        add_param("filter.geocode.name", self.filter_geocode_name)
        
        # External service parameters
        add_param("filter.external.exists", self.filter_external_exists, True)
        add_param("operator.filter.external.exists", self.operator_filter_external_exists)
        add_param("filter.external.resy.count.min", self.filter_external_resy_count_min)
        add_param("filter.external.resy.count.max", self.filter_external_resy_count_max)
        add_param("filter.external.resy.rating.min", self.filter_external_resy_rating_min)
        add_param("filter.external.resy.rating.max", self.filter_external_resy_rating_max)
        add_param("filter.external.resy.party_size.min", self.filter_external_resy_party_size_min)
        add_param("filter.external.resy.party_size.max", self.filter_external_resy_party_size_max)
        add_param("filter.external.tripadvisor.rating.count.min", self.filter_external_tripadvisor_rating_count_min)
        add_param("filter.external.tripadvisor.rating.count.max", self.filter_external_tripadvisor_rating_count_max)
        add_param("filter.external.tripadvisor.rating.min", self.filter_external_tripadvisor_rating_min)
        add_param("filter.external.tripadvisor.rating.max", self.filter_external_tripadvisor_rating_max)
        
        # Rating parameters
        add_param("filter.rating.min", self.filter_rating_min)
        add_param("filter.rating.max", self.filter_rating_max)
        add_param("filter.properties.business_rating.min", self.filter_properties_business_rating_min)
        add_param("filter.properties.business_rating.max", self.filter_properties_business_rating_max)
        
        # Price parameters
        add_param("filter.price_level.min", self.filter_price_level_min)
        add_param("filter.price_level.max", self.filter_price_level_max)
        add_param("filter.price_range.from", self.filter_price_range_from)
        add_param("filter.price_range.to", self.filter_price_range_to)
        add_param("filter.price.min", self.filter_price_min)
        add_param("filter.price.max", self.filter_price_max)
        
        # Content parameters
        add_param("filter.content_rating", self.filter_content_rating)
        add_param("filter.exists", self.filter_exists)
        add_param("filter.hours", self.filter_hours)
        
        # Date and year parameters
        add_param("filter.release_year.min", self.filter_release_year_min)
        add_param("filter.release_year.max", self.filter_release_year_max)
        add_param("filter.release_date.min", self.filter_release_date_min)
        add_param("filter.release_date.max", self.filter_release_date_max)
        add_param("filter.publication_year.min", self.filter_publication_year_min)
        add_param("filter.publication_year.max", self.filter_publication_year_max)
        add_param("filter.latest_known_year.min", self.filter_latest_known_year_min)
        add_param("filter.latest_known_year.max", self.filter_latest_known_year_max)
        add_param("filter.finale_year.min", self.filter_finale_year_min)
        add_param("filter.finale_year.max", self.filter_finale_year_max)
        
        # Demographic parameters
        add_param("filter.date_of_birth.min", self.filter_date_of_birth_min)
        add_param("filter.date_of_birth.max", self.filter_date_of_birth_max)
        add_param("filter.date_of_death.min", self.filter_date_of_death_min)
        add_param("filter.date_of_death.max", self.filter_date_of_death_max)
        add_param("filter.gender", self.filter_gender)
        add_param("filter.hotel_class.min", self.filter_hotel_class_min)
        add_param("filter.hotel_class.max", self.filter_hotel_class_max)
        
        # Entity filters
        add_param("filter.references_brand", self.filter_references_brand, True)
        add_param("filter.release_country", self.filter_release_country, True)
        add_param("operator.filter.release_country", self.operator_filter_release_country)
        add_param("filter.results.entities", self.filter_results_entities)
        add_param("filter.exclude.entities", self.filter_exclude_entities)
        add_param("filter.results.tags", self.filter_results_tags, True)
        add_param("filter.parents.types", self.filter_parents_types)
        
        # Signal parameters - demographics
        add_param("signal.demographics.age", self.signal_demographics_age)
        add_param("signal.demographics.age.weight", self.signal_demographics_age_weight)
        add_param("signal.demographics.audiences", self.signal_demographics_audiences, True)
        add_param("signal.demographics.audiences.weight", self.signal_demographics_audiences_weight)
        add_param("signal.demographics.gender", self.signal_demographics_gender)
        add_param("signal.demographics.gender.weight", self.signal_demographics_gender_weight)
        
        # Signal parameters - interests
        add_param("signal.interests.entities", self.signal_interests_entities, True)
        add_param("signal.interests.entities.weight", self.signal_interests_entities_weight)
        add_param("signal.interests.tags", self.signal_interests_tags, True)
        add_param("signal.interests.tags.weight", self.signal_interests_tags_weight)
        
        # Signal parameters - location
        add_param("signal.location", self.signal_location)
        add_param("signal.location.radius", self.signal_location_radius)
        add_param("signal.location.query", self.signal_location_query)
        add_param("signal.location.weight", self.signal_location_weight)
        
        # Bias parameters
        add_param("bias.trends", self.bias_trends)
        
        # Diversity parameters
        add_param("diversify.by", self.diversify_by)
        add_param("diversify.take", self.diversify_take)
        
        # Output parameters
        add_param("feature.explainability", self.feature_explainability)
        add_param("output.heatmap.boundary", self.output_heatmap_boundary)
        
        # Pagination parameters
        add_param("page", self.page)
        add_param("take", self.take)
        add_param("offset", self.offset)
        
        # Sorting parameters
        add_param("sort_by", self.sort_by)
        
        return params


class CompanyInfo(BaseModel):
    """Model for company information extracted from metadata"""
    company_name: str = Field(description="Name of the company")
    industry: Optional[str] = Field(description="Primary industry of the company", default=None)
    location: Optional[str] = Field(description="Location of the company (city, country)", default=None)
    target_audience: Optional[str] = Field(description="Target audience of the company", default=None)
    company_size: Optional[str] = Field(description="Size of the company (e.g., startup, small, medium, enterprise)", default=None)
    product_category: Optional[str] = Field(description="Main product/service category", default=None)
    business_model: Optional[str] = Field(description="Business model (e.g., B2B, B2C, SaaS)", default=None)
    competitors: Optional[List[str]] = Field(description="Known competitors", default=None)
    unique_selling_points: Optional[List[str]] = Field(description="Unique selling points or key differentiators", default=None)
    year_founded: Optional[int] = Field(description="Year the company was founded", default=None)


class GeocodingResult(BaseModel):
    """Model for geocoding results"""
    latitude: float = Field(description="Latitude coordinate")
    longitude: float = Field(description="Longitude coordinate")
    address: Optional[Dict[str, Any]] = Field(description="Address details", default=None)


class TagResolvingQuery(BaseModel):
    """Model for tag resolving query parameters"""
    feature_typo_tolerance: bool = Field(
        description="When set to true, allows tolerance for typos in the filter.query parameter. For example, a query for 'Mediterranaen' would return tags with the word 'Mediterranean' in their titles.",
        default=False
    )
    filter_results_tags: Optional[List[str]] = Field(
        description="Filter by a comma-separated list of tag IDs. Often used to assess the affinity of a tag towards input",
        default=None
    )
    filter_parents_types: Optional[str] = Field(
        description="Filter by a comma-separated list of parental entity types.",
        default=None
    )
    filter_popularity_min: Optional[float] = Field(
        description="Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).",
        ge=0,
        le=1,
        default=None
    )
    filter_popularity_max: Optional[float] = Field(
        description="Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).",
        ge=0,
        le=1,
        default=None
    )
    filter_query: Optional[str] = Field(
        description="A partial string search on the audience or tag name. IMPORTANT: Use only a SINGLE relevant word or short phrase (NO commas allowed). For example, 'Mediterranean' is valid but 'Mediterranean, dining, wine' is NOT supported.",
        default=None
    )
    page: Optional[int] = Field(
        description="The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.",
        ge=1,
        default=None
    )
    take: Optional[int] = Field(
        description="The number of results to return.",
        ge=1,
        default=None
    )


class TagParamsResolver(BaseModel):
    param_name: str = Field(..., description="Target parameter in QlooParamSet for tag resolution")
    query_params: Optional[TagResolvingQuery] = Field(default=None, description="Parameters for tag search API query")
    answer_finalising_query: str = Field(..., description="Query for LLM to select relevant tags from API response")


class AudienceResolvingQuery(BaseModel):
    """Model for audience resolving query parameters"""
    filter_parents_types: Optional[str] = Field(
        description="Filter by a comma-separated list of parental entity types.",
        default=None
    )
    filter_results_audiences: Optional[List[str]] = Field(
        description="Filter by a comma-separated list of audience IDs.",
        default=None
    )
    filter_audience_types: Optional[List[str]] = Field(
        description="Filter by a list of audience types.",
        default=None
    )
    filter_popularity_min: Optional[float] = Field(
        description="Filter by the minimum popularity percentile required for a Point of Interest (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).",
        ge=0,
        le=1,
        default=None
    )
    filter_popularity_max: Optional[float] = Field(
        description="Filter by the maximum popularity percentile a Point of Interest must have (float, between 0 and 1; closer to 1 indicates higher popularity, e.g., 0.98 for the 98th percentile).",
        ge=0,
        le=1,
        default=None
    )
    page: Optional[int] = Field(
        description="The page number of results to return. This is equivalent to take + offset and is the recommended approach for most use cases.",
        ge=1,
        default=None
    )
    take: Optional[int] = Field(
        description="The number of results to return.",
        ge=1,
        default=None
    )

 
class AudienceParamsResolver(BaseModel):
    param_name: str = Field(..., description="Target parameter in QlooParamSet for audience resolution")
    query_params: Optional[AudienceResolvingQuery] = Field(default=None, description="Parameters for audience search API query")
    answer_finalising_query: str = Field(..., description="Query for LLM to select relevant audience IDs from API response")


class LocationResolver(BaseModel):
    param_name: str = Field(..., description="Target parameter in QlooParamSet for location resolution")
    loaction_name: str = Field(..., description="Location name to geocode")


class TagIdsOutput(BaseModel):
    """Model for tag IDs extracted by LLM"""
    tag_ids: List[str] = Field(..., description="List of tag IDs extracted from the API response")


class AudienceIdsOutput(BaseModel):
    """Model for audience IDs extracted by LLM"""
    audience_ids: List[str] = Field(..., description="List of audience IDs extracted from the API response")


class PlannerOutput(BaseModel):
    qloo_params: QlooParameterSet = Field(..., description="Instance of qloo params where you try to set possible values you can set and not dependent on any extra steps")
    tag_resolving_queries: List[TagParamsResolver] = Field(default_factory=list, description="Parameters for which we need to do tag search to resolve those")
    location_resolving_queries: List[LocationResolver] = Field(default_factory=list, description="List of location to resolve the params")
    audience_resolving_queries: List[AudienceParamsResolver] = Field(default_factory=list, description="Parameters for which we need to do audience search to resolve those")


class QlooState(TypedDict):
    """State object for the LangGraph workflow"""
    company_name: str
    company_details: str
    final_params: Optional[QlooParameterSet]
    tag_resolving_queries: List[TagParamsResolver]
    location_resolving_queries: List[LocationResolver]
    audience_resolving_queries: List[AudienceParamsResolver]
    error: Optional[str]
    query: str


class QlooService:
    """Service for interacting with the QLoo API to find similar companies"""
    
    def __init__(self):
        # API configuration
        self.api_base_url = settings.QLOO_API_BASE_URL
        self.api_key = settings.QLOO_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key
        }
        self.here_api_key = settings.HERE_API_KEY
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model="gpt-4.1",
            temperature=0.1
        )
        
        # Set up LLM for parameter generation using LangGraph
        self.setup_langgraph()

    def planner(self, state: QlooState) -> QlooState:
        """
        Generate parameters using LLM with structured output and update the state
        
        Args:
            state: Current state with company information and query
            
        Returns:
            Updated state with generated parameters and resolving queries
        """
        # Create the prompt - keeping the same prompt as requested
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""
You are AdBuddy's data agent with access to the Qloo API for taste-based insights.

### Bussiness Information
Company Name: {state["company_name"]}
Company Details: {state["company_details"]}


Generate appropriate Qloo parameters for the insights API. Some parameters require additional resolution steps:

1. For tag parameters: Add entries to tag_resolving_queries with proper TagResolverQuery instances.
2. For location parameters: Add entries to location_resolving_queries with proper LocationResolver instances.
3. For audience parameters: Use these parent types to filter specific audience data:
   - urn:audience:communities
   - urn:audience:global_issues
   - urn:audience:hobbies_and_interests
   - urn:audience:investing_interests
   - urn:audience:leisure
   - urn:audience:life_stage
   - urn:audience:lifestyle_preferences_beliefs
   - urn:audience:political_preferences
   - urn:audience:professional_area
   - urn:audience:spending_habits

For filter_type parameter: Select the appropriate entity type based on the query context.
            """),
            ("human", state["query"])
        ])
        
        # Bind the schema to the LLM for structured output
        model_with_structure = self.llm.with_structured_output(PlannerOutput)
        
        # Create and invoke the chain
        chain = prompt | model_with_structure
        
        try:
            # Get the structured output
            planner_output = chain.invoke({})

            state["final_params"] = planner_output.qloo_params
            state["tag_resolving_queries"] = planner_output.tag_resolving_queries
            state["location_resolving_queries"] = planner_output.location_resolving_queries
            state["audience_resolving_queries"] = planner_output.audience_resolving_queries
            
        except Exception as e:
            logger.error(f"Error in planner: {e}")
            state["error"] = f"Planning error: {str(e)}"
            
        return state
    
    async def process_resolvers(self, state: QlooState) -> QlooState:
        """
        Process all resolving queries (tag, audience, location) and update parameters
        
        Args:
            state: Current state with resolving queries and initial parameters
            
        Returns:
            Updated state with processed parameters
        """
        try:
            if not state["final_params"]:
                state["error"] = "No parameters to process"
                return state
                
            # Process all resolving queries and get updated parameters
            processed_params = await self._process_resolving_queries(
                state["final_params"],
                state["tag_resolving_queries"],
                state["audience_resolving_queries"],
                state["location_resolving_queries"]
            )
            
            # Update the state with processed parameters
            state["final_params"] = processed_params
            
            return state
        except Exception as e:
            logger.error(f"Error processing resolving queries: {e}")
            state["error"] = f"Error processing resolving queries: {str(e)}"
            return state
    
    def setup_langgraph(self):
        """Sets up a strategy-driven, conditional LangGraph workflow."""
        self.workflow = StateGraph(QlooState)
        
        # Add nodes for planning and processing resolvers
        self.workflow.add_node("planner", self.planner)
        self.workflow.add_node("process_resolvers", self.process_resolvers)

        # Define the workflow edges
        self.workflow.add_edge(START, "planner")
        self.workflow.add_edge("planner", "process_resolvers")
        self.workflow.add_edge("process_resolvers", END)

        self.workflow_app = self.workflow.compile()

    async def _resolve_tags(self, tag_resolver: TagParamsResolver) -> List[str]:
        """
        Resolve tags using the tag search API
        
        Args:
            tag_resolver: Parameters for resolving tags
            
        Returns:
            List of resolved tag IDs
        """
        try:
            url = f"{self.api_base_url}/v2/tags"
            
            # Convert query parameters to API parameters
            params = {}
            if tag_resolver.query_params:
                query_params = tag_resolver.query_params
                if query_params.feature_typo_tolerance is not None:
                    params["feature.typo_tolerance"] = str(query_params.feature_typo_tolerance).lower()
                if query_params.filter_results_tags:
                    params["filter.results.tags"] = ",".join(query_params.filter_results_tags)
                if query_params.filter_parents_types:
                    params["filter.parents.types"] = query_params.filter_parents_types
                if query_params.filter_popularity_min is not None:
                    params["filter.popularity.min"] = str(query_params.filter_popularity_min)
                if query_params.filter_popularity_max is not None:
                    params["filter.popularity.max"] = str(query_params.filter_popularity_max)
                if query_params.filter_query:
                    params["filter.query"] = query_params.filter_query
                if query_params.page:
                    params["page"] = str(query_params.page)
                if query_params.take:
                    params["take"] = str(query_params.take)
            
            # Construct full URL with parameters for logging
            query_string = "&".join([f"{k}={v}" for k, v in params.items()]) if params else ""
            full_url = f"{url}?{query_string}" if query_string else url
            logger.info(f"Making API request to: {full_url}")
            
            # Make API request with 5-minute timeout
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Process results based on the answer finalizing query
                if tag_resolver.answer_finalising_query and data:
                    # Use LLM with structured output to process the results
                    # Use raw string to avoid template variable interpretation issues with JSON
                    prompt_messages = [
                        ("system", """
                        Extract relevant tag IDs from the Qloo API response that best match the query.
                        """),
                        ("human", f"""
                        Query: {tag_resolver.answer_finalising_query}
                        
                        API Response (Tags):
                        {json.dumps(data, indent=2).replace('{', '{{').replace('}', '}}')}
                        
                        Return only the relevant tag IDs as a list of strings.
                        """)
                    ]
                    prompt = ChatPromptTemplate.from_messages(prompt_messages)
                    
                    # Bind the schema to the model for structured output
                    model_with_structure = self.llm.with_structured_output(TagIdsOutput)
                    
                    # Create and invoke the chain
                    chain = prompt | model_with_structure
                    
                    try:
                        structured_response = await chain.ainvoke({})
                        tag_ids = structured_response.tag_ids
                    except Exception as e:
                        logger.error(f"Error processing tag IDs with LLM: {e}")
                        raise
                else:
                    raise Exception("Not sufficient params to resolve tags")
                
                return tag_ids
                
        except Exception as e:
            logger.exception(f"Error resolving tags: {e}")
            return []

    async def _resolve_audiences(self, audience_resolver: AudienceParamsResolver) -> List[str]:
        """
        Resolve audiences using the audiences/types API
        
        Args:
            audience_resolver: Parameters for resolving audiences
            
        Returns:
            List of resolved audience IDs
        """
        try:
            url = f"{self.api_base_url}/v2/audiences/types"
            
            # Convert query parameters to API parameters
            params = {}
            if audience_resolver.query_params:
                query_params = audience_resolver.query_params
                if query_params.filter_parents_types:
                    params["filter.parents.types"] = query_params.filter_parents_types
                if query_params.filter_results_audiences:
                    params["filter.results.audiences"] = ",".join(query_params.filter_results_audiences)
                if query_params.filter_audience_types:
                    params["filter.audience.types"] = ",".join(query_params.filter_audience_types)
                if query_params.filter_popularity_min is not None:
                    params["filter.popularity.min"] = str(query_params.filter_popularity_min)
                if query_params.filter_popularity_max is not None:
                    params["filter.popularity.max"] = str(query_params.filter_popularity_max)
                if query_params.page:
                    params["page"] = str(query_params.page)
                if query_params.take:
                    params["take"] = str(query_params.take)
            
            # Construct full URL with parameters for logging
            query_string = "&".join([f"{k}={v}" for k, v in params.items()]) if params else ""
            full_url = f"{url}?{query_string}" if query_string else url
            logger.info(f"Making API request to: {full_url}")
            
            # Make API request with 5-minute timeout
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Process results based on the answer finalizing query
                if audience_resolver.answer_finalising_query and data:
                    # Use LLM with structured output to process the results
                    # Use raw string to avoid template variable interpretation issues with JSON
                    prompt_messages = [
                        ("system", """
                        Extract relevant audience IDs from the Qloo API response that best match the query.
                        """),
                        ("human", f"""
                        Query: {audience_resolver.answer_finalising_query}
                        
                        API Response (Audiences):
                        {json.dumps(data, indent=2).replace('{', '{{').replace('}', '}}')}
                        
                        Return only the relevant audience IDs as a list of strings.
                        """)
                    ]
                    prompt = ChatPromptTemplate.from_messages(prompt_messages)
                    
                    # Bind the schema to the model for structured output
                    model_with_structure = self.llm.with_structured_output(AudienceIdsOutput)
                    
                    # Create and invoke the chain
                    chain = prompt | model_with_structure
                    
                    try:
                        structured_response = await chain.ainvoke({})
                        audience_ids = structured_response.audience_ids
                    except Exception as e:
                        logger.error(f"Error processing audience IDs with LLM: {e}")
                        # Fallback to extracting IDs directly from results
                        raise
                else:
                     raise Exception("Not sufficient params to resolve audience")
                
                return audience_ids
                
        except Exception as e:
            logger.exception(f"Error resolving audiences: {e}")
            return []

    async def _resolve_locations(self, location_resolver: LocationResolver) -> Dict[str, Any]:
        """
        Resolve locations using geocoding
        
        Args:
            location_resolver: Parameters for resolving locations
            
        Returns:
            Dictionary with location data (latitude, longitude)
        """
        try:
            location_name = location_resolver.loaction_name
            geocode_result = await self._geocode_location(location_name)
            
            if not geocode_result:
                logger.warning(f"Failed to geocode location: {location_name}")
                return {}
            
            # Return location data with latitude and longitude
            return {
                "lat": geocode_result.latitude,
                "lng": geocode_result.longitude
            }
                
        except Exception as e:
            logger.exception(f"Error resolving location: {e}")
            return {}

    async def _process_resolving_queries(self, 
                                       params: QlooParameterSet, 
                                       tag_resolvers: List[TagParamsResolver],
                                       audience_resolvers: List[AudienceParamsResolver],
                                       location_resolvers: List[LocationResolver]) -> QlooParameterSet:
        """
        Process all resolving queries and update the QlooParameterSet accordingly
        
        Args:
            params: The initial parameters
            tag_resolvers: List of tag resolvers
            audience_resolvers: List of audience resolvers
            location_resolvers: List of location resolvers
            
        Returns:
            Updated QlooParameterSet
        """
        # Process tag resolvers
        for tag_resolver in tag_resolvers:
            tag_ids = await self._resolve_tags(tag_resolver)
            if tag_ids:
                # Update the appropriate parameter in params
                param_name = tag_resolver.param_name
                if hasattr(params, param_name):
                    # If the parameter is a list type, extend it rather than replace it
                    current_value = getattr(params, param_name)
                    if isinstance(current_value, list) and current_value:
                        # Combine existing values with new values, avoiding duplicates
                        combined_values = list(set(current_value + tag_ids))
                        setattr(params, param_name, combined_values)
                    else:
                        # If current value is None or empty list, just set the new values
                        setattr(params, param_name, tag_ids)
        
        # Process audience resolvers
        for audience_resolver in audience_resolvers:
            audience_ids = await self._resolve_audiences(audience_resolver)
            if audience_ids:
                # Update the appropriate parameter in params
                param_name = audience_resolver.param_name
                if hasattr(params, param_name):
                    # If the parameter is a list type, extend it rather than replace it
                    current_value = getattr(params, param_name)
                    if isinstance(current_value, list) and current_value:
                        # Combine existing values with new values, avoiding duplicates
                        combined_values = list(set(current_value + audience_ids))
                        setattr(params, param_name, combined_values)
                    else:
                        # If current value is None or empty list, just set the new values
                        setattr(params, param_name, audience_ids)
        
        # Process location resolvers
        for location_resolver in location_resolvers:
            location_data = await self._resolve_locations(location_resolver)
            if location_data:
                # Update the appropriate parameter in params
                param_name = location_resolver.param_name
                if param_name.endswith("_lat") and "lat" in location_data:
                    setattr(params, param_name, location_data["lat"])
                elif param_name.endswith("_lng") and "lng" in location_data:
                    setattr(params, param_name, location_data["lng"])
                elif param_name == "filter_location" and "lat" in location_data and "lng" in location_data:
                    wkt_point = f"POINT({location_data['lng']} {location_data['lat']})"
                    setattr(params, param_name, wkt_point)
        setattr(params, "take", 25)
        return params

    async def _geocode_location(self, location: str) -> Optional[GeocodingResult]:
        """
        Convert a location string to geographic coordinates (latitude, longitude) using Here Maps API.
        Input should be a location string like 'San Francisco, CA' or 'London, UK'.
        """
        try:
            if not location or not self.here_api_key:
                logger.warning("Location is empty or Here Maps API key not configured")
                return None
                
            url = "https://geocode.search.hereapi.com/v1/geocode"
            params = {
                "q": location,
                "apiKey": self.here_api_key
            }
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                items = data.get("items", [])
                
                if not items:
                    logger.warning(f"No geocoding results found for location '{location}'")
                    return None
                
                position = items[0].get("position", {})
                result = GeocodingResult(
                    latitude=position.get("lat"),
                    longitude=position.get("lng"),
                    address=items[0].get("address", {})
                )
                
                return result
        except Exception as e:
            logger.exception(f"Error geocoding location '{location}': {e}")
            return None

    async def get_insights(self, params: QlooParameterSet) -> List[Dict[str, Any]]:
        """
        Get insights from the QLoo API based on provided parameters
        
        Args:
            params: Dictionary of parameters for the insights API
            
        Returns:
            List of insight results
        """
        try:
            url = f"{self.api_base_url}/v2/insights"
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.get(url, headers=self.headers, params=params.to_api_params())
                response.raise_for_status()
                data = response.json()
                if data.get("success"):
                    return data.get("results", {"entities": []}).get("entities", [])
        except Exception as e:
            logger.exception(f"Error getting insights: {e}")
        return []
   
    async def qloo_llm(self, company_name: str, company_details: str, query: str) -> QlooParameterSet:
        """
        Generate QLoo API parameters using the LangGraph workflow
        
        Args:
            company_name: Name of the company
            company_details: Description of the company
            query: Query to generate parameters for
            
        Returns:
            QlooParameterSet object with generated parameters
        """
        try:
            # Initialize the state for the new workflow
            initial_state = QlooState(
                company_name=company_name,
                company_details=company_details,
                query=query,
                tag_resolving_queries=[],
                location_resolving_queries=[],
                audience_resolving_queries=[],
                final_params=None,
                error=None
            )
            
            # Execute the workflow
            final_state = await self.workflow_app.ainvoke(initial_state)
            if final_state["final_params"]:
                return final_state["final_params"]
            raise Exception("Failed to resolve the parameters for the insights API")
        except Exception as e:
            logger.exception(f"Error generating QLoo parameters: {e}")
            raise e
    
    async def get_similar_companies_from_metadata(self, company_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Find similar companies using company metadata from user_metadata
        
        Args:
            company_metadata: Dict containing company_name and company_details
            limit: Maximum number of results to return
            
        Returns:
            List of similar companies with their details
        """
        try:
            company_name = company_metadata.get("company_name", "")
            company_details = company_metadata.get("company_details", "")
            
            if not company_name:
                logger.error("Company name is required but not provided")
                return []

            if company_details:
                # Generate parameters using LangGraph workflow directly
                parameters = await self.qloo_llm(
                    company_name,
                    company_details,
                    "Find businesses similar to the given business"
                )
                return await self.get_insights(params=parameters)
        except Exception as e:
            logger.exception(f"Error getting similar companies: {e}")
        return []


qloo_service = QlooService()
