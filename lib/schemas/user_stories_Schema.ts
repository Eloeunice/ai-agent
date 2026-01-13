import { z } from "zod";

export const generateStoriesInputSchema = z.object({
  featureTitle: z.string().min(3),
  featureDescription: z.string().min(10),
});

export const userStorySchema = z.object({
  title: z.string(),
  description: z.string(), // formato: Como..., quero..., para...
});

export const generateStoriesOutputSchema = z.object({
  stories: z.array(userStorySchema).min(1),
});
