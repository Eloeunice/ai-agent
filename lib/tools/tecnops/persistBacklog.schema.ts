import { z } from "zod";

export const PersistBacklogSchema = z.object({
  project_id: z.string(),

  epics: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),

      features: z.array(
        z.object({
          title: z.string(),
          description: z.string().optional(),

          user_stories: z.array(
            z.object({
              title: z.string(),
              description: z.string().optional(),

              tasks: z.array(
                z.object({
                  title: z.string(),
                  description: z.string().optional(),
                })
              ),
            })
          ),
        })
      ),
    })
  ),
});
