# Local Setup

## Prerequisites
- Node.js version from `.nvmrc`
- npm
- Git
- Docker and Docker Compose if using the local PostgreSQL service

## Steps
1. Clone the repository.
2. Copy `.env.example` to `.env.local`.
3. Start PostgreSQL with `docker compose up -d db`.
4. Install dependencies with `npm ci`.
5. Generate the Prisma client with `npm run db:generate`.
6. Apply migrations with `npm run db:migrate` after the initial migration has been created.
7. Start the app with `npm run dev`.

## Notes
The scaffold home page can run without external credentials. Authentication, Oscar API, and real content-feed integrations are not implemented yet.
