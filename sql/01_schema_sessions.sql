-- OnlyDucks - Epic 15 Task 1: SQL Layer for Duck Sessions and Messages
-- Engine: PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: duck_sessions
CREATE TABLE IF NOT EXISTS duck_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    mentor_slug VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'REDIRECTED')),
    turn_count INT NOT NULL DEFAULT 1 CHECK (turn_count >= 1 AND turn_count <= 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ
);

-- Table: duck_messages
CREATE TABLE IF NOT EXISTS duck_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('USER', 'DUCK', 'SYSTEM')),
    content TEXT NOT NULL,
    turn_number INT NOT NULL CHECK (turn_number >= 1 AND turn_number <= 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_duck_messages_session
        FOREIGN KEY (session_id)
        REFERENCES duck_sessions(id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_duck_sessions_user_status ON duck_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_duck_messages_session_created ON duck_messages(session_id, created_at);

-- Partial Unique Index: Concurrency-safe enforcement of maximum one ACTIVE session per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session
    ON duck_sessions(user_id)
    WHERE status = 'ACTIVE';

