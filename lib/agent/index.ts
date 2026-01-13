import { createAgent } from "langchain";
import { model } from "../ai/client";
import { SYSTEM_PROMPT } from "../prompts";

import { generateEpicsTool } from "../tools/extract_epics";
import { generateFeaturesForEpicTool } from "../tools/extract_features";
import { generateStoriesForFeatureTool } from "../tools/extract_user_stories";
import { generateTasksForStoryTool } from "../tools/extract_tasks"; 
import { buildBacklogStructureTool } from "../tools/build_backlog_structure";
/**
 * Langchain ReAct Agent for generating structured project backlogs
 * 
 * This agent uses:
 * - OpenAI GPT-5.2 model
 * - TECNOPS hierarchy system prompt
 * - Structured output format (Zod schema)
 * - Backlog generation tool
 */
export const backlogAgent = createAgent({
  model,
  tools: [generateEpicsTool, generateFeaturesForEpicTool, generateStoriesForFeatureTool, generateTasksForStoryTool, buildBacklogStructureTool],
  systemPrompt: SYSTEM_PROMPT
});

