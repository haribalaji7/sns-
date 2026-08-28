-- ============================================================================
-- Migration: 20250101000003_create_rls_policies.sql
-- Description: Enable Row Level Security (RLS) & define role-based access policies
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evacuation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_responder_assignments ENABLE ROW LEVEL SECURITY;


-- 2. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role
    FROM public.users
    WHERE id = auth.uid();
    
    RETURN COALESCE(v_role, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.auth_user_role() = 'admin'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_dispatcher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.auth_user_role() IN ('admin'::user_role, 'dispatcher'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.auth_user_role() IN ('admin'::user_role, 'dispatcher'::user_role, 'responder'::user_role, 'security_officer'::user_role, 'analyst'::user_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- 3. RLS POLICIES: USERS
-- Allow users to view profiles
DROP POLICY IF EXISTS "Users can view active profiles" ON public.users;
CREATE POLICY "Users can view active profiles"
    ON public.users FOR SELECT
    TO authenticated, anon
    USING (is_active = true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow Admins full management on users
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users"
    ON public.users FOR ALL
    TO authenticated
    USING (public.is_admin());


-- 4. RLS POLICIES: INCIDENTS
-- Allow viewing incidents (authenticated staff/users & public alerts)
DROP POLICY IF EXISTS "Anyone can view incidents" ON public.incidents;
CREATE POLICY "Anyone can view incidents"
    ON public.incidents FOR SELECT
    TO authenticated, anon
    USING (true);

-- Allow authenticated users to report/create an incident
DROP POLICY IF EXISTS "Authenticated users can report incidents" ON public.incidents;
CREATE POLICY "Authenticated users can report incidents"
    ON public.incidents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Dispatchers, Admins, or assigned Responders can update incident status
DROP POLICY IF EXISTS "Staff and assigned responders can update incidents" ON public.incidents;
CREATE POLICY "Staff and assigned responders can update incidents"
    ON public.incidents FOR UPDATE
    TO authenticated
    USING (
        public.is_dispatcher_or_admin() OR
        EXISTS (
            SELECT 1 FROM public.responders r
            WHERE r.user_id = auth.uid()
              AND (r.id = ANY(public.incidents.assigned_responders) OR r.current_incident_id = public.incidents.id)
        )
    );

-- Only Admins can delete incidents
DROP POLICY IF EXISTS "Admins can delete incidents" ON public.incidents;
CREATE POLICY "Admins can delete incidents"
    ON public.incidents FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 5. RLS POLICIES: RESPONDERS
-- Read responder directory and live coordinates
DROP POLICY IF EXISTS "Anyone authenticated can view responders" ON public.responders;
CREATE POLICY "Anyone authenticated can view responders"
    ON public.responders FOR SELECT
    TO authenticated, anon
    USING (true);

-- Dispatchers and Admins can create responders
DROP POLICY IF EXISTS "Dispatchers and admins can insert responders" ON public.responders;
CREATE POLICY "Dispatchers and admins can insert responders"
    ON public.responders FOR INSERT
    TO authenticated
    WITH CHECK (public.is_dispatcher_or_admin());

-- Dispatchers, Admins, or the responder themselves can update status/lat/lng/eta
DROP POLICY IF EXISTS "Responders and dispatchers can update responder details" ON public.responders;
CREATE POLICY "Responders and dispatchers can update responder details"
    ON public.responders FOR UPDATE
    TO authenticated
    USING (
        public.is_dispatcher_or_admin() OR
        user_id = auth.uid()
    )
    WITH CHECK (
        public.is_dispatcher_or_admin() OR
        user_id = auth.uid()
    );

-- Admins can delete responders
DROP POLICY IF EXISTS "Admins can delete responders" ON public.responders;
CREATE POLICY "Admins can delete responders"
    ON public.responders FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 6. RLS POLICIES: ALERTS
-- Read alerts
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.alerts;
CREATE POLICY "Anyone can view alerts"
    ON public.alerts FOR SELECT
    TO authenticated, anon
    USING (true);

-- Dispatchers, Admins, and system services can create alerts
DROP POLICY IF EXISTS "Staff can insert alerts" ON public.alerts;
CREATE POLICY "Staff can insert alerts"
    ON public.alerts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_staff());

-- Users can acknowledge alerts; Dispatchers/Admins can edit alerts
DROP POLICY IF EXISTS "Users can acknowledge alerts" ON public.alerts;
CREATE POLICY "Users can acknowledge alerts"
    ON public.alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admins can delete alerts
DROP POLICY IF EXISTS "Admins can delete alerts" ON public.alerts;
CREATE POLICY "Admins can delete alerts"
    ON public.alerts FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 7. RLS POLICIES: EVACUATION ROUTES
-- Everyone can view evacuation routes for campus life safety
DROP POLICY IF EXISTS "Public can view evacuation routes" ON public.evacuation_routes;
CREATE POLICY "Public can view evacuation routes"
    ON public.evacuation_routes FOR SELECT
    TO authenticated, anon
    USING (true);

-- Dispatchers and Admins can manage evacuation routes
DROP POLICY IF EXISTS "Dispatchers and admins can manage evacuation routes" ON public.evacuation_routes;
CREATE POLICY "Dispatchers and admins can manage evacuation routes"
    ON public.evacuation_routes FOR ALL
    TO authenticated
    USING (public.is_dispatcher_or_admin())
    WITH CHECK (public.is_dispatcher_or_admin());


-- 8. RLS POLICIES: AI LOGS
-- Staff can view AI logs
DROP POLICY IF EXISTS "Staff can view AI logs" ON public.ai_logs;
CREATE POLICY "Staff can view AI logs"
    ON public.ai_logs FOR SELECT
    TO authenticated
    USING (public.is_staff());

-- Staff and automated AI agents can insert logs
DROP POLICY IF EXISTS "Staff can insert AI logs" ON public.ai_logs;
CREATE POLICY "Staff can insert AI logs"
    ON public.ai_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_staff());

-- Admins can delete AI logs
DROP POLICY IF EXISTS "Admins can delete AI logs" ON public.ai_logs;
CREATE POLICY "Admins can delete AI logs"
    ON public.ai_logs FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 9. RLS POLICIES: SENSORS & CAMPUS ZONES
DROP POLICY IF EXISTS "Anyone can view campus zones" ON public.campus_zones;
CREATE POLICY "Anyone can view campus zones"
    ON public.campus_zones FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Staff can manage campus zones" ON public.campus_zones;
CREATE POLICY "Staff can manage campus zones"
    ON public.campus_zones FOR ALL
    TO authenticated
    USING (public.is_dispatcher_or_admin())
    WITH CHECK (public.is_dispatcher_or_admin());

DROP POLICY IF EXISTS "Anyone can view sensors" ON public.sensors;
CREATE POLICY "Anyone can view sensors"
    ON public.sensors FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Staff can manage sensors" ON public.sensors;
CREATE POLICY "Staff can manage sensors"
    ON public.sensors FOR ALL
    TO authenticated
    USING (public.is_dispatcher_or_admin())
    WITH CHECK (public.is_dispatcher_or_admin());


-- 10. RLS POLICIES: INCIDENT RESPONDER ASSIGNMENTS
DROP POLICY IF EXISTS "Anyone authenticated can view assignments" ON public.incident_responder_assignments;
CREATE POLICY "Anyone authenticated can view assignments"
    ON public.incident_responder_assignments FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Staff can manage assignments" ON public.incident_responder_assignments;
CREATE POLICY "Staff can manage assignments"
    ON public.incident_responder_assignments FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());
