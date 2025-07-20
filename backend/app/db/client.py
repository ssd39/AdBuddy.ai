from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
def get_supabase_client() -> Client:
    """
    Returns a Supabase client instance using environment variables
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)