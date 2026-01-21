import { generateEpicsTool } from "../tools/extract_epics";
import { generateFeaturesForEpicTool } from "../tools/extract_features";
import { generateStoriesForFeatureTool } from "../tools/extract_user_stories";
import { generateTasksForStoryTool } from "../tools/extract_tasks";

/**
 * Input do projeto
 */
type ProjectInput = {
  projectText: string;
  projectGoal?: string;
  inputType?: 'project' | 'feature'; // Novo campo opcional
};

// Limites removidos - processa tudo que a IA gerar

/**
 * Orquestração principal
 */
export async function runBacklogOrchestration(input: ProjectInput) {
  // ===== Estado acumulado =====
  const features: any[] = [];
  const stories: any[] = [];
  const tasks: any[] = [];

  let totalTasks = 0;

  // ===== 1️⃣ Gerar Épicos =====
  const { epics } = await generateEpicsTool.invoke({
    projectText: input.projectText,
  });

  // ===== 2️⃣ Iterar épicos (sem limites) =====
  for (const epic of epics) {
    // ===== 3️⃣ Gerar features do épico =====
    const featuresResult = await generateFeaturesForEpicTool.invoke({
      epicTitle: epic.title,
      epicDescription: epic.description,
    });

    for (const feature of featuresResult.features) {
      features.push({
        epicTitle: epic.title,
        ...feature,
      });

      // ===== 4️⃣ Gerar stories da feature =====
      const storiesResult = await generateStoriesForFeatureTool.invoke({
        featureTitle: feature.title,
        featureDescription: feature.description,
      });

      for (const story of storiesResult.stories) {
        stories.push({
          epicTitle: epic.title,
          featureTitle: feature.title,
          ...story,
        });

        // ===== 5️⃣ Gerar tasks da story =====
        const tasksResult = await generateTasksForStoryTool.invoke({
          storyTitle: story.title,
          storyDescription: story.description,
        });

        for (const task of tasksResult.tasks) {
          tasks.push({
            epicTitle: epic.title,
            featureTitle: feature.title,
            storyTitle: story.title,
            ...task,
          });

          totalTasks++;
        }
      }
    }
  }

  // ===== 6️⃣ Montar backlog FINAL (código puro, sem LLM) =====
  return buildBacklogStructure({
    epics,
    features,
    stories,
    tasks,
  });
}

/**
 * Orquestração para quando já temos uma FEATURE definida
 * Pula épicos e features, gera direto stories e tasks
 */
export async function runFeatureOrchestration(input: {
  featureText: string;
  featureTitle?: string;
  projectGoal?: string;
}) {
  const stories: any[] = [];
  const tasks: any[] = [];
  let totalTasks = 0;

  // Extrai título e descrição da feature do texto
  let featureTitle: string;
  let featureDescription: string;

  if (input.featureTitle) {
    featureTitle = input.featureTitle;
    featureDescription = input.featureText;
  } else {
    // Extrai título e descrição da feature do texto
    const featureInfo = extractFeatureInfo(input.featureText);
    featureTitle = featureInfo.title;
    featureDescription = featureInfo.description;
  }

  // ===== 1️⃣ Gerar Stories da Feature =====
  const storiesResult = await generateStoriesForFeatureTool.invoke({
    featureTitle,
    featureDescription,
  });

  for (const story of storiesResult.stories) {
    stories.push({
      featureTitle,
      ...story,
    });

    // ===== 2️⃣ Gerar Tasks da Story =====
    const tasksResult = await generateTasksForStoryTool.invoke({
      storyTitle: story.title,
      storyDescription: story.description,
    });

    for (const task of tasksResult.tasks) {
      tasks.push({
        featureTitle,
        storyTitle: story.title,
        ...task,
      });

      totalTasks++;
    }
  }

  // ===== 3️⃣ Montar estrutura simplificada =====
  return {
    epics: [
      {
        title: input.projectGoal || "Feature Backlog",
        description: "Backlog gerado a partir de uma feature",
        features: [
          {
            title: featureTitle,
            description: featureDescription,
            user_stories: stories.map((story) => ({
              title: story.title,
              description: story.description,
              tasks: tasks.filter((t) => t.storyTitle === story.title),
              sub_bugs: [],
            })),
            bugs: [],
          },
        ],
      },
    ],
  };
}

/**
 * Função auxiliar para extrair título e descrição de uma feature do texto
 * Tenta identificar o título na primeira linha e o resto como descrição
 */
function extractFeatureInfo(featureText: string): {
  title: string;
  description: string;
} {
  const lines = featureText.split("\n").filter((l) => l.trim());
  
  // Se o texto tem poucas linhas, usa tudo como descrição
  if (lines.length <= 1) {
    return {
      title: "Feature",
      description: featureText.trim() || "Feature description",
    };
  }

  // Primeira linha como título (até 100 caracteres)
  const firstLine = lines[0]?.trim() || "";
  const title = firstLine.length > 100 
    ? firstLine.substring(0, 100) + "..." 
    : firstLine || "Feature";

  // Resto como descrição
  const description = lines.slice(1).join("\n").trim() || featureText.trim();

  return { title, description };
}

/**
 * Builder determinístico do backlog
 * ⚠️ NÃO usa LLM
 */
function buildBacklogStructure({
  epics,
  features,
  stories,
  tasks,
}: {
  epics: any[];
  features: any[];
  stories: any[];
  tasks: any[];
}) {
  return {
    epics: epics.map(epic => ({
      title: epic.title,
      description: epic.description,
      features: features
        .filter(f => f.epicTitle === epic.title)
        .map(feature => ({
          title: feature.title,
          description: feature.description,
          user_stories: stories
            .filter(
              s =>
                s.epicTitle === epic.title &&
                s.featureTitle === feature.title
            )
            .map(story => ({
              title: story.title,
              description: story.description,
              tasks: tasks.filter(
                t =>
                  t.epicTitle === epic.title &&
                  t.featureTitle === feature.title &&
                  t.storyTitle === story.title
              ),
              sub_bugs: [],
            })),
          bugs: [],
        })),
    })),
  };
}
