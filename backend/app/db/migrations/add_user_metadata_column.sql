-- Add user_metadata column to users table
-- This allows us to store dynamic properties like onboarding state and conversation IDs
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_metadata JSONB DEFAULT '{}'::jsonb;
