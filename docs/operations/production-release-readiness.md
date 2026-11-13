# Production Release Readiness — OnlyDucks

**Status: BLOCKED — NOT APPROVED FOR PRODUCTION**  
**Assessment date:** 2026-11-13  
**Assessed source:** `develop` at `b7121178856b89a26f3f879a8f5d998fb236aa08`  
This document is a release plan, not deployment authorization.

## 1. Decision

Do not deploy the current application to public production. The current repository has a useful application foundation and PostgreSQL-backed CI, but critical product integrations and production operating controls are incomplete or unverified. A controlled internal preview is a separate decision and must disclose the missing integrations.

## 2. Verified state

| Area | Evidence | Status |
|---|---|---|
| Source | develop SHA `b7121178856b89a26f3f879a8f5d998fb236aa08` | Snapshot; revalidate before release |
| CI | PR #42 passed PostgreSQL service, Prisma validation/generation/migration, lint, typecheck, unit tests, build | No Playwright E2E in workflow |
| Deploy workflow | `.github/workflows/pilot-deploy.yml` only echoes that provider/credentials are not configured | Placeholder |
| Container | Dockerfile installs with `npm install` | Needs deterministic `npm ci` and image scan |
| Compose | Local PostgreSQL only, default local credentials, publishes 5432 | Not production topology |
| Health | `/api/health` always returns `status: ok`, while auth/Oscar/feed are not configured | Not a readiness probe |
| SSO | Local auth only; no completed shared SSO/OIDC/SAML callback | Blocker |
| Oscar | Adapter not configured/implemented | Blocker for AI mentor flow |
| Content | Live content adapter not implemented; feed has no live items | Blocker for live opportunities |
| Login security | Account lockout exists; code notes IP-aware rate limiting is still needed | Blocker for public exposure |
| Session concurrency | develop retains read-then-unconditional-write transition | Blocker |
| PR #41 | Draft; behind develop; CI failed at typecheck, tests/build skipped | Not merge-ready |
| Branch governance | GitHub reports develop protection disabled | Required checks not enforced |
| PR #34 | Open, unmergeable, 42 commits; deployment claims not backed by target evidence; unsafe deployment assumptions identified | Do not merge/use |

## 3. Mandatory release gates

### Product integrations
- [ ] Select and configure the approved identity provider; test OIDC/SAML callback, issuer/audience, logout, expiry, revocation, account linking, and key rotation.
- [ ] Confirm Oscar production contract, endpoint, credentials, quotas, timeout/retry behavior, privacy terms; complete real mentor conversation tests.
- [ ] Configure approved live sources for articles/jobs/products; test freshness, attribution, URL validation, deduplication, empty/error states.
- [ ] Approve explicit degraded-mode behavior for unavailable integrations.

### Security and correctness
- [ ] Implement distributed IP-aware rate limiting for login and sensitive endpoints.
- [ ] Fix/rebase PR #41, merge only after typecheck, unit tests, PostgreSQL concurrency integration test, and production build pass.
- [ ] Standardize analytics on one canonical user ID for browser and server events.
- [ ] Bound analytics request bytes, schema depth/size, event/property allow-list, and request rates.
- [ ] Verify production origin/host allow-list and secure cookies behind the actual proxy.
- [ ] Remove demo/default credentials, password-reset shortcuts, debug endpoints, and secrets from images/logs.
- [ ] Run dependency and container vulnerability scans; resolve or formally accept high/critical findings.
- [ ] Review authorization, CSRF/origin checks, session revocation, PII retention, and secret rotation.

### Database and operations
- [ ] Confirm PostgreSQL provider/region, TLS, network policy, connection pooling/limits, encryption, retention, owner.
- [ ] Configure automated backups and complete a restore drill to an isolated database.
- [ ] Rehearse migrations on a production-like copy; record lock impact, compatibility, and recovery plan.
- [ ] Implement separate liveness/readiness. Liveness checks process only; readiness fails if required dependencies (at least DB) are unavailable.
- [ ] Configure structured logs, error reporting, metrics, uptime monitoring, alert routing and retention; never log secrets or sensitive payloads.
- [ ] Record incident owner, on-call/escalation path, resource limits, request timeouts, replica policy, and platform health checks.

### Release governance
- [ ] Protect develop/release branches; require CI and review.
- [ ] CI must run lint, typecheck, unit tests, PostgreSQL migrations/integration tests, production build, critical E2E, dependency audit, and container scan.
- [ ] Build once from immutable SHA; record image digest, SBOM, provenance, and migration ID.
- [ ] Deployment workflow targets a named environment, uses least privilege, requires explicit production approval, and supports gradual rollout.
- [ ] Staging deploy and real-provider smoke tests pass.
- [ ] Product/stakeholder acceptance is recorded against `docs/testing/pilot-acceptance.md`.
- [ ] Rollback and database recovery are rehearsed.

## 4. Inputs still required

Do not guess or commit secrets. Supply:
- Hosting provider, production project/environment, hostname and DNS owner.
- PostgreSQL provider/region/connection mode/backup policy.
- Identity provider and approved production callback/logout URLs.
- Oscar API production base URL, credential owner, quotas, and data-processing terms.
- Approved feed sources and credentials, if required.
- Object storage provider/bucket/policy, if required.
- Secret manager, secret owners, monitoring provider, alert destination.
- Deployment approver, incident owner, rollback operator.

## 5. Safe deployment sequence

1. Freeze release candidate from protected branch; record exact SHA.
2. Run all required CI and security checks against that SHA.
3. Build one immutable image; record digest/SBOM/provenance. Promote the same artifact to staging and production.
4. Provision production resources with managed secrets and private networking. Never use local Compose defaults or demo-user scripts.
5. Verify database backup; rehearse migration against production-like copy.
6. Deploy to staging; run migrations once via controlled job, not on every web replica.
7. Run staging smoke tests for readiness/liveness, SSO, session create/transition, Oscar conversation, live feed, analytics attribution, authorization and logout.
8. Obtain explicit production approval. Deploy canary/rolling with health gates and automatic stop conditions.
9. Run read-only production smoke checks; verify logs, metrics, DB and integration status without destructive test data.
10. Monitor the agreed window; record SHA, image digest, migration, results, approver and incidents.

## 6. Rollback and recovery

- Stop rollout on failed readiness, elevated 5xx/latency, auth failures, DB saturation, data-integrity issues, or integration failures beyond agreed tolerance.
- Roll application back to previous immutable image only when schema remains backward-compatible.
- Never run `prisma migrate reset` or destructive down-migrations in production.
- For incompatible migrations, use rehearsed forward-fix or point-in-time restore with explicit data-loss assessment and incident approval.
- Preserve deployment metadata/logs; verify recovery with read-only health checks and critical user journeys before reopening traffic.

## 7. Smoke-test acceptance matrix

| Check | Expected result | Evidence |
|---|---|---|
| Liveness | 200 while process runs | Response + timestamp |
| Readiness | 200 only if required dependencies healthy | Response + DB probe |
| Database | TLS connection and read/write probe | Sanitized result |
| SSO | Login/callback/expiry/logout/revocation work | Test report; no tokens |
| Authorization | Cross-user access denied | Automated report |
| Mentor | Real Oscar-backed interaction succeeds | Redacted trace |
| Feed | Fresh approved articles/jobs/products returned | Source/freshness report |
| Analytics | Authenticated event uses canonical ID; cross-user read denied | Test report |
| Security | Rate limits, origin, payload limits, cookie flags pass | Test/scan report |
| Recovery | Image rollback and DB recovery demonstrated | Exercise record |

## 8. Relevant PR evidence

- PR #42 visual refresh merged to develop; PR validation passed. This is not a production deployment.
- PR #39 backend recovery merged after PostgreSQL integration validation; it does not deliver SSO, Oscar, or live feed.
- PR #41 is a draft; CI failed in TypeScript because tests still reference removed `updateSessionStatus`; unit tests and build were skipped.
- PR #34 must not be used as deployment candidate. Its checked boxes do not prove target provisioning or tests.

**Release remains BLOCKED until every mandatory gate has verifiable evidence and the production environment inputs are confirmed.**
