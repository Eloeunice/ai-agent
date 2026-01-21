import { createAgent } from "langchain";
import { model } from "../ai/client";
import { SYSTEM_PROMPT } from "../prompts";
import { MCP_TECNOPS_RULES } from "../prompts/mcpTecnopsRules";

import { generateEpicsTool } from "../tools/extract_epics";
import { generateFeaturesForEpicTool } from "../tools/extract_features";
import { generateStoriesForFeatureTool } from "../tools/extract_user_stories";
import { generateTasksForStoryTool } from "../tools/extract_tasks"; 
import { buildBacklogStructureTool } from "../tools/build_backlog_structure";
import { persistBacklogTool } from "../tools/tecnops/persistBacklog";
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
  tools: [generateEpicsTool, generateFeaturesForEpicTool, generateStoriesForFeatureTool, generateTasksForStoryTool, buildBacklogStructureTool, persistBacklogTool],
  systemPrompt: [MCP_TECNOPS_RULES, SYSTEM_PROMPT].join("\n")
});

