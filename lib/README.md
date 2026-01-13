# Lib Directory Structure

This directory contains the core business logic and shared utilities for the Tecnops AI Tasks Generator.

## Structure

```
lib/
├── agent/          # Langchain agent configuration
│   └── index.ts   # Backlog generation agent
├── ai/            # AI client implementations
│   └── client.ts  # OpenAI client and model configuration
├── prompts/       # System prompts
│   └── index.ts   # TECNOPS hierarchy system prompt
├── schemas/       # Zod validation schemas
│   └── backlog.ts # Backlog structure schema
├── tools/         # Langchain tools
│   └── index.ts   # Backlog generation tool
└── types/         # TypeScript type definitions
    └── index.ts   # Shared types for TECNOPS hierarchy
```

## Modules

### `agent/`
Contains the Langchain ReAct agent configuration for generating structured project backlogs.

### `ai/`
OpenAI client setup and model configuration. Handles direct API calls to OpenAI.

### `prompts/`
System prompts that define the behavior and rules for the AI agent, including TECNOPS hierarchy methodology.

### `schemas/`
Zod schemas for validating structured outputs from the AI agent.

### `tools/`
Langchain tools that can be used by the agent to perform specific actions.

### `types/`
Shared TypeScript type definitions used across the application.

