# Production Release Readiness — OnlyDucks

**Status: BLOCKED — NOT APPROVED FOR PRODUCTION**  
**Assessment date:** 2026-11-23  
**Assessed source:** `develop` at `388ec959636735b6b91ee1292fb05c8c94ba8831` (includes PR #45)

This document records release gates. It is not deployment authorization, client acceptance, or evidence that production has been provisioned.

## 1. Release decision

Do not deploy OnlyDucks to public production. The current `develop` branch contains a validated frontend preview, but production identity, Oscar, live content, analytics authorization, infrastructure, and operational controls remain incomplete or unverified. The Vercel deployment created for PR #45 was a preview (`target: null`), not production. The Vercel project is not live and `www.onlyducks.es` is not configured.

## 2. Verified repository and preview state

| Area | Verified state | Release implication |
|---|---|---|
| Source | `develop` at `388ec959636735b6b91ee1292fb05c8c94ba8831`; includes merged PR #45 | Reassess every gate against the exact release SHA |
| Frontend | PR #45 delivered responsive three-column feed, shared light/dark theme, local profile-avatar preview and local discovery filtering | Frontend preview only; local profile state is not authenticated server persistence |
| PR #45 CI | Prisma validation/migrations, lint, typecheck, unit tests, build and 10 Playwright Chromium E2E tests passed; run [45170239529](https://github.com/CWM-du/OnlyDucks/actions/runs/45170239529) | Evidence applies to PR #45 head SHA, not automatically to later release candidates |
| Preview hosting | Vercel preview [only-ducks-1ato2pwav-trindadeproduction-9727.vercel.app](https://only-ducks-1ato2pwav-trindadeproduction-9727.vercel.app); deployment READY, `target: null` | Not production; no production domain configured |
| Identity | Local authentication only; shared production SSO/OIDC/SAML is not completed | Blocker |
| Oscar | Production API contract, endpoint and credentials are not available/verified; no proven live mentor conversation | Blocker for AI mentor flow |
| Content | Approved live content-source integration is not verified; current feed content is preview/demo | Blocker for live opportunities |
| Analytics | Client-supplied identity and cross-user report authorization require remediation and tests | Security blocker |
| Session concurrency | PR #41 proposes conditional ACTIVE-state transition and a PostgreSQL race test; it remains unmerged pending actual CI execution evidence | Blocker until merged and validated |
| Deployment | Pilot deploy workflow is a placeholder; no verified production target, deployment, migration or production smoke evidence | Blocker |
| Domain | `www.onlyducks.es` is not configured in the Vercel project | Blocker |
| PR #34 | Open, unmergeable handover/deployment PR with unsupported completion claims and unsafe deployment assumptions | Must not be used as a release candidate |

## 3. Mandatory release gates

### Product integrations
- [ ] Select and configure the approved identity provider; verify OIDC/SAML issuer, audience, callbacks, logout, expiry, revocation, account linking and key rotation.
- [ ] Confirm Oscar production contract, endpoint, credential owner, quotas, timeout/retry behavior and data-processing terms; complete real mentor-conversation tests.
- [ ] Configure approved live sources for articles/jobs/products; verify freshness, attribution, URL validation, deduplication, empty/error states and source permissions.
- [ ] Approve degraded-mode behavior when required integrations are unavailable.
- [ ] Implement authenticated server-side profile persistence and approved avatar/object storage if cross-device profile continuity is required.

### Security and correctness
- [ ] Merge the atomic mentor-session transition only after required CI passes and the PostgreSQL concurrency integration test is proven to execute (not skip).
- [ ] Implement distributed IP-aware rate limiting for login and sensitive endpoints.
- [ ] Use one canonical authenticated user identity for browser and server analytics; reject client-forged identity.
- [ ] Enforce role-based authorization on analytics reads; prevent cross-user/global report access without explicit privilege.
- [ ] Bound analytics request bytes, schema depth/size, event/property allow-list and request rates.
- [ ] Verify production origin/host allow-list and secure cookies behind the actual proxy.
- [ ] Remove demo/default credentials, password-reset shortcuts, debug endpoints and secrets from images/logs.
- [ ] Run dependency and container vulnerability scans; resolve or formally accept high/critical findings.
- [ ] Review authorization, CSRF/origin checks, session revocation, PII retention and secret rotation.

### Database and operations
- [ ] Confirm PostgreSQL provider/region, TLS, network policy, connection pooling/limits, encryption, retention and owner.
- [ ] Configure automated backups and complete a restore drill to an isolated database.
- [ ] Rehearse migrations on a production-like copy; record lock impact, compatibility and recovery plan.
- [ ] Implement separate liveness/readiness; readiness must fail when required dependencies (at least DB) are unavailable.
- [ ] Configure structured logs, error reporting, metrics, uptime monitoring, alert routing and retention; never log secrets or sensitive payloads.
- [ ] Record incident owner, on-call/escalation path, resource limits, request timeouts, replica policy and platform health checks.

### Release governance
- [ ] Protect develop/release branches; require CI and review. Branch protection was observed disabled on develop at the assessment SHA.
- [ ] CI must run lint, typecheck, unit tests, PostgreSQL migrations/integration tests, production build, critical E2E, dependency audit and container scan.
- [ ] Build once from immutable SHA; record image digest, SBOM, provenance and migration ID.
- [ ] Deployment workflow must target a named environment, use least privilege, require explicit production approval and support gradual rollout.
- [ ] Staging deployment and real-provider smoke tests pass.
- [ ] Product/client/stakeholder acceptance is recorded against the current acceptance document; a merged PR or preview review is not client signoff.
- [ ] Rollback and database recovery are rehearsed.

## 4. Inputs still required

Do not guess or commit secrets. Confirm:
- Hosting provider, production project/environment, hostname and DNS owner.
- PostgreSQL provider/region/connection mode/backup policy.
- Identity provider and approved production callback/logout URLs.
- Oscar API production base URL, credential owner, quotas and data-processing terms.
- Approved feed sources and credentials, if required.
- Object storage provider/bucket/policy, if required.
- Secret manager, secret owners, monitoring provider and alert destination.
- Deployment approver, incident owner and rollback operator.

## 5. Safe deployment sequence

1. Freeze a release candidate from a protected branch and record its exact SHA.
2. Run all required CI and security checks against that SHA.
3. Build one immutable image; record digest/SBOM/provenance. Promote the same artifact to staging and production.
4. Provision production resources with managed secrets and private networking. Never use local Compose defaults or demo-user scripts.
5. Verify database backup; rehearse migration against a production-like copy.
6. Deploy to staging; run migrations once via a controlled job, not on every web replica.
7. Run staging smoke tests for readiness/liveness, SSO, session create/transition, Oscar conversation, live feed, analytics attribution, authorization and logout.
8. Obtain explicit production approval. Deploy canary/rolling with health gates and automatic stop conditions.
9. Run read-only production smoke checks; verify logs, metrics, DB and integration status without destructive test data.
10. Monitor the agreed window; record SHA, image digest, migration, results, approver and incidents.

## 6. Rollback and recovery

- Stop rollout on failed readiness, elevated 5xx/latency, auth failures, DB saturation, data-integrity issues or integration failures beyond agreed tolerance.
- Roll application back to the previous immutable image only when schema remains backward-compatible.
- Never run `prisma migrate reset` or destructive down-migrations in production.
- For incompatible migrations, use a rehearsed forward-fix or point-in-time restore with explicit data-loss assessment and incident approval.
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
| Security | Rate limits, origin, payload limits and cookie flags pass | Test/scan report |
| Recovery | Image rollback and DB recovery demonstrated | Exercise record |

## 8. Relevant PR evidence and exclusions

- PR #45 merged to develop and passed its preview CI/E2E suite. It did not deploy to production or implement the missing live integrations.
- PR #41 remains unmerged until the PostgreSQL concurrency test is demonstrably executed in CI.
- PR #34 is not a deployment record or release candidate. Its checked boxes do not establish a provisioned target, deployed artifact, production smoke tests, external integration success or stakeholder acceptance.
- A Vercel preview marked READY is not a production deployment. No production release is authorized by this document.

**Release remains BLOCKED until every mandatory gate has verifiable evidence against the exact release SHA, required client acceptance is recorded, and the production environment inputs are confirmed.**
