# Pilot handover notes (recovered from PR #34)

**Purpose:** retain useful operational context from PR #34 without treating its claims as evidence of a deployed pilot or production release.  
**Source:** PR #34, reviewed 2026-11-23.  
**Status:** planning notes only; not an acceptance record, runbook approval, or deployment record.

## Integration constraints to resolve

The PR #34 handover described the following intended integration boundaries. They must be re-confirmed with the relevant client owners before implementation or release:

- **Identity:** the repository's local authentication is not proof of a configured corporate identity provider. Confirm the IdP, protocol, callback/logout URLs, account mapping, credential owner and test environment.
- **Mentor / Oscar:** the Groq-compatible adapter is not evidence of connectivity to the client's Oscar API. Obtain the approved API contract, endpoint, credentials, quotas and data-processing terms; then run a real end-to-end mentor test.
- **Content:** curated or seeded recommendations are not a live client feed. Confirm approved sources, attribution, freshness, deduplication and failure behavior.
- **Analytics:** verify server-derived identity and authorization on analytics reads. Never trust a client-supplied user ID as authorization and never expose cross-user reports to ordinary users.
- **Pilot infrastructure:** record the actual target, deployment SHA/image digest, database provider, migration result, smoke-test output, monitoring and rollback evidence before describing a pilot as deployed.

## Demo safety

- Do not publish, reuse or commit demo usernames/passwords from PR #34. Any demo account must be created explicitly by an authorized operator using a unique secret delivered out of band.
- Demo-user provisioning must be opt-in and must not reset or overwrite an existing account.
- Local Compose defaults are for development only. Do not expose a local database port or reuse local credentials in a hosted environment.
- A successful local smoke test or CI run is not a production smoke test.

## Handover checklist template

Before a controlled pilot is accepted, record evidence for each item:

- [ ] Named environment and owner; verified deployment URL and immutable release SHA.
- [ ] Database provider/region, TLS/network policy, backup policy and successful restore drill.
- [ ] Migration job and result against the named environment.
- [ ] Identity-provider configuration and tested login/logout/expiry/revocation.
- [ ] Real Oscar-backed mentor conversation, with redacted evidence.
- [ ] Approved live content source and freshness/attribution checks.
- [ ] Analytics identity and cross-user authorization tests.
- [ ] Liveness/readiness, logs, metrics, alert routing and incident owner.
- [ ] Rollback procedure rehearsed, including database recovery constraints.
- [ ] Client/product acceptance recorded separately from code review.

## Operational ownership

Assign named, currently active individuals for application operations, identity, AI integration, content/analytics and QA. Reconfirm availability and escalation coverage before pilot start. Role labels or historic assignments in PR #34 are not current ownership.

## Explicit non-claims

This note does not assert that a pilot environment was provisioned, a release was deployed, external integrations were live, smoke tests passed, a release tag exists, or stakeholders accepted the product. Those claims require independently verifiable evidence attached to the actual environment and release SHA.
