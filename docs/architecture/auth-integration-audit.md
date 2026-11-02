# WP-02 / TL2 — Authentication integration audit (develop baseline)

## Implemented in this change

- A typed `IdentityProvider` boundary and authenticated identity contract.
- A **fail-closed** default provider: without verified SSO integration, requests are anonymous.
- A server-side `requireAuthentication` helper that returns 401, never trusting user-controlled identity headers.
- Authentication check before parsing or handling `POST /api/mentor-sessions`.
- Unit tests for absent identity, forged headers, provider failures, malformed claims and a verified provider stub.

**This is not a working SSO login.** The test provider is injected in unit tests only; it is not exposed as a runtime login method.

## Blocking decisions required from notodoescodigo.com

1. Confirm the actual SSO protocol, identity provider and discovery/metadata endpoints.
2. Provide sandbox/test client registration, allowed callback URLs and logout URLs.
3. Specify stable subject claim and mapping to `User.externalUserId`; confirm whether provider IDs are UUIDs or strings.
4. Confirm issuer, audience, signing algorithms, key rotation, token lifetimes, clock skew and refresh/revocation behaviour.
5. Specify browser session mechanism, cookie domain/path, SameSite, Secure and HttpOnly policies, CSRF protection and logout semantics.
6. Confirm which endpoints/pages are public and which require authorization, and whether role/entitlement claims exist.
7. Supply test accounts and documented login, expiry, logout and failure scenarios.

## Integration acceptance (not yet satisfied)

- Replace `UnconfiguredIdentityProvider` with a provider implementation that verifies issuer, audience, signature, expiry and stable subject using the **confirmed** protocol.
- Implement safe callback, state/nonce/PKCE as applicable, session renewal and logout; avoid logging tokens.
- Validate server-side API access; do not rely only on middleware or client redirects.
- Add integration/E2E tests against an authorized test identity environment.
- Agree with TL1 how verified external identity is mapped to the local Prisma `User` record. Do not change Prisma IDs or session schema unilaterally.
- Agree with TL3 which mentor routes and operations require the authenticated user. Mentor session creation is still HTTP 501 after successful authentication because WP-04/WP-03 own persistence and session rules.

## Ownership and scope

TL2 owns the auth boundary and security integration. This change intentionally leaves mentor business logic, UI, database schema, Oscar API and content feed untouched. Public landing/feed/mentor listing pages are not restricted without an agreed route policy; any protected operations must enforce authorization on the server.
