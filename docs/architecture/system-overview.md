# System Overview

## Proposed architecture
OnlyDucks is a modular monolith built with Next.js App Router, React, TypeScript, PostgreSQL, and a single server-side Oscar API integration.

## Proposed modules
- Auth: shared identity integration.
- Mentors: mentor configuration and session lifecycle.
- Content: articles, job offers, and products.
- Recommendations: actionable next steps and resource links.
- Analytics: mentor, recommendation, and referral events.

## External dependencies to confirm
- notodoescodigo.com SSO/identity provider.
- Oscar API contract, credentials, and usage limits.
- Content API or controlled feed.
- Hosting, database, and optional object storage provider.

## Important
This document describes the intended direction. It does not claim that external integrations are configured.
