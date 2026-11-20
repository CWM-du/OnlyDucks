# OnlyDucks

OnlyDucks is a web application for AI-assisted developer learning and opportunity discovery, designed to complement notodoescodigo.com.

## Delivery model

The application is prepared as an independently runnable service. It will be handed to Oscar with source code, build/runtime instructions, Prisma migrations and integration notes. Oscar owns the final deployment and connection within the existing notodoescodigo.com infrastructure.

This repository preparation does not deploy to or modify the production server. External integrations must not be described as connected until their contracts and credentials are implemented and verified.

## MVP scope

- Shared authentication integration (provider-specific implementation must be confirmed).
- Three configurable AI mentor profiles using Oscar API.
- One active mentor session per user.
- Feed for articles, job offers, and products.
- Outbound referral tracking and analytics events.

## Requirements

- Node.js LTS compatible with the selected Next.js release
- npm
- Docker and Docker Compose (optional for local PostgreSQL)
- Git

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Fill in local configuration values. Do not commit secrets.
3. Install dependencies: `npm ci`.
4. Start PostgreSQL for local development: `docker compose up -d db`.
5. Generate the Prisma client: `npm run db:generate`.
6. Apply local migrations: `npm run db:migrate`.
7. Start development: `npm run dev`.

The application can run without external integrations, but API routes/adapters may return safe placeholders until their contracts are implemented.

## Useful commands

- `npm run dev` — local development
- `npm run lint` — lint source
- `npm run typecheck` — TypeScript checks
- `npm run test` — unit tests
- `npm run build` — production build
- `npm run start` — production Node.js server
- `npm run db:generate` — generate Prisma client
- `npm run db:deploy` — apply committed migrations in a deployment

## Handover

See [docs/operations/notodoescodigo-handover.md](./docs/operations/notodoescodigo-handover.md) for Oscar's deployment contract and integration checklist.

See [readme-project_guide.md](./readme-project_guide.md) for repository workflow.
