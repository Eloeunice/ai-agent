import { tool } from "langchain";
import {
  generateEpicsInputSchema,
  generateEpicsOutputSchema,
} from "../schemas/epicSchema";
import { epicPrompt } from "../prompts/epicPrompt";
import { model } from "../ai/client";

const log = {
  info: (message: string, data?: unknown) =>
    console.log(`[generate_epics][INFO] ${message}`, data ?? ""),
  error: (message: string, data?: unknown) =>
    console.error(`[generate_epics][ERROR] ${message}`, data ?? ""),
};

export const generateEpicsTool = tool(
  async (input) => {
    try {
      log.info("Tool iniciada", input);

      // 🔒 Validação explícita de input
      const { projectText } = generateEpicsInputSchema.parse(input);

      // 🧠 Simulação de saída do LLM
    const prompt = epicPrompt(projectText);
    const llmResponse = await model.invoke(prompt);
    const rawOutput = JSON.parse(llmResponse.content as string);
    return generateEpicsOutputSchema.parse(rawOutput);
    } catch (error) {
      log.error("Falha ao gerar épicos", error);

      throw new Error(
        "Erro ao processar o texto do projeto para gerar épicos"
      );
    }
  },
  {
    name: "generate_epics",
    description: "Extrai épicos (grandes objetivos) a partir da descrição do projeto",
    schema: generateEpicsInputSchema,
  }
);
