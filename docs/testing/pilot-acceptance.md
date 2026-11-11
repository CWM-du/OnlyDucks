# Pilot Acceptance Checklist

## Authentication
- [x] Shared identity provider integration works (local MVP identity fallback per PM decision Issue #24).
- [x] Unauthenticated requests are rejected.
- [x] Expired and invalid sessions are handled.
- [x] User sessions remain isolated.

## Mentors
- [x] Three approved mentor profiles are available.
- [x] Oscar API requests and responses work (Groq/OpenAI-compatible adapter per PM decision Issue #24).
- [x] Provider failures are handled safely.
- [x] One active session per user is enforced under concurrent requests.
- [x] A concrete next step is generated.

## Content and attribution
- [x] Articles, jobs, and products load from approved real sources.
- [x] Outbound links point to the expected destinations.
- [x] Relevant analytics events can be inspected.
- [x] Clicks are not misrepresented as completed downstream conversions.

## Quality and operations
- [x] Lint, typecheck, tests, and production build pass.
- [x] Critical end-to-end journey passes.
- [x] No unresolved critical/high-severity release blockers.
- [x] Secrets are configured outside the repository.
- [x] Deployment and recovery instructions are documented.
- [x] Known limitations are recorded.
- [ ] Stakeholder acceptance is recorded.
