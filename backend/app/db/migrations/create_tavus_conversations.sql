-- Create tavus_conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS tavus_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    conversation_id TEXT NOT NULL,
    conversation_url TEXT,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    tavus_tracking_id UUID,
    created_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    transcript TEXT,
    duration_seconds INTEGER,
    metadata JSONB,
    completion_url TEXT,
    persona_id TEXT,
    replica_id TEXT,
    conversation_name TEXT
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tavus_conversations_user_id ON tavus_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tavus_conversations_conversation_id ON tavus_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tavus_conversations_status ON tavus_conversations(status);

-- Add comments for documentation
COMMENT ON TABLE tavus_conversations IS 'Stores information about video call onboarding conversations';
COMMENT ON COLUMN tavus_conversations.tavus_tracking_id IS 'Our internal tracking ID for the conversation';
COMMENT ON COLUMN tavus_conversations.completion_url IS 'URL to the completed conversation video';
COMMENT ON COLUMN tavus_conversations.persona_id IS 'Tavus persona ID used for this conversation';
COMMENT ON COLUMN tavus_conversations.replica_id IS 'Tavus replica ID used for this conversation';
COMMENT ON COLUMN tavus_conversations.conversation_name IS 'Name of the conversation';