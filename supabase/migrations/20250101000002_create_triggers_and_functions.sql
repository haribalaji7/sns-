-- ============================================================================
-- Migration: 20250101000002_create_triggers_and_functions.sql
-- Description: Automated updated_at triggers, auth sync, and business logic procedures
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- 1. UNIVERSAL UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach updated_at triggers to all tables with updated_at
DROP TRIGGER IF EXISTS tr_users_updated_at ON public.users;
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_campus_zones_updated_at ON public.campus_zones;
CREATE TRIGGER tr_campus_zones_updated_at
    BEFORE UPDATE ON public.campus_zones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_incidents_updated_at ON public.incidents;
CREATE TRIGGER tr_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_responders_updated_at ON public.responders;
CREATE TRIGGER tr_responders_updated_at
    BEFORE UPDATE ON public.responders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_alerts_updated_at ON public.alerts;
CREATE TRIGGER tr_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_evacuation_routes_updated_at ON public.evacuation_routes;
CREATE TRIGGER tr_evacuation_routes_updated_at
    BEFORE UPDATE ON public.evacuation_routes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sensors_updated_at ON public.sensors;
CREATE TRIGGER tr_sensors_updated_at
    BEFORE UPDATE ON public.sensors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_incident_assignments_updated_at ON public.incident_responder_assignments;
CREATE TRIGGER tr_incident_assignments_updated_at
    BEFORE UPDATE ON public.incident_responder_assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. AUTH.USERS -> PUBLIC.USERS AUTOMATIC SYNC TRIGGER
-- Automatically populates public.users profile when a new user registers in Supabase Auth
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
        id,
        name,
        email,
        role,
        phone,
        avatar,
        department,
        is_active,
        created_at,
        updated_at
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

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. INCIDENT STATUS TRANSITION & RESOLUTION HANDLER
CREATE OR REPLACE FUNCTION public.handle_incident_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status transitioned to resolved or false_alarm, record resolved timestamp
    IF NEW.status IN ('resolved', 'false_alarm') AND OLD.status NOT IN ('resolved', 'false_alarm') THEN
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at := timezone('utc'::text, now());
        END IF;

        -- Release assigned responders back to available
        UPDATE public.responders
        SET 
            status = 'available',
            current_incident_id = NULL,
            eta = 0,
            updated_at = timezone('utc'::text, now())
        WHERE current_incident_id = NEW.id;

    -- If status reopened from resolved
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


-- 4. RESPONDER ASSIGNMENT SYNC TRIGGER
-- Keeps the incident's assigned_responders array synchronized when responder record updates
CREATE OR REPLACE FUNCTION public.handle_responder_incident_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- When assigned to a new incident
    IF NEW.current_incident_id IS NOT NULL AND (OLD.current_incident_id IS NULL OR OLD.current_incident_id <> NEW.current_incident_id) THEN
        -- Add responder ID to incident assigned_responders array if missing
        UPDATE public.incidents
        SET assigned_responders = array_append(
            array_remove(assigned_responders, NEW.id),
            NEW.id
        ),
        updated_at = timezone('utc'::text, now())
        WHERE id = NEW.current_incident_id
          AND NOT (NEW.id = ANY(assigned_responders));

        -- Create or update assignment entry in junction table
        INSERT INTO public.incident_responder_assignments (incident_id, responder_id, status, assigned_at)
        VALUES (NEW.current_incident_id, NEW.id, 'dispatched', timezone('utc'::text, now()))
        ON CONFLICT (incident_id, responder_id) DO UPDATE
        SET status = 'dispatched', updated_at = timezone('utc'::text, now());

    -- When unassigned from an incident
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


-- 5. AI LOG AUTO-CALCULATION & AUDIT TRIGGER
-- Updates incident confidence and risk_score when an AI inference log is recorded
CREATE OR REPLACE FUNCTION public.handle_new_ai_log()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.incident_id IS NOT NULL THEN
        UPDATE public.incidents
        SET 
            confidence = NEW.confidence,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.incident_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_new_ai_log ON public.ai_logs;
CREATE TRIGGER tr_new_ai_log
    AFTER INSERT ON public.ai_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_ai_log();


-- 6. HELPER STORED PROCEDURES & UTILITY FUNCTIONS

-- Stored procedure: Dispatch responder to incident
CREATE OR REPLACE FUNCTION public.dispatch_responder(
    p_incident_id UUID,
    p_responder_id UUID,
    p_eta_seconds INTEGER DEFAULT 180
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE public.responders
    SET 
        status = 'dispatched',
        current_incident_id = p_incident_id,
        eta = p_eta_seconds,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_responder_id;

    UPDATE public.incidents
    SET 
        status = CASE WHEN status = 'active' THEN 'responding'::incident_status ELSE status END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_incident_id;

    SELECT json_build_object(
        'success', true,
        'incident_id', p_incident_id,
        'responder_id', p_responder_id,
        'eta', p_eta_seconds
    )::jsonb INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored procedure: Calculate campus real-time metrics
CREATE OR REPLACE FUNCTION public.get_campus_metrics()
RETURNS TABLE (
    total_incidents BIGINT,
    active_incidents BIGINT,
    resolved_today BIGINT,
    responders_available BIGINT,
    total_responders BIGINT,
    sensors_online BIGINT,
    total_sensors BIGINT,
    safe_zones BIGINT,
    total_zones BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.incidents)::BIGINT AS total_incidents,
        (SELECT COUNT(*) FROM public.incidents WHERE status IN ('active', 'responding'))::BIGINT AS active_incidents,
        (SELECT COUNT(*) FROM public.incidents WHERE status = 'resolved' AND resolved_at >= date_trunc('day', timezone('utc'::text, now())))::BIGINT AS resolved_today,
        (SELECT COUNT(*) FROM public.responders WHERE status = 'available')::BIGINT AS responders_available,
        (SELECT COUNT(*) FROM public.responders)::BIGINT AS total_responders,
        (SELECT COUNT(*) FROM public.sensors WHERE status <> 'offline')::BIGINT AS sensors_online,
        (SELECT COUNT(*) FROM public.sensors)::BIGINT AS total_sensors,
        (SELECT COUNT(*) FROM public.campus_zones WHERE status = 'safe')::BIGINT AS safe_zones,
        (SELECT COUNT(*) FROM public.campus_zones)::BIGINT AS total_zones;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
