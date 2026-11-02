# Pilot Acceptance Checklist

## Authentication
- [ ] Shared identity provider integration works.
- [ ] Unauthenticated requests are rejected.
- [ ] Expired and invalid sessions are handled.
- [ ] User sessions remain isolated.

## Mentors
- [ ] Three approved mentor profiles are available.
- [ ] Oscar API requests and responses work.
- [ ] Provider failures are handled safely.
- [ ] One active session per user is enforced under concurrent requests.
- [ ] A concrete next step is generated.

## Content and attribution
- [ ] Articles, jobs, and products load from approved real sources.
- [ ] Outbound links point to the expected destinations.
- [ ] Relevant analytics events can be inspected.
- [ ] Clicks are not misrepresented as completed downstream conversions.

## Quality and operations
- [ ] Lint, typecheck, tests, and production build pass.
- [ ] Critical end-to-end journey passes.
- [ ] No unresolved critical/high-severity release blockers.
- [ ] Secrets are configured outside the repository.
- [ ] Deployment and recovery instructions are documented.
- [ ] Known limitations are recorded.
- [ ] Stakeholder acceptance is recorded.
