import { z } from "zod";

export const generateTasksInputSchema = z.object({
  storyTitle: z.string().min(3),
  storyDescription: z.string().min(10),
});

export const taskSchema = z.object({
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()).min(1),
});

export const generateTasksOutputSchema = z.object({
  tasks: z.array(taskSchema).min(1),
});
