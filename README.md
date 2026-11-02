# OnlyDucks

OnlyDucks is a web application concept for AI-assisted developer learning and opportunity discovery, complementing notodoescodigo.com.

## MVP scope
- Shared authentication integration (provider-specific implementation must be confirmed).
- Three configurable AI mentor profiles using Oscar API.
- One active mentor session per user.
- Feed for articles, job offers, and products.
- Outbound referral tracking and analytics events.
- Documented, secure pilot deployment.

## Status
This repository is a starter scaffold, not a production-ready implementation. External integrations are represented by explicit adapters and TODOs until credentials, API contracts, and provider details are confirmed.

## Requirements
- Node.js LTS compatible with the selected Next.js release
- npm
- Docker and Docker Compose (optional for local PostgreSQL)
- Git

## Getting started
1. Copy `.env.example` to `.env.local`.
2. Fill in local configuration values. Do not commit secrets.
3. Install dependencies: `npm install` (then commit the generated `package-lock.json` so CI can use reproducible installs).
4. Start PostgreSQL if using Docker: `docker compose up -d db`
5. Generate the Prisma client: `npm run db:generate`
6. Apply migrations: `npm run db:migrate`
7. Start development: `npm run dev`

The initial scaffold allows the home page to run without external integrations. API routes return safe placeholder responses until implemented.

## Useful commands
- `npm run dev` — local development
- `npm run lint` — lint source
- `npm run typecheck` — TypeScript checks
- `npm run test` — unit tests
- `npm run build` — production build
- `npm run db:generate` — generate Prisma client
- `npm run db:migrate` — apply local migrations

## Repository workflow
See [`readme-project_guide.md`](./readme-project_guide.md).

## Global tool inventory
See [`requirements-global.txt`](./requirements-global.txt).
