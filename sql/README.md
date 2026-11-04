# SQL Layer Deliverables (Epic 15 - Task 1)

This directory contains standalone, pure PostgreSQL scripts defining the relational schema for Duck Mentors sessions and message tracking.

## Files

- `01_schema_sessions.sql`: Core DDL for `duck_sessions` and `duck_messages`.

## Constraints and Concurrency Rules

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
