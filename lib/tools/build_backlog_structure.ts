import { tool } from "langchain";
import {
  buildBacklogInputSchema,
  buildBacklogOutputSchema,
} from "../schemas/buildBacklogSchema";

const log = {
  info: (msg: string, data?: unknown) =>
    console.log("[build_backlog][INFO]", msg, data ?? ""),
  error: (msg: string, data?: unknown) =>
    console.error("[build_backlog][ERROR]", msg, data ?? ""),
};

export const buildBacklogStructureTool = tool(
  async (input) => {
    try {
      log.info("Iniciando montagem do backlog");

      const validatedInput =
        buildBacklogInputSchema.parse(input);

      /**
       * Aqui você faria:
       * - vincular features ao épico
       * - vincular stories à feature
       * - vincular tasks à story
       * 
       * Por enquanto, estrutura simples
       */

      const backlog = {
        epics: validatedInput.epics.map((epic) => ({
          title: epic.title,
          description: epic.description,
          features: validatedInput.features
            .filter((f) => f.epicTitle === epic.title)
            .map((feature) => ({
              title: feature.title,
              description: feature.description,
              user_stories: validatedInput.stories
                .filter((s) => s.featureTitle === feature.title)
                .map((story) => ({
                  title: story.title,
                  description: story.description,
                  tasks: validatedInput.tasks
                    .filter((t) => t.storyTitle === story.title)
                    .map((task) => ({
                      title: task.title,
                      description: task.description,
                      acceptance_criteria:
                        task.acceptanceCriteria,
                    })),
                  sub_bugs: [],
                })),
              bugs: [],
            })),
        })),
      };

      const validatedOutput =
        buildBacklogOutputSchema.parse(backlog);

      log.info("Backlog montado com sucesso");

      return validatedOutput;
    } catch (error) {
      log.error("Erro ao montar backlog", error);
      throw new Error("Erro ao montar backlog final");
    }
  },
  {
    name: "build_backlog_structure",
    description:
      "Monta e valida a estrutura final do backlog a partir dos dados gerados",
    schema: buildBacklogInputSchema,
  }
);
