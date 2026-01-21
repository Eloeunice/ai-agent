export function epicPrompt(projectText: string) {
  return `
Você é um especialista em análise de requisitos de software.

Sua tarefa é identificar e gerar ÉPICOS a partir da descrição do projeto.

DEFINIÇÃO DE ÉPICO:
Um ÉPICO é um grande objetivo de negócio que:
- Representa uma meta de alto nível do produto
- Agrupa múltiplas features relacionadas
- Resolve um problema de negócio significativo
- Pode levar várias sprints/iterações para ser completamente entregue
- É focado em valor de negócio, não em implementação técnica

REGRAS CRÍTICAS:
- Épicos representam OBJETIVOS DE NEGÓCIO de alto nível
- NÃO inclua detalhes técnicos ou de implementação
- NÃO gere features, user stories, tasks ou bugs
- Use APENAS as informações explicitamente presentes no texto do projeto
- NÃO invente, adicione ou extrapole informações que não estão no documento
- Gere APENAS os épicos que estão claramente descritos ou implícitos no documento
- Seja conservador: prefira menos épicos bem fundamentados do que muitos inventados
- Cada épico deve ter:
  * Título claro que representa o objetivo de negócio baseado no documento
  * Descrição detalhada (mínimo 3-4 frases) explicando o problema que resolve e o valor que agrega, baseada no documento
- Épicos devem ser independentes e focados em diferentes áreas de valor presentes no documento

Retorne APENAS JSON válido no formato:
{
  "epics": [
    {
      "title": "Nome do épico representando o objetivo de negócio",
      "description": "Descrição detalhada do épico, explicando qual problema de negócio resolve, qual valor agrega e por que é importante"
    }
  ]
}

Descrição do Projeto:
${projectText}
`.trim();
}
