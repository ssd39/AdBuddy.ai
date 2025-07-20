from supabase import create_client, create_async_client, Client, AsyncClient
from app.core.config import settings

# Initialize Supabase client
def get_supabase_client() -> Client:
    """
    Returns a Supabase client instance using environment variables
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Initialize async Supabase client
async def get_async_supabase_client() -> AsyncClient:
    """
    Returns an async Supabase client instance using environment variables
    """
    return await create_async_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
