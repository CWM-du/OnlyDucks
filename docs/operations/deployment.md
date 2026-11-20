# Deployment

OnlyDucks is prepared as a separately runnable Next.js service for handover to Oscar. Oscar will deploy it within the existing notodoescodigo.com infrastructure and complete the server-side connection.

See [OnlyDucks handover for notodoescodigo.com](./notodoescodigo-handover.md) for the runtime contract, environment variables, host integration options, migration sequence, validation and known integration boundaries.

The repository's Docker Compose file is for local PostgreSQL development only. It must not be treated as the production topology.

No production server, DNS, reverse proxy, database, secret store or external integration is modified by this repository preparation.
