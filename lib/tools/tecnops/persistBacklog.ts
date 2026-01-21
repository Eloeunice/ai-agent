import { tool } from "langchain";
import { PersistBacklogSchema } from "./persistBacklog.schema";
import { createWorkItem } from "./supabase.adapter";

export const persistBacklogTool = tool(
  async (input) => {
    const backlog = PersistBacklogSchema.parse(input);

    const createdEpics = [];

    for (const epic of backlog.epics) {
      const epicItem = await createWorkItem({
        title: epic.title,
        description: epic.description,
        type: "epic",
        status: "to_do",
        priority: "medium",
        project_id: backlog.project_id,
        created_by: process.env.SYSTEM_USER_ID!,
      });

      for (const feature of epic.features) {
        const featureItem = await createWorkItem({
          title: feature.title,
          description: feature.description,
          type: "feature",
          status: "to_do",
          priority: "medium",
          parent_id: epicItem.id,
          project_id: backlog.project_id,
          created_by: process.env.SYSTEM_USER_ID!,
        });

        for (const story of feature.user_stories) {
          const storyItem = await createWorkItem({
            title: story.title,
            description: story.description,
            type: "user_story",
            priority: "medium",
            status: "to_do",
            parent_id: featureItem.id,
            project_id: backlog.project_id,
            created_by: process.env.SYSTEM_USER_ID!,
          });

          for (const task of story.tasks) {
            await createWorkItem({
              title: task.title,
              description: task.description,
              type: "task",
              status: "to_do",
              priority: "medium",
              parent_id: storyItem.id,
              project_id: backlog.project_id,
              created_by: process.env.SYSTEM_USER_ID!,
            });
          }
        }
      }

      createdEpics.push(epicItem.id);
    }

    return {
      success: true,
      created_epics: createdEpics.length,
    };
  },
  {
    name: "persist_backlog",
    description:
      "Cria toda a hierarquia de work_items no Tecnops a partir de um backlog estruturado",
    schema: PersistBacklogSchema,
  }
);
