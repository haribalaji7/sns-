import type {
  Incident, Responder, CampusZone, Sensor, AIAlert, SystemMetrics,
} from '@/types';

// ─── System Metrics ────────────────────────────────────────────────────────
export const MOCK_METRICS: SystemMetrics = {
  totalIncidents:      47,
  activeIncidents:      3,
  resolvedToday:       12,
  avgResponseTime:    134,    // seconds → 2m 14s
  aiAccuracy:        97.4,
  sensorsOnline:      218,
  totalSensors:       224,
  respondersAvailable: 9,
  totalResponders:    16,
  campusOccupancy:  4820,
  safeZones:           6,
  totalZones:          8,
};

// ─── Incidents ────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-0091',
    type: 'fire',
    severity: 'critical',
    status: 'active',
    title: 'Thermal Spike + Smoke – Lab 302',
    description: 'Multiple smoke sensors triggered simultaneously. Thermal camera detected 340 °C anomaly near fume hood. Possible chemical fire.',
    location: 'Science Block B – Floor 3, Room 302',
    zone: 'Z-SCIB',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    reportedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 1000).toISOString(),
    aiConfidence: 98.4,
    peopleAtRisk: 42,
    assignedResponders: ['R-101', 'R-103'],
    cameraIds: ['CAM-B3-01', 'CAM-B3-02'],
    tags: ['fire', 'chemical', 'lab'],
  },
  {
    id: 'INC-0090',
    type: 'intrusion',
    severity: 'high',
    status: 'responding',
    title: 'Unauthorized Access – Server Room',
    description: 'Access control breach detected. Badge scan failed 3 times before forced entry. Motion detected inside restricted zone.',
    location: 'IT Building – Basement B1',
    zone: 'Z-ITB',
    coordinates: { lat: 28.6145, lng: 77.2085 },
    reportedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    aiConfidence: 93.1,
    peopleAtRisk: 0,
    assignedResponders: ['R-102'],
    cameraIds: ['CAM-IT-B01'],
    tags: ['access', 'intrusion', 'restricted'],
  },
  {
    id: 'INC-0089',
    type: 'medical',
    severity: 'high',
    status: 'responding',
    title: 'Cardiac Event – Athletic Center',
    description: 'Student collapsed on indoor track. AED beacon activated. Paramedics dispatched.',
    location: 'Athletic Center – Indoor Track',
    zone: 'Z-ATH',
    coordinates: { lat: 28.6130, lng: 77.2095 },
    reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    aiConfidence: 99.1,
    peopleAtRisk: 1,
    assignedResponders: ['R-104'],
    cameraIds: ['CAM-ATH-03'],
    tags: ['medical', 'cardiac', 'aed'],
  },
  {
    id: 'INC-0088',
    type: 'suspicious',
    severity: 'medium',
    status: 'contained',
    title: 'Unattended Package – Main Gate',
    description: 'Backpack left unattended for 22 minutes near main entrance. Bomb disposal unit cleared it – false alarm.',
    location: 'Main Entrance Gate – North',
    zone: 'Z-GATE',
    coordinates: { lat: 28.6155, lng: 77.2075 },
    reportedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    aiConfidence: 84.7,
    peopleAtRisk: 0,
    assignedResponders: [],
    cameraIds: ['CAM-GATE-01'],
    tags: ['suspicious', 'package'],
  },
  {
    id: 'INC-0087',
    type: 'gas_leak',
    severity: 'medium',
    status: 'resolved',
    title: 'Chemical Vapour – Library Basement',
    description: 'CO2 and VOC sensors flagged. Ventilation activated automatically. Area cleared within 18 minutes.',
    location: 'Main Library – Basement Archives',
    zone: 'Z-LIB',
    coordinates: { lat: 28.6148, lng: 77.2098 },
    reportedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    aiConfidence: 91.2,
    peopleAtRisk: 18,
    assignedResponders: ['R-101'],
    cameraIds: ['CAM-LIB-B01'],
    tags: ['gas', 'chemical', 'ventilation'],
  },
];

// ─── Responders ────────────────────────────────────────────────────────────
export const MOCK_RESPONDERS: Responder[] = [
  {
    id: 'R-101',
    name: 'Cpt. Alex Rivera',
    role: 'Fire & HAZMAT Lead',
    team: 'Emergency Squad Alpha',
    status: 'on_scene',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    etaSeconds: 0,
    phone: '+91-99001-10101',
    radioChannel: 'CH-4 Tactical',
    certifications: ['Fire Suppression', 'HAZMAT-3', 'SCBA'],
    currentIncidentId: 'INC-0091',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
  {
    id: 'R-102',
    name: 'Sgt. Priya Sharma',
    role: 'Security Operations',
    team: 'Security Wing B',
    status: 'dispatched',
    coordinates: { lat: 28.6148, lng: 77.2088 },
    etaSeconds: 75,
    phone: '+91-99001-10102',
    radioChannel: 'CH-2 Security',
    certifications: ['Crowd Control', 'First Aid', 'Armed Response'],
    currentIncidentId: 'INC-0090',
  },
  {
    id: 'R-103',
    name: 'Lt. James Chen',
    role: 'Tactical Fire Unit',
    team: 'Emergency Squad Alpha',
    status: 'dispatched',
    coordinates: { lat: 28.6142, lng: 77.2092 },
    etaSeconds: 120,
    phone: '+91-99001-10103',
    radioChannel: 'CH-4 Tactical',
    certifications: ['Fire Suppression', 'High-Angle Rescue'],
    currentIncidentId: 'INC-0091',
  },
  {
    id: 'R-104',
    name: 'Dr. Sarah Mills',
    role: 'Advanced Paramedic',
    team: 'Medical Response Unit',
    status: 'on_scene',
    coordinates: { lat: 28.6130, lng: 77.2095 },
    etaSeconds: 0,
    phone: '+91-99001-10104',
    radioChannel: 'CH-9 Medical',
    certifications: ['ALS Paramedic', 'Cardiac Specialist', 'Trauma Triage'],
    currentIncidentId: 'INC-0089',
  },
  {
    id: 'R-105',
    name: 'Off. Marcus Webb',
    role: 'Campus Patrol',
    team: 'Security Wing A',
    status: 'available',
    coordinates: { lat: 28.6160, lng: 77.2080 },
    etaSeconds: 0,
    phone: '+91-99001-10105',
    radioChannel: 'CH-1 Patrol',
    certifications: ['Crowd Management', 'First Aid'],
  },
  {
    id: 'R-106',
    name: 'Off. Neha Patel',
    role: 'Perimeter Security',
    team: 'Security Wing A',
    status: 'available',
    coordinates: { lat: 28.6135, lng: 77.2070 },
    etaSeconds: 0,
    phone: '+91-99001-10106',
    radioChannel: 'CH-1 Patrol',
    certifications: ['Perimeter Control', 'CCTV Analysis'],
  },
];

// ─── Campus Zones ──────────────────────────────────────────────────────────
export const MOCK_ZONES: CampusZone[] = [
  {
    id: 'Z-SCIB', name: 'Science Block B', status: 'danger',
    occupancy: 340, capacity: 500, sensors: 48, activeSensors: 48,
    coordinates: { lat: 28.6139, lng: 77.2090 },
    bounds: [[28.6142, 77.2086], [28.6142, 77.2094], [28.6136, 77.2094], [28.6136, 77.2086]],
    riskScore: 94,
  },
  {
    id: 'Z-ITB', name: 'IT Building', status: 'caution',
    occupancy: 120, capacity: 300, sensors: 36, activeSensors: 34,
    coordinates: { lat: 28.6145, lng: 77.2085 },
    bounds: [[28.6148, 77.2082], [28.6148, 77.2088], [28.6142, 77.2088], [28.6142, 77.2082]],
    riskScore: 62,
  },
  {
    id: 'Z-ATH', name: 'Athletic Center', status: 'caution',
    occupancy: 190, capacity: 400, sensors: 24, activeSensors: 24,
    coordinates: { lat: 28.6130, lng: 77.2095 },
    bounds: [[28.6133, 77.2091], [28.6133, 77.2099], [28.6127, 77.2099], [28.6127, 77.2091]],
    riskScore: 71,
  },
  {
    id: 'Z-LIB', name: 'Main Library', status: 'safe',
    occupancy: 620, capacity: 800, sensors: 72, activeSensors: 70,
    coordinates: { lat: 28.6148, lng: 77.2098 },
    bounds: [[28.6151, 77.2094], [28.6151, 77.2102], [28.6145, 77.2102], [28.6145, 77.2094]],
    riskScore: 18,
  },
  {
    id: 'Z-GATE', name: 'Main Gate Complex', status: 'safe',
    occupancy: 45, capacity: 100, sensors: 16, activeSensors: 16,
    coordinates: { lat: 28.6155, lng: 77.2075 },
    bounds: [[28.6157, 77.2073], [28.6157, 77.2077], [28.6153, 77.2077], [28.6153, 77.2073]],
    riskScore: 22,
  },
  {
    id: 'Z-ADMIN', name: 'Administration Block', status: 'safe',
    occupancy: 280, capacity: 400, sensors: 40, activeSensors: 39,
    coordinates: { lat: 28.6152, lng: 77.2088 },
    bounds: [[28.6155, 77.2084], [28.6155, 77.2092], [28.6149, 77.2092], [28.6149, 77.2084]],
    riskScore: 12,
  },
];

// ─── Sensors ──────────────────────────────────────────────────────────────
export const MOCK_SENSORS: Sensor[] = [
  { id: 'SEN-001', type: 'smoke',   label: 'Smoke – Lab 302',       location: 'Science Block B', zoneId: 'Z-SCIB', status: 'alert',   value: 87,  unit: 'ppm', threshold: 40,  lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6139, lng: 77.2090 } },
  { id: 'SEN-002', type: 'thermal', label: 'Thermal – Lab 302',     location: 'Science Block B', zoneId: 'Z-SCIB', status: 'alert',   value: 342, unit: '°C',  threshold: 80,  lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6140, lng: 77.2091 } },
  { id: 'SEN-003', type: 'motion',  label: 'Motion – Server Room',  location: 'IT Building',     zoneId: 'Z-ITB',  status: 'warning', value: 1,   unit: '',    threshold: 0,   lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6145, lng: 77.2085 } },
  { id: 'SEN-004', type: 'access',  label: 'Access – Server Door',  location: 'IT Building',     zoneId: 'Z-ITB',  status: 'alert',   value: 3,   unit: 'fails',threshold: 3,  lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6146, lng: 77.2085 } },
  { id: 'SEN-005', type: 'smoke',   label: 'Smoke – Library B1',    location: 'Main Library',    zoneId: 'Z-LIB',  status: 'normal',  value: 8,   unit: 'ppm', threshold: 40,  lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6148, lng: 77.2098 } },
  { id: 'SEN-006', type: 'chemical',label: 'CO2 – Library B1',      location: 'Main Library',    zoneId: 'Z-LIB',  status: 'normal',  value: 412, unit: 'ppm', threshold: 1000,lastUpdated: new Date().toISOString(), coordinates: { lat: 28.6149, lng: 77.2099 } },
];

// ─── AI Alerts ────────────────────────────────────────────────────────────
export const MOCK_AI_ALERTS: AIAlert[] = [
  {
    id: 'AI-441', type: 'prediction', severity: 'high',
    title: 'Crowd Surge Predicted – Auditorium',
    message: 'Event starting in 40 min. Model predicts 94% chance of bottleneck at Entry D. Pre-position 2 guards.',
    confidence: 94, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), acknowledged: false,
  },
  {
    id: 'AI-440', type: 'anomaly', severity: 'medium',
    title: 'Unusual Access Pattern – Lab Wing',
    message: '14 badge scans in Lab Wing between 02:00–04:00 AM vs. historical average of 1.2. Investigate.',
    confidence: 87, timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), acknowledged: false,
  },
  {
    id: 'AI-439', type: 'recommendation', severity: 'low',
    title: 'Sensor Maintenance Due',
    message: 'Sensors SEN-018, SEN-041 have 92-day uptime without calibration. Schedule maintenance within 48h.',
    confidence: 100, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), acknowledged: true,
  },
];

// ─── Chart data helpers ────────────────────────────────────────────────────
export const INCIDENT_TREND_DATA = [
  { label: 'Mon', fire: 3, intrusion: 2, medical: 1, other: 2 },
  { label: 'Tue', fire: 1, intrusion: 4, medical: 2, other: 1 },
  { label: 'Wed', fire: 5, intrusion: 1, medical: 3, other: 3 },
  { label: 'Thu', fire: 2, intrusion: 3, medical: 0, other: 2 },
  { label: 'Fri', fire: 4, intrusion: 2, medical: 2, other: 4 },
  { label: 'Sat', fire: 1, intrusion: 5, medical: 1, other: 1 },
  { label: 'Sun', fire: 2, intrusion: 1, medical: 3, other: 2 },
];

export const RESPONSE_TIME_DATA = [
  { label: '6AM', value: 180 },
  { label: '9AM', value: 95 },
  { label: '12PM', value: 134 },
  { label: '3PM', value: 112 },
  { label: '6PM', value: 156 },
  { label: '9PM', value: 88 },
  { label: '12AM', value: 210 },
];

export const ZONE_RISK_DATA = MOCK_ZONES.map(z => {
  let label = z.name.split(' ')[0];
  if (z.name.includes('Library')) label = 'Library';
  if (z.name.includes('Gate')) label = 'Gate';
  return {
    label,
    value: z.riskScore,
    color: z.riskScore > 70 ? '#FF4D6D' : z.riskScore > 40 ? '#FFB347' : '#22D3A5',
  };
});
