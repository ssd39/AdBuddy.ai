#!/usr/bin/env python3
"""
Runner script for Qloo service tests
"""
import asyncio
import logging
import sys
from test_qloo_service import test_get_similar_companies_from_metadata

# Configure logging
def setup_logging():
    """Configure logging to show all logs in console"""
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)  # Set to DEBUG to see more detailed logs
    
    # Create console handler and set level
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(console_handler)
    
    # Configure specific loggers you want to see
    logging.getLogger('app.services.qloo').setLevel(logging.DEBUG)
    
    return logger

async def run_tests():
    """
    Run all Qloo service tests
    """
    print("===== Testing Qloo Service =====")
    print("\nTesting get_similar_companies_from_metadata...")
    
    results = await test_get_similar_companies_from_metadata()
    
    print("\n===== Test Results =====")
    print(f"\n===== No Of Results: {len(results)}")
    print("\n===== Test Complete =====")

if __name__ == "__main__":
    # Setup logging before running tests
    logger = setup_logging()
    logger.info("Starting Qloo Service tests...")
    
    try:
        asyncio.run(run_tests())
    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        raise
