import { tool } from "langchain";
import {
  generateFeaturesInputSchema,
  generateFeaturesOutputSchema,
} from "../schemas/featureSchema";
import { featurePrompt } from "../prompts/featurePrompt";
import { model } from "../ai/client";

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
      const prompt = featurePrompt(epicTitle, epicDescription, projectGoal);
      const llmResponse = await model.invoke(prompt);
      const rawOutput = JSON.parse(llmResponse.content as string);
    
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
