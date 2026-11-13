# Connected demo integration notes

> **Status:** reference notes for a future connected walkthrough. These notes do not describe the current `/demo` page in `develop`. The current page is a browser-local product tour: it does not sign users in, create mentor sessions, call Oscar, synchronize opportunities, or emit production analytics.

## Intended connected-demo behaviour

A future connected walkthrough may exercise the same-origin application APIs:

1. Operator-provisioned local demo login using an HTTP-only session cookie.
2. Authenticated identity lookup.
3. Mentor-session creation, retrieval, and completion backed by PostgreSQL.
4. Application health check.

The walkthrough must not describe local demo authentication as shared notodoescodigo.com SSO, persisted mentor sessions as Oscar conversations, or preview feed content as live opportunities.

## Backend integration

The backend foundations were integrated into `develop` through PR #39. Before implementing or re-enabling a connected UI, verify the current route contracts in the repository rather than relying on this historical endpoint list:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/mentor-sessions`
- `POST /api/mentor-sessions`
- `PATCH /api/mentor-sessions/:sessionId`
- `GET /api/health`

Keep the UI and API on the same origin so the HttpOnly cookie is sent automatically.

## Environment and database

Configure secrets in the deployment platform, never in Git:

- `DATABASE_URL`: PostgreSQL connection string.
- `APP_BASE_URL`: canonical origin of the deployed app.
- `NODE_ENV=production` in production deployments.

Install dependencies and apply the repository's current Prisma migrations:

```sh
npm ci
npm run db:generate
npm run db:deploy
```

Provision a dedicated demo account from a secure operator shell. Use a unique username and a strong password (at least 12 characters); do not put the password in source control, logs, or a shared terminal transcript.

```sh
DEMO_USERNAME='your-demo-user' DEMO_PASSWORD='use-a-unique-secret-of-at-least-12-chars' npm run auth:create-demo-user
```

The seed script is intended for operator provisioning. Do not add default credentials or public registration for a demo.

## Integration boundaries

- Local demo authentication is not shared notodoescodigo.com SSO.
- Mentor-session records do not imply that chat messages are sent to Oscar.
- Keep Oscar disabled until the owner supplies and approves the API base URL, authentication method/header, request and response schema, prompt-key mapping, timeout/rate-limit expectations, and a test credential.
- Do not scrape the public site or invent jobs/products. Obtain an approved read-only source/API contract before enabling a live opportunity feed.
- Enable analytics only when actor identity is derived server-side and reporting access is role-scoped.

## Security and release checks

A passing build or test pipeline is not, by itself, a production security approval. Run a fresh dependency audit and review current security findings before exposing any connected demo publicly. Keep staging access-restricted and use non-production data.

Before inviting external demo users, verify:

- production origin configuration and secure cookies;
- login rate limiting;
- server-side analytics actor attribution and read authorization;
- mentor-session transition concurrency;
- clean PostgreSQL migrations and concurrent active-session tests;
- keyboard, mobile, and screen-reader walkthrough;
- no real user data in the demo database.

## Suggested acceptance sequence for a future connected walkthrough

Run only in isolated staging with a dedicated demo account and non-production data:

1. Open the connected walkthrough and confirm the health indicator reports API reachability.
2. Sign in with operator-provisioned demo credentials.
3. Confirm the identity panel identifies the local issuer and does not claim shared SSO.
4. Select a mentor profile and create a session.
5. Confirm the returned session ID and mentor are displayed.
6. Complete the session and confirm the UI returns to the session-creation state.
7. Sign out and confirm the authenticated identity is no longer displayed.
8. If showing `/agent`, identify it accurately as a local preview unless Oscar is actually connected.
9. If showing `/feed`, distinguish external links or preview categories from synchronized live articles, jobs, and products.

Record the staging URL, commit SHA, CI run, and failed acceptance steps in the handover. Never record demo passwords.
