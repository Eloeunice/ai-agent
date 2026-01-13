import { ChatOpenAI } from "@langchain/openai";

/**
 * OpenAI Chat Model instance
 * Configured for GPT-5.2 with API key from environment variables
 */
export const model = new ChatOpenAI({
  modelName: "gpt-5.2",
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls OpenAI GPT-5.2 model with a system prompt and user message
 * 
 * This function is reusable and can be easily adapted to use different models
 * by changing the model parameter.
 * 
 * @param systemPrompt - The system prompt defining the model's behavior
 * @param userMessage - The user's input message (project scope)
 * @returns Promise<string> - The model's response content
 * @throws Error if the OpenAI API call fails
 */
export async function callOpenAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  // Validate that API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  const response = await model.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);

  return response.content as string;
}

