export function storyPrompt(
  featureTitle: string,
  featureDescription: string
) {
  return `
Você é um especialista em análise de requisitos de software.

Sua tarefa é identificar e gerar USER STORIES a partir de uma FEATURE, baseando-se APENAS no que está descrito no documento fornecido.

DEFINIÇÃO DE USER STORY:
Uma USER STORY descreve o que muda no sistema quando a story termina.
User Stories podem ser:
- Funcionais (para usuários finais)
- Técnicas (infra, refactor, migração, para time de engenharia/plataforma)

REGRAS CRÍTICAS:
- Use APENAS informações explicitamente presentes na descrição da feature fornecida
- NÃO invente, adicione ou extrapole informações que não estão no documento
- Gere de 3 a 10 user stories por feature (quantidade recomendada)
- Cada story deve ser específica, focada e baseada no que está descrito
- Título deve ser curto, direto e descritivo
- NÃO gere épicos, features, tasks ou bugs
- Seja conservador: prefira menos stories bem fundamentadas do que muitas inventadas

FORMATO DE DESCRIÇÃO:
Inicie com "Como sistema / time de engenharia / plataforma" e descreva o que muda no sistema quando a story termina.

Exemplos:
- "Como sistema, permitir que usuários façam login usando email e senha, autenticando credenciais e retornando token de acesso"
- "Como time de engenharia, migrar banco de dados legado para nova estrutura, garantindo integridade dos dados existentes"
- "Como plataforma, processar pagamentos via gateway, atualizando status do pedido após confirmação"

EVITAR:
- Stories genéricas ou vagas
- Stories que só descrevem implementação sem valor final
- Stories que não descrevem mudança clara no sistema

Retorne APENAS JSON válido no formato:
{
  "stories": [
    {
      "title": "Título curto e descritivo da user story",
      "description": "Como [sistema/time de engenharia/plataforma], [descrição do que muda no sistema quando a story termina], baseada APENAS no documento fornecido"
    }
  ]
}

Feature:
Título: ${featureTitle}
Descrição: ${featureDescription}

IMPORTANTE: 
- Baseie-se APENAS no conteúdo acima
- Gere de 3 a 10 stories (quantidade recomendada)
- Cada story deve descrever claramente o que muda no sistema
- Não invente ou adicione informações que não estão presentes
`.trim();
}
