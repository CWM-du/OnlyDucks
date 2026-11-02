# OnlyDucks — Project Guide

**Delivery target:** 11 November 2026  
**Status:** MVP pilot scaffold

## 1. Purpose
This document defines collaboration, Git, code quality, documentation, security, and delivery rules.

## 2. MVP scope
- Shared identity integration with notodoescodigo.com.
- Three configurable AI mentor profiles through Oscar API.
- One active mentor session per user.
- Feed for articles, job offers, and products.
- Measurable outbound links and analytics events.
- Secure deployment and documented pilot operations.

Public portfolios, CV generation, weekly challenges, user publications, video avatars, real-time animated calls, hardware marketplace features, and complex gamification are out of scope unless formally approved.

## 3. Roles
- **Project Manager:** delivery plan, priorities, milestones, risks, scope, stakeholder acceptance.
- **TL1 — Architecture, Backend and Data:** architecture, database, APIs, CI/deployment coordination.
- **TL2 — Authentication and Security:** identity integration, access control, secrets and session security.
- **TL3 — AI Mentors and UX:** Oscar integration, mentor configurations, conversation UX.
- **TL4 — Feed, Analytics and QA:** content feed, attribution, testing and acceptance evidence.
- **Developers:** implement assigned issues, tests and documentation.

Each issue must have one accountable owner.

## 4. Communication and behaviour
- Communicate professionally and respectfully.
- Discuss technical decisions using evidence and documented trade-offs.
- Report blockers, defects, delays, and security concerns immediately.
- Record decisions affecting architecture, interfaces, security, scope, or delivery.
- Use GitHub Issues and Pull Requests as the technical record.

## 5. Repository and branches
Repository: `onlyducks`  
Default branch: `main`  
Integration branch: `develop`

Branch format: `<type>/<issue-number>-<short-description>`

Allowed types: `feature/`, `fix/`, `test/`, `docs/`, `refactor/`, `chore/`.

Examples:
- `feature/12-shared-sso`
- `fix/31-concurrent-session-lock`
- `test/36-pilot-user-journey`
- `docs/41-local-setup-guide`

Workflow:
1. Select an approved GitHub issue.
2. Update local `develop`.
3. Create a task branch from `develop`.
4. Implement only the issue scope.
5. Run relevant checks and tests.
6. Open a Pull Request against `develop`.
7. Obtain review and passing CI checks.
8. Merge through the approved process and close the issue.

Do not commit directly to `main` or `develop`. Do not force-push shared branches.

## 6. Pull Requests
Every PR must explain the change, link the issue, list tests, identify configuration or migration changes, and document known limitations. UI changes should include screenshots where useful.

Required:
- CI checks pass.
- At least one approval from another contributor.
- Team-lead approval for critical architecture, security, database, or shared-contract changes.
- Required review comments resolved.
- No unrelated changes.

Authors must not approve their own PRs.

## 7. Commit messages
Use Conventional Commits:

`<type>(<scope>): <imperative description>`

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`, `perf`, `style`.

Examples:
- `feat(auth): integrate shared identity provider`
- `feat(mentors): add mentor selection flow`
- `fix(sessions): prevent duplicate active sessions`
- `test(api): cover invalid mentor requests`
- `docs(project): define pilot acceptance criteria`

Write concise, specific subjects in English. Never include secrets or personal data.

## 8. Naming conventions
- React components: PascalCase, e.g. `MentorSessionPanel`.
- Types/interfaces: PascalCase, e.g. `MentorProfile`.
- Functions and local variables: camelCase, e.g. `createMentorSession`.
- Module-level constants: UPPER_SNAKE_CASE where appropriate.
- Environment variables: UPPER_SNAKE_CASE.
- API paths: lowercase path segments.
- Utility files: kebab-case.
- Component files: PascalCase where appropriate.
- Boolean names should communicate meaning, e.g. `isAuthenticated`.

Use descriptive names. Avoid unexplained abbreviations and ambiguous identifiers. Do not rename external API or database fields without checking compatibility.

## 9. Coding standards
- Use TypeScript; avoid `any` except for documented exceptions.
- Validate external inputs at boundaries with Zod.
- Keep provider credentials and calls server-side.
- Centralize error handling and logging.
- Avoid unnecessary dependencies and duplicate business logic.
- Add tests for new business rules and bug fixes.

## 10. Security
- Never commit real `.env` files, credentials, tokens, private keys, production database exports, or real user data.
- Commit `.env.example` with safe placeholders only.
- Enforce authorization server-side.
- Use reviewed, versioned database migrations.
- Do not make undocumented manual changes to shared databases.

## 11. Documentation
Write documentation in English. Update docs when architecture, APIs, database models, environment variables, integrations, security, deployment, testing, risks, or acceptance criteria change.

Use the root directory or the appropriate `docs/` subdirectory. Submit documentation changes through branches and Pull Requests.

## 12. Issue lifecycle
Statuses: `Backlog`, `Ready`, `In Progress`, `In Review`, `Blocked`, `Done`.  
Priorities: `P0` mandatory for pilot, `P1` important, `P2` deferred unless approved, `P3` future improvement.

Blocked issues must state the dependency, responsible party, and next action.

## 13. Definition of Done
1. Acceptance criteria are met.
2. Relevant implementation and tests are committed.
3. Required checks pass.
4. Another contributor reviewed the change.
5. Required team-lead approval is obtained.
6. Documentation is updated.
7. No secrets or confidential data were committed.
8. PR is merged through the approved process.
9. Integration effects and limitations are documented.

## 14. Pilot release
Target: 11 November 2026.

Release requires a successful production build, verified deployment, working critical integrations, passing smoke tests, no unresolved critical/high-severity release blockers, deployment documentation, release notes, known limitations, and stakeholder acceptance.

Do not describe mocked integrations or simulated data as production-ready functionality.

## 15. Final rule
When requirements conflict, prioritize security, data integrity, approved MVP scope, and documented decisions. Ask the responsible lead when requirements are unclear.
