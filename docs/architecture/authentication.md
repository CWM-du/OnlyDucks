# Authentication Architecture

## Required outcome
Users should access OnlyDucks through the agreed shared identity mechanism with notodoescodigo.com, without a second independent registration.

## To confirm
- Protocol and identity provider.
- Issuer, audience, client registration, and callback URLs.
- Required identity claims and stable external user identifier.
- Session storage, expiry, refresh, and logout behaviour.
- Local development and test strategy.

## Acceptance
Protected routes and APIs reject unauthenticated or unauthorized requests. Secrets remain server-side. Expired and invalid sessions are handled safely.
