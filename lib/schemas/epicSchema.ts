import { z } from "zod";

export const generateEpicsInputSchema = z.object({
  projectText: z.string().min(50),
});

export const epicSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const generateEpicsOutputSchema = z.object({
  epics: z.array(epicSchema),
});
