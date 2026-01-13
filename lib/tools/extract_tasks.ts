import { tool } from "langchain";
import {
  generateTasksInputSchema,
  generateTasksOutputSchema,
} from "../schemas/taskSchema";

const log = {
  info: (msg: string, data?: unknown) =>
    console.log("[generate_tasks][INFO]", msg, data ?? ""),
  error: (msg: string, data?: unknown) =>
    console.error("[generate_tasks][ERROR]", msg, data ?? ""),
};

export const generateTasksForStoryTool = tool(
  async (input) => {
    try {
      log.info("Tool iniciada", input);

      // 1️⃣ Validar input
      const { storyTitle, storyDescription } =
        generateTasksInputSchema.parse(input);

      // 2️⃣ Gerar tasks (LLM - mock por enquanto)
      const rawOutput = {
        tasks: [
          {
            title: "Criar endpoint de cadastro",
            description:
              "Implementar endpoint de cadastro de usuários no backend",
            acceptanceCriteria: [
              "Endpoint criado",
              "Validação de dados",
              "Retorna status 201",
            ],
          },
        ],
      };

      // 3️⃣ Validar output
      const validatedOutput =
        generateTasksOutputSchema.parse(rawOutput);

      log.info("Tasks geradas com sucesso", validatedOutput);

      return validatedOutput;
    } catch (error) {
      log.error("Erro ao gerar tasks", error);
      throw new Error(
        "Erro ao processar user story para geração de tasks"
      );
    }
  },
  {
    name: "generate_tasks_for_story",
    description: "Gera tasks técnicas a partir de uma user story",
    schema: generateTasksInputSchema,
  }
);
