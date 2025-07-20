-- This migration ensures the tavus_conversations table structure matches
-- the data structure from Tavus webhooks for application.transcription_ready events

-- Ensure metadata is JSONB type and can store structured transcript data
ALTER TABLE IF EXISTS tavus_conversations 
ALTER COLUMN metadata TYPE JSONB USING metadata::jsonb;

-- Add a comment to explain the expected structure for webhook data
COMMENT ON COLUMN tavus_conversations.metadata IS 'JSON data including transcript_structured array for conversation messages';

-- Ensure event_type field exists to store the webhook event type
ALTER TABLE IF EXISTS tavus_conversations 
ADD COLUMN IF NOT EXISTS event_type TEXT;

COMMENT ON COLUMN tavus_conversations.event_type IS 'Type of event from Tavus webhook (e.g., application.transcription_ready)';

-- Ensure webhook_url field exists
ALTER TABLE IF EXISTS tavus_conversations 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

COMMENT ON COLUMN tavus_conversations.webhook_url IS 'URL of the webhook endpoint that received the event';

-- Add a flag to indicate if the conversation has been processed
ALTER TABLE IF EXISTS tavus_conversations 
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN tavus_conversations.is_processed IS 'Flag to indicate if the conversation has been processed';
