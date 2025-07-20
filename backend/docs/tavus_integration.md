# Tavus API Integration

This document explains how to set up and use the Tavus API integration for video onboarding.

## Prerequisites

1. A Tavus account with API access
2. Persona and Replica created in Tavus

## Environment Variables

Configure these environment variables in your `.env` file:

```
TAVUS_API_KEY=your-tavus-api-key
TAVUS_PERSONA_ID=your-tavus-persona-id
TAVUS_REPLICA_ID=your-tavus-replica-id  # Optional if persona has a default replica
BACKEND_URL=https://your-backend-url.com  # For callback URL
```

## Endpoints

### Create Conversation

`POST /api/v1/tavus/create-conversation`

Creates a new Tavus conversation and returns the URL where the user can join.

**Request:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "conversation_name": "Onboarding Call"  // Optional
}
```

**Response:**
```json
{
  "conversation_id": "12345",
  "conversation_url": "https://meet.tavus.io/12345",
  "status": "created"
}
```

### Check Conversation Status

`GET /api/v1/tavus/conversation-status/{conversation_id}`

Checks the status of a conversation.

**Response:**
```json
{
  "conversation_id": "12345",
  "status": "completed",
  "is_completed": true,
  "created_at": "2023-01-01T12:00:00Z",
  "completed_at": "2023-01-01T12:30:00Z"
}
```

### Callback Webhook

`POST /api/v1/tavus/callback`

Webhook that receives updates from Tavus when a conversation status changes.

## Database

The integration uses the `tavus_conversations` table with the following schema:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users table)
- `conversation_id`: String (Tavus conversation ID)
- `conversation_url`: String (URL for the conversation)
- `tavus_tracking_id`: UUID (Our internal tracking ID)
- `email`: String (User's email)
- `status`: String (e.g., "created", "completed")
- `created_at`: Timestamp
- `completed_at`: Timestamp
- `transcript`: Text (conversation transcript)
- `duration_seconds`: Integer
- `metadata`: JSON
- `completion_url`: String (URL to the completed recording)
- `persona_id`: String (Tavus persona ID)
- `replica_id`: String (Tavus replica ID)
- `conversation_name`: String (Name of the conversation)

## Migration

Run the SQL migration script:

```sql
-- Add new columns to tavus_conversations table
ALTER TABLE tavus_conversations
ADD COLUMN IF NOT EXISTS tavus_tracking_id UUID,
ADD COLUMN IF NOT EXISTS completion_url TEXT,
ADD COLUMN IF NOT EXISTS persona_id TEXT,
ADD COLUMN IF NOT EXISTS replica_id TEXT,
ADD COLUMN IF NOT EXISTS conversation_name TEXT;
```