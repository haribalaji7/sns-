-- ============================================================================
-- Migration: 20250101000004_create_realtime_and_indexes.sql
-- Description: Configure Supabase Realtime publications and optimize high-throughput indexes
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- 1. CONFIGURE REPLICA IDENTITY (Full row delivery for realtime subscribers)
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.responders REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.sensors REPLICA IDENTITY FULL;
ALTER TABLE public.evacuation_routes REPLICA IDENTITY FULL;
ALTER TABLE public.ai_logs REPLICA IDENTITY FULL;
ALTER TABLE public.campus_zones REPLICA IDENTITY FULL;

-- 2. ENABLE REALTIME PUBLICATION
DO $$ BEGIN
    -- Ensure publication exists
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to realtime publication safely
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.evacuation_routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_zones;


-- 3. FOREIGN KEY INDEXES (Optimizes JOIN queries and cascade checks)
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


-- 4. FILTERING, SORTING & QUERY PERFORMANCE INDEXES
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


-- 5. GIN INDEXES FOR JSONB & ARRAY COLUMNS (Sub-millisecond containment queries)
CREATE INDEX IF NOT EXISTS idx_evacuation_routes_geojson ON public.evacuation_routes USING GIN (geojson);
CREATE INDEX IF NOT EXISTS idx_evacuation_routes_waypoints ON public.evacuation_routes USING GIN (waypoints);
CREATE INDEX IF NOT EXISTS idx_ai_logs_prediction ON public.ai_logs USING GIN (prediction);
CREATE INDEX IF NOT EXISTS idx_campus_zones_bounds ON public.campus_zones USING GIN (bounds);

CREATE INDEX IF NOT EXISTS idx_incidents_tags ON public.incidents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_ids ON public.incidents USING GIN (camera_ids);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_responders ON public.incidents USING GIN (assigned_responders);
CREATE INDEX IF NOT EXISTS idx_responders_certifications ON public.responders USING GIN (certifications);
