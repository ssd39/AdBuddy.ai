-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    competitors_data JSONB NOT NULL,
    source TEXT DEFAULT 'qloo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON competitors(user_id);
