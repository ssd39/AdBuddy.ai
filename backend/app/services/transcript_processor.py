"""
Transcript processing service for extracting company information
from Tavus conversation transcripts using LangChain and OpenAI GPT-4.1
"""
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import json
import asyncio
from enum import Enum
import logging
from pydantic import BaseModel, Field

from app.db.client import get_async_mongodb_db
from bson.objectid import ObjectId
from app.core.config import settings

# LangChain imports
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field  # Use Pydantic directly

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_conversation_transcript(conversation_id: str, user_id: str) -> Dict[str, Any]:
    """
    Process a conversation transcript to extract company information.
    
    Args:
        conversation_id: The ID of the conversation to process
        user_id: The ID of the user who owns the conversation
        
    Returns:
        A dictionary containing the processing results
    """
    try:
        # 1. Fetch the transcript from the database
        db = await get_async_mongodb_db()
        mongo_user_id = user_id
  
        
        logger.info(f"Fetching transcript for conversation_id: {conversation_id}, user_id: {user_id}")

        conversation = await db.tavus_conversations.find_one({
            "conversation_id": conversation_id
        })
        
        if not conversation:
            logger.error(f"No conversation found with ID: {conversation_id} for user_id: {user_id}")
            return {"success": False, "error": "Conversation not found"}
        
        # Check if we have transcript data
        if not conversation.get("transcript"):
            logger.error(f"No transcript found for conversation_id: {conversation_id}")
            return {"success": False, "error": "No transcript data available"}
        # Get transcript, ensuring it's clean of problematic characters
        transcript = conversation.get("transcript", "")
        company_name, company_details = await extract_company_info_from_transcript(transcript)
        
        if not company_name:
            logger.warning(f"Failed to extract company name from transcript for conversation_id: {conversation_id}")
        
        # 4. Update user metadata with the extracted information
        user_result = await db.users.find_one({"_id": ObjectId(mongo_user_id)}, {"user_metadata": 1})
        
        if not user_result:
            logger.error(f"User not found with ID: {user_id}")
            return {"success": False, "error": "User not found"}
        
        # Get existing metadata or initialize empty dict
        user_metadata = user_result.get("user_metadata", {}) or {}
        
        # Update metadata with company information
        user_metadata["company_name"] = company_name
        user_metadata["company_details"] = company_details
        user_metadata["transcript_processed_at"] = datetime.now(timezone.utc)
        user_metadata["processed_conversation_id"] = conversation_id
        
        # Update the user record
        await db.users.update_one(
            {"_id": ObjectId(mongo_user_id)},
            {
                "$set": {
                    "user_metadata": user_metadata,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # 5. Mark conversation as processed
        await db.tavus_conversations.update_one(
            {"conversation_id": conversation_id},
            {"$set": {"is_processed": True}}
        )
        
        logger.info(f"Successfully processed transcript for conversation_id: {conversation_id}")
        
        return {
            "success": True,
            "company_name": company_name,
            "conversation_id": conversation_id,
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"success": False, "error": str(e)}

# Define the structured output schema with Pydantic
class CompanyInfo(BaseModel):
    """Schema for company information extracted from conversation"""
    company_name: str = Field(
        description="The extracted company name from the conversation"
    )
    company_details: str = Field(
        description="A comprehensive paragraph summarizing key information about the company including industry, target audience, products or services, challenges, goals, and selling points"
    )

async def extract_company_info_from_transcript(conversation_text: str) -> Tuple[str, str]:
    """
    Use LangChain with OpenAI to extract company name and generate detailed company information
    from the conversation transcript.
    
    Args:
        conversation_text: Plain text of the conversation transcript
        
    Returns:
        Tuple of (company_name, company_details)
    """
    try:
        # Configure LangChain OpenAI chat model
        llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model="gpt-4.1",  # Use the most capable model available
            temperature=0.2,  # Lower temperature for more deterministic output
        )
        
        # Set up the LLM with structured output
        structured_llm = llm.with_structured_output(CompanyInfo)
        
        # Create the prompt for the model - using only ASCII characters
        prompt = f"""You are an expert business analyst. Analyze this conversation transcript between a user and an AI assistant.
        Extract the company name and create a detailed summary of the company information mentioned in the conversation.
        Focus on key business details like industry, target audience, products or services, challenges, goals, and selling points.
        
        Here is the conversation transcript:
        
        {conversation_text}
        """
        
        # Call the LLM with the structured output schema
        response = await structured_llm.ainvoke(prompt)
        
        # Extract just the company name and details
        company_name = response.company_name
        company_details = response.company_details
        
        return company_name, company_details
    
    except Exception as e:
        logger.error(f"Error extracting company info with LangChain: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return "", f"Error extracting company information: {str(e)}"
