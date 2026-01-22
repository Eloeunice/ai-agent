# Tecnops AI Tasks Generator

Uma API backend inteligente para gerar backlogs estruturados de projetos usando IA (OpenAI). O sistema gera automaticamente a hierarquia completa TECNOPS (Épicos → Features → User Stories → Tasks) a partir de descrições de projeto ou documentos Word (.docx).

## 🚀 Funcionalidades

- **Geração Automática de Backlog**: Cria hierarquia completa de épicos, features, user stories e tasks
- **Suporte a Documentos Word**: Processa arquivos .docx e extrai estrutura automaticamente
- **Parsing Inteligente**: Identifica automaticamente a estrutura do documento quando possível
- **Dois Modos de Operação**:
  - **Projeto Completo**: Gera toda a hierarquia (épicos, features, stories, tasks)
  - **Feature Específica**: Gera apenas stories e tasks para uma feature
- **Exportação em Múltiplos Formatos**: JSON, Markdown e Texto
- **Estatísticas do Backlog**: Contagem de épicos, features, stories e tasks
- **Integração com Tecnops**: Ferramenta para persistir backlog diretamente no Tecnops via Supabase

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta OpenAI com API key
- (Opcional) Supabase configurado para integração com Tecnops

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd tecnops-ai-tasks
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...
SYSTEM_USER_ID=uuid-do-usuario-sistema
```

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | Chave da API OpenAI | ✅ Sim |
| `SUPABASE_URL` | URL do projeto Supabase | ⚠️ Apenas para integração Tecnops |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase | ⚠️ Apenas para integração Tecnops |
| `SYSTEM_USER_ID` | UUID do usuário sistema no Tecnops | ⚠️ Apenas para integração Tecnops |

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

A API estará disponível em `http://localhost:3000/api/ai/generate-tasks`

## 📡 API Reference

### POST `/api/ai/generate-tasks`

Gera um backlog estruturado a partir de uma descrição de projeto ou arquivo Word.

#### Autenticação

Atualmente o endpoint **não requer autenticação**. Em produção, recomenda-se adicionar autenticação.

#### Formato 1: JSON (Texto Direto)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "scope": "Sistema de gestão de tarefas com autenticação, painel do usuário e relatórios",
  "projectName": "Tecnops Task Manager",
  "inputType": "project"
}
```

**Campos:**
- `scope` (string, obrigatório): Descrição do projeto ou feature
- `projectName` (string, opcional): Nome do projeto/épico
- `inputType` (string, opcional): `"project"` ou `"feature"`
  - `"project"`: Gera hierarquia completa (épicos, features, stories, tasks)
  - `"feature"`: Gera apenas stories e tasks (pula épicos e features)

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "Sistema de autenticação com login por email/senha e recuperação de senha",
    "projectName": "Auth System",
    "inputType": "project"
  }'
```

#### Formato 2: Multipart FormData (Upload de Arquivo)

**Content-Type:** `multipart/form-data`

**Campos:**
- `file` (File, obrigatório): Arquivo .docx
- `projectName` (string, opcional): Nome do projeto/épico
- `inputType` (string, opcional): `"project"` ou `"feature"`

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-tasks \
  -F "file=@documento.docx" \
  -F "projectName=Meu Projeto" \
  -F "inputType=project"
```

#### Response (Sucesso)

**Status:** `200 OK`

```json
{
  "backlog": {
    "epics": [
      {
        "title": "Nome do Épico",
        "description": "Descrição do épico",
        "features": [
          {
            "title": "Nome da Feature",
            "description": "Descrição da feature",
            "user_stories": [
              {
                "title": "Título da User Story",
                "description": "Descrição da user story",
                "tasks": [
                  {
                    "title": "Título da Task",
                    "description": "Descrição da task",
                    "acceptanceCriteria": [
                      "Critério de aceite 1",
                      "Critério de aceite 2"
                    ]
                  }
                ],
                "sub_bugs": []
              }
            ],
            "bugs": []
          }
        ]
      }
    ]
  },
  "stats": {
    "total_epics": 2,
    "total_features": 5,
    "total_stories": 12,
    "total_tasks": 45
  },
  "export": {
    "json": "{ ...backlog serializado em JSON... }",
    "markdown": "# Backlog em formato Markdown...",
    "text": "Backlog em texto simples..."
  },
  "source": "ai_generation"
}
```

**Campos da Resposta:**
- `backlog`: Estrutura hierárquica completa do backlog
- `stats`: Estatísticas agregadas (contagem de épicos, features, stories, tasks)
- `export`: Backlog formatado em JSON, Markdown e Texto
- `source`: Origem do backlog (`"ai_generation"` ou `"document_parsing"`)

#### Response (Erro)

**Status:** `400 Bad Request` ou `500 Internal Server Error`

```json
{
  "error": "Mensagem de erro descritiva"
}
```

**Erros Comuns:**
- `400`: Campo "scope" é obrigatório e deve ser uma string
- `400`: Campo "file" é obrigatório (para upload)
- `400`: Arquivo deve ser um .docx
- `500`: Falha ao gerar backlog

## 🏗️ Estrutura do Projeto

```
tecnops-ai-tasks/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── generate-tasks/
│   │           └── route.ts          # Endpoint principal da API
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── agent/
│   │   ├── index.ts                  # Configuração do agente Langchain
│   │   └── orchestrator.ts           # Orquestração de geração de backlog
│   ├── ai/
│   │   └── client.ts                 # Cliente OpenAI
│   ├── prompts/
│   │   ├── index.ts                  # Prompt principal do sistema
│   │   ├── epicPrompt.ts             # Prompt para geração de épicos
│   │   ├── featurePrompt.ts          # Prompt para geração de features
│   │   ├── userStoryPrompt.ts        # Prompt para geração de user stories
│   │   ├── taskPrompt.ts             # Prompt para geração de tasks
│   │   └── mcpTecnopsRules.ts        # Regras TECNOPS
│   ├── schemas/
│   │   ├── backlog.ts                # Schema Zod do backlog
│   │   ├── epicSchema.ts
│   │   ├── featureSchema.ts
│   │   ├── user_stories_Schema.ts
│   │   └── taskSchema.ts
│   ├── tools/
│   │   ├── extract_epics.ts          # Tool para extrair épicos
│   │   ├── extract_features.ts       # Tool para extrair features
│   │   ├── extract_user_stories.ts   # Tool para extrair user stories
│   │   ├── extract_tasks.ts          # Tool para extrair tasks
│   │   ├── build_backlog_structure.ts # Tool para montar estrutura final
│   │   ├── tecnops/
│   │   │   ├── persistBacklog.ts     # Tool para persistir no Tecnops
│   │   │   ├── persistBacklog.schema.ts
│   │   │   ├── createworkItem.tool.ts
│   │   │   ├── supabase.adapter.ts   # Adaptador Supabase
│   │   │   └── schema.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts                  # Definições de tipos TypeScript
│   ├── utils/
│   │   ├── docxExtractor.ts          # Extração de texto de arquivos Word
│   │   ├── documentParser.ts         # Parsing inteligente de documentos
│   │   └── exportFormatter.ts        # Formatação para exportação
│   ├── supabase.ts                   # Cliente Supabase
│   └── README.md                     # Documentação da lib
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Langchain**: Framework para agentes de IA
- **OpenAI**: Modelo GPT para geração de conteúdo
- **Zod**: Validação de schemas
- **Supabase**: Banco de dados e integração com Tecnops
- **Mammoth**: Extração de texto de arquivos Word (.docx)

## 🔄 Fluxo de Geração

1. **Recebe Input**: Texto do projeto ou arquivo .docx
2. **Processa Documento** (se .docx): Extrai texto e estrutura
3. **Parsing Inteligente** (opcional): Tenta identificar estrutura pré-existente
4. **Orquestração**:
   - **Modo Projeto**: Gera épicos → features → user stories → tasks
   - **Modo Feature**: Gera apenas user stories → tasks
5. **Monta Estrutura**: Organiza tudo na hierarquia TECNOPS
6. **Gera Estatísticas**: Calcula contagens e métricas
7. **Formata Exportação**: Prepara JSON, Markdown e Texto
8. **Retorna Resposta**: Backlog completo + stats + exports

## 🔌 Integração com Tecnops

O projeto inclui ferramentas para persistir o backlog gerado diretamente no Tecnops:

- **Tool `persist_backlog`**: Cria work_items no Supabase seguindo a hierarquia
- **Status padrão**: `"backlog"` para todos os itens criados
- **Tipos suportados**: epic, feature, user_story, task

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🐛 Problemas Conhecidos

- O endpoint não possui autenticação (recomenda-se adicionar em produção)
- Parsing inteligente de documentos pode não funcionar para todos os formatos de Word

## 📞 Suporte

Para questões e suporte, abra uma issue no repositório.
