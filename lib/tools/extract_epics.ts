import { tool } from "langchain";
import { generateEpicsInputSchema, generateEpicsOutputSchema } from "../schemas/epicSchema";

export const generateEpicsTool = tool(
  async ({ projectText }) => {
    /**
     * Aqui o LLM:
     * - lê o texto
     * - identifica grandes objetivos
     * - retorna épicos estruturados
     */

    const rawOutput = {
      epics: [
        {
          title: "Exemplo de Épico",
          description: "Descrição de alto nível do objetivo do produto",
        },
      ],
    };

    // ✅ Validação explícita
    return generateEpicsOutputSchema.parse(rawOutput);
  },
  {
    name: "generate_epics",
    description: "Extrai épicos (grandes objetivos) a partir da descrição do projeto",
    schema: generateEpicsInputSchema,
  }
);
