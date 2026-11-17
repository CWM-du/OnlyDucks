# VPS deployment preparation (Docker Compose)

**Status: deployment template only — not production approved.** This topology is prepared for review. It has not been run against a VPS, TLS endpoint, production database, or real integrations.

## Topology

- Caddy terminates HTTPS and proxies to the Next.js app.
- The app is not published directly to the host; it is reachable only on the Docker edge network.
- PostgreSQL has no published host port and is attached only to an internal Docker network.
- Prisma migrations run as an explicit one-off job, not during web container startup.
- The Next.js container runs as a non-root user.
- Database and Caddy data use named Docker volumes.

## VPS prerequisites

Use a supported Linux LTS release with Docker Engine and the Docker Compose plugin. Configure DNS `A` (and `AAAA` only if IPv6 is working) for the chosen hostname to the VPS. Allow inbound TCP 80/443 (and UDP 443 if enabling HTTP/3). Restrict SSH to trusted administrator IPs; do not expose PostgreSQL (5432) or the app (3000) publicly. Enable unattended security updates or a documented patch cadence, firewall, SSH keys, and monitoring.

## Prepare secrets and environment

1. Copy `.env.production.example` to `.env.production` on the VPS only.
2. Set the real domain and ACME email.
3. Generate a high-entropy password, for example `openssl rand -hex 32`. Use the output as `POSTGRES_PASSWORD`; hexadecimal avoids reserved characters in the current DATABASE_URL construction.
4. Store the file with restrictive permissions: `chmod 600 .env.production`; ensure it is owned by the deployment account and excluded from backups accessible to untrusted parties.
5. Populate only integration values that are actually available and approved. Do not use example credentials.
6. Back up the environment file securely outside the application directory or use a proper secret manager.

The example file is a template, not a complete integration setup. SSO, Oscar, and the live content feed are not implemented/verified in the current application; adding environment variables does not implement them.

## Build and deploy sequence (after release approval)

Run commands from the checked-out, reviewed release tag/SHA on the VPS. Do not deploy mutable `develop` directly.

```bash
# 1. Validate configuration and build both runtime images
docker compose --env-file .env.production config
docker compose --env-file .env.production build app migrate

# 2. Start only the database, then wait for health
docker compose --env-file .env.production up -d db
docker compose --env-file .env.production ps

# 3. Take a verified pre-migration backup using your approved backup procedure.
# Do not continue until backup completion and restore viability are confirmed.

# 4. Apply migrations once as a one-off task
docker compose --env-file .env.production --profile tools run --rm migrate

# 5. Start the app and HTTPS proxy
docker compose --env-file .env.production up -d app proxy

# 6. Inspect health and logs
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail=200 app proxy
```

These commands are an operator runbook, not evidence that deployment has occurred. Validate the exact Compose version and image tags in staging first. For repeatable releases, build and publish immutable images in CI, then pin the exact image digest rather than building on the VPS.

## Operational requirements before public traffic

- Configure a real secrets manager or tightly controlled secret delivery; do not pass secrets in shell history or commit them.
- Configure encrypted off-host PostgreSQL backups and perform a restore drill.
- Add a real readiness endpoint that probes the database and returns non-200 when required dependencies are unavailable. The current `/api/health` endpoint is static and must not be used as a readiness signal.
- Configure monitoring, log retention, alerting, disk/volume capacity alerts, and an incident owner.
- Configure log rotation and Docker image/volume cleanup with retention safeguards.
- Confirm app process limits, memory/CPU limits, restart behavior, and VPS capacity under load.
- Test proxy headers, secure cookies, canonical origin, TLS renewal, and authentication flows through the public hostname.
- Review firewall, SSH, Docker socket access, backup access, and least-privilege deployment account.
- Verify migration compatibility and rollback/forward-fix plan against a production-like database.

## Rollback

Keep the previous immutable app image available. If the schema remains backward-compatible, redeploy the prior image tag/digest and verify critical read-only journeys. Do not run destructive Prisma down-migrations or `migrate reset` in production. For incompatible schema changes, use the rehearsed forward-fix or point-in-time restore plan with explicit incident approval and a data-loss assessment.

## Current release blockers

The repository assessment still blocks public production deployment: shared SSO, Oscar mentor integration, live opportunity feed, atomic session transitions, login rate limiting, analytics hardening, real readiness checks, protected release branches, security scans, E2E coverage, and production backup/restore evidence remain incomplete or unverified. PR #34 is not a safe deployment source.

## Acceptance evidence to attach before approval

- VPS hostname/provider and firewall review.
- Immutable image digest and source SHA.
- CI, PostgreSQL migration/integration, E2E, dependency and container scan results.
- Backup and restore drill record.
- Staging HTTPS, auth, mentor, feed, analytics and authorization smoke-test results.
- Readiness/liveness results, monitoring/alert test, and rollback rehearsal.
- Named deployment approver and incident/rollback owners.
