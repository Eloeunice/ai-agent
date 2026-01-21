import { z } from "zod";

export const CreateWorkItemSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),

  type: z.enum([
    "epic",
    "feature",
    "user_story",
    "task",
    "bug",
    "critical_bug",
    "sub_bug",
  ]),

  priority: z.enum(["low", "medium", "high", "critical"]),

  project_id: z.string(),

  parent_id: z.string().optional(), // obrigatório por regra, não por schema
});
