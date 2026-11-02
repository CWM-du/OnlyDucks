# ADR-001: Initial Application Stack

- **Status:** Proposed; requires TL1 confirmation.
- **Date:** 2026-11-02

## Context
The proposal recommends a maintainable modular monolith for a small team and an accelerated MVP.

## Decision
Use Next.js App Router, React, TypeScript, Zod, PostgreSQL, and Prisma as the initial scaffold. Use one server-side Oscar API integration. Use Docker for reproducible container builds and local PostgreSQL development.

## Alternatives
- Drizzle ORM instead of Prisma.
- Existing project-specific authentication, hosting, or content integration conventions.

## Consequences
- Dependencies and versions must be verified before deployment.
- Existing infrastructure may require changing this decision.
- Do not maintain both Prisma and Drizzle without explicit approval.
- External authentication, Oscar API, and content integrations remain unimplemented until contracts are confirmed.
