import { z } from "zod";

export const generateFeaturesInputSchema = z.object({
  epicTitle: z.string().min(3),
  epicDescription: z.string().min(10),
  projectGoal: z.string().optional(),
});

export const featureSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const generateFeaturesOutputSchema = z.object({
  features: z.array(featureSchema).min(1),
});
