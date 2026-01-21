export function taskPrompt(
  storyTitle: string,
  storyDescription: string
) {
  return `
Você é um especialista em análise técnica de software.

Sua tarefa é identificar e gerar TASKS TÉCNICAS a partir de uma USER STORY, baseando-se APENAS no que está descrito.

DEFINIÇÃO DE TASK:
Uma TASK é uma unidade de trabalho técnica que:
- Descreve COMO a user story será implementada
- É executável, atômica e idealmente concluível em até 1 dia
- É específica, mensurável e testável

REGRAS CRÍTICAS:
- Use APENAS informações explicitamente presentes na user story fornecida
- NÃO invente, adicione ou extrapole informações que não estão no documento
- Gere de 3 a 7 tasks por user story (quantidade recomendada)
- Se uma story precisar de mais de 8 tasks, avalie se deve ser dividida em duas stories
- Cada task deve ser:
  * Executável (pode ser feita de forma independente)
  * Atômica (não pode ser dividida em subtasks menores)
  * Idealmente concluível em até 1 dia de trabalho
  * Ação específica e clara
  * Mensurável (pode ser verificada como completa)
  * Testável (tem critérios de aceitação objetivos)
- Título deve ser técnico, curto e descritivo
- Descrição deve explicar os detalhes técnicos da implementação de forma concisa
- NÃO gere épicos, features ou user stories
- NÃO repita a descrição da user story, foque na implementação técnica
- NÃO adicione tasks "extras" ou "nice to have" que não estão relacionadas diretamente à story
- NÃO repita lógica de seleção/configuração em múltiplos pontos (use centralização quando aplicável)

CRITÉRIOS DE ACEITAÇÃO:
Cada task deve ter critérios de aceitação objetivos que:
- São verificáveis (true/false)
- Evitam linguagem vaga ("ajustes", "verificar", "melhorar")
- Seguem formato recomendado:
  * "Quando X, então Y"
  * "Dado Z, o sistema faz W"
- Máximo de 3-4 critérios por task

NUMERAÇÃO:
- NÃO use numeração hierárquica complexa (ex.: 1.1.7.3)
- A ferramenta de gestão já controla hierarquia
- Use identificadores simples ou deixe sem numeração

Retorne APENAS JSON válido no formato:
{
  "tasks": [
    {
      "title": "Título técnico e descritivo da task",
      "description": "Descrição concisa da implementação técnica, baseada APENAS no que está descrito na user story",
      "acceptanceCriteria": [
        "Quando [condição], então [resultado esperado]",
        "Dado [contexto], o sistema faz [ação]"
      ]
    }
  ]
}

User Story:
Título: ${storyTitle}
Descrição: ${storyDescription}

IMPORTANTE: 
- Baseie-se APENAS no conteúdo acima
- Gere de 3 a 7 tasks (se precisar de mais de 8, a story pode precisar ser dividida)
- Cada task deve ser executável, atômica e concluível em até 1 dia
- Critérios de aceitação devem ser objetivos e verificáveis
- Não invente ou adicione informações que não estão presentes
`.trim();
}
