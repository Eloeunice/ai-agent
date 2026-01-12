import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { callOpenAI } from '@/lib/openai-client';

// Type definitions for the API request and response
interface GenerateTasksRequest {
  userId?: string; // Optional: for user isolation (frontend POC)
  projectName?: string; // Optional: for user isolation (frontend POC)
  scope: string;
}

interface Task {
  title: string;
  description: string;
  acceptance_criteria: string[];
}

interface SubBug {
  title: string;
  description: string;
  acceptance_criteria: string[];
}

interface UserStory {
  title: string;
  description: string;
  tasks: Task[];
  sub_bugs: SubBug[];
}

interface Bug {
  title: string;
  description: string;
  tasks: Task[];
  sub_bugs: SubBug[];
}

interface Feature {
  title: string;
  description: string;
  user_stories: UserStory[];
  bugs: Bug[];
}

interface Epic {
  title: string;
  description: string;
  features: Feature[];
}

interface GenerateTasksResponse {
  epics: Epic[];
}

/**
 * POST /api/ai/generate-tasks
 * 
 * Generates a structured task breakdown from a project scope using OpenAI GPT-5.2
 * following TECNOPS hierarchy rules: Epic → Feature → (User Story | Bug) → (Task | Sub-bug)
 * 
 * Request body:
 * {
 *   "userId": "string (optional) - user identifier for isolation",
 *   "projectName": "string (optional) - project name",
 *   "scope": "string - project scope description"
 * }
 * 
 * Response:
 * {
 *   "epics": [
 *     {
 *       "title": "string",
 *       "description": "string",
 *       "features": [
 *         {
 *           "title": "string",
 *           "description": "string",
 *           "user_stories": [
 *             {
 *               "title": "string",
 *               "description": "string",
 *               "tasks": [
 *                 {
 *                   "title": "string",
 *                   "description": "string",
 *                   "acceptance_criteria": ["string"]
 *                 }
 *               ],
 *               "sub_bugs": [
 *                 {
 *                   "title": "string",
 *                   "description": "string",
 *                   "acceptance_criteria": ["string"]
 *                 }
 *               ]
 *             }
 *           ],
 *           "bugs": [
 *             {
 *               "title": "string",
 *               "description": "string",
 *               "tasks": [
 *                 {
 *                   "title": "string",
 *                   "description": "string",
 *                   "acceptance_criteria": ["string"]
 *                 }
 *               ],
 *               "sub_bugs": [
 *                 {
 *                   "title": "string",
 *                   "description": "string",
 *                   "acceptance_criteria": ["string"]
 *                 }
 *               ]
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: GenerateTasksRequest = await request.json();
    
    // Validate that scope is provided and is a non-empty string
    if (!body.scope || typeof body.scope !== 'string' || body.scope.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "scope" field is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Call OpenAI GPT-5.2 with the system prompt and user scope
    const modelResponse = await callOpenAI(SYSTEM_PROMPT, body.scope.trim());

    // Parse the JSON response from the model
    // The model should return valid JSON matching our GenerateTasksResponse structure
    let parsedResponse: GenerateTasksResponse;
    try {
      parsedResponse = JSON.parse(modelResponse);
    } catch (parseError) {
      // If the response is not valid JSON, return an error
      return NextResponse.json(
        { error: 'Invalid response format from AI model. Expected valid JSON.' },
        { status: 500 }
      );
    }

    // Validate that the response has the expected structure
    if (!parsedResponse.epics || !Array.isArray(parsedResponse.epics)) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI model. Expected "epics" array.' },
        { status: 500 }
      );
    }

    // Return the structured response
    return NextResponse.json(parsedResponse);

  } catch (error) {
    // Handle JSON parsing errors (malformed request body)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle any other unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

