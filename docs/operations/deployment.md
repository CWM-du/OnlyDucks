# Deployment

## Pre-deployment checklist
- Confirm hosting provider and Node.js compatibility.
- Configure environment variables and secrets in the hosting platform.
- Provision PostgreSQL and verify network access.
- Confirm identity provider callback URLs.
- Confirm Oscar API access and limits.
- Confirm content source access.
- Run lint, typecheck, tests, and production build.
- Apply reviewed database migrations.
- Run smoke tests against the deployed environment.

## Security
Never commit production secrets or `.env` files. Use platform-managed secrets or an approved secret manager. Restrict access to production resources.

## Rollback
Document the selected platform's rollback procedure and database recovery approach before pilot launch.
