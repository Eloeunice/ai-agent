import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { backlogAgent } from '@/lib/agent';
import type { GenerateTasksRequest, GenerateTasksResponse } from '@/lib/types';

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

    // Use Langchain agent to generate structured backlog
    // The agent uses the TECNOPS hierarchy rules and returns structured JSON
    const userMessage = body.projectName 
      ? `Project: ${body.projectName}\n\nScope: ${body.scope.trim()}`
      : body.scope.trim();

    // Invoke the agent with the user message
    // The agent expects HumanMessage objects from Langchain
    const agentResponse = await backlogAgent.invoke({
      messages: [new HumanMessage(userMessage)],
    });

    // The agent returns structured data matching backlogSchema
    // The response format ensures the output matches the Zod schema
    let parsedResponse: GenerateTasksResponse;
    
    // Extract structured response from agent state
    // When using responseFormat, the result is in structuredResponse
    if (agentResponse.structuredResponse) {
      parsedResponse = agentResponse.structuredResponse as GenerateTasksResponse;
    } else {
      // Fallback: use the entire response object (shouldn't happen with responseFormat)
      console.warn('Agent response missing structuredResponse, using full response object');
      parsedResponse = agentResponse as unknown as GenerateTasksResponse;
    }

    // Validate that the response has the expected structure
    if (!parsedResponse || !parsedResponse.epics || !Array.isArray(parsedResponse.epics)) {
      console.error('Invalid agent response structure:', JSON.stringify(agentResponse, null, 2));
      return NextResponse.json(
        { 
          error: 'Invalid response structure from AI agent. Expected "epics" array.',
          details: 'The agent did not return the expected TECNOPS hierarchy structure.'
        },
        { status: 500 }
      );
    }

    // Return the structured response
    return NextResponse.json(parsedResponse);

  } catch (error) {
    // Log error for debugging
    console.error('Error in generate-tasks route:', error);
    
    // Handle JSON parsing errors (malformed request body)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes('OpenAI') || error.message.includes('API')) {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.message}` },
          { status: 500 }
        );
      }
      
      // Return the error message for other errors
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle any other unexpected errors
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

