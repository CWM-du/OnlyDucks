# Meeting Decisions Log

Record decisions that affect scope, architecture, interfaces, security, delivery, or budget.

## Entry template
- **Date:**
- **Decision owner:**
- **Context:**
- **Decision:**
- **Alternatives considered:**
- **Consequences:**
- **Follow-up issue:**

Do not record credentials, access tokens, or unnecessary personal data here.

---

## Decision Log Entries

### 2026-11-10 — Known Limitations and Controlled Demo Path for Pilot Delivery (Issue #24)
- **Date:** 2026-11-10
- **Decision owner:** Project Manager (PM)
- **Context:** The delivery deadline for the pilot is fixed for 2026-11-11. As of 2026-11-10, external client integrations remain pending: client SSO credentials and firewall configuration are unconfirmed, Oscar API production quotas and definitive endpoints are unreleased, and the client CMS dynamic content feed is not connected to the staging environment.
- **Decision:** Authorize pilot delivery (v0.1.0-pilot) with controlled fallbacks and documented limitations:
  1. Operate with the local scrypt identity provider (`local:<username>`) preserving the abstract `User` table contract.
  2. Operate AI mentor conversations via the Groq / Llama 3.3 server-side adapter.
  3. Operate recommendations using curated seeds and structured adapters pointing to `notodoescodigo.com`.
- **Alternatives considered:** Postponing pilot delivery until client integrations were ready (rejected: roadmap deadline is firm; stakeholders require demonstrating working end-to-end user journeys).
- **Consequences:** Pilot scope is protected; clean migration paths are established for post-pilot SSO and Oscar API onboarding; clear demonstration steps are supplied in `docs/operations/pilot-handover.md`.
- **Follow-up issue:** Issue #24, Issue #14 (WP-09).
