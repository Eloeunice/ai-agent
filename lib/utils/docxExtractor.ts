import * as mammoth from "mammoth";

/**
 * Estrutura extraída do documento
 */
export interface DocumentStructure {
  rawText: string;
  structuredText: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  level: number; // Nível do cabeçalho (1, 2, 3, etc.)
  title: string;
  content: string;
  type?: 'feature' | 'user_story' | 'task' | 'epic' | 'unknown';
}

/**
 * Extrai texto de um arquivo DOCX preservando estrutura
 * @param buffer Buffer do arquivo DOCX
 * @returns Texto extraído do documento com estrutura preservada
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // Extrai texto bruto
    const rawResult = await mammoth.extractRawText({ buffer });
    
    // Extrai HTML para preservar estrutura
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    // Converte HTML para texto estruturado
    const structuredText = convertHtmlToStructuredText(htmlResult.value);
    
    return structuredText;
  } catch (error) {
    throw new Error(
      `Erro ao extrair texto do arquivo DOCX: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}

/**
 * Extrai estrutura completa do documento DOCX
 * @param buffer Buffer do arquivo DOCX
 * @returns Estrutura completa do documento
 */
export async function extractDocumentStructure(buffer: Buffer): Promise<DocumentStructure> {
  try {
    // Extrai texto bruto
    const rawResult = await mammoth.extractRawText({ buffer });
    
    // Extrai HTML para preservar estrutura
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    // Converte HTML para texto estruturado
    const structuredText = convertHtmlToStructuredText(htmlResult.value);
    
    // Extrai seções do documento
    const sections = extractSections(htmlResult.value);
    
    return {
      rawText: rawResult.value,
      structuredText,
      sections,
    };
  } catch (error) {
    throw new Error(
      `Erro ao extrair estrutura do arquivo DOCX: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}

/**
 * Converte HTML para texto estruturado preservando hierarquia
 */
function convertHtmlToStructuredText(html: string): string {
  // Remove tags HTML mas preserva estrutura
  let text = html
    // Preserva quebras de linha de parágrafos
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    // Preserva cabeçalhos com marcadores
    .replace(/<h1[^>]*>/gi, '\n\n# ')
    .replace(/<h2[^>]*>/gi, '\n\n## ')
    .replace(/<h3[^>]*>/gi, '\n\n### ')
    .replace(/<h4[^>]*>/gi, '\n\n#### ')
    .replace(/<h5[^>]*>/gi, '\n\n##### ')
    .replace(/<h6[^>]*>/gi, '\n\n###### ')
    .replace(/<\/h[1-6]>/gi, '\n')
    // Preserva listas
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    // Preserva quebras de linha
    .replace(/<br[^>]*>/gi, '\n')
    // Remove outras tags
    .replace(/<[^>]+>/g, '')
    // Decodifica entidades HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Limpa espaços múltiplos
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

/**
 * Extrai seções do documento baseado em cabeçalhos HTML
 */
function extractSections(html: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  // Regex para capturar cabeçalhos e conteúdo
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const matches = Array.from(html.matchAll(headingRegex));
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const level = parseInt(match[1]);
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    
    // Encontra o conteúdo até o próximo cabeçalho do mesmo nível ou superior
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 
      ? matches[i + 1].index! 
      : html.length;
    
    const content = html
      .substring(startIndex, endIndex)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Detecta tipo baseado no título
    const type = detectSectionType(title, content);
    
    sections.push({
      level,
      title,
      content,
      type,
    });
  }
  
  return sections;
}

/**
 * Detecta o tipo de seção baseado no título e conteúdo
 */
function detectSectionType(title: string, content: string): DocumentSection['type'] {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  // Palavras-chave para cada tipo
  if (
    lowerTitle.includes('epic') ||
    lowerTitle.includes('épico') ||
    lowerTitle.includes('objetivo') ||
    lowerTitle.includes('meta')
  ) {
    return 'epic';
  }
  
  if (
    lowerTitle.includes('feature') ||
    lowerTitle.includes('funcionalidade') ||
    lowerTitle.includes('capacidade')
  ) {
    return 'feature';
  }
  
  if (
    lowerTitle.includes('user story') ||
    lowerTitle.includes('história') ||
    lowerTitle.includes('story') ||
    lowerTitle.includes('como') ||
    lowerContent.includes('como usuário') ||
    lowerContent.includes('as a')
  ) {
    return 'user_story';
  }
  
  if (
    lowerTitle.includes('task') ||
    lowerTitle.includes('tarefa') ||
    lowerTitle.includes('implementação') ||
    lowerTitle.includes('desenvolvimento')
  ) {
    return 'task';
  }
  
  return 'unknown';
}

