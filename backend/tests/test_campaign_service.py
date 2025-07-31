#!/usr/bin/env python3
"""
Test script for Campaign service - processes a campaign with a given ID
"""
import sys
import os
import asyncio
import logging

# Add the parent directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.campaign import campaign_service

# Configure logging
def setup_logging():
    """Configure logging to show all logs in console"""
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Create console handler and set level
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(console_handler)
    
    # Configure specific loggers you want to see
    logging.getLogger('app.services.campaign').setLevel(logging.DEBUG)
    
    return logger


async def test_process_campaign(campaign_id: str):
    """
    Test the process_campaign function with a given campaign ID
    
    Args:
        campaign_id: ID of the campaign to process
        
    Returns:
        Dictionary with processing results
    """
    try:
        # Call the process_campaign function with the provided campaign ID
        print(f"Processing campaign with ID: {campaign_id}")
        result = await campaign_service.process_campaign(campaign_id)
        
        # Print the results
        if result.get("success"):
            print(f"Campaign processed successfully:")
            print(f"  Campaign ID: {result.get('campaign_id')}")
            print(f"  Title: {result.get('title')}")
            print(f"  Status: {result.get('status')}")
        else:
            print(f"Campaign processing failed:")
            print(f"  Error: {result.get('error')}")
        
        return result
    except Exception as e:
        print(f"Error testing process_campaign: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    setup_logging()
    campaign_id = "688b7a5a60c04b1a5000e8d7"
    print(f"Running test with campaign_id: {campaign_id}")
    result = asyncio.run(test_process_campaign(campaign_id))
    print(f"\nTest completed. Result: {result}")
