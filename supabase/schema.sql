-- ============================================================================
-- Complete Unified Schema: supabase/schema.sql
-- Project: CampusShield AI / Emergency Response Platform
-- Description: Complete production PostgreSQL schema for Supabase
-- Contains: Extensions, Enums, Tables, Constraints, Triggers, RLS, Policies,
--           Realtime Publications, and Performance Indexes.
-- ============================================================================

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- 2. CUSTOM ENUMS
-- ==========================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin',
        'dispatcher',
        'responder',
        'analyst',
        'security_officer',
        'viewer',
        'student'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM (
        'critical',
        'high',
        'medium',
        'low'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'active',
        'responding',
        'contained',
        'resolved',
        'false_alarm'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM (
        'fire',
        'intrusion',
        'medical',
        'gas_leak',
        'suspicious',
        'crowd',
        'vandalism',
        'weather',
        'structural',
        'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE responder_status AS ENUM (
        'available',
        'dispatched',
        'on_scene',
        'offline',
        'en_route',
        'busy'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE alert_audience AS ENUM (
        'all',
        'responders',
        'dispatchers',
        'security',
        'public',
        'zone_occupants'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM (
        'prediction',
        'anomaly',
        'pattern',
        'recommendation',
        'broadcast',
        'emergency',
        'maintenance'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE zone_status AS ENUM (
        'safe',
        'caution',
        'danger',
        'evacuating',
        'lockdown'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sensor_status AS ENUM (
        'normal',
        'warning',
        'alert',
        'offline'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sensor_type AS ENUM (
        'smoke',
        'motion',
        'thermal',
        'chemical',
        'sound',
        'access',
        'camera',
        'flame'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 3. CORE TABLES & RELATIONS
-- ==========================================

-- A. USERS (Synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    phone TEXT,
    avatar TEXT,
    department TEXT,
    year TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    is_hosteller BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- AA. STUDENTS STATUS
CREATE TABLE IF NOT EXISTS public.students_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    last_known_lat DOUBLE PRECISION,
    last_known_lng DOUBLE PRECISION,
    assembly_point_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- B. CAMPUS ZONES
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

-- C. INCIDENTS
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

-- D. RESPONDERS
CREATE TABLE IF NOT EXISTS public.responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT,
    status responder_status NOT NULL DEFAULT 'available',
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    eta INTEGER NOT NULL DEFAULT 0 CHECK (eta >= 0),
    phone TEXT,
    radio_channel TEXT,
    certifications TEXT[] NOT NULL DEFAULT '{}',
    current_incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    avatar_url TEXT,
    last_ping_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- E. ALERTS
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

-- F. EVACUATION ROUTES
CREATE TABLE IF NOT EXISTS public.evacuation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    geojson JSONB NOT NULL,
    safe_exit TEXT NOT NULL,
    estimated_time INTEGER NOT NULL DEFAULT 0 CHECK (estimated_time >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared', 'blocked', 'alternative')),
    waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- G. AI LOGS
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

-- H. SENSORS
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

-- I. INCIDENT RESPONDER ASSIGNMENTS
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

-- ==========================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==========================================

-- Universal updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_campus_zones_updated_at ON public.campus_zones;
CREATE TRIGGER tr_campus_zones_updated_at BEFORE UPDATE ON public.campus_zones FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_incidents_updated_at ON public.incidents;
CREATE TRIGGER tr_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_responders_updated_at ON public.responders;
CREATE TRIGGER tr_responders_updated_at BEFORE UPDATE ON public.responders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_alerts_updated_at ON public.alerts;
CREATE TRIGGER tr_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_evacuation_routes_updated_at ON public.evacuation_routes;
CREATE TRIGGER tr_evacuation_routes_updated_at BEFORE UPDATE ON public.evacuation_routes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sensors_updated_at ON public.sensors;
CREATE TRIGGER tr_sensors_updated_at BEFORE UPDATE ON public.sensors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_incident_assignments_updated_at ON public.incident_responder_assignments;
CREATE TRIGGER tr_incident_assignments_updated_at BEFORE UPDATE ON public.incident_responder_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auth sync trigger (auth.users -> public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'viewer';
    extracted_role text;
BEGIN
    extracted_role := NEW.raw_user_meta_data->>'role';
    IF extracted_role IS NOT NULL AND extracted_role IN ('admin', 'dispatcher', 'responder', 'analyst', 'security_officer', 'viewer') THEN
        default_role := extracted_role::user_role;
    END IF;

    INSERT INTO public.users (
        id, name, email, role, phone, avatar, department, is_active, created_at, updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        default_role,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'department',
        true,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Incident resolution trigger
CREATE OR REPLACE FUNCTION public.handle_incident_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('resolved', 'false_alarm') AND OLD.status NOT IN ('resolved', 'false_alarm') THEN
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at := timezone('utc'::text, now());
        END IF;

        UPDATE public.responders
        SET status = 'available', current_incident_id = NULL, eta = 0, updated_at = timezone('utc'::text, now())
        WHERE current_incident_id = NEW.id;

    ELSIF NEW.status IN ('active', 'responding') AND OLD.status IN ('resolved', 'false_alarm') THEN
        NEW.resolved_at := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_incident_status_change ON public.incidents;
CREATE TRIGGER tr_incident_status_change
    BEFORE UPDATE OF status ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.handle_incident_status_change();

-- Responder assignment synchronization
CREATE OR REPLACE FUNCTION public.handle_responder_incident_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_incident_id IS NOT NULL AND (OLD.current_incident_id IS NULL OR OLD.current_incident_id <> NEW.current_incident_id) THEN
        UPDATE public.incidents
        SET assigned_responders = array_append(array_remove(assigned_responders, NEW.id), NEW.id),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.current_incident_id AND NOT (NEW.id = ANY(assigned_responders));

        INSERT INTO public.incident_responder_assignments (incident_id, responder_id, status, assigned_at)
        VALUES (NEW.current_incident_id, NEW.id, 'dispatched', timezone('utc'::text, now()))
        ON CONFLICT (incident_id, responder_id) DO UPDATE
        SET status = 'dispatched', updated_at = timezone('utc'::text, now());

    ELSIF NEW.current_incident_id IS NULL AND OLD.current_incident_id IS NOT NULL THEN
        UPDATE public.incidents
        SET assigned_responders = array_remove(assigned_responders, NEW.id),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.current_incident_id;

        UPDATE public.incident_responder_assignments
        SET status = 'completed', updated_at = timezone('utc'::text, now())
        WHERE incident_id = OLD.current_incident_id AND responder_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_responder_incident_assignment ON public.responders;
CREATE TRIGGER tr_responder_incident_assignment
    AFTER INSERT OR UPDATE OF current_incident_id ON public.responders
    FOR EACH ROW EXECUTE FUNCTION public.handle_responder_incident_assignment();

-- AI Log auto update
CREATE OR REPLACE FUNCTION public.handle_new_ai_log()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.incident_id IS NOT NULL THEN
        UPDATE public.incidents
        SET confidence = NEW.confidence, updated_at = timezone('utc'::text, now())
        WHERE id = NEW.incident_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_new_ai_log ON public.ai_logs;
CREATE TRIGGER tr_new_ai_log
    AFTER INSERT ON public.ai_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_ai_log();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evacuation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_responder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students_status ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS user_role AS $$
DECLARE v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
    RETURN COALESCE(v_role, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN RETURN (public.auth_user_role() = 'admin'::user_role); END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_dispatcher_or_admin() RETURNS BOOLEAN AS $$
BEGIN RETURN (public.auth_user_role() IN ('admin'::user_role, 'dispatcher'::user_role)); END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN AS $$
BEGIN RETURN (public.auth_user_role() IN ('admin'::user_role, 'dispatcher'::user_role, 'responder'::user_role, 'security_officer'::user_role, 'analyst'::user_role)); END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Users policies
DROP POLICY IF EXISTS "Users can view active profiles" ON public.users;
CREATE POLICY "Users can view active profiles" ON public.users FOR SELECT TO authenticated, anon USING (is_active = true);

-- Students Status policies
DROP POLICY IF EXISTS "Users can view their own status and staff can view all" ON public.students_status;
CREATE POLICY "Users can view their own status and staff can view all" ON public.students_status FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Students can insert their own status" ON public.students_status;
CREATE POLICY "Students can insert their own status" ON public.students_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own status" ON public.students_status;
CREATE POLICY "Students can update their own status" ON public.students_status FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete students status" ON public.students_status;
CREATE POLICY "Admins can delete students status" ON public.students_status FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL TO authenticated USING (public.is_admin());

-- Incidents policies
DROP POLICY IF EXISTS "Anyone can view incidents" ON public.incidents;
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Authenticated users can report incidents" ON public.incidents;
CREATE POLICY "Authenticated users can report incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and assigned responders can update incidents" ON public.incidents;
CREATE POLICY "Staff and assigned responders can update incidents" ON public.incidents FOR UPDATE TO authenticated USING (
    public.is_dispatcher_or_admin() OR
    EXISTS (SELECT 1 FROM public.responders r WHERE r.user_id = auth.uid() AND (r.id = ANY(public.incidents.assigned_responders) OR r.current_incident_id = public.incidents.id))
);

DROP POLICY IF EXISTS "Admins can delete incidents" ON public.incidents;
CREATE POLICY "Admins can delete incidents" ON public.incidents FOR DELETE TO authenticated USING (public.is_admin());

-- Responders policies
DROP POLICY IF EXISTS "Anyone authenticated can view responders" ON public.responders;
CREATE POLICY "Anyone authenticated can view responders" ON public.responders FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Dispatchers and admins can insert responders" ON public.responders;
CREATE POLICY "Dispatchers and admins can insert responders" ON public.responders FOR INSERT TO authenticated WITH CHECK (public.is_dispatcher_or_admin());

DROP POLICY IF EXISTS "Responders and dispatchers can update responder details" ON public.responders;
CREATE POLICY "Responders and dispatchers can update responder details" ON public.responders FOR UPDATE TO authenticated USING (public.is_dispatcher_or_admin() OR user_id = auth.uid()) WITH CHECK (public.is_dispatcher_or_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete responders" ON public.responders;
CREATE POLICY "Admins can delete responders" ON public.responders FOR DELETE TO authenticated USING (public.is_admin());

-- Alerts policies
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.alerts;
CREATE POLICY "Anyone can view alerts" ON public.alerts FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can insert alerts" ON public.alerts;
CREATE POLICY "Staff can insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Users can acknowledge alerts" ON public.alerts;
CREATE POLICY "Users can acknowledge alerts" ON public.alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete alerts" ON public.alerts;
CREATE POLICY "Admins can delete alerts" ON public.alerts FOR DELETE TO authenticated USING (public.is_admin());

-- Evacuation routes policies
DROP POLICY IF EXISTS "Public can view evacuation routes" ON public.evacuation_routes;
CREATE POLICY "Public can view evacuation routes" ON public.evacuation_routes FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Dispatchers and admins can manage evacuation routes" ON public.evacuation_routes;
CREATE POLICY "Dispatchers and admins can manage evacuation routes" ON public.evacuation_routes FOR ALL TO authenticated USING (public.is_dispatcher_or_admin()) WITH CHECK (public.is_dispatcher_or_admin());

-- AI logs policies
DROP POLICY IF EXISTS "Staff can view AI logs" ON public.ai_logs;
CREATE POLICY "Staff can view AI logs" ON public.ai_logs FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can insert AI logs" ON public.ai_logs;
CREATE POLICY "Staff can insert AI logs" ON public.ai_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can delete AI logs" ON public.ai_logs;
CREATE POLICY "Admins can delete AI logs" ON public.ai_logs FOR DELETE TO authenticated USING (public.is_admin());

-- Campus zones & Sensors policies
DROP POLICY IF EXISTS "Anyone can view campus zones" ON public.campus_zones;
CREATE POLICY "Anyone can view campus zones" ON public.campus_zones FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can manage campus zones" ON public.campus_zones;
CREATE POLICY "Staff can manage campus zones" ON public.campus_zones FOR ALL TO authenticated USING (public.is_dispatcher_or_admin()) WITH CHECK (public.is_dispatcher_or_admin());

DROP POLICY IF EXISTS "Anyone can view sensors" ON public.sensors;
CREATE POLICY "Anyone can view sensors" ON public.sensors FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can manage sensors" ON public.sensors;
CREATE POLICY "Staff can manage sensors" ON public.sensors FOR ALL TO authenticated USING (public.is_dispatcher_or_admin()) WITH CHECK (public.is_dispatcher_or_admin());

-- Incident Responder Assignments policies
DROP POLICY IF EXISTS "Anyone authenticated can view assignments" ON public.incident_responder_assignments;
CREATE POLICY "Anyone authenticated can view assignments" ON public.incident_responder_assignments FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Staff can manage assignments" ON public.incident_responder_assignments;
CREATE POLICY "Staff can manage assignments" ON public.incident_responder_assignments FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ==========================================
-- 6. REALTIME PUBLICATION
-- ==========================================
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.responders REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.sensors REPLICA IDENTITY FULL;
ALTER TABLE public.evacuation_routes REPLICA IDENTITY FULL;
ALTER TABLE public.ai_logs REPLICA IDENTITY FULL;
ALTER TABLE public.campus_zones REPLICA IDENTITY FULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.students_status; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.responders; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.evacuation_routes; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_logs; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_zones; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 7. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents (reported_by);
CREATE INDEX IF NOT EXISTS idx_incidents_zone_id ON public.incidents (zone_id);
CREATE INDEX IF NOT EXISTS idx_responders_user_id ON public.responders (user_id);
CREATE INDEX IF NOT EXISTS idx_responders_current_incident ON public.responders (current_incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_incident_id ON public.alerts (incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged_by ON public.alerts (acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_evacuation_routes_incident_id ON public.evacuation_routes (incident_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_incident_id ON public.ai_logs (incident_id);
CREATE INDEX IF NOT EXISTS idx_sensors_zone_id ON public.sensors (zone_id);
CREATE INDEX IF NOT EXISTS idx_assignments_incident_id ON public.incident_responder_assignments (incident_id);
CREATE INDEX IF NOT EXISTS idx_assignments_responder_id ON public.incident_responder_assignments (responder_id);

CREATE INDEX IF NOT EXISTS idx_incidents_status_severity ON public.incidents (status, severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at_desc ON public.incidents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON public.incidents (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_responders_status ON public.responders (status);
CREATE INDEX IF NOT EXISTS idx_responders_coords ON public.responders (current_lat, current_lng);

CREATE INDEX IF NOT EXISTS idx_alerts_ack_sent ON public.alerts (acknowledged, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_audience ON public.alerts (audience);

CREATE INDEX IF NOT EXISTS idx_sensors_status ON public.sensors (status);
CREATE INDEX IF NOT EXISTS idx_sensors_type ON public.sensors (type);

CREATE INDEX IF NOT EXISTS idx_ai_logs_model_created ON public.ai_logs (model, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zones_status ON public.campus_zones (status);

CREATE INDEX IF NOT EXISTS idx_evacuation_routes_geojson ON public.evacuation_routes USING GIN (geojson);
CREATE INDEX IF NOT EXISTS idx_evacuation_routes_waypoints ON public.evacuation_routes USING GIN (waypoints);
CREATE INDEX IF NOT EXISTS idx_ai_logs_prediction ON public.ai_logs USING GIN (prediction);
CREATE INDEX IF NOT EXISTS idx_campus_zones_bounds ON public.campus_zones USING GIN (bounds);
CREATE INDEX IF NOT EXISTS idx_incidents_tags ON public.incidents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_ids ON public.incidents USING GIN (camera_ids);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_responders ON public.incidents USING GIN (assigned_responders);
CREATE INDEX IF NOT EXISTS idx_responders_certifications ON public.responders USING GIN (certifications);
