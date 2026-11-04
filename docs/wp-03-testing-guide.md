# WP-03 and Epic 15 Testing Guide

This guide provides reproducible, copy-paste terminal instructions to verify the database schema, Prisma migrations, SQL constraints, domain services, and HTTP endpoints implemented for Issue #8 (WP-03) and Epic #15 (Task 1).

---

## Section 0: Fresh Setup and Environment Preparation

Follow these steps when starting from a clean checkout or switching to branch `feature/8-database-api-contracts-session-rules`:

```bash
# 1. Switch to branch
git checkout feature/8-database-api-contracts-session-rules

# 2. Prepare environment configuration from example
cp .env.example .env
cp .env.example .env.local

# 3. Install and rebuild dependencies
npm install
npm rebuild esbuild @prisma/client prisma @prisma/engines

# 4. Start local PostgreSQL in Docker
docker compose up -d db

# 5. Generate Prisma Client and push schema to database
npx prisma generate
npx prisma db push

# 6. Apply the partial unique index for single active session enforcement
docker compose exec -T db psql -U onlyducks -d onlyducks -c 'CREATE UNIQUE INDEX IF NOT EXISTS "idx_mentor_sessions_user_active" ON "MentorSession"("userId") WHERE "status" = '\''ACTIVE'\'';'
```

---

## Section 1: Static Validation and Test Suite

Execute the static analysis and automated test suite:

```bash
# Validate Prisma schema
npx prisma validate

# Type check TypeScript without emit
npm run typecheck

# Lint codebase
npm run lint

# Run all automated tests (43 unit and integration tests)
npm test
```

Expected output:

- `npx prisma validate`: Schema is valid.
- `npm run typecheck`: Exits with code 0.
- `npm run lint`: Exits with code 0 (0 errors).
- `npm test`: 7 test files passed, 43 tests passed.

---

## Section 2: PostgreSQL Verification of Prisma Tables and Partial Index

Verify that Prisma tables and the partial unique index exist in PostgreSQL:

```bash
# Check relations in PostgreSQL
docker compose exec -T db psql -U onlyducks -d onlyducks -c "\dt"

# Verify table structure and indexes of MentorSession
docker compose exec -T db psql -U onlyducks -d onlyducks -c "\d \"MentorSession\""
```

Expected index in output:

```text
"idx_mentor_sessions_user_active" UNIQUE, btree ("userId") WHERE status = 'ACTIVE'::"MentorSessionStatus"
```

---

## Section 3: Epic 15 SQL Layer Verification (Standalone PostgreSQL)

Apply the DDL script `sql/01_schema_sessions.sql` and verify constraint enforcement:

```bash
# Apply Epic 15 SQL layer
docker compose exec -T db psql -U onlyducks -d onlyducks < sql/01_schema_sessions.sql

# Inspect duck_sessions table constraints and indexes
docker compose exec -T db psql -U onlyducks -d onlyducks -c "\d duck_sessions"
```

### Live Test of SQL Constraints:

```bash
# Run validation script against duck_sessions
docker compose exec -T db psql -U onlyducks -d onlyducks << 'EOF'
-- 1. First active session insert succeeds
INSERT INTO duck_sessions (id, user_id, mentor_slug, status, turn_count)
VALUES ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'python-socratic', 'ACTIVE', 1);

-- 2. Second active session insert for same user_id fails with unique violation
INSERT INTO duck_sessions (id, user_id, mentor_slug, status, turn_count)
VALUES ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'interview-prep', 'ACTIVE', 1);

-- 3. Turn count > 4 fails with check constraint violation
INSERT INTO duck_sessions (id, user_id, mentor_slug, status, turn_count)
VALUES ('00000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'python-socratic', 'ACTIVE', 5);

-- Cleanup test records
DELETE FROM duck_sessions WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);
EOF
```

Expected outputs:

- Statement 1: `INSERT 0 1`
- Statement 2: `ERROR: duplicate key value violates unique constraint "idx_unique_active_session"`
- Statement 3: `ERROR: new row for relation "duck_sessions" violates check constraint "duck_sessions_turn_count_check"`

---

## Section 4: Manual HTTP API Verification with curl

Start the development server:

```bash
npm run dev
```

### 1. Create a local demo user

```bash
DEMO_USERNAME=testuser DEMO_PASSWORD=StrongPassword123! node scripts/create-demo-user.mjs
```

### 2. Authenticate and obtain session cookie

```bash
curl -i -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"username":"testuser","password":"StrongPassword123!"}' \
  -c cookies.txt
```

Expected output: `HTTP/1.1 200 OK` with `set-cookie: onlyducks_session=...`

### 3. Create active mentor session (POST 201 Created)

```bash
curl -i -s -X POST http://localhost:3000/api/mentor-sessions \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt \
  -d '{"mentorSlug":"python-socratic"}'
```

Expected output: `HTTP/1.1 201 Created` with created session JSON containing `"status":"ACTIVE"`. Save the returned `"id"` (e.g. `SESSION_ID`).

### 4. Attempt creating a second active session (POST 409 Conflict)

```bash
curl -i -s -X POST http://localhost:3000/api/mentor-sessions \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt \
  -d '{"mentorSlug":"interview-prep"}'
```

Expected output:

```json
HTTP/1.1 409 Conflict
{"error":"User already has an active mentor session."}
```

### 5. Query currently active session (GET 200 OK)

```bash
curl -i -s -X GET http://localhost:3000/api/mentor-sessions \
  -b cookies.txt
```

Expected output: `HTTP/1.1 200 OK` with `{"activeSession": {"id": "SESSION_ID", "status": "ACTIVE", ...}}`.

### 6. Transition session to completed (PATCH 200 OK)

Replace `SESSION_ID` with the actual session ID from step 3:

```bash
curl -i -s -X PATCH http://localhost:3000/api/mentor-sessions/SESSION_ID \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt \
  -d '{"status":"COMPLETED"}'
```

Expected output: `HTTP/1.1 200 OK` with `"status":"COMPLETED"` and `"endedAt"` populated.

### 7. Confirm no active session remains (GET 200 OK with null)

```bash
curl -i -s -X GET http://localhost:3000/api/mentor-sessions \
  -b cookies.txt
```

Expected output:

```json
HTTP/1.1 200 OK
{"activeSession":null}
```
