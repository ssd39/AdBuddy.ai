"""
Test script for the transcript processor to debug the issue with conversation lookup
"""
import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId

from app.services.transcript_processor import process_conversation_transcript

# Load environment variables
load_dotenv()

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "adbuddy")
CONVERSATION_ID = "c8e54e45ddd9144c"  # The conversation ID from the error logs
USER_ID = "688a260744e8d15d8078199b"  # The user ID from the error logs

async def test_find_conversation():
    """Test finding a conversation by ID"""
    print("\n--- Testing Conversation Lookup ---")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    
    # First, try to find the conversation with just the conversation_id
    print(f"Looking for conversation with ID: {CONVERSATION_ID}")
    conversation = await db.tavus_conversations.find_one({"conversation_id": CONVERSATION_ID})
    
    if conversation:
        print("✅ Conversation found by conversation_id!")
        print(f"  - Conversation ID: {conversation.get('conversation_id')}")
        print(f"  - User ID (string): {conversation.get('user_id')}")
        print(f"  - User ID (type): {type(conversation.get('user_id'))}")
        print(f"  - Status: {conversation.get('status')}")
        print(f"  - Created at: {conversation.get('created_at')}")
        print(f"  - Is processed: {conversation.get('is_processed', False)}")
        
        # Check if user_id in conversation matches the expected user_id
        conv_user_id = str(conversation.get('user_id', ''))
        if conv_user_id == USER_ID:
            print("✅ User ID in conversation matches expected User ID")
        else:
            print(f"❌ User ID mismatch: Expected {USER_ID}, got {conv_user_id}")
            
            # Try to find user by ID
            try:
                user_obj_id = ObjectId(USER_ID)
                user = await db.users.find_one({"_id": user_obj_id})
                if user:
                    print(f"✅ Found user with ID {USER_ID}")
                    print(f"  - Email: {user.get('email')}")
                else:
                    print(f"❌ User with ID {USER_ID} not found")
            except Exception as e:
                print(f"❌ Error converting user ID to ObjectId: {e}")
            
            # Check if the conversation user_id is valid ObjectId
            try:
                if isinstance(conversation.get('user_id'), str) and len(conversation.get('user_id')) == 24:
                    obj_id = ObjectId(conversation.get('user_id'))
                    print(f"✅ Conversation user_id is valid ObjectId: {obj_id}")
                    
                    # Try to find the user with this ID
                    user = await db.users.find_one({"_id": obj_id})
                    if user:
                        print(f"✅ Found user with conversation's user_id")
                        print(f"  - Email: {user.get('email')}")
                    else:
                        print(f"❌ User with conversation's user_id not found")
                else:
                    print(f"❌ Conversation user_id is not a valid ObjectId format")
            except Exception as e:
                print(f"❌ Error with conversation user_id: {e}")
    else:
        print(f"❌ No conversation found with ID: {CONVERSATION_ID}")
    
    # Now try with both conversation_id and user_id (as string)
    print("\nTrying with both conversation_id and user_id as string:")
    conversation = await db.tavus_conversations.find_one({
        "conversation_id": CONVERSATION_ID,
        "user_id": USER_ID
    })
    
    if conversation:
        print("✅ Found conversation with both conversation_id and string user_id")
    else:
        print("❌ No conversation found with both conversation_id and string user_id")
    
    # Try with conversation_id and user_id as ObjectId
    print("\nTrying with conversation_id and user_id as ObjectId:")
    try:
        user_obj_id = ObjectId(USER_ID)
        conversation = await db.tavus_conversations.find_one({
            "conversation_id": CONVERSATION_ID,
            "user_id": user_obj_id
        })
        
        if conversation:
            print("✅ Found conversation with conversation_id and ObjectId user_id")
        else:
            print("❌ No conversation found with conversation_id and ObjectId user_id")
    except Exception as e:
        print(f"❌ Error trying ObjectId conversion: {e}")

async def test_process_transcript():
    """Test the process_conversation_transcript function"""
    print("\n--- Testing Transcript Processing Function ---")
    
    print("Calling process_conversation_transcript with:")
    print(f"  - Conversation ID: {CONVERSATION_ID}")
    print(f"  - User ID: {USER_ID}")
    
    try:
        result = await process_conversation_transcript(
            conversation_id=CONVERSATION_ID,
            user_id=USER_ID
        )
        
        print(f"Result: {result}")
        if result.get("success"):
            print("✅ Transcript processing successful!")
        else:
            print(f"❌ Transcript processing failed: {result.get('error')}")
    except Exception as e:
        print(f"❌ Exception in process_conversation_transcript: {e}")
        import traceback
        print(traceback.format_exc())

async def main():
    """Main function to run all tests"""
    #print("=== Transcript Processor Tests ===")
    
    #await test_find_conversation()
    #print("\n" + "-" * 50)
    await test_process_transcript()

if __name__ == "__main__":
    asyncio.run(main())
