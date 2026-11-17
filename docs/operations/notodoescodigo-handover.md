# OnlyDucks handover for notodoescodigo.com

OnlyDucks is prepared as an independently runnable Next.js service. The delivery to Oscar consists of the reviewed application source, reproducible build/runtime instructions, Prisma schema and migrations, environment inventory, and this integration handover. Oscar owns final deployment and connection within the existing notodoescodigo.com infrastructure.

## Responsibility boundary

The OnlyDucks team supplies application code, build instructions, migrations, configuration inventory, known limitations and validation evidence.

Oscar owns the final hostname or path, production runtime, database, reverse proxy, TLS, DNS, secret injection, backups, approved SSO/Oscar/content integrations, production deployment and operational monitoring.

This repository work does not modify the production server, DNS, proxy, database, secret store or external integrations.

## Runtime contract

- Next.js App Router on a compatible Node.js LTS runtime.
- Install deterministically with `npm ci`.
- Build with `npm run build`.
- Start with `npm run start`, or use the Dockerfile's standalone `runner` target.
- Default port is `3000`; set `PORT` to the port assigned by the host.
- Set `HOSTNAME=0.0.0.0` when running in a container.
- Set `APP_BASE_URL` to the final canonical public origin.
- Supply `DATABASE_URL` for a dedicated PostgreSQL database managed by the host owner.
- Apply Prisma migrations with `npm run db:deploy` as a controlled release step after a verified backup. Do not run migrations automatically on every web process start.

The Dockerfile provides a standalone Next.js runtime and a separate migrator target. Docker Compose is retained for local PostgreSQL development only; it does not define production topology or take ownership of notodoescodigo's proxy, database or TLS.

## Host integration decision

Oscar should select the integration based on the existing server architecture:

1. Dedicated subdomain (preferred when available), for example `onlyducks.notodoescodigo.com`, routed by the existing reverse proxy to the OnlyDucks service on its private application port.
2. Path prefix, for example `/onlyducks`, only after validating Next.js `basePath`, static assets, API routes, cookies, OAuth/SSO callbacks and redirects. The current app is not confirmed to support a path prefix.

Do not assume a hostname or path before Oscar confirms the target topology. Keep the app and its APIs on the same origin.

## Environment variables

Required at runtime:
- `NODE_ENV=production`
- `APP_BASE_URL`: canonical public URL selected by Oscar.
- `DATABASE_URL`: PostgreSQL connection string injected using the host's approved secret mechanism.

Integration placeholders in `.env.example` are not proof of working integrations:
- `OSCAR_API_BASE_URL`, `OSCAR_API_KEY`: Oscar client is currently a scaffold and throws when invoked.
- `AUTH_ISSUER_URL`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `AUTH_CALLBACK_URL`: shared identity provider details and SSO implementation are not complete.
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: optional object storage integration is not verified.

Never commit populated environment files or include secrets in handover documentation. Oscar should inject secrets through the server's approved secret manager or protected runtime configuration.

## Build and validation

Run from the reviewed release commit:

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

For a Docker-based host, build the `runner` target and expose only its private application port to the existing reverse proxy. Run the `migrator` target as a one-off release task using the same reviewed source/image and production `DATABASE_URL`.

Before production traffic:
1. Confirm host Node.js/Docker version and process supervisor.
2. Confirm hostname/path, proxy routing, forwarded headers and HTTPS termination.
3. Provision a dedicated production PostgreSQL database and verify network/TLS policy.
4. Take and verify a backup before applying migrations.
5. Apply migrations once, then start the app.
6. Verify login/session, mentor, feed, analytics and referral journeys against approved integration contracts.
7. Verify logs, monitoring, resource limits, backups, restore and rollback.
8. Record deployed source SHA/image digest and test evidence.

## Known functional boundaries at handover

The current repository is not a claim of production-complete external connectivity:
- Shared notodoescodigo SSO is not implemented; local authentication remains.
- Oscar API client is a placeholder; mentor UI/session foundations do not mean Oscar conversations are connected.
- Live content/opportunity synchronization is not complete.
- `/api/health` currently reports application metadata and integration placeholders; it is not a database readiness probe.
- Previously identified release blockers (including login rate limiting, analytics hardening, session-transition concurrency, E2E/security coverage and operational recovery evidence) must be resolved or explicitly accepted before public production use.

## Handover acceptance record

Attach:
- source commit SHA and release tag;
- CI run and exact lint/typecheck/test/build outcomes;
- database migration review and test evidence;
- responsive UI and accessibility review;
- known issues and integration TODO owners;
- Oscar's selected host topology and deployment/rollback owner.

This guide is a handover contract, not evidence that deployment or production validation has occurred.
