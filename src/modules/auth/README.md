# Authentication module

The identity provider and protocol must be confirmed during the integration audit.

Before pilot use:
- Implement the agreed SSO flow.
- Validate issuer, audience, signature, expiry, and relevant identity claims.
- Enforce authorization on server routes.
- Define logout and session expiry behaviour.
- Add tests for failed, expired, and unauthorized sessions.
- Do not use a local mock as evidence that shared authentication works.
