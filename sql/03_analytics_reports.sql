-- OnlyDucks - Epic 15 Task 3: SQL Layer for Analytics and Attribution Reports
-- Engine: PostgreSQL 14+
-- Prerequisites: Pure PostgreSQL DDL with idempotent tables and analytical reporting queries.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure duck_sessions exists (idempotent reference from 01_schema_sessions.sql)
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

-- Ensure duck_messages exists (idempotent reference from 01_schema_sessions.sql)
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

-- Table: feed_items (Curated content and external resources for attribution)
CREATE TABLE IF NOT EXISTS feed_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    destination_url TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: analytics_events (Idempotent event store for session lifecycle, recommendations, and outbound clicks)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    session_id UUID,
    content_id UUID,
    destination TEXT,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analytics_events_session
        FOREIGN KEY (session_id)
        REFERENCES duck_sessions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_analytics_events_feed_item
        FOREIGN KEY (content_id)
        REFERENCES feed_items(id)
        ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_occurred
    ON analytics_events (event_type, occurred_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
    ON analytics_events (session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
    ON analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_content_id
    ON analytics_events (content_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_properties_gin
    ON analytics_events USING gin (properties);


-- ============================================================================
-- QUERY 1: Tasa de Retención al Turno 4 (Epic 15 Task 3)
-- Proporción de sesiones de mentoría iniciadas que alcanzaron el turno 4.
-- ============================================================================
WITH session_cohort AS (
    SELECT
        COUNT(DISTINCT s.id) AS total_sessions_started,
        COUNT(DISTINCT CASE WHEN s.turn_count >= 4 OR m.turn_number >= 4 THEN s.id END) AS sessions_reached_turn_4
    FROM duck_sessions s
    LEFT JOIN duck_messages m
        ON m.session_id = s.id AND m.turn_number >= 4
)
SELECT
    total_sessions_started,
    sessions_reached_turn_4,
    COALESCE(
        ROUND(
            (sessions_reached_turn_4::numeric / NULLIF(total_sessions_started, 0)) * 100,
            2
        ),
        0.00
    ) AS retention_rate_turn_4_pct
FROM session_cohort;


-- ============================================================================
-- QUERY 2: Atribución de Clics por Categoría y Fuente (Epic 15 Task 3)
-- Agregación de impresiones vs clics salientes (CTR%) por categoría y origen.
-- ============================================================================
SELECT
    COALESCE(fi.category, ae.properties->>'category', 'uncategorized') AS content_category,
    COALESCE(fi.source, ae.properties->>'source', 'direct') AS attribution_source,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'recommendation_displayed' THEN ae.id END) AS impressions_count,
    COUNT(DISTINCT CASE WHEN ae.event_type = 'outbound_click' THEN ae.id END) AS clicks_count,
    COALESCE(
        ROUND(
            (COUNT(DISTINCT CASE WHEN ae.event_type = 'outbound_click' THEN ae.id END)::numeric /
             NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'recommendation_displayed' THEN ae.id END), 0)) * 100,
            2
        ),
        0.00
    ) AS click_through_rate_pct
FROM analytics_events ae
LEFT JOIN feed_items fi
    ON fi.id = ae.content_id
WHERE ae.event_type IN ('recommendation_displayed', 'outbound_click')
GROUP BY
    COALESCE(fi.category, ae.properties->>'category', 'uncategorized'),
    COALESCE(fi.source, ae.properties->>'source', 'direct')
ORDER BY
    clicks_count DESC,
    impressions_count DESC;


-- ============================================================================
-- QUERY 3: Auditoría Cronológica Completa por session_id (Epic 15 Task 3)
-- Reconstrucción temporal de eventos de ciclo de vida, mensajes y analíticas.
-- ============================================================================
WITH session_anchor AS (
    SELECT
        s.id AS session_id,
        s.created_at AS session_started_at
    FROM duck_sessions s
),
event_timeline AS (
    -- 1. Session start lifecycle
    SELECT
        s.id AS session_id,
        s.created_at AS occurred_at,
        'SESSION_LIFECYCLE' AS event_stream,
        'SESSION_STARTED' AS event_name,
        jsonb_build_object(
            'mentor_slug', s.mentor_slug,
            'initial_status', s.status
        ) AS metadata_payload,
        NULL::text AS destination_url
    FROM duck_sessions s

    UNION ALL

    -- 2. Message turns in conversation
    SELECT
        m.session_id,
        m.created_at AS occurred_at,
        'CHAT_MESSAGE' AS event_stream,
        CONCAT('MESSAGE_TURN_', m.turn_number) AS event_name,
        jsonb_build_object(
            'sender_role', m.sender_role,
            'turn_number', m.turn_number,
            'content_preview', LEFT(m.content, 40)
        ) AS metadata_payload,
        NULL::text AS destination_url
    FROM duck_messages m

    UNION ALL

    -- 3. Analytics events logged during session
    SELECT
        ae.session_id,
        ae.occurred_at,
        'ANALYTICS_EVENT' AS event_stream,
        ae.event_type AS event_name,
        ae.properties AS metadata_payload,
        ae.destination AS destination_url
    FROM analytics_events ae
    WHERE ae.session_id IS NOT NULL
)
SELECT
    et.session_id,
    et.occurred_at,
    COALESCE(
        ROUND(EXTRACT(EPOCH FROM (et.occurred_at - sa.session_started_at))::numeric, 2),
        0.00
    ) AS elapsed_seconds_from_start,
    et.event_stream,
    et.event_name,
    et.metadata_payload,
    et.destination_url
FROM event_timeline et
JOIN session_anchor sa
    ON sa.session_id = et.session_id
ORDER BY
    et.session_id,
    et.occurred_at ASC;
