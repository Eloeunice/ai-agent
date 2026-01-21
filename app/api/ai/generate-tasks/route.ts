import { NextRequest, NextResponse } from "next/server";
import { runBacklogOrchestration, runFeatureOrchestration } from "@/lib/agent/orchestrator";
import { extractTextFromDocx, extractDocumentStructure } from "@/lib/utils/docxExtractor";
import { parseDocumentIntelligently, ParsedDocument } from "@/lib/utils/documentParser";
import { formatBacklogForExport, generateBacklogStats } from "@/lib/utils/exportFormatter";

/**
 * Converte documento parseado para formato de backlog
 */
function convertParsedDocToBacklog(parsedDoc: ParsedDocument, projectName?: string) {
  // Se tem épicos no documento parseado, usa eles
  if (parsedDoc.epics && parsedDoc.epics.length > 0) {
    return {
      epics: parsedDoc.epics.map((epic) => ({
        title: epic.title,
        description: epic.description,
        features: parsedDoc.features
          .filter((f) => f.userStories && f.userStories.length > 0)
          .map((feature) => ({
            title: feature.title,
            description: feature.description,
            user_stories: (feature.userStories || []).map((story) => ({
              title: story.title,
              description: story.description,
              tasks: (story.tasks || []).map((task) => ({
                title: task.title,
                description: task.description,
                acceptanceCriteria: task.acceptanceCriteria || [],
              })),
              sub_bugs: [],
            })),
            bugs: [],
          })),
      })),
    };
  }

  // Caso contrário, cria um épico único
  return {
    epics: [
      {
        title: projectName || "Backlog do Projeto",
        description: "Backlog gerado a partir do documento",
        features: parsedDoc.features.map((feature) => ({
          title: feature.title,
          description: feature.description,
          user_stories: (feature.userStories || []).map((story) => ({
            title: story.title,
            description: story.description,
            tasks: (story.tasks || []).map((task) => ({
              title: task.title,
              description: task.description,
              acceptanceCriteria: task.acceptanceCriteria || [],
            })),
            sub_bugs: [],
          })),
          bugs: [],
        })),
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let projectText: string;
    let projectName: string | undefined;
    let inputType: 'project' | 'feature' | undefined;

    // Verifica se é upload de arquivo (FormData)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const projectNameField = formData.get("projectName") as string | null;
      const inputTypeField = formData.get("inputType") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: 'Field "file" is required' },
          { status: 400 }
        );
      }

      // Verifica se é um arquivo DOCX
      if (
        !file.name.endsWith(".docx") &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return NextResponse.json(
          { error: "File must be a .docx file" },
          { status: 400 }
        );
      }

      // Converte File para Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extrai estrutura completa do DOCX
      const documentStructure = await extractDocumentStructure(buffer);
      projectText = documentStructure.structuredText;
      projectName = projectNameField || undefined;
      inputType = (inputTypeField === 'feature' || inputTypeField === 'project') 
        ? inputTypeField 
        : undefined;

      if (!projectText || projectText.trim().length === 0) {
        return NextResponse.json(
          { error: "Could not extract text from DOCX file" },
          { status: 400 }
        );
      }

      // Tenta parsing inteligente do documento APENAS se inputType for 'project' ou undefined
      // Se inputType for 'feature', pula o parsing e vai direto para runFeatureOrchestration
      console.log('[generate-tasks] DOCX extracted, inputType:', inputType);
      
      if (inputType !== 'feature') {
        console.log('[generate-tasks] inputType is not "feature", attempting document parsing');
        try {
          const parsedDoc = await parseDocumentIntelligently(documentStructure);
          if (parsedDoc && parsedDoc.features && parsedDoc.features.length > 0) {
            // Documento já tem features identificadas - usa parsing inteligente
            console.log('[generate-tasks] Using document parsing, found features:', parsedDoc.features.length);
            const backlog = convertParsedDocToBacklog(parsedDoc, projectName);
            const stats = generateBacklogStats(backlog);
            
            return NextResponse.json({
              backlog,
              stats,
              export: {
                json: formatBacklogForExport(backlog, { format: 'json' }),
                markdown: formatBacklogForExport(backlog, { format: 'markdown' }),
                text: formatBacklogForExport(backlog, { format: 'text' }),
              },
              source: 'document_parsing',
            });
          }
        } catch (error) {
          console.log('[generate-tasks] Document parsing failed, using standard flow:', error);
          // Continua com o fluxo normal - não é um erro crítico
        }
      } else {
        console.log('[generate-tasks] inputType is "feature", skipping document parsing - will use runFeatureOrchestration');
      }
    } else {
      // Processa como JSON (texto direto)
      const body = await request.json();

      if (!body.scope || typeof body.scope !== "string") {
        return NextResponse.json(
          { error: 'Field "scope" is required and must be a string' },
          { status: 400 }
        );
      }

      projectText = body.scope;
      projectName = body.projectName;
      inputType = (body.inputType === 'feature' || body.inputType === 'project') 
        ? body.inputType 
        : undefined;
    }

    // Decide qual orquestração usar
    let backlog;
    
    console.log('[generate-tasks] Final decision - inputType:', inputType);
    
    if (inputType === 'feature') {
      console.log('[generate-tasks] Using runFeatureOrchestration - will generate only stories and tasks');
      backlog = await runFeatureOrchestration({
        featureText: projectText,
        projectGoal: projectName,
      });
    } else {
      console.log('[generate-tasks] Using runBacklogOrchestration - will generate full hierarchy');
      backlog = await runBacklogOrchestration({
        projectText,
        projectGoal: projectName,
        inputType: inputType || 'project',
      });
    }
    
    console.log('[generate-tasks] Backlog generated:', {
      epicsCount: backlog.epics?.length || 0,
      firstEpicTitle: backlog.epics?.[0]?.title,
      firstEpicFeaturesCount: backlog.epics?.[0]?.features?.length || 0,
    });

    // Gera estatísticas e arquivos formatados
    const stats = generateBacklogStats(backlog);
    const exportData = {
      json: formatBacklogForExport(backlog, { format: 'json' }),
      markdown: formatBacklogForExport(backlog, { format: 'markdown' }),
      text: formatBacklogForExport(backlog, { format: 'text' }),
    };

    return NextResponse.json({
      backlog,
      stats,
      export: exportData,
      source: 'ai_generation',
    });

  } catch (error) {
    console.error("[generate-backlog] error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate backlog",
      },
      { status: 500 }
    );
  }
}
