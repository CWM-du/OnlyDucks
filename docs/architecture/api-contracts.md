# API Contracts

## Initial scaffold routes
- `GET /api/health` — reports application status and integration configuration status.
- `POST /api/mentor-sessions` — validates a request shape but intentionally returns `501` until authentication, persistence, and concurrency-safe session creation are implemented.

## Contract requirements
- Use Zod for input validation.
- Define stable request and response shapes.
- Return appropriate HTTP status codes.
- Do not expose provider secrets or internal exception details.
- Document authentication and authorization requirements.
- Add integration tests before pilot use.
