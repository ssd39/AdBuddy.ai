from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.database import Database
from pymongo import MongoClient
from app.core.config import settings
import asyncio

# MongoDB clients
_async_client = None
_sync_client = None

# Initialize MongoDB client
def get_mongodb_client() -> MongoClient:
    """
    Returns a MongoDB client instance using environment variables
    """
    global _sync_client
    if _sync_client is None:
        _sync_client = MongoClient(settings.MONGODB_URI)
    return _sync_client

def get_mongodb_db() -> Database:
    """
    Returns a MongoDB database instance
    """
    return get_mongodb_client()[settings.MONGODB_DATABASE]

# Initialize async MongoDB client
async def get_async_mongodb_client() -> AsyncIOMotorClient:
    """
    Returns an async MongoDB client instance using environment variables
    """
    global _async_client
    if _async_client is None:
        _async_client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _async_client

async def get_async_mongodb_db() -> AsyncIOMotorDatabase:
    """
    Returns an async MongoDB database instance
    """
    client = await get_async_mongodb_client()
    return client[settings.MONGODB_DATABASE]
