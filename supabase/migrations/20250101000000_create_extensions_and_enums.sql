-- ============================================================================
-- Migration: 20250101000000_create_extensions_and_enums.sql
-- Description: Enable required PostgreSQL extensions and define custom ENUM types
-- Project: CampusShield AI / Supabase Backend
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CUSTOM ENUM TYPES

-- User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin',
        'dispatcher',
        'responder',
        'analyst',
        'security_officer',
        'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Incident Severity
DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM (
        'critical',
        'high',
        'medium',
        'low'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Incident Status
DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'active',
        'responding',
        'contained',
        'resolved',
        'false_alarm'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Incident Types
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Responder Status
DO $$ BEGIN
    CREATE TYPE responder_status AS ENUM (
        'available',
        'dispatched',
        'on_scene',
        'offline',
        'en_route',
        'busy'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alert Audience
DO $$ BEGIN
    CREATE TYPE alert_audience AS ENUM (
        'all',
        'responders',
        'dispatchers',
        'security',
        'public',
        'zone_occupants'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alert Type
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Zone Status
DO $$ BEGIN
    CREATE TYPE zone_status AS ENUM (
        'safe',
        'caution',
        'danger',
        'evacuating',
        'lockdown'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sensor Status
DO $$ BEGIN
    CREATE TYPE sensor_status AS ENUM (
        'normal',
        'warning',
        'alert',
        'offline'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sensor Type
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
