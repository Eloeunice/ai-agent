import { z } from "zod";
import { backlogSchema } from "../schemas/backlog";

export const buildBacklogInputSchema = z.object({
  epics: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  features: z.array(
    z.object({
      epicTitle: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
  stories: z.array(
    z.object({
      featureTitle: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
  tasks: z.array(
    z.object({
      storyTitle: z.string(),
      title: z.string(),
      description: z.string(),
      acceptanceCriteria: z.array(z.string()),
    })
  ),
});

export const buildBacklogOutputSchema = backlogSchema;
