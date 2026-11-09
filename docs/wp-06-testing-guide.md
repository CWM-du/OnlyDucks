# WP-06 and Epic 15 Task 3 Testing Guide

This guide documents the attribution methodology, limitations, and privacy guarantees for WP-06 (Analytics and Attribution), followed by reproducible terminal instructions to verify the implementation.

---

## Part 1: Attribution Methodology, Limitations, and Privacy

### 1. Attribution Methodology

- **Event Linkage:** Telemetry correlates content impressions (`recommendation_displayed`) and link traversal (`outbound_click`) using immutable identifiers: `sessionId`, `contentId`, `userId`, and `destination`.
- **Source Preservation:** Metadata such as campaign source (`feed_card`, `recommendation_card`, `inline_mentor`) is normalized and preserved in the structured `properties` column.
- **Reporting Engine:** Pure PostgreSQL queries aggregate impression volumes, click volumes, and calculate Click-Through Rate (CTR%) grouped by content item and source.

### 2. Limitations

- **No Downstream Conversion Tracking:** Once a user navigates to an external destination (e.g., external article or sponsor site), third-party actions cannot be observed or attributed.
- **Client Disconnection:** If a client drops network connectivity before transmitting an outbound click event, the click cannot be recorded retroactively.
- **Session Attribution Boundary:** Events are scoped to active sessions; cross-device attribution without an authenticated user is intentionally not supported.

### 3. Privacy Guarantees (Anti-Leak by Design)

- **Zero LLM Prompt / Message Logging:** Prohibited keys (`prompt`, `message`, `query`) are recursively purged from analytics payloads prior to persistence.
- **Zero Credential / Token Logging:** Security-sensitive headers, tokens, passwords, cookies, and secret keys are stripped.
- **PII Scrubbing:** Raw email addresses and Bearer/JWT tokens found in strings are redacted to `[REDACTED_EMAIL]` and `[REDACTED_TOKEN]`.
- **Zero-Failure Boundary:** Analytics persistence is non-blocking. Under database downtime or constraint exceptions, tracking degrades silently (`{ recorded: false }`) without disrupting user workflows.

---

## Part 2: Step-by-Step Verification Runbook

### Section 0: Fresh Setup and Environment Preparation

Follow these steps when starting from a clean checkout or switching to branch `feature/11-analytics-and-attribution`:

```bash
# 1. Switch to branch
git checkout feature/11-analytics-and-attribution

# 2. Prepare environment configuration from example
cp .env.example .env
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Start local PostgreSQL in Docker
docker compose up -d db

# 5. Generate Prisma Client and push schema to database
npx prisma generate
npx prisma db push
```

---

### Section 1: Static Validation and Test Suite

Execute static analysis, typechecking, and the full automated test suite:

```bash
# Validate Prisma schema
npx prisma validate

# Type check TypeScript without emit
npm run typecheck

# Lint codebase
npm run lint

# Run all automated tests (including analytics, sanitizer, and HTTP endpoints)
npm test
```

Expected output:

- `npx prisma validate`: Schema is valid.
- `npm run typecheck`: Exits with code 0.
- `npm run lint`: Exits with code 0 (0 errors).
- `npm test`: All test files passed with 0 failures.

---

### Section 2: PostgreSQL Live Verification of `sql/03_analytics_reports.sql` in Docker

Apply `sql/03_analytics_reports.sql` and verify constraint enforcement and report queries:

```bash
# 1. Apply Epic 15 SQL layer (Tables: feed_items, analytics_events, and sample reporting queries)
docker compose exec -T db psql -U onlyducks -d onlyducks < sql/03_analytics_reports.sql

# 2. Verify tables and indexes in PostgreSQL
docker compose exec -T db psql -U onlyducks -d onlyducks -c "\d analytics_events"
docker compose exec -T db psql -U onlyducks -d onlyducks -c "\d feed_items"
```

#### Live Test of Analytical Queries:

```bash
docker compose exec -T db psql -U onlyducks -d onlyducks << 'EOF'
-- 1. Insert seed duck session
INSERT INTO duck_sessions (id, user_id, mentor_slug, status, turn_count)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'python-socratic', 'ACTIVE', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert message at turn 4
INSERT INTO duck_messages (id, session_id, sender_role, content, turn_number)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'USER', 'What about async generators in Python?', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert feed item
INSERT INTO feed_items (id, title, source, category, destination_url)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Python Async Deep Dive', 'notodoescodigo', 'python', 'https://notodoescodigo.com/python-async')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert recommendation displayed event
INSERT INTO analytics_events (id, event_type, user_id, session_id, content_id, properties)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'recommendation_displayed', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"source":"recommendation_card","category":"python"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert outbound click event
INSERT INTO analytics_events (id, event_type, user_id, session_id, content_id, destination, properties)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'outbound_click', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://notodoescodigo.com/python-async', '{"source":"recommendation_card","category":"python"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Execute Query 1: Retention Rate to Turn 4
WITH session_cohort AS (
    SELECT
        COUNT(DISTINCT s.id) AS total_sessions_started,
        COUNT(DISTINCT CASE WHEN s.turn_count >= 4 OR m.turn_number >= 4 THEN s.id END) AS sessions_reached_turn_4
    FROM duck_sessions s
    LEFT JOIN duck_messages m ON m.session_id = s.id AND m.turn_number >= 4
)
SELECT total_sessions_started, sessions_reached_turn_4,
       ROUND((sessions_reached_turn_4::numeric / NULLIF(total_sessions_started, 0)) * 100, 2) AS retention_rate_turn_4_pct
FROM session_cohort;

-- 7. Execute Query 2: Attribution CTR
SELECT
    COALESCE(fi.category, ae.properties->>'category', 'uncategorized') AS content_category,
    COALESCE(fi.source, ae.properties->>'source', 'direct') AS attribution_source,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'recommendation_displayed' THEN ae.id END) AS impressions_count,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'outbound_click' THEN ae.id END) AS clicks_count,
    ROUND((COUNT(DISTINCT CASE WHEN ae.event_type = 'outbound_click' THEN ae.id END)::numeric /
           NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'recommendation_displayed' THEN ae.id END), 0)) * 100, 2) AS click_through_rate_pct
FROM analytics_events ae
LEFT JOIN feed_items fi ON fi.id = ae.content_id
WHERE ae.event_type IN ('recommendation_displayed', 'outbound_click')
GROUP BY 1, 2;
EOF
```

Expected outputs:

- Query 1: Displays total sessions, sessions reached turn 4, and 100.00 retention rate.
- Query 2: Displays `python` category, `recommendation_card` source, 1 impression, 1 click, and 100.00 CTR%.

---

### Section 3: Manual HTTP API Verification with curl

Start the development server:

```bash
npm run dev
```

#### 1. Create local demo user (if not already created)

```bash
DEMO_USERNAME=testuser DEMO_PASSWORD=StrongPassword123! node scripts/create-demo-user.mjs
```

#### 2. Authenticate and obtain session cookie

```bash
curl -i -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"username":"testuser","password":"StrongPassword123!"}' \
  -c cookies.txt
```

Expected output: `HTTP/1.1 200 OK` with `set-cookie: onlyducks_session=...`.

#### 3. Ingest an outbound click event (POST 201 Created)

```bash
curl -i -s -X POST http://localhost:3000/api/analytics/events \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -b cookies.txt \
  -d '{
    "eventType": "outbound_click",
    "destination": "https://notodoescodigo.com/python-async",
    "source": "recommendation_card",
    "properties": {
      "category": "python",
      "position": 1,
      "prompt": "this should be automatically purged by sanitizer"
    }
  }'
```

Expected output: `HTTP/1.1 201 Created` with `{"recorded":true,"id":"..."}`.

#### 4. Query logged analytics events (GET 200 OK)

```bash
curl -i -s -X GET "http://localhost:3000/api/analytics/events?eventType=outbound_click&limit=5" \
  -b cookies.txt
```

Expected output: `HTTP/1.1 200 OK` with JSON array containing the sanitized event without the prompt property.

#### 5. Query attribution summary report (GET 200 OK)

```bash
curl -i -s -X GET "http://localhost:3000/api/analytics/events?mode=attribution" \
  -b cookies.txt
```

Expected output: `HTTP/1.1 200 OK` with `{"attribution":{"totalClicks":...,"totalImpressions":...,"items":[...]}}`.
