# Database Schema

The initial Prisma schema proposes:
- `User`
- `MentorProfile`
- `MentorSession`
- `ContentItem`
- `AnalyticsEvent`

Review this schema against confirmed identity claims, retention requirements, and integration contracts before production use.

## Critical rule
The one-active-session-per-user requirement must be enforced using a concurrency-safe database strategy. Application-level pre-checks alone are insufficient under concurrent requests.

Create reviewed migrations and test them against a disposable database before deployment.
