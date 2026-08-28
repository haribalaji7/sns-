-- ============================================================================
-- Seed Data: supabase/seed.sql
-- Description: Realistic initial data for CampusShield AI Emergency Platform
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- Clean existing data safely (development seed)
TRUNCATE TABLE public.ai_logs CASCADE;
TRUNCATE TABLE public.evacuation_routes CASCADE;
TRUNCATE TABLE public.alerts CASCADE;
TRUNCATE TABLE public.incident_responder_assignments CASCADE;
TRUNCATE TABLE public.responders CASCADE;
TRUNCATE TABLE public.incidents CASCADE;
TRUNCATE TABLE public.sensors CASCADE;
TRUNCATE TABLE public.campus_zones CASCADE;

-- 1. SEED CAMPUS ZONES
INSERT INTO public.campus_zones (id, code, name, status, occupancy, capacity, risk_score, latitude, longitude, bounds)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Z-SCIB', 'Science Block B', 'danger', 340, 500, 94.00, 28.6139, 77.2090, 
     '[[28.6142, 77.2086], [28.6142, 77.2094], [28.6136, 77.2094], [28.6136, 77.2086]]'::jsonb),
    ('a0000000-0000-0000-0000-000000000002', 'Z-ITB', 'IT Building', 'caution', 120, 300, 62.00, 28.6145, 77.2085, 
     '[[28.6148, 77.2082], [28.6148, 77.2088], [28.6142, 77.2088], [28.6142, 77.2082]]'::jsonb),
    ('a0000000-0000-0000-0000-000000000003', 'Z-ATH', 'Athletic Center', 'caution', 190, 400, 71.00, 28.6130, 77.2095, 
     '[[28.6133, 77.2091], [28.6133, 77.2099], [28.6127, 77.2099], [28.6127, 77.2091]]'::jsonb),
    ('a0000000-0000-0000-0000-000000000004', 'Z-LIB', 'Main Library', 'safe', 620, 800, 18.00, 28.6148, 77.2098, 
     '[[28.6151, 77.2094], [28.6151, 77.2102], [28.6145, 77.2102], [28.6145, 77.2094]]'::jsonb),
    ('a0000000-0000-0000-0000-000000000005', 'Z-GATE', 'Main Gate Complex', 'safe', 45, 100, 22.00, 28.6155, 77.2075, 
     '[[28.6157, 77.2073], [28.6157, 77.2077], [28.6153, 77.2077], [28.6153, 77.2073]]'::jsonb),
    ('a0000000-0000-0000-0000-000000000006', 'Z-ADMIN', 'Administration Block', 'safe', 280, 400, 12.00, 28.6152, 77.2088, 
     '[[28.6155, 77.2084], [28.6155, 77.2092], [28.6149, 77.2092], [28.6149, 77.2084]]'::jsonb);

-- 2. SEED SENSORS
INSERT INTO public.sensors (id, code, type, label, location, zone_id, status, value, unit, threshold, latitude, longitude, last_updated)
VALUES
    ('s0000000-0000-0000-0000-000000000001', 'SEN-001', 'smoke', 'Smoke – Lab 302', 'Science Block B', 'a0000000-0000-0000-0000-000000000001', 'alert', 87.00, 'ppm', 40.00, 28.6139, 77.2090, now()),
    ('s0000000-0000-0000-0000-000000000002', 'SEN-002', 'thermal', 'Thermal – Lab 302', 'Science Block B', 'a0000000-0000-0000-0000-000000000001', 'alert', 342.00, '°C', 80.00, 28.6140, 77.2091, now()),
    ('s0000000-0000-0000-0000-000000000003', 'SEN-003', 'motion', 'Motion – Server Room', 'IT Building', 'a0000000-0000-0000-0000-000000000002', 'warning', 1.00, '', 0.00, 28.6145, 77.2085, now()),
    ('s0000000-0000-0000-0000-000000000004', 'SEN-004', 'access', 'Access – Server Door', 'IT Building', 'a0000000-0000-0000-0000-000000000002', 'alert', 3.00, 'fails', 3.00, 28.6146, 77.2085, now()),
    ('s0000000-0000-0000-0000-000000000005', 'SEN-005', 'smoke', 'Smoke – Library B1', 'Main Library', 'a0000000-0000-0000-0000-000000000004', 'normal', 8.00, 'ppm', 40.00, 28.6148, 77.2098, now()),
    ('s0000000-0000-0000-0000-000000000006', 'SEN-006', 'chemical', 'CO2 – Library B1', 'Main Library', 'a0000000-0000-0000-0000-000000000004', 'normal', 412.00, 'ppm', 1000.00, 28.6149, 77.2099, now());

-- 3. SEED INCIDENTS
INSERT INTO public.incidents (id, title, type, severity, status, description, latitude, longitude, location, zone_id, confidence, risk_score, people_at_risk, tags, camera_ids, created_at, updated_at)
VALUES
    ('c0000000-0000-0000-0000-000000000091', 'Thermal Spike + Smoke – Lab 302', 'fire', 'critical', 'active', 
     'Multiple smoke sensors triggered simultaneously. Thermal camera detected 340 °C anomaly near fume hood. Possible chemical fire.',
     28.6139, 77.2090, 'Science Block B – Floor 3, Room 302', 'a0000000-0000-0000-0000-000000000001', 98.40, 95.00, 42,
     ARRAY['fire', 'chemical', 'lab'], ARRAY['CAM-B3-01', 'CAM-B3-02'], now() - interval '4 minutes', now() - interval '90 seconds'),

    ('c0000000-0000-0000-0000-000000000090', 'Unauthorized Access – Server Room', 'intrusion', 'high', 'responding',
     'Access control breach detected. Badge scan failed 3 times before forced entry. Motion detected inside restricted zone.',
     28.6145, 77.2085, 'IT Building – Basement B1', 'a0000000-0000-0000-0000-000000000002', 93.10, 78.00, 0,
     ARRAY['access', 'intrusion', 'restricted'], ARRAY['CAM-IT-B01'], now() - interval '12 minutes', now() - interval '3 minutes'),

    ('c0000000-0000-0000-0000-000000000089', 'Cardiac Event – Athletic Center', 'medical', 'high', 'responding',
     'Student collapsed on indoor track. AED beacon activated. Paramedics dispatched.',
     28.6130, 77.2095, 'Athletic Center – Indoor Track', 'a0000000-0000-0000-0000-000000000003', 99.10, 82.00, 1,
     ARRAY['medical', 'cardiac', 'aed'], ARRAY['CAM-ATH-03'], now() - interval '8 minutes', now() - interval '2 minutes'),

    ('c0000000-0000-0000-0000-000000000088', 'Unattended Package – Main Gate', 'suspicious', 'medium', 'contained',
     'Backpack left unattended for 22 minutes near main entrance. Bomb disposal unit cleared it – false alarm.',
     28.6155, 77.2075, 'Main Entrance Gate – North', 'a0000000-0000-0000-0000-000000000005', 84.70, 45.00, 0,
     ARRAY['suspicious', 'package'], ARRAY['CAM-GATE-01'], now() - interval '35 minutes', now() - interval '10 minutes'),

    ('c0000000-0000-0000-0000-000000000087', 'Chemical Vapour – Library Basement', 'gas_leak', 'medium', 'resolved',
     'CO2 and VOC sensors flagged. Ventilation activated automatically. Area cleared within 18 minutes.',
     28.6148, 77.2098, 'Main Library – Basement Archives', 'a0000000-0000-0000-0000-000000000004', 91.20, 20.00, 18,
     ARRAY['gas', 'chemical', 'ventilation'], ARRAY['CAM-LIB-B01'], now() - interval '90 minutes', now() - interval '60 minutes');

UPDATE public.incidents
SET resolved_at = now() - interval '60 minutes'
WHERE id = 'c0000000-0000-0000-0000-000000000087';

-- 4. SEED RESPONDERS
INSERT INTO public.responders (id, name, role, team, status, current_lat, current_lng, eta, phone, radio_channel, certifications, current_incident_id, avatar_url)
VALUES
    ('r0000000-0000-0000-0000-000000000101', 'Cpt. Alex Rivera', 'Fire & HAZMAT Lead', 'Emergency Squad Alpha', 'on_scene',
     28.6139, 77.2090, 0, '+91-99001-10101', 'CH-4 Tactical', ARRAY['Fire Suppression', 'HAZMAT-3', 'SCBA'],
     'c0000000-0000-0000-0000-000000000091', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),

    ('r0000000-0000-0000-0000-000000000102', 'Sgt. Priya Sharma', 'Security Operations', 'Security Wing B', 'dispatched',
     28.6148, 77.2088, 75, '+91-99001-10102', 'CH-2 Security', ARRAY['Crowd Control', 'First Aid', 'Armed Response'],
     'c0000000-0000-0000-0000-000000000090', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),

    ('r0000000-0000-0000-0000-000000000103', 'Lt. James Chen', 'Tactical Fire Unit', 'Emergency Squad Alpha', 'dispatched',
     28.6142, 77.2092, 120, '+91-99001-10103', 'CH-4 Tactical', ARRAY['Fire Suppression', 'High-Angle Rescue'],
     'c0000000-0000-0000-0000-000000000091', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),

    ('r0000000-0000-0000-0000-000000000104', 'Dr. Sarah Mills', 'Advanced Paramedic', 'Medical Response Unit', 'on_scene',
     28.6130, 77.2095, 0, '+91-99001-10104', 'CH-9 Medical', ARRAY['ALS Paramedic', 'Cardiac Specialist', 'Trauma Triage'],
     'c0000000-0000-0000-0000-000000000089', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'),

    ('r0000000-0000-0000-0000-000000000105', 'Off. Marcus Webb', 'Campus Patrol', 'Security Wing A', 'available',
     28.6160, 77.2080, 0, '+91-99001-10105', 'CH-1 Patrol', ARRAY['Crowd Management', 'First Aid'],
     NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),

    ('r0000000-0000-0000-0000-000000000106', 'Off. Neha Patel', 'Perimeter Security', 'Security Wing A', 'available',
     28.6135, 77.2070, 0, '+91-99001-10106', 'CH-1 Patrol', ARRAY['Perimeter Control', 'CCTV Analysis'],
     NULL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');

-- 5. SEED INCIDENT ASSIGNMENTS
INSERT INTO public.incident_responder_assignments (incident_id, responder_id, status, assigned_at)
VALUES
    ('c0000000-0000-0000-0000-000000000091', 'r0000000-0000-0000-0000-000000000101', 'on_scene', now() - interval '4 minutes'),
    ('c0000000-0000-0000-0000-000000000091', 'r0000000-0000-0000-0000-000000000103', 'dispatched', now() - interval '3 minutes'),
    ('c0000000-0000-0000-0000-000000000090', 'r0000000-0000-0000-0000-000000000102', 'dispatched', now() - interval '10 minutes'),
    ('c0000000-0000-0000-0000-000000000089', 'r0000000-0000-0000-0000-000000000104', 'on_scene', now() - interval '7 minutes');

-- Sync assigned_responders array on incidents
UPDATE public.incidents
SET assigned_responders = ARRAY['r0000000-0000-0000-0000-000000000101'::uuid, 'r0000000-0000-0000-0000-000000000103'::uuid]
WHERE id = 'c0000000-0000-0000-0000-000000000091';

UPDATE public.incidents
SET assigned_responders = ARRAY['r0000000-0000-0000-0000-000000000102'::uuid]
WHERE id = 'c0000000-0000-0000-0000-000000000090';

UPDATE public.incidents
SET assigned_responders = ARRAY['r0000000-0000-0000-0000-000000000104'::uuid]
WHERE id = 'c0000000-0000-0000-0000-000000000089';

-- 6. SEED ALERTS
INSERT INTO public.alerts (id, incident_id, title, message, audience, type, severity, confidence, acknowledged, sent_at)
VALUES
    ('e0000000-0000-0000-0000-000000000441', 'c0000000-0000-0000-0000-000000000091',
     'Crowd Surge Predicted – Auditorium',
     'Event starting in 40 min. Model predicts 94% chance of bottleneck at Entry D. Pre-position 2 guards.',
     'security', 'prediction', 'high', 94.00, false, now() - interval '5 minutes'),

    ('e0000000-0000-0000-0000-000000000440', 'c0000000-0000-0000-0000-000000000090',
     'Unusual Access Pattern – Lab Wing',
     '14 badge scans in Lab Wing between 02:00–04:00 AM vs. historical average of 1.2. Investigate.',
     'dispatchers', 'anomaly', 'medium', 87.00, false, now() - interval '20 minutes'),

    ('e0000000-0000-0000-0000-000000000439', NULL,
     'Sensor Maintenance Due',
     'Sensors SEN-018, SEN-041 have 92-day uptime without calibration. Schedule maintenance within 48h.',
     'all', 'recommendation', 'low', 100.00, true, now() - interval '60 minutes'),

    ('e0000000-0000-0000-0000-000000000442', 'c0000000-0000-0000-0000-000000000091',
     'CRITICAL: Fire Alarm Science Block B Floor 3',
     'Evacuate Science Block B immediately via East Stairwell. Avoid West Fume Hood corridor.',
     'all', 'emergency', 'critical', 98.40, false, now() - interval '3 minutes');

-- 7. SEED EVACUATION ROUTES
INSERT INTO public.evacuation_routes (id, incident_id, geojson, safe_exit, estimated_time, status, waypoints, is_primary)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000091',
     '{
       "type": "Feature",
       "geometry": {
         "type": "LineString",
         "coordinates": [
           [77.2090, 28.6139],
           [77.2093, 28.6141],
           [77.2096, 28.6144],
           [77.2099, 28.6148]
         ]
       },
       "properties": {
         "name": "East Stairwell to North Lawn",
         "clearance": "high",
         "hazard_distance_m": 45
       }
     }'::jsonb,
     'East Stairwell Exit → North Quad Assembly Point',
     150, 'active',
     '[
       {"step": 1, "instruction": "Exit Room 302 and turn left toward East Stairwell", "distance_m": 25},
       {"step": 2, "instruction": "Descend stairs to Ground Level Exit E-2", "distance_m": 60},
       {"step": 3, "instruction": "Proceed 50m north to Assembly Zone Alpha", "distance_m": 50}
     ]'::jsonb,
     true),

    ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000090',
     '{
       "type": "Feature",
       "geometry": {
         "type": "LineString",
         "coordinates": [
           [77.2085, 28.6145],
           [77.2082, 28.6147],
           [77.2078, 28.6152]
         ]
       },
       "properties": {
         "name": "IT Basement Service Ramp",
         "clearance": "secure",
         "hazard_distance_m": 12
       }
     }'::jsonb,
     'Service Tunnel Ramp B1 → West Parking Gate',
     90, 'active',
     '[
       {"step": 1, "instruction": "Secure server rack doors and exit via corridor B-4", "distance_m": 15},
       {"step": 2, "instruction": "Follow illuminated green exit indicators up service ramp", "distance_m": 40}
     ]'::jsonb,
     true);

-- 8. SEED AI LOGS
INSERT INTO public.ai_logs (id, incident_id, model, prediction, confidence, raw_features, processing_time_ms, created_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000091',
     'yolo-v8-flame-detector',
     '{
       "detection": "Class 1: Chemical Fire",
       "bounding_box": [140, 220, 480, 560],
       "temperature_estimate_c": 340,
       "rate_of_spread": "fast",
       "flashover_risk": "critical"
     }'::jsonb,
     98.40,
     '{"cam_feed": "CAM-B3-01", "ir_sensor_delta": "+260C", "co_spike_ppm": 87}'::jsonb,
     42.50, now() - interval '4 minutes'),

    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000090',
     'rfid-anomaly-ensemble',
     '{
       "classification": "Brute Force / Forced Entry",
       "failed_attempts": 3,
       "badge_uid": "UNKNOWN_CARD_FF34",
       "threat_score": 93.1
     }'::jsonb,
     93.10,
     '{"door_sensor": "SEN-004", "motion_coincide": true, "after_hours": true}'::jsonb,
     18.20, now() - interval '12 minutes'),

    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000089',
     'pose-fall-detector-v3',
     '{
       "event": "Sudden Fall & Prolonged Inactivity",
       "time_down_sec": 45,
       "aed_recommended": true
     }'::jsonb,
     99.10,
     '{"pose_keypoints": 17, "velocity_drop": "-4.2m/s", "vital_patch_ping": true}'::jsonb,
     31.00, now() - interval '8 minutes'),

    ('d0000000-0000-0000-0000-000000000004', NULL,
     'lstm-crowd-density-forecaster',
     '{
       "bottleneck_zone": "Z-ATH_ENTRY_D",
       "predicted_surge_time_utc": "2026-08-28T09:10:00Z",
       "surge_probability": 0.94,
       "recommended_responders": 2
     }'::jsonb,
     94.00,
     '{"calendar_event": "Campus Basketball Derby", "historical_turnout": 1200}'::jsonb,
     88.40, now() - interval '5 minutes');
