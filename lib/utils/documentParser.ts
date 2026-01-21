import { DocumentStructure, DocumentSection } from "./docxExtractor";
import { model } from "../ai/client";

/**
 * Resultado do parsing inteligente do documento
 */
export interface ParsedDocument {
  features: Array<{
    title: string;
    description: string;
    userStories?: Array<{
      title: string;
      description: string;
      tasks?: Array<{
        title: string;
        description: string;
        acceptanceCriteria: string[];
      }>;
    }>;
  }>;
  epics?: Array<{
    title: string;
    description: string;
  }>;
  rawStructure: DocumentStructure;
}

/**
 * Analisa o documento e identifica features, user stories e tasks
 * usando IA para melhor compreensão
 */
export async function parseDocumentIntelligently(
  documentStructure: DocumentStructure
): Promise<ParsedDocument> {
  const prompt = createDocumentAnalysisPrompt(documentStructure);
  
  try {
    const response = await model.invoke(prompt);
    const parsed = JSON.parse(response.content as string);
    
    return {
      ...parsed,
      rawStructure: documentStructure,
    };
  } catch (error) {
    // Fallback: usa detecção baseada em estrutura
    return parseDocumentByStructure(documentStructure);
  }
}

/**
 * Cria prompt para análise inteligente do documento
 */
function createDocumentAnalysisPrompt(structure: DocumentStructure): string {
  return `
Você é um especialista em análise de documentos de requisitos de software.

Analise o seguinte documento e identifique APENAS o que está explicitamente descrito:
1. FEATURES (funcionalidades/capacidades do produto)
2. USER STORIES (histórias de usuário - descrições diretas, sem formato "Como usuário")
3. TASKS (tarefas técnicas de implementação)

REGRAS CRÍTICAS:
- FEATURE: Representa uma capacidade do produto, algo que o usuário pode fazer ou usar
- USER STORY: Descreve o QUE o usuário precisa, não COMO será implementado. Use descrições diretas e objetivas, SEM o formato "Como [usuário], eu quero..."
- TASK: Descreve COMO será implementado tecnicamente. É específica, mensurável e testável.

REGRAS DE EXTRAÇÃO:
- Extraia APENAS o que está explicitamente descrito no documento
- NÃO invente, adicione ou extrapole informações que não estão presentes
- Seja conservador: prefira menos itens bem fundamentados do que muitos inventados
- Para USER STORIES:
  * Gere de 3 a 10 stories por feature (quantidade recomendada)
  * Formato: "Como sistema / time de engenharia / plataforma, [descrição do que muda no sistema]"
  * Podem ser técnicas (infra, refactor, migração)
  * Descrevem o que muda no sistema quando a story termina
  * Evite stories genéricas ou que só descrevem implementação sem valor final
- Para TASKS:
  * Gere de 3 a 7 tasks por user story (quantidade recomendada)
  * Devem ser executáveis, atômicas e idealmente concluíveis em até 1 dia
  * Se uma story tiver mais de 8 tasks, avalie divisão em duas stories
  * Não repita lógica de seleção/configuração em múltiplos pontos
- Para CRITÉRIOS DE ACEITAÇÃO:
  * Objetivos e verificáveis (true/false)
  * Formato: "Quando X, então Y" ou "Dado Z, o sistema faz W"
  * Evite linguagem vaga ("ajustes", "verificar", "melhorar")
- Mantenha a hierarquia: Features contêm User Stories, que contêm Tasks
- NÃO use numeração hierárquica complexa (ex.: 1.1.7.3)

Retorne APENAS JSON válido no formato:
{
  "features": [
    {
      "title": "Nome da Feature",
      "description": "Descrição detalhada da feature",
      "userStories": [
        {
          "title": "Título da User Story",
          "description": "Como sistema/time de engenharia/plataforma, [descrição do que muda no sistema quando a story termina]",
          "tasks": [
            {
              "title": "Título da Task",
              "description": "Descrição técnica da task (executável, atômica, concluível em até 1 dia)",
              "acceptanceCriteria": [
                "Quando [condição], então [resultado esperado]",
                "Dado [contexto], o sistema faz [ação]"
              ]
            }
          ]
        }
      ]
    }
  ],
  "epics": [
    {
      "title": "Nome do Épico (se houver)",
      "description": "Descrição do épico"
    }
  ]
}

DOCUMENTO:
${structure.structuredText}

Seções identificadas:
${structure.sections.map((s, i) => 
  `${i + 1}. [Nível ${s.level}] ${s.title} (${s.type || 'unknown'})\n   ${s.content.substring(0, 200)}...`
).join('\n')}

IMPORTANTE: 
- Baseie-se APENAS no conteúdo acima
- NÃO invente ou adicione informações que não estão presentes
- Para user stories, use descrições diretas sem o formato "Como usuário, eu quero..."
- Seja conservador e gere apenas o que está claramente descrito no documento
`.trim();
}

/**
 * Fallback: parsing baseado em estrutura quando IA falha
 */
function parseDocumentByStructure(structure: DocumentStructure): ParsedDocument {
  const features: ParsedDocument['features'] = [];
  const epics: ParsedDocument['epics'] = [];
  
  type FeatureType = ParsedDocument['features'][0];
  type StoryType = NonNullable<FeatureType['userStories']>[0];
  
  let currentFeature: FeatureType | null = null;
  let currentStory: StoryType | null = null;
  
  for (const section of structure.sections) {
    if (section.type === 'epic') {
      epics.push({
        title: section.title,
        description: section.content,
      });
    } else if (section.type === 'feature') {
      // Salva feature anterior se houver
      if (currentFeature) {
        features.push(currentFeature);
      }
      // Cria nova feature
      currentFeature = {
        title: section.title,
        description: section.content,
        userStories: [],
      };
      currentStory = null;
    } else if (section.type === 'user_story') {
      if (!currentFeature) {
        // Cria feature implícita
        currentFeature = {
          title: 'Feature',
          description: '',
          userStories: [],
        };
      }
      // Salva story anterior se houver
      if (currentStory) {
        currentFeature.userStories!.push(currentStory);
      }
      // Cria nova story
      currentStory = {
        title: section.title,
        description: section.content,
        tasks: [],
      };
    } else if (section.type === 'task') {
      if (!currentStory) {
        if (!currentFeature) {
          currentFeature = {
            title: 'Feature',
            description: '',
            userStories: [],
          };
        }
        currentStory = {
          title: 'User Story',
          description: '',
          tasks: [],
        };
      }
      // Adiciona task à story atual
      currentStory.tasks!.push({
        title: section.title,
        description: section.content,
        acceptanceCriteria: extractAcceptanceCriteria(section.content),
      });
    }
  }
  
  // Adiciona última feature/story se houver
  if (currentStory && currentFeature) {
    currentFeature.userStories!.push(currentStory);
  }
  if (currentFeature) {
    features.push(currentFeature);
  }
  
  return {
    features,
    epics: epics.length > 0 ? epics : undefined,
    rawStructure: structure,
  };
}

/**
 * Extrai critérios de aceitação do texto
 */
function extractAcceptanceCriteria(text: string): string[] {
  const criteria: string[] = [];
  
  // Procura por listas numeradas ou com marcadores
  const listRegex = /[-•*]\s*(.+?)(?=\n[-•*]|\n\n|$)/g;
  const matches = text.matchAll(listRegex);
  
  for (const match of matches) {
    const criterion = match[1].trim();
    if (criterion.length > 10) {
      criteria.push(criterion);
    }
  }
  
  // Se não encontrou lista, divide por parágrafos
  if (criteria.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    criteria.push(...paragraphs.slice(0, 5));
  }
  
  return criteria;
}

