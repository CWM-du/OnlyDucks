# Local MVP authentication (provisional)

Decision from TL1: implement a local login for the MVP; later replace the provider with the verified notodoescodigo.com SSO integration. **No public registration**: create accounts only via a controlled CLI. This is not the final shared identity solution.

## Database and setup

1. Configure `DATABASE_URL` in `.env` / `.env.local`; ensure PostgreSQL is running.
2. Run `npm install`, `npm run db:generate`, `npm run db:migrate` (or `npm run db:deploy` for deployed environments).
3. In PowerShell set `$env:DEMO_USERNAME='demo'; $env:DEMO_PASSWORD='<unique strong password>'`; run `npm run auth:create-demo-user`. Remove the shell variables afterwards. Never commit credentials or seed a known password.
4. POST JSON `{"username":"demo","password":"..."}` to `/api/auth/login`; the server sets an HttpOnly cookie. GET `/api/auth/me` with the cookie. POST `/api/auth/logout` with the cookie and an `Origin` header matching the application host.

## Security model

- Passwords use salted scrypt; passwords are not returned to clients.
- 32-byte random session tokens are stored only as SHA-256 hashes in PostgreSQL; cookies are HttpOnly, SameSite=Lax, and Secure in production.
- Session lifetime: eight hours, checked on every authenticated request; logout revokes the database session.
- Five failed attempts lock an existing account for 15 minutes. This is **not** a replacement for IP-aware rate limiting.
- No user identity is accepted from untrusted headers, bearer payloads, or unsigned JWTs.
- Local users have `externalUserId=local:<username>`; the `User.id` primary key stays stable for mentor relations. Future SSO account linking must be explicitly designed to avoid account takeover or duplicate users.
- Login and session validation are Node.js server-only. Production deployment must use HTTPS and configure trusted reverse-proxy host/origin behavior.

## Outstanding blockers before public pilot

- TL1 review of Prisma migration and `User` identity contract.
- IP-aware distributed rate limiting and abuse monitoring; CSRF/origin policy for all state-changing cookie-authenticated endpoints.
- Account provisioning/rotation, session cleanup, password reset or admin account recovery policy.
- Real SSO contract, token/issuer/audience validation, callbacks, logout semantics and account linking.
- Mentor session POST still returns 501 after authentication: domain implementation belongs to mentors/backend.
- Full DB-backed integration and browser E2E tests require a running PostgreSQL environment.
- npm audit dependency findings need triage by the team.

Do not mark #2/#7 as fully complete until the agreed acceptance criteria and remaining security controls are verified.
