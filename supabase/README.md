# CampusShield AI — Supabase Backend Architecture

This directory contains the complete normalized PostgreSQL database schema, migrations, security policies, triggers, and seed data for the **CampusShield AI Emergency Management Platform**.

---

## 📁 Directory Structure

```
supabase/
├── config.toml                     # Supabase CLI local dev config
├── schema.sql                      # Consolidated 1-click execution schema
├── seed.sql                        # Comprehensive seed data (zones, sensors, incidents, responders, routes, AI logs)
├── README.md                       # Backend documentation & architecture guide
└── migrations/
    ├── 20250101000000_create_extensions_and_enums.sql   # UUID, pgcrypto, custom enums
    ├── 20250101000001_create_core_tables.sql            # Normalized tables with foreign keys
    ├── 20250101000002_create_triggers_and_functions.sql  # updated_at, auth sync, dispatch functions
    ├── 20250101000003_create_rls_policies.sql           # Row Level Security (RLS) policies
    └── 20250101000004_create_realtime_and_indexes.sql   # Realtime publications & GIN/B-Tree indexes
```

---

## 🗄️ Normalized Database Schema

### 1. `users`
Synced directly with Supabase `auth.users` via database triggers.
* **`id`** (`UUID`, PK, `REFERENCES auth.users(id) ON DELETE CASCADE`)
* **`name`** (`TEXT NOT NULL`)
* **`email`** (`TEXT UNIQUE NOT NULL`)
* **`role`** (`user_role NOT NULL DEFAULT 'viewer'`: `'admin'`, `'dispatcher'`, `'responder'`, `'analyst'`, `'security_officer'`, `'viewer'`)
* **`phone`** (`TEXT`)
* **`avatar`** (`TEXT`)
* **`department`** (`TEXT`)
* **`is_active`** (`BOOLEAN DEFAULT true`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`updated_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 2. `incidents`
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`)
* **`title`** (`TEXT NOT NULL`)
* **`type`** (`incident_type`: `'fire'`, `'intrusion'`, `'medical'`, `'gas_leak'`, `'suspicious'`, `'crowd'`, `'vandalism'`, `'weather'`, `'structural'`, `'other'`)
* **`severity`** (`incident_severity`: `'critical'`, `'high'`, `'medium'`, `'low'`)
* **`status`** (`incident_status`: `'active'`, `'responding'`, `'contained'`, `'resolved'`, `'false_alarm'`)
* **`description`** (`TEXT`)
* **`latitude`** (`DOUBLE PRECISION NOT NULL`)
* **`longitude`** (`DOUBLE PRECISION NOT NULL`)
* **`location`** (`TEXT`)
* **`zone_id`** (`UUID REFERENCES campus_zones(id) ON DELETE SET NULL`)
* **`confidence`** (`NUMERIC(5,2) CHECK (0..100)`)
* **`risk_score`** (`NUMERIC(5,2) CHECK (0..100)`)
* **`people_at_risk`** (`INTEGER DEFAULT 0`)
* **`reported_by`** (`UUID REFERENCES users(id) ON DELETE SET NULL`)
* **`assigned_responders`** (`UUID[] DEFAULT '{}'`)
* **`camera_ids`** (`TEXT[] DEFAULT '{}'`)
* **`tags`** (`TEXT[] DEFAULT '{}'`)
* **`resolved_at`** (`TIMESTAMPTZ`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`updated_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 3. `responders`
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`)
* **`user_id`** (`UUID REFERENCES users(id) ON DELETE SET NULL`)
* **`name`** (`TEXT NOT NULL`)
* **`role`** (`TEXT NOT NULL`)
* **`team`** (`TEXT`)
* **`status`** (`responder_status`: `'available'`, `'dispatched'`, `'on_scene'`, `'offline'`, `'en_route'`, `'busy'`)
* **`current_lat`** (`DOUBLE PRECISION`)
* **`current_lng`** (`DOUBLE PRECISION`)
* **`eta`** (`INTEGER DEFAULT 0`) — *Estimated arrival in seconds*
* **`phone`** (`TEXT`)
* **`radio_channel`** (`TEXT`)
* **`certifications`** (`TEXT[] DEFAULT '{}'`)
* **`current_incident_id`** (`UUID REFERENCES incidents(id) ON DELETE SET NULL`)
* **`avatar_url`** (`TEXT`)
* **`last_ping_at`** (`TIMESTAMPTZ`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`updated_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 4. `alerts`
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`)
* **`incident_id`** (`UUID REFERENCES incidents(id) ON DELETE CASCADE`)
* **`title`** (`TEXT NOT NULL`)
* **`message`** (`TEXT NOT NULL`)
* **`audience`** (`alert_audience`: `'all'`, `'responders'`, `'dispatchers'`, `'security'`, `'public'`, `'zone_occupants'`)
* **`type`** (`alert_type`: `'prediction'`, `'anomaly'`, `'pattern'`, `'recommendation'`, `'broadcast'`, `'emergency'`, `'maintenance'`)
* **`severity`** (`incident_severity`)
* **`confidence`** (`NUMERIC(5,2) DEFAULT 100`)
* **`acknowledged`** (`BOOLEAN DEFAULT false`)
* **`acknowledged_by`** (`UUID REFERENCES users(id) ON DELETE SET NULL`)
* **`acknowledged_at`** (`TIMESTAMPTZ`)
* **`sent_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`updated_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 5. `evacuation_routes`
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`)
* **`incident_id`** (`UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE`)
* **`geojson`** (`JSONB NOT NULL`) — *GeoJSON Feature / LineString with coordinates*
* **`safe_exit`** (`TEXT NOT NULL`)
* **`estimated_time`** (`INTEGER DEFAULT 0`) — *Estimated clearance time in seconds*
* **`status`** (`TEXT DEFAULT 'active'`)
* **`waypoints`** (`JSONB DEFAULT '[]'`) — *Step-by-step turn guidance*
* **`is_primary`** (`BOOLEAN DEFAULT true`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)
* **`updated_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 6. `ai_logs`
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`)
* **`incident_id`** (`UUID REFERENCES incidents(id) ON DELETE CASCADE`)
* **`model`** (`TEXT NOT NULL`) — *e.g. YOLOv8 Flame, Crowd Forecast LSTM, Pose Fall Triage*
* **`prediction`** (`JSONB NOT NULL`) — *Detailed model prediction outputs and bounding boxes*
* **`confidence`** (`NUMERIC(5,2) NOT NULL CHECK (0..100)`)
* **`raw_features`** (`JSONB DEFAULT '{}'`)
* **`processing_time_ms`** (`NUMERIC(10,2)`)
* **`created_at`** (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### Supporting Normalized Tables:
* **`campus_zones`**: Campus polygon bounds, occupancy, risk scores, and sensor density.
* **`sensors`**: IoT sensor fleet (smoke, thermal, chemical, access, motion).
* **`incident_responder_assignments`**: Normalized Many-to-Many dispatch junction table.

---

## ⚡ Automated Triggers & Functions

1. **`handle_updated_at()`**: Automatically updates the `updated_at` timestamp before any `UPDATE` on every table.
2. **`handle_new_user()`**: Automatically creates/syncs a public user profile from `auth.users` upon signup or OAuth login.
3. **`handle_incident_status_change()`**: Automatically timestamps `resolved_at` and frees assigned responders back to `available` upon incident closure.
4. **`handle_responder_incident_assignment()`**: Synchronizes incident responder arrays and junction records whenever a responder is dispatched.
5. **`handle_new_ai_log()`**: Automatically updates incident AI confidence level when a new model inference is logged.
6. **`dispatch_responder(p_incident_id, p_responder_id, p_eta_seconds)`**: Stored procedure to atomically dispatch a unit.
7. **`get_campus_metrics()`**: Returns instant aggregated KPIs for command center dashboards.

---

## 🛡️ Row Level Security (RLS) Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | Authenticated / Anon | Auth Trigger / Admin | Self (`auth.uid() = id`) / Admin | Admin only |
| **`incidents`** | Public / All | Authenticated Users | Dispatcher, Admin, Assigned Responder | Admin only |
| **`responders`** | Public / All | Dispatcher, Admin | Self (`user_id = auth.uid()`), Dispatcher, Admin | Admin only |
| **`alerts`** | Public / All | Staff / Service Role | Authenticated (Acknowledge), Admin | Admin only |
| **`evacuation_routes`** | Public / All (Safety) | Dispatcher, Admin | Dispatcher, Admin | Admin only |
| **`ai_logs`** | Staff / Analysts | Staff / AI Service Role | Admin only | Admin only |
| **`campus_zones`** | Public / All | Dispatcher, Admin | Dispatcher, Admin | Admin only |
| **`sensors`** | Public / All | Dispatcher, Admin | Dispatcher, Admin | Admin only |

---

## 📡 Realtime Subscriptions

Realtime is enabled on the `supabase_realtime` publication with `REPLICA IDENTITY FULL` on:
- `incidents`
- `responders`
- `alerts`
- `sensors`
- `evacuation_routes`
- `ai_logs`
- `campus_zones`

### Frontend Usage (TypeScript)

```ts
import { subscribeToIncidents, subscribeToResponders, subscribeToAlerts } from '@/lib/supabase/realtime';

// Subscribe to live incident updates
const unsubscribeIncidents = subscribeToIncidents(
  (newIncident) => console.log('New incident created:', newIncident),
  (updatedIncident) => console.log('Incident updated:', updatedIncident),
  (deletedId) => console.log('Incident removed:', deletedId),
);

// Subscribe to live responder GPS tracking
const unsubscribeResponders = subscribeToResponders((responder) => {
  console.log(`Responder ${responder.name} moved to:`, responder.current_lat, responder.current_lng);
});

// Subscribe to real-time safety alerts
const unsubscribeAlerts = subscribeToAlerts((alert) => {
  console.log('URGENT ALERT:', alert.title, alert.message);
});
```

---

## 🚀 How to Apply to Supabase

### Option A: Via Supabase Dashboard (Fastest)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and paste the contents of `supabase/schema.sql` and click **Run**.
4. (Optional) Copy and paste `supabase/seed.sql` to populate sample data and click **Run**.

### Option B: Via Supabase CLI (Local Development)
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start local Supabase instance
supabase start

# Apply migrations
supabase db reset
```
