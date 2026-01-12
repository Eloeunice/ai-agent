import OpenAI from 'openai';

// Initialize OpenAI client
// The API key should be set in the OPENAI_API_KEY environment variable
const openai = new OpenAI({
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

  try {
    // Call OpenAI Chat Completions API with GPT-5.2
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2', // Model can be easily changed here
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      // Set temperature to 0 for more deterministic, focused output
      temperature: 0,
      // Request JSON response format
      response_format: { type: 'json_object' },
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('OpenAI API returned an empty response');
    }

    return responseContent;
  } catch (error) {
    // Re-throw with more context if it's an OpenAI API error
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

