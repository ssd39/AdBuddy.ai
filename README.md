# AdBuddy.ai

A platform for businesses to create and manage ad campaigns on Facebook and Google.

## Project Structure

- `/frontend` - React frontend with Vite and TypeScript
- `/backend` - FastAPI backend
- `/scripts` - Utility scripts

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   ./setup_venv.sh
   source venv/bin/activate
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

4. API documentation will be available at: http://localhost:8000/docs

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The development server will start at: http://localhost:5173

### API Client Generation

To generate TypeScript clients for the API:

1. Make sure the backend server is running
2. Run the client generator script:
   ```bash
   node scripts/generate_client.js
   ```

## Development Workflow

1. Start both the backend and frontend development servers
2. Make changes to the code
3. Generate API client if backend API changes
4. Test your changes
5. Commit your changes