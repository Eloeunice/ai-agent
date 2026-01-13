import { z } from "zod";

/**
 * Zod schema for the TECNOPS hierarchy structure
 * This schema validates the structured output from the AI agent
 */
export const backlogSchema = z.object({
  epics: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      features: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          user_stories: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              tasks: z.array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                  acceptance_criteria: z.array(z.string()),
                })
              ),
              sub_bugs: z.array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                  acceptance_criteria: z.array(z.string()),
                })
              ),
            })
          ),
          bugs: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              tasks: z.array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                  acceptance_criteria: z.array(z.string()),
                })
              ),
              sub_bugs: z.array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                  acceptance_criteria: z.array(z.string()),
                })
              ),
            })
          ),
        })
      ),
    })
  ),
});

