# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Experiment Code Library (`artifacts/experiment-library`)

- **Kind**: react-vite web app
- **Preview path**: `/`
- **Stack**: React, Vite, Tailwind CSS, highlight.js, @tanstack/react-query, wouter
- **Purpose**: A ChatGPT-style dark themed code library for CS experiment snippets

### API Server (`artifacts/api-server`)

- **Kind**: Express API
- **Preview path**: `/api`
- **Key endpoints**:
  - `GET /api/experiments` — returns all subjects and experiments
  - `GET /api/experiments/:subject` — returns experiments for a specific subject
  - `GET /api/outputs/:filename` — serves output images

## Experiment Folder System

Experiments are stored as JSON files in:
```
artifacts/api-server/experiments/
  DBMS/exp1.json
  OS/exp1.json
  CN/exp1.json
  Java/exp1.json
  ...
```

Output images (referenced in experiment JSON) go in:
```
artifacts/api-server/outputs/
```

**Adding a new experiment**: Drop a JSON file into the appropriate subject folder. No code changes needed. Example format:
```json
{
  "title": "My Experiment",
  "description": "What it demonstrates",
  "language": "Python",
  "code": "print('hello')",
  "output": null
}
```
