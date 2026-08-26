# HireMate AI

A full-stack recruitment platform for candidates and recruiters, with AI-assisted resume analysis, semantic job matching and interview evaluation.

## Current capabilities
- JWT authentication and role-aware API routes
- Resume parsing for PDF/DOCX uploads
- AI resume analysis and job matching modules
- Interview workflows and evaluation routes
- Dashboard and job-management API modules
- Next.js web application and Express/TypeScript API
- Prisma/PostgreSQL database package
- Environment-based secret configuration

## Monorepo

```text
apps/web        Next.js frontend
apps/api        Express + TypeScript API
packages/database Prisma schema/client
```

## Requirements
- Node.js 20+
- pnpm 10+
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm dev
```

The web app runs on the Next.js development port and the API runs from `apps/api`.

## Quality checks

```bash
pnpm build
pnpm lint
pnpm test
```

## Security
Never commit `.env`, API keys, JWT secrets, database credentials or uploaded resumes. Use `.env.example` as the configuration template.

## Roadmap
- Persistent recruiter/candidate dashboards
- Production LLM provider integration
- Embeddings/RAG matching pipeline
- Automated interview scoring with audit trails
- Production deployment for web, API and PostgreSQL

## License
MIT
