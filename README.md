# HireMate AI

Full-stack recruitment and AI-powered interview platform.

## Planned stack

- Next.js + TypeScript
- Node.js + Express
- PostgreSQL + Prisma
- JWT authentication and role-based access control
- LLM-powered resume analysis and interview evaluation
- Embeddings and RAG for semantic job/candidate matching

## Monorepo structure

```text
apps/
  web/        Next.js frontend
  api/        Node.js/Express API
packages/
  database/   Prisma schema and database client
```

## Development status

Phase 1: project foundation.

Secrets must be supplied through environment variables. Never commit `.env` files or API keys.
