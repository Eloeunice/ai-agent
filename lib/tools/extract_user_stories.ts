import { tool } from "langchain";
import {
  generateStoriesInputSchema,
  generateStoriesOutputSchema,
} from "../schemas/user_stories_Schema";

const log = {
  info: (msg: string, data?: unknown) =>
    console.log("[generate_stories][INFO]", msg, data ?? ""),
  error: (msg: string, data?: unknown) =>
    console.error("[generate_stories][ERROR]", msg, data ?? ""),
};

export const generateStoriesForFeatureTool = tool(
  async (input) => {
    try {
      log.info("Tool iniciada", input);

      // 1️⃣ Validar input
      const { featureTitle, featureDescription } =
        generateStoriesInputSchema.parse(input);

      // 2️⃣ Gerar stories (LLM)
      const rawOutput = {
        stories: [
          {
            title: "Usuário pode se cadastrar",
            description:
              "Como usuário, quero me cadastrar no sistema para acessar as funcionalidades disponíveis.",
          },
        ],
      };

      // 3️⃣ Validar output
      const validatedOutput =
        generateStoriesOutputSchema.parse(rawOutput);

      log.info("Stories geradas com sucesso", validatedOutput);

      return validatedOutput;
    } catch (error) {
      log.error("Erro ao gerar user stories", error);
      throw new Error(
        "Erro ao processar feature para geração de user stories"
      );
    }
  },
  {
    name: "generate_user_stories_for_feature",
    description: "Gera user stories a partir de uma feature",
    schema: generateStoriesInputSchema,
  }
);
