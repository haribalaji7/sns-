export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | 'admin'
  | 'dispatcher'
  | 'responder'
  | 'analyst'
  | 'security_officer'
  | 'viewer';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'active'
  | 'responding'
  | 'contained'
  | 'resolved'
  | 'false_alarm';

export type IncidentType =
  | 'fire'
  | 'smoke'
  | 'person_fallen'
  | 'medical'
  | 'violence'
  | 'crowd'
  | 'flood'
  | 'electrical'
  | 'gas_leak'
  | 'intrusion'
  | 'suspicious'
  | 'vandalism'
  | 'weather'
  | 'structural'
  | 'other';

export type ResponderStatus =
  | 'available'
  | 'dispatched'
  | 'on_scene'
  | 'offline'
  | 'en_route'
  | 'busy';

export type AlertAudience =
  | 'all'
  | 'responders'
  | 'dispatchers'
  | 'security'
  | 'public'
  | 'zone_occupants';

export type AlertType =
  | 'prediction'
  | 'anomaly'
  | 'pattern'
  | 'recommendation'
  | 'broadcast'
  | 'emergency'
  | 'maintenance';

export type ZoneStatus =
  | 'safe'
  | 'caution'
  | 'danger'
  | 'evacuating'
  | 'lockdown';

export type SensorStatus = 'normal' | 'warning' | 'alert' | 'offline';

export type SensorType =
  | 'smoke'
  | 'motion'
  | 'thermal'
  | 'chemical'
  | 'sound'
  | 'access'
  | 'camera'
  | 'flame';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          phone: string | null;
          avatar: string | null;
          department: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          phone?: string | null;
          avatar?: string | null;
          department?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: UserRole;
          phone?: string | null;
          avatar?: string | null;
          department?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campus_zones: {
        Row: {
          id: string;
          code: string;
          name: string;
          status: ZoneStatus;
          occupancy: number;
          capacity: number;
          risk_score: number;
          latitude: number;
          longitude: number;
          bounds: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          status?: ZoneStatus;
          occupancy?: number;
          capacity?: number;
          risk_score?: number;
          latitude: number;
          longitude: number;
          bounds?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          status?: ZoneStatus;
          occupancy?: number;
          capacity?: number;
          risk_score?: number;
          latitude?: number;
          longitude?: number;
          bounds?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          title: string;
          type: IncidentType;
          severity: IncidentSeverity;
          status: IncidentStatus;
          description: string | null;
          latitude: number;
          longitude: number;
          location: string | null;
          zone_id: string | null;
          confidence: number;
          risk_score: number;
          people_at_risk: number;
          reported_by: string | null;
          assigned_responders: string[];
          camera_ids: string[];
          tags: string[];
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: IncidentType;
          severity?: IncidentSeverity;
          status?: IncidentStatus;
          description?: string | null;
          latitude: number;
          longitude: number;
          location?: string | null;
          zone_id?: string | null;
          confidence?: number;
          risk_score?: number;
          people_at_risk?: number;
          reported_by?: string | null;
          assigned_responders?: string[];
          camera_ids?: string[];
          tags?: string[];
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: IncidentType;
          severity?: IncidentSeverity;
          status?: IncidentStatus;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          location?: string | null;
          zone_id?: string | null;
          confidence?: number;
          risk_score?: number;
          people_at_risk?: number;
          reported_by?: string | null;
          assigned_responders?: string[];
          camera_ids?: string[];
          tags?: string[];
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incidents_reported_by_fkey';
            columns: ['reported_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_zone_id_fkey';
            columns: ['zone_id'];
            referencedRelation: 'campus_zones';
            referencedColumns: ['id'];
          },
        ];
      };
      responders: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          role: string;
          team: string | null;
          status: ResponderStatus;
          current_lat: number | null;
          current_lng: number | null;
          eta: number;
          phone: string | null;
          radio_channel: string | null;
          certifications: string[];
          current_incident_id: string | null;
          avatar_url: string | null;
          last_ping_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          role: string;
          team?: string | null;
          status?: ResponderStatus;
          current_lat?: number | null;
          current_lng?: number | null;
          eta?: number;
          phone?: string | null;
          radio_channel?: string | null;
          certifications?: string[];
          current_incident_id?: string | null;
          avatar_url?: string | null;
          last_ping_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          role?: string;
          team?: string | null;
          status?: ResponderStatus;
          current_lat?: number | null;
          current_lng?: number | null;
          eta?: number;
          phone?: string | null;
          radio_channel?: string | null;
          certifications?: string[];
          current_incident_id?: string | null;
          avatar_url?: string | null;
          last_ping_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'responders_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'responders_current_incident_id_fkey';
            columns: ['current_incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
        ];
      };
      alerts: {
        Row: {
          id: string;
          incident_id: string | null;
          title: string;
          message: string;
          audience: AlertAudience;
          type: AlertType;
          severity: IncidentSeverity;
          confidence: number;
          acknowledged: boolean;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
          sent_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          incident_id?: string | null;
          title: string;
          message: string;
          audience?: AlertAudience;
          type?: AlertType;
          severity?: IncidentSeverity;
          confidence?: number;
          acknowledged?: boolean;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          sent_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string | null;
          title?: string;
          message?: string;
          audience?: AlertAudience;
          type?: AlertType;
          severity?: IncidentSeverity;
          confidence?: number;
          acknowledged?: boolean;
          acknowledged_by?: string | null;
          acknowledged_at?: string | null;
          sent_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
        ];
      };
      evacuation_routes: {
        Row: {
          id: string;
          incident_id: string;
          geojson: Json;
          safe_exit: string;
          estimated_time: number;
          status: string;
          waypoints: Json;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          geojson: Json;
          safe_exit: string;
          estimated_time?: number;
          status?: string;
          waypoints?: Json;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          geojson?: Json;
          safe_exit?: string;
          estimated_time?: number;
          status?: string;
          waypoints?: Json;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'evacuation_routes_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_logs: {
        Row: {
          id: string;
          incident_id: string | null;
          model: string;
          prediction: Json;
          confidence: number;
          raw_features: Json;
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id?: string | null;
          model: string;
          prediction: Json;
          confidence: number;
          raw_features?: Json;
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string | null;
          model?: string;
          prediction?: Json;
          confidence?: number;
          raw_features?: Json;
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_logs_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
        ];
      };
      sensors: {
        Row: {
          id: string;
          code: string;
          type: SensorType;
          label: string;
          location: string;
          zone_id: string | null;
          status: SensorStatus;
          value: number;
          unit: string;
          threshold: number;
          latitude: number;
          longitude: number;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: SensorType;
          label: string;
          location: string;
          zone_id?: string | null;
          status?: SensorStatus;
          value?: number;
          unit?: string;
          threshold?: number;
          latitude: number;
          longitude: number;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: SensorType;
          label?: string;
          location?: string;
          zone_id?: string | null;
          status?: SensorStatus;
          value?: number;
          unit?: string;
          threshold?: number;
          latitude?: number;
          longitude?: number;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sensors_zone_id_fkey';
            columns: ['zone_id'];
            referencedRelation: 'campus_zones';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_responder_assignments: {
        Row: {
          id: string;
          incident_id: string;
          responder_id: string;
          assigned_at: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          responder_id: string;
          assigned_at?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          responder_id?: string;
          assigned_at?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_responder_assignments_incident_id_fkey';
            columns: ['incident_id'];
            referencedRelation: 'incidents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incident_responder_assignments_responder_id_fkey';
            columns: ['responder_id'];
            referencedRelation: 'responders';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_dispatcher_or_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      dispatch_responder: {
        Args: {
          p_incident_id: string;
          p_responder_id: string;
          p_eta_seconds?: number;
        };
        Returns: Json;
      };
      get_campus_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_incidents: number;
          active_incidents: number;
          resolved_today: number;
          responders_available: number;
          total_responders: number;
          sensors_online: number;
          total_sensors: number;
          safe_zones: number;
          total_zones: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      incident_severity: IncidentSeverity;
      incident_status: IncidentStatus;
      incident_type: IncidentType;
      responder_status: ResponderStatus;
      alert_audience: AlertAudience;
      alert_type: AlertType;
      zone_status: ZoneStatus;
      sensor_status: SensorStatus;
      sensor_type: SensorType;
    };
  };
}
