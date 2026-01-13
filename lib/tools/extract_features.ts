import { tool } from "langchain";
import {
  generateFeaturesInputSchema,
  generateFeaturesOutputSchema,
} from "../schemas/featureSchema";

const log = {
  info: (msg: string, data?: unknown) =>
    console.log("[generate_features][INFO]", msg, data ?? ""),
  error: (msg: string, data?: unknown) =>
    console.error("[generate_features][ERROR]", msg, data ?? ""),
};

export const generateFeaturesForEpicTool = tool(
  async (input) => {
    try {
      log.info("Tool iniciada", input);

      // 1️⃣ Validação de input
      const { epicTitle, epicDescription, projectGoal } =
        generateFeaturesInputSchema.parse(input);

      // 2️⃣ Geração das features (LLM)
      const rawOutput = {
        features: [
          {
            title: "Cadastro de usuários",
            description: `Permitir cadastro de usuários relacionado ao épico "${epicTitle}".`,
          },
        ],
      };

      // 3️⃣ Validação de output
      const validatedOutput =
        generateFeaturesOutputSchema.parse(rawOutput);

      log.info("Features geradas com sucesso", validatedOutput);

      return validatedOutput;
    } catch (error) {
      log.error("Erro ao gerar features", error);
      throw new Error(
        "Erro ao processar épico para geração de features"
      );
    }
  },
  {
    name: "generate_features_for_epic",
    description: "Gera features a partir de um épico",
    schema: generateFeaturesInputSchema,
  }
);
