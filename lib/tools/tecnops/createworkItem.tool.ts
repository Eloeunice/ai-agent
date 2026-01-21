import { tool } from "langchain";
import { PersistBacklogSchema } from "./persistBacklog.schema";
import { createWorkItem } from "./supabase.adapter";

export const persistBacklogTool = tool(
  async (input) => {
    const backlog = PersistBacklogSchema.parse(input);

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

      // resto do código igual
    }

    return { success: true };
  },
  {
    name: "persist_backlog",
    description:
      "Cria toda a hierarquia de work_items no Tecnops a partir de um backlog estruturado",
    schema: PersistBacklogSchema,
  }
);
