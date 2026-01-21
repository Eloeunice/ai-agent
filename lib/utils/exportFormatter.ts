/**
 * Formata o backlog para exportação em diferentes formatos
 */

export interface ExportOptions {
  format: 'json' | 'markdown' | 'text';
  includeMetadata?: boolean;
}

/**
 * Gera arquivo formatado do backlog para importação em sistemas de gestão
 */
export function formatBacklogForExport(
  backlog: any,
  options: ExportOptions = { format: 'json', includeMetadata: true }
): string {
  switch (options.format) {
    case 'json':
      return formatAsJSON(backlog, options);
    case 'markdown':
      return formatAsMarkdown(backlog, options);
    case 'text':
      return formatAsText(backlog, options);
    default:
      return formatAsJSON(backlog, options);
  }
}

/**
 * Formata como JSON estruturado para importação
 */
function formatAsJSON(backlog: any, options: ExportOptions): string {
  const exportData = {
    ...(options.includeMetadata && {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        format: 'tecnops-backlog',
      },
    }),
    backlog: {
      epics: backlog.epics.map((epic: any) => ({
        epic: {
          title: epic.title,
          description: epic.description,
          features: epic.features.map((feature: any) => ({
            feature: {
              title: feature.title,
              description: feature.description,
              userStories: feature.user_stories.map((story: any) => ({
                userStory: {
                  title: story.title,
                  description: story.description,
                  tasks: story.tasks.map((task: any) => ({
                    task: {
                      title: task.title,
                      description: task.description,
                      acceptanceCriteria: task.acceptanceCriteria || task.acceptance_criteria || [],
                    },
                  })),
                },
              })),
            },
          })),
        },
      })),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Formata como Markdown para documentação
 */
function formatAsMarkdown(backlog: any, options: ExportOptions): string {
  let markdown = '';

  if (options.includeMetadata) {
    markdown += `# Backlog do Projeto\n\n`;
    markdown += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    markdown += `---\n\n`;
  }

  backlog.epics.forEach((epic: any, epicIndex: number) => {
    markdown += `## Épico ${epicIndex + 1}: ${epic.title}\n\n`;
    markdown += `${epic.description}\n\n`;

    epic.features.forEach((feature: any, featureIndex: number) => {
      markdown += `### Feature ${epicIndex + 1}.${featureIndex + 1}: ${feature.title}\n\n`;
      markdown += `${feature.description}\n\n`;

      feature.user_stories.forEach((story: any, storyIndex: number) => {
        markdown += `#### User Story ${epicIndex + 1}.${featureIndex + 1}.${storyIndex + 1}: ${story.title}\n\n`;
        markdown += `**Descrição:** ${story.description}\n\n`;

        if (story.tasks && story.tasks.length > 0) {
          markdown += `**Tasks:**\n\n`;
          story.tasks.forEach((task: any, taskIndex: number) => {
            markdown += `- **Task ${epicIndex + 1}.${featureIndex + 1}.${storyIndex + 1}.${taskIndex + 1}:** ${task.title}\n`;
            markdown += `  - Descrição: ${task.description}\n`;
            
            const criteria = task.acceptanceCriteria || task.acceptance_criteria || [];
            if (criteria.length > 0) {
              markdown += `  - Critérios de Aceitação:\n`;
              criteria.forEach((criterion: string) => {
                markdown += `    - ${criterion}\n`;
              });
            }
            markdown += `\n`;
          });
        }
        markdown += `\n`;
      });
    });

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Formata como texto simples para leitura
 */
function formatAsText(backlog: any, options: ExportOptions): string {
  let text = '';

  if (options.includeMetadata) {
    text += `BACKLOG DO PROJETO\n`;
    text += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `${'='.repeat(80)}\n\n`;
  }

  backlog.epics.forEach((epic: any, epicIndex: number) => {
    text += `ÉPICO ${epicIndex + 1}: ${epic.title}\n`;
    text += `${'-'.repeat(80)}\n`;
    text += `${epic.description}\n\n`;

    epic.features.forEach((feature: any, featureIndex: number) => {
      text += `  Feature ${epicIndex + 1}.${featureIndex + 1}: ${feature.title}\n`;
      text += `  ${'-'.repeat(76)}\n`;
      text += `  ${feature.description}\n\n`;

      feature.user_stories.forEach((story: any, storyIndex: number) => {
        text += `    User Story ${epicIndex + 1}.${featureIndex + 1}.${storyIndex + 1}: ${story.title}\n`;
        text += `    ${'-'.repeat(72)}\n`;
        text += `    ${story.description}\n\n`;

        if (story.tasks && story.tasks.length > 0) {
          story.tasks.forEach((task: any, taskIndex: number) => {
            text += `      Task ${epicIndex + 1}.${featureIndex + 1}.${storyIndex + 1}.${taskIndex + 1}: ${task.title}\n`;
            text += `      ${task.description}\n`;
            
            const criteria = task.acceptanceCriteria || task.acceptance_criteria || [];
            if (criteria.length > 0) {
              text += `      Critérios de Aceitação:\n`;
              criteria.forEach((criterion: string) => {
                text += `        - ${criterion}\n`;
              });
            }
            text += `\n`;
          });
        }
        text += `\n`;
      });
    });

    text += `${'='.repeat(80)}\n\n`;
  });

  return text;
}

/**
 * Gera estatísticas do backlog
 */
export function generateBacklogStats(backlog: any): {
  totalEpics: number;
  totalFeatures: number;
  totalUserStories: number;
  totalTasks: number;
} {
  let totalEpics = backlog.epics.length;
  let totalFeatures = 0;
  let totalUserStories = 0;
  let totalTasks = 0;

  backlog.epics.forEach((epic: any) => {
    totalFeatures += epic.features.length;
    epic.features.forEach((feature: any) => {
      totalUserStories += feature.user_stories.length;
      feature.user_stories.forEach((story: any) => {
        totalTasks += (story.tasks || []).length;
      });
    });
  });

  return {
    totalEpics,
    totalFeatures,
    totalUserStories,
    totalTasks,
  };
}

