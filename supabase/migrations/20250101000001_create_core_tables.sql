-- ============================================================================
-- Migration: 20250101000001_create_core_tables.sql
-- Description: Create normalized tables with constraints, default values, and relations
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- 1. USERS TABLE
-- Profiles table synced with Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    phone TEXT,
    avatar TEXT,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CAMPUS ZONES TABLE
CREATE TABLE IF NOT EXISTS public.campus_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status zone_status NOT NULL DEFAULT 'safe',
    occupancy INTEGER NOT NULL DEFAULT 0 CHECK (occupancy >= 0),
    capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bounds JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type incident_type NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'active',
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location TEXT,
    zone_id UUID REFERENCES public.campus_zones(id) ON DELETE SET NULL,
    confidence NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 100.0),
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (risk_score >= 0.0 AND risk_score <= 100.0),
    people_at_risk INTEGER NOT NULL DEFAULT 0 CHECK (people_at_risk >= 0),
    reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_responders UUID[] NOT NULL DEFAULT '{}',
    camera_ids TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. RESPONDERS TABLE
CREATE TABLE IF NOT EXISTS public.responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT,
    status responder_status NOT NULL DEFAULT 'available',
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    eta INTEGER NOT NULL DEFAULT 0 CHECK (eta >= 0), -- ETA in seconds
    phone TEXT,
    radio_channel TEXT,
    certifications TEXT[] NOT NULL DEFAULT '{}',
    current_incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    avatar_url TEXT,
    last_ping_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    audience alert_audience NOT NULL DEFAULT 'all',
    type alert_type NOT NULL DEFAULT 'broadcast',
    severity incident_severity NOT NULL DEFAULT 'medium',
    confidence NUMERIC(5,2) NOT NULL DEFAULT 100.0 CHECK (confidence >= 0.0 AND confidence <= 100.0),
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. EVACUATION ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.evacuation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    geojson JSONB NOT NULL,
    safe_exit TEXT NOT NULL,
    estimated_time INTEGER NOT NULL DEFAULT 0 CHECK (estimated_time >= 0), -- in seconds
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared', 'blocked', 'alternative')),
    waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. AI LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prediction JSONB NOT NULL,
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 100.0),
    raw_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    processing_time_ms NUMERIC(10,2) CHECK (processing_time_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. SENSORS TABLE
CREATE TABLE IF NOT EXISTS public.sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type sensor_type NOT NULL,
    label TEXT NOT NULL,
    location TEXT NOT NULL,
    zone_id UUID REFERENCES public.campus_zones(id) ON DELETE SET NULL,
    status sensor_status NOT NULL DEFAULT 'normal',
    value NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    unit TEXT NOT NULL DEFAULT '',
    threshold NUMERIC(10,2) NOT NULL DEFAULT 0.0,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INCIDENT RESPONDER ASSIGNMENTS (Normalized Join Table)
CREATE TABLE IF NOT EXISTS public.incident_responder_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES public.responders(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'en_route', 'on_scene', 'completed', 'reassigned')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(incident_id, responder_id)
);
