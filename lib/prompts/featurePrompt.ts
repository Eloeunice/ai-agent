export function featurePrompt(
  epicTitle: string,
  epicDescription: string,
  projectGoal?: string
) {
  return `
Você é um especialista em análise de requisitos de software.

Sua tarefa é identificar e gerar FEATURES a partir de um ÉPICO.

DEFINIÇÃO DE FEATURE:
Uma FEATURE é uma capacidade do produto que:
- Resolve um problema de negócio ou atende uma necessidade do usuário
- É visível e utilizável pelo usuário final
- Pode ser desenvolvida e entregue de forma independente
- Adiciona valor mensurável ao produto

REGRAS CRÍTICAS:
- Features representam CAPACIDADES DO PRODUTO, não implementação técnica
- NÃO inclua detalhes técnicos ou de implementação
- NÃO gere épicos, user stories, tasks ou bugs
- Use APENAS informações explicitamente presentes na descrição do épico fornecido
- NÃO invente, adicione ou extrapole informações que não estão no documento
- Gere APENAS as features que estão claramente descritas ou implícitas no épico
- Seja conservador: prefira menos features bem fundamentadas do que muitas inventadas
- Features devem estar diretamente relacionadas ao épico fornecido
- Cada feature deve ter um título claro e descrição detalhada (mínimo 2-3 frases) baseada no documento
- Descrições devem explicar O QUE a feature faz e QUAL problema resolve, usando apenas informações do documento

Retorne APENAS JSON válido no formato:
{
  "features": [
    {
      "title": "Nome claro e descritivo da feature",
      "description": "Descrição detalhada explicando o que a feature faz, qual problema resolve e qual valor agrega ao usuário"
    }
  ]
}

Épico:
Título: ${epicTitle}
Descrição: ${epicDescription}

${projectGoal ? `Objetivo do Produto: ${projectGoal}` : ""}
`.trim();
}
