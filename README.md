# Tecnops AI Tasks Generator

A backend API for generating structured project tasks using OpenAI GPT-5.2.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/ai/generate-tasks`

## API Usage

### POST /api/ai/generate-tasks

Generate structured tasks from a project scope.

**Request:**
```json
{
  "scope": "Build a user authentication system with email/password login and password reset functionality"
}
```

**Response:**
```json
{
  "epics": [
    {
      "title": "User Authentication",
      "description": "Implement secure user authentication system",
      "features": [
        {
          "title": "Email/Password Login",
          "description": "Allow users to login with email and password",
          "tasks": [
            {
              "title": "Create login form",
              "description": "Build UI form for email and password input",
              "acceptance_criteria": [
                "Form validates email format",
                "Password field is masked",
                "Submit button is disabled until form is valid"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Project Structure

- `app/api/ai/generate-tasks/route.ts` - Main API route handler
- `lib/prompts.ts` - System prompt constant
- `lib/openai-client.ts` - Reusable OpenAI client function

