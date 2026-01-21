import { ChatOpenAI } from "@langchain/openai";

/**
 * OpenAI Chat Model instance
 * Configured for GPT-5.2 with API key from environment variables
 */
export const model = new ChatOpenAI({
  modelName: "gpt-5.2",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2,
});