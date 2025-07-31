"""
Script to test the find_and_store_similar_companies function with a real MongoDB database
Takes a user ID as parameter and looks up the user's metadata to find similar companies
"""
import asyncio
import sys
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson.objectid import ObjectId

# Load environment variables from .env
load_dotenv()

# Import after environment variables are loaded
from app.db.client import get_async_mongodb_db
from app.api.tavus import find_and_store_similar_companies

async def run_find_similar_companies(user_id: str):
    """
    Find and store similar companies for a user with real database
    
    Args:
        user_id: User ID string or ObjectId hex string
    """
    try:
        print(f"\n=== Finding Similar Companies for User ID: {user_id} ===\n")
        
        # Connect to MongoDB
        db = await get_async_mongodb_db()
        
        # Convert to ObjectId if it's a valid ObjectId string
        try:
            if len(user_id) == 24:
                obj_id = ObjectId(user_id)
                print(f"Converting user_id to ObjectId: {obj_id}")
            else:
                obj_id = user_id
                print(f"Using user_id as is: {user_id}")
        except Exception as e:
            print(f"Error converting to ObjectId, using as string: {e}")
            obj_id = user_id
        
        # Fetch the user
        user_data = await db.users.find_one({"_id": obj_id})
        if not user_data:
            print(f"⚠️ User not found with ID {user_id}")
            return
            
        print(f"Found user: {user_data.get('email')}")
        
        # Get user metadata
        user_metadata = user_data.get("user_metadata", {}) or {}
        
        # Display company information
        company_name = user_metadata.get("company_name", "")
        company_details = user_metadata.get("company_details", "")
        
        print(f"Company Name: {company_name}")
        print(f"Company Details: {company_details[:100]}..." if len(company_details or "") > 100 else f"Company Details: {company_details}")
        
        if not company_name:
            print("⚠️ No company name found in user metadata")
            return
        
        # Find and store similar companies
        print("\nFinding similar companies...")
        result = await find_and_store_similar_companies(db, user_id, user_metadata)
        
        # Display results
        if result.get("success"):
            print(f"✅ Success! Found {result['count']} similar companies")
            print(f"Inserted with ID: {result['insert_id']}")
            
            # Query the database to get the companies we just stored
            competitor_data = await db.competitors.find_one({"_id": ObjectId(result['insert_id'])})
            
            if competitor_data and "competitors_data" in competitor_data:
                print(f"\nTop 3 Similar Companies:")
                companies = competitor_data["competitors_data"][:3]  # Get first 3
                for i, company in enumerate(companies, 1):
                    print(f"{i}. {company.get('name', 'Unknown')}")
                    if "description" in company:
                        print(f"   Description: {company['description'][:100]}..." if len(company['description']) > 100 else f"   Description: {company['description']}")
            else:
                print("Could not retrieve stored companies")
        else:
            print(f"⚠️ Failed: {result.get('message') or result.get('error', 'Unknown error')}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    user_id = "688a260744e8d15d8078199b"
    asyncio.run(run_find_similar_companies(user_id))
