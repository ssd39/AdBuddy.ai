"""
Campaign processing service for generating ad campaigns from conversation transcripts
using LangChain, LangGraph, and OpenAI GPT-4.1
"""
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
from datetime import datetime
from bson.objectid import ObjectId

from app.core.config import settings
from app.db.client import get_async_mongodb_db
from app.services.qloo import qloo_service, QlooParameterSet

# Initialize traceloop for observability
Traceloop.init(
    disable_batch=True,
    api_key=settings.TRACE_LOOP_API_KEY
)

# Configure logging
logger = logging.getLogger(__name__)

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

class Budget(BaseModel):
    """Defines the budget for a campaign or ad set."""
    mode: BudgetMode = Field(..., description="The type of budget, e.g., daily or lifetime.")
    amount: float = Field(..., gt=0, description="The budget amount.")
    currency: str = Field("USD", description="The ISO 4217 currency code.")

class Targeting(BaseModel):
    """Defines the audience targeting for an ad set."""
    locations: Optional[List[str]] = Field(default=None, description="List of targeted countries, regions, or cities.")
    age_min: Optional[int] = Field(default=None, ge=13, description="Minimum age of the target audience.")
    age_max: Optional[int] = Field(default=None, le=65, description="Maximum age of the target audience.")
    genders: Optional[List[str]] = Field(default=None, description="Targeted genders (e.g., ['male', 'female']).")
    languages: Optional[List[str]] = Field(default=None, description="List of targeted language codes.")
    interests: Optional[List[str]] = Field(default=None, description="List of interests to target.")
    custom_audiences: Optional[List[str]] = Field(default=None, description="List of custom audience IDs.")

class Placement(BaseModel):
    """Defines where the ads will be shown."""
    automatic: bool = Field(True, description="Whether to use automatic placements.")
    instagram_positions: Optional[List[str]] = Field(default=None, description="Specific Instagram placements like 'stream', 'story', 'explore'.")
    tiktok_placements: Optional[List[str]] = Field(default=None, description="Specific TikTok placements like 'feed', 'topbuzz'.")

class Creative(BaseModel):
    """Represents the creative content of an ad."""
    ad_format: str = Field(..., description="The format of the ad (e.g., 'IMAGE', 'VIDEO', 'CAROUSEL').")
    primary_text: str = Field(..., description="The main text or caption of the ad.")
    headline: Optional[str] = Field(default=None, description="The headline of the ad.")
    description: Optional[str] = Field(default=None, description="A longer description for the ad.")

class AdSet(BaseModel):
    """Represents an ad set (Instagram) or ad group (TikTok)."""
    name: str = Field(..., description="The name of the ad set or ad group.")
    status: AdStatus = Field(AdStatus.PAUSED, description="The status of the ad set.")
    start_time: Optional[datetime] = Field(default=None, description="The start time for the ad set.")
    end_time: Optional[datetime] = Field(default=None, description="The end time for the ad set. Required for lifetime budgets.")
    budget: Budget = Field(..., description="The budget for this ad set.")
    targeting: Targeting = Field(..., description="The targeting criteria for this ad set.")
    placements: Placement = Field(..., description="The placements for the ads in this set.")
    optimization_goal: str = Field(..., description="The optimization goal for the ad set (e.g., 'REACH', 'CONVERSIONS').")
    creatives: List[Creative] = Field(..., description="A list of creatives to be used in this ad set.")

class AdCampaign(BaseModel):
    """A comprehensive model for a social media ad campaign."""
    name: str = Field(..., description="The name of the ad campaign.")
    objective: CampaignObjective = Field(..., description="The primary objective of the campaign.")
    status: AdStatus = Field(AdStatus.PAUSED, description="The current status of the campaign.")
    ad_sets: List[AdSet] = Field(..., description="A list of ad sets or ad groups belonging to this campaign.")
    campaign_budget: Optional[Budget] = Field(default=None, description="Campaign-level budget (Campaign Budget Optimization).")
    special_ad_category: Optional[str] = Field(default=None, description="Special ad category for sensitive topics (e.g., 'HOUSING', 'EMPLOYMENT').")
    platform_specific_ids: Optional[Dict[str, str]] = Field(default=None, description="Dictionary of platform-specific account/page IDs.")

class InitialPlanningOutput(BaseModel):
    """Combined output for initial campaign planning"""
    title: str = Field(..., description="Generated title for the campaign")
    qloo_query: str = Field(..., description="Generated query for the Qloo API")

class CreativeIdea(BaseModel):
    """A creative idea for the campaign"""
    title: str = Field(..., description="Title of the creative idea")
    description: str = Field(..., description="Detailed description of the creative idea")
    target_audience: str = Field(..., description="Description of the target audience for this idea")
    platforms: List[str] = Field(..., description="Recommended platforms for this creative idea")

class TodoItem(BaseModel):
    """A to-do item for the campaign implementation"""
    task: str = Field(..., description="Description of the task to be completed")
    priority: str = Field(..., description="Priority of the task (high, medium, low)")
    notes: Optional[str] = Field(default=None, description="Additional notes about the task")

class EnhancedCampaignOutput(BaseModel):
    """Enhanced output for campaign generation including more details"""
    ad_campaign: AdCampaign = Field(..., description="The structured ad campaign definition")
    campaign_goal: str = Field(..., description="Clear statement of the campaign's goal and objectives")
    target_audience_analysis: str = Field(..., description="Detailed analysis of the target audience")
    creative_ideas: List[CreativeIdea] = Field(..., description="List of creative ideas for the campaign")
    todo_list: List[TodoItem] = Field(..., description="List of action items to implement the campaign")
    kpis: List[str] = Field(..., description="Key Performance Indicators to measure campaign success")
    budget_allocation_strategy: str = Field(..., description="Strategy for allocating the campaign budget")

class CampaignState(TypedDict):
    """State for the campaign generation workflow"""
    campaign_id: str
    user_id: str
    transcript: List[Dict[str, Any]]
    company_name: Optional[str]
    company_details: Optional[str]
    title: Optional[str]
    qloo_query: Optional[str]
    qloo_data: Optional[List[Dict[str, Any]]]
    enhanced_campaign: Optional[EnhancedCampaignOutput]
    error: Optional[str]

class CampaignService:
    """Service for processing and generating ad campaigns"""
    
    def __init__(self):
        # Initialize LLM
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model="gpt-4.1",
            temperature=0.2
        )
        
        # Set up LangGraph workflow
        self.setup_langgraph()

    def setup_langgraph(self):
        """Sets up the LangGraph workflow for campaign generation"""
        self.workflow = StateGraph(CampaignState)
        
        # Add nodes for each step in the campaign generation process
        self.workflow.add_node("initial_planning", self.initial_planning)
        self.workflow.add_node("fetch_qloo_data", self.fetch_qloo_data)
        self.workflow.add_node("generate_enhanced_campaign", self.generate_enhanced_campaign)

        # Define the workflow edges
        self.workflow.add_edge(START, "initial_planning")
        self.workflow.add_edge("initial_planning", "fetch_qloo_data")
        self.workflow.add_edge("fetch_qloo_data", "generate_enhanced_campaign")
        self.workflow.add_edge("generate_enhanced_campaign", END)

        self.workflow_app = self.workflow.compile()

    def initial_planning(self, state: CampaignState) -> CampaignState:
        """Generate campaign title and Qloo query in a single step"""
        try:
            # Extract messages from transcript for the prompt
            messages_text = ""
            for msg in state["transcript"]:
                sender = msg.get("sender", "unknown")
                text = msg.get("text", "")
                messages_text += f"{sender}: {text}\n\n"
            
            # Create the prompt for initial planning
            prompt = ChatPromptTemplate.from_messages([
                ("system", """
                You are an advertising and marketing specialist. Based on the conversation transcript between a user and an AI,
                you need to produce two key outputs:
                
                1. A concise, memorable title for an ad campaign that captures what the business does and their advertising goals.
                   The title should be clear, professional, reflect the business identity, and be under 50 characters.
                
                2. A data query that will help find relevant audience data and business insights through the Qloo API.
                   The query should be concise but capture the key aspects of the business, target audience, and marketing goals.
                
                Use the company information and conversation transcript to inform both outputs.
                """),
                ("human", f"""
                Company Name: {state["company_name"]}
                
                Company Details: {state["company_details"]}
                
                Conversation Transcript:
                {messages_text}
                
                Generate both a campaign title and a Qloo query for finding relevant audience data:
                """)
            ])
            
            # Bind the schema to the LLM for structured output
            model_with_structure = self.llm.with_structured_output(InitialPlanningOutput)
            
            # Create and invoke the chain
            chain = prompt | model_with_structure
            result = chain.invoke({})
            
            # Update state with the generated title and query
            state["title"] = result.title
            state["qloo_query"] = result.qloo_query
            
        except Exception as e:
            logger.error(f"Error in initial planning: {e}")
            state["error"] = f"Initial planning error: {str(e)}"
            
        return state
    
    async def fetch_qloo_data(self, state: CampaignState) -> CampaignState:
        """Fetch data from the Qloo API using the generated query"""
        try:
            if not state["qloo_query"]:
                state["error"] = "No query available to fetch Qloo data"
                return state
                
            # Generate parameters using qloo_llm
            parameters = await qloo_service.qloo_llm(
                company_name=state["company_name"],
                company_details=state["company_details"],
                query=state["qloo_query"]
            )
            
            # Get insights from Qloo API
            insights = await qloo_service.get_insights(params=parameters)
            
            # Update state with the fetched data
            state["qloo_data"] = insights
            
        except Exception as e:
            logger.error(f"Error fetching Qloo data: {e}")
            state["error"] = f"Data fetch error: {str(e)}"
            
        return state
    
    def generate_enhanced_campaign(self, state: CampaignState) -> CampaignState:
        """Generate a complete enhanced campaign based on all the collected data"""
        try:
            # Extract messages from transcript for the prompt
            messages_text = ""
            for msg in state["transcript"]:
                sender = msg.get("sender", "unknown")
                text = msg.get("text", "")
                messages_text += f"{sender}: {text}\n\n"
            
            # Extract audience IDs from Qloo data for use in the prompt
            audience_ids = []
            if state["qloo_data"]:
                for entity in state["qloo_data"]:
                    if "audience_ids" in entity:
                        audience_ids.extend(entity.get("audience_ids", []))
            
            # Format Qloo data for the prompt - escaping curly braces to avoid template variable interpretation
            if state["qloo_data"]:
                # Use repr to convert the dictionary to a string and preserve escape sequences
                # Then replace single quotes with double quotes for valid JSON format
                qloo_data_str = repr(state["qloo_data"]).replace("'", "\"")
                # Escape curly braces to avoid template variable interpretation
                qloo_data_summary = qloo_data_str.replace("{", "{{").replace("}", "}}")
            else:
                qloo_data_summary = "No data available"
            
            # Create the prompt for enhanced campaign generation
            prompt = ChatPromptTemplate.from_messages([
                ("system", """
                You are an expert advertising strategist. Based on the provided company information, conversation transcript, 
                and audience data, create a comprehensive, detailed campaign plan.
                
                Your output should include:
                1. A structured AdCampaign with precise targeting and creative specifications
                2. A clear statement of the campaign's goals and objectives
                3. Detailed target audience analysis
                4. A list of creative ideas with titles, descriptions, target audiences, and recommended platforms
                5. A to-do list of action items to implement the campaign
                6. Key Performance Indicators (KPIs) to measure campaign success
                7. A budget allocation strategy
                
                Be practical, strategic, and focus on micro-targeting different audience segments with tailored content.
                Include specific ad formats, copy ideas, and creative directions.
                """),
                ("human", f"""
                Company Name: {state["company_name"]}
                Campaign Title: {state["title"]}
                
                Company Details: {state["company_details"]}
                
                Audience Data & Insights:
                {qloo_data_summary}
                
                Conversation Transcript:
                {messages_text}
                
                Generate a complete enhanced campaign plan:
                """)
            ])
            
            # Bind the schema to the LLM for structured output
            model_with_structure = self.llm.with_structured_output(EnhancedCampaignOutput)
            
            # Create and invoke the chain
            chain = prompt | model_with_structure
            result = chain.invoke({})
            
            # Update state with the generated enhanced campaign
            state["enhanced_campaign"] = result
            
        except Exception as e:
            logger.error(f"Error generating enhanced campaign: {e}")
            state["error"] = f"Enhanced campaign generation error: {str(e)}"
            
        return state

    async def process_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """
        Process a campaign from the database and generate an ad campaign
        
        Args:
            campaign_id: ID of the campaign to process
            
        Returns:
            Dictionary with processing results
        """
        try:
            db = await get_async_mongodb_db()
            
            # Fetch the campaign from database
            campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
            if not campaign:
                return {"success": False, "error": f"Campaign not found with ID: {campaign_id}"}
            
            user_id = campaign.get("user_id")
            if not user_id:
                return {"success": False, "error": "Campaign has no associated user ID"}
            
            # Get user metadata for company info
            user_result = await db.users.find_one({"_id": ObjectId(user_id)}, {"user_metadata": 1})
            if not user_result:
                return {"success": False, "error": f"User not found with ID: {user_id}"}
            
            user_metadata = user_result.get("user_metadata", {}) or {}
            company_name = user_metadata.get("company_name", "Unknown Company")
            company_details = user_metadata.get("company_details", "")
            
            # Initialize state for workflow
            initial_state = CampaignState(
                campaign_id=campaign_id,
                user_id=user_id,
                transcript=campaign.get("messages", []),
                company_name=company_name,
                company_details=company_details,
                title=None,
                qloo_query=None,
                qloo_data=None,
                ad_campaign=None,
                error=None
            )
            
            # Execute the workflow
            final_state = await self.workflow_app.ainvoke(initial_state)
            
            if final_state.get("error"):
                logger.error(f"Error in campaign workflow: {final_state['error']}")
                
                # Update campaign status to error
                await db.campaigns.update_one(
                    {"_id": ObjectId(campaign_id)},
                    {"$set": {
                        "status": "error",
                        "error_message": final_state["error"],
                        "updated_at": datetime.now()
                    }}
                )
                
                return {"success": False, "error": final_state["error"]}
            
            # Campaign generation successful - update the campaign with the results
            enhanced_campaign = final_state.get("enhanced_campaign")
            if not enhanced_campaign:
                return {"success": False, "error": "No enhanced campaign generated"}
            
            # Update campaign in database
            update_result = await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$set": {
                    "title": final_state["title"],
                    "status": "processed",
                    "ad_campaign": enhanced_campaign.ad_campaign.model_dump(),
                    "campaign_goal": enhanced_campaign.campaign_goal,
                    "target_audience_analysis": enhanced_campaign.target_audience_analysis,
                    "creative_ideas": [idea.model_dump() for idea in enhanced_campaign.creative_ideas],
                    "todo_list": [item.model_dump() for item in enhanced_campaign.todo_list],
                    "kpis": enhanced_campaign.kpis,
                    "budget_allocation_strategy": enhanced_campaign.budget_allocation_strategy,
                    "updated_at": datetime.now()
                }}
            )
            
            if update_result.modified_count == 0:
                logger.warning(f"Campaign {campaign_id} was not updated")
                
            return {
                "success": True,
                "campaign_id": campaign_id,
                "title": final_state["title"],
                "status": "processed"
            }
            
        except Exception as e:
            logger.exception(f"Error processing campaign: {e}")
            
            try:
                # Update campaign status to error
                db = await get_async_mongodb_db()
                await db.campaigns.update_one(
                    {"_id": ObjectId(campaign_id)},
                    {"$set": {
                        "status": "error",
                        "error_message": str(e),
                        "updated_at": datetime.now()
                    }}
                )
            except Exception as update_error:
                logger.error(f"Error updating campaign status: {update_error}")
                
            return {"success": False, "error": str(e)}

# Initialize the singleton service
campaign_service = CampaignService()
