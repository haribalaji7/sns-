// ─── Shared TypeScript Types for CampusShield AI ──────────────────────────

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'active' | 'responding' | 'contained' | 'resolved' | 'false_alarm';
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
  | 'other';
export type ResponderStatus = 'available' | 'dispatched' | 'on_scene' | 'offline';
export type ZoneStatus = 'safe' | 'caution' | 'danger' | 'evacuating';
export type SensorStatus = 'normal' | 'warning' | 'alert' | 'offline';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  zone: string;
  coordinates: Coordinates;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  aiConfidence: number;         // 0–100
  peopleAtRisk: number;
  assignedResponders: string[];
  cameraIds: string[];
  tags: string[];
}

export interface Responder {
  id: string;
  name: string;
  role: string;
  team: string;
  status: ResponderStatus;
  coordinates: Coordinates;
  etaSeconds: number;
  phone: string;
  radioChannel: string;
  certifications: string[];
  currentIncidentId?: string;
  avatarUrl?: string;
}

export interface CampusZone {
  id: string;
  name: string;
  status: ZoneStatus;
  occupancy: number;
  capacity: number;
  sensors: number;
  activeSensors: number;
  coordinates: Coordinates;
  bounds: [number, number][];
  riskScore: number;            // 0–100
}

export interface Sensor {
  id: string;
  type: 'smoke' | 'motion' | 'thermal' | 'chemical' | 'sound' | 'access';
  label: string;
  location: string;
  zoneId: string;
  status: SensorStatus;
  value: number;
  unit: string;
  threshold: number;
  lastUpdated: string;
  coordinates: Coordinates;
}

export interface AIAlert {
  id: string;
  incidentId?: string;
  type: 'prediction' | 'anomaly' | 'pattern' | 'recommendation';
  severity: IncidentSeverity;
  title: string;
  message: string;
  confidence: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface SystemMetrics {
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  avgResponseTime: number;      // seconds
  aiAccuracy: number;           // %
  sensorsOnline: number;
  totalSensors: number;
  respondersAvailable: number;
  totalResponders: number;
  campusOccupancy: number;
  safeZones: number;
  totalZones: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
  color?: string;
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  duration?: number;
}
