# SQL Layer Deliverables (Epic 15 - Tasks 1 & 3)

This directory contains standalone, pure PostgreSQL scripts defining the relational schema, constraints, and analytical reports for OnlyDucks Duck Mentors and Analytics Attribution.

## Files

- `01_schema_sessions.sql`: Core DDL for `duck_sessions` and `duck_messages` (Epic 15 Task 1).
- `03_analytics_reports.sql`: Core DDL for `feed_items`, `analytics_events`, performance indexes, and 3 analytical queries (Epic 15 Task 3).

---

## Part 1: Duck Sessions Schema and Concurrency Rules (`01_schema_sessions.sql`)

1. **Turn Count Constraint:**
   - Column `turn_count` enforces `CHECK (turn_count >= 1 AND turn_count <= 4)`.
   - Message turns are bounded to the allowed conversation limit.

2. **Session Status Constraint:**
   - Column `status` allows only `'ACTIVE'`, `'CLOSED'`, or `'REDIRECTED'`.

3. **Concurrency-Safe Single Active Session Rule:**
   - Enforced at engine level using PostgreSQL partial unique index:
     ```sql
     CREATE UNIQUE INDEX idx_unique_active_session
         ON duck_sessions(user_id)
         WHERE status = 'ACTIVE';
     ```
   - Concurrent insert attempts for the same user while an active session exists are rejected by the database with error code 23505 (unique_violation).

4. **Referential Integrity:**
   - Table `duck_messages` references `duck_sessions(id)` with `ON DELETE CASCADE`.

---

## Part 2: Analytics and Attribution Schema (`03_analytics_reports.sql`)

### Tables

1. **`feed_items`**:
   - Represents curated articles, tutorials, and jobs.
   - Columns: `id UUID`, `title VARCHAR(255)`, `source VARCHAR(100)`, `category VARCHAR(100)`, `destination_url TEXT`, `published_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ`.

2. **`analytics_events`**:
   - Stores telemetry and attribution events (`mentor_session_started`, `mentor_session_completed`, `mentor_session_failed`, `recommendation_displayed`, `outbound_click`).
   - Columns: `id UUID`, `event_type VARCHAR(50)`, `user_id UUID`, `session_id UUID`, `content_id UUID`, `destination TEXT`, `properties JSONB`, `occurred_at TIMESTAMPTZ`.
   - Foreign key `fk_analytics_events_session` references `duck_sessions(id)` with `ON DELETE CASCADE`.
   - Foreign key `fk_analytics_events_feed_item` references `feed_items(id)` with `ON DELETE SET NULL`.

### Index Strategy

- `idx_analytics_events_type_occurred (event_type, occurred_at)`: Optimizes high-throughput filtering by event type and time window.
- `idx_analytics_events_session_id (session_id)`: Enables sub-millisecond timeline reconstruction for specific sessions.
- `idx_analytics_events_user_id (user_id)`: Accelerates per-user telemetry audits and compliance lookups.
- `idx_analytics_events_content_id (content_id)`: Accelerates attribution joins against recommendations and feed content.
- `idx_analytics_events_properties_gin USING gin (properties)`: Accelerates JSONB deep queries on metadata keys (e.g., `properties->>'source'`).

---

## Part 3: Analytical Reporting Queries (Epic 15 Task 3)

### Query 1: Tasa de Retención al Turno 4

- **Objective:** Measure conversation depth and user retention by comparing sessions that reached turn 4 against total initiated sessions.
- **Engine Logic:** CTE aggregates distinct session identifiers where `turn_count >= 4` or where at least one message with `turn_number >= 4` was recorded.

### Query 2: Atribución de Clics por Categoría y Fuente

- **Objective:** Measure effectiveness of content recommendations by computing the Click-Through Rate (CTR%) grouped by content category and distribution source.
- **Engine Logic:** Joins `analytics_events` with `feed_items`, falling back to JSONB properties when direct relational references are absent. Aggregates distinct impression events and outbound click events.

### Query 3: Auditoría Cronológica Completa por session_id

- **Objective:** Observability and debugging timeline that reconstructs all actions within a session in exact chronological sequence.
- **Engine Logic:** Uses a `UNION ALL` across session lifecycle changes, message exchanges, and analytics telemetry, calculating `elapsed_seconds_from_start` relative to initial session creation.
