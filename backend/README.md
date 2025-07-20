# AdBuddy.ai Backend

Backend API for AdBuddy.ai - a platform for businesses to create and manage ad campaigns.

## Features

- Email OTP authentication
- Magic link authentication
- User onboarding flow
- JWT-based session management
- Supabase integration
- FastAPI backend

## Setup

### Prerequisites

- Python 3.8+
- Supabase account (for database and authentication)

### Environment Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with the following variables:

```
API_ENV=development
API_DEBUG=true
API_HOST=0.0.0.0
API_PORT=8000

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# For email sending (optional during development)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@adbuddy.ai
```

### Database Setup

1. Create the necessary tables in Supabase:
   - Use the SQL script in `app/db/migrations/create_tables.sql`

### Running the API

```bash
# From the backend directory
python -m app.main
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Authentication

- `POST /api/v1/auth/login/otp/send` - Send OTP code to email
- `POST /api/v1/auth/login/otp/verify` - Verify OTP code and get access token
- `POST /api/v1/auth/login/magic-link` - Send magic link to email
- `GET /api/v1/auth/me` - Get current user information

### Onboarding

- `GET /api/v1/onboarding/status` - Get user's onboarding status
- `POST /api/v1/onboarding/complete` - Complete user onboarding

## Frontend Integration

The authentication system is designed to work with the frontend, which should:

1. Implement login screens for email input
2. Handle OTP verification or magic link redirection
3. Store JWT tokens securely
4. Check onboarding status after authentication
5. Implement onboarding flow if the user is not onboarded