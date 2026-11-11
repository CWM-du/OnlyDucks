# OnlyDucks connected demo runbook

## What this demo proves

The guided demo at `/demo` exercises the existing same-origin application APIs:

1. Local demo login and an HTTP-only session cookie.
2. Authenticated identity lookup.
3. Mentor session creation, retrieval, and completion backed by PostgreSQL.
4. A health endpoint for the running application.

The walkthrough intentionally does not claim that shared SSO, Oscar AI messages, the opportunity feed, or production analytics are live.

## Required code integration

The UI in PR #29 calls APIs introduced by the backend recovery work in PR #23:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/mentor-sessions`
- `POST /api/mentor-sessions`
- `PATCH /api/mentor-sessions/:sessionId`
- `GET /api/health`

Merge/integrate the relevant API implementation before expecting the guided demo to work. Keep the UI and API on the same origin so the HttpOnly cookie is sent automatically.

## Environment and database

Configure secrets in the deployment platform, never in Git:

- `DATABASE_URL`: PostgreSQL connection string.
- `APP_BASE_URL`: canonical origin of the deployed app (required for reliable production origin validation).
- `NODE_ENV=production` in production deployments.

Then install and deploy the Prisma migrations:

```sh
npm ci
npm run db:generate
npm run db:deploy
```

Provision a dedicated demo account from a secure operator shell. Use a unique username and a strong password (at least 12 characters); do not put the password in source control, logs, or a shared terminal transcript.

```sh
DEMO_USERNAME='your-demo-user' DEMO_PASSWORD='use-a-unique-secret-of-at-least-12-chars' npm run auth:create-demo-user
```

The seed script refuses to overwrite an existing account. There are no default credentials and no public registration flow.

## Demo boundaries

- The current identity provider is local demo authentication, not the shared notodoescodigo.com SSO.
- Mentor session records are persisted, but no chat messages are sent to Oscar yet.
- Oscar integration remains disabled until the owner supplies the API base URL, authentication method/header, request and response schema, prompt-key mapping, timeout/rate-limit expectations, and a test credential.
- The notodoescodigo.com public site has a visible blog, but no supported content API/feed contract has been confirmed for OnlyDucks. Do not scrape the site or invent jobs/products. Obtain an approved read-only source for articles, jobs, and products before enabling the live feed.
- Analytics should remain disabled until actor identity is derived server-side and reporting access is role-scoped.

## Security and deployment gate

The npm audit report currently contains 14 findings (8 moderate, 4 high, 2 critical). A passing build/test pipeline does not clear these advisories. Keep this as an isolated, access-restricted staging demo; do not expose it as a public production service until the Next.js/PostCSS, Prisma, and Vitest dependency remediation is completed and a fresh audit is clean or each residual risk has an explicit PM exception and mitigation.

Before inviting external demo users, verify:

- production origin configuration and secure cookies;
- rate limiting on login;
- analytics actor attribution and read authorization;
- session transition concurrency;
- clean PostgreSQL migrations and concurrent active-session tests;
- keyboard, mobile, and screen-reader walkthrough;
- no real user data in the demo database.

## External deployment connections

Vercel hosting and managed PostgreSQL can be connected to automate preview deployments and database provisioning. Those provider connections have not been made from this repository; connect the selected accounts and configure the secrets before requesting a deployment. Do not commit credentials or ask a public preview deployment to use production data.

## Guided demo acceptance sequence

Run this only in an isolated staging environment with a dedicated demo account and non-production data:

1. Open `/demo`; the application health indicator should report that the API is reachable.
2. Sign in with the operator-provisioned demo credentials.
3. Confirm that the identity panel shows the local issuer and does not describe it as shared SSO.
4. Select one mentor profile and create a session.
5. Confirm that the returned session ID and mentor are displayed.
6. Complete the session and confirm the UI returns to the session-creation state.
7. Sign out and confirm that the authenticated identity is no longer displayed.
8. Open `/agent` and demonstrate blueprint creation/refinement; explicitly identify it as deterministic local preview, not live AI.
9. Open `/feed` and follow the external public blog link. Do not imply that articles, jobs, or products are synchronized into OnlyDucks.

Record the staging URL, commit SHA, test account provisioning date, CI run, and any failed steps in the demo handover. Never record the demo password.
