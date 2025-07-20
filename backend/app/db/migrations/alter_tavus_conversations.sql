-- Add new columns to tavus_conversations table
ALTER TABLE tavus_conversations
ADD COLUMN IF NOT EXISTS tavus_tracking_id UUID,
ADD COLUMN IF NOT EXISTS completion_url TEXT,
ADD COLUMN IF NOT EXISTS persona_id TEXT,
ADD COLUMN IF NOT EXISTS replica_id TEXT,
ADD COLUMN IF NOT EXISTS conversation_name TEXT;

-- Comment on columns
COMMENT ON COLUMN tavus_conversations.tavus_tracking_id IS 'Our internal tracking ID for the conversation';
COMMENT ON COLUMN tavus_conversations.completion_url IS 'URL to the completed conversation video';
COMMENT ON COLUMN tavus_conversations.persona_id IS 'Tavus persona ID used for this conversation';
COMMENT ON COLUMN tavus_conversations.replica_id IS 'Tavus replica ID used for this conversation';
COMMENT ON COLUMN tavus_conversations.conversation_name IS 'Name of the conversation';