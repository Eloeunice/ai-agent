import { tool } from "langchain";
import { z } from "zod";

/**
 * Langchain tool for generating agile backlog
 * This tool can be used by the agent to process project text
 */
export const generateBacklogTool = tool(
  async ({ projectText }: { projectText: string }) => {
    return projectText;
  },
  {
    name: "generate_agile_backlog",
    description: "Gera épicos, features, user stories e tasks a partir de um texto de projeto",
    schema: z.object({
      projectText: z.string(),
    }),
  }
);

