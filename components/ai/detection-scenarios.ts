import { IncidentType, IncidentSeverity } from '@/types';

export type DetectionSource = 'cctv' | 'upload' | 'student_sos' | 'voice_transcript' | 'officer_report';

export interface BoundingBoxItem {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  color: string;
  category: 'threat' | 'person' | 'hazard' | 'asset';
  telemetry?: Record<string, string | number>;
}

export interface RiskFactorBreakdown {
  incidentTypeScore: number; // 0-35
  occupancyScore: number;    // 0-25
  timeScore: number;         // 0-15
  locationScore: number;     // 0-15
  nearbyBuildingsScore: number; // 0-5
  previousIncidentsScore: number; // 0-5
  totalScore: number;        // 0-100
}

export interface DetectionScenario {
  id: string;
  type: IncidentType;
  title: string;
  severity: IncidentSeverity;
  source: DetectionSource;
  confidence: number;
  riskScore: number;
  occupancy: number;
  location: string;
  zone: string;
  coordinates: { lat: number; lng: number };
  cameraId?: string;
  cameraName?: string;
  imageUrl: string;
  recommendation: string;
  objects: BoundingBoxItem[];
  riskFactors: RiskFactorBreakdown;
  evidence: {
    sourceType: string;
    sourceId: string;
    timestamp: string;
    studentMessage?: string;
    studentName?: string;
    studentId?: string;
    audioDuration?: string;
    audioWaveform?: number[];
    voiceTranscript?: string;
    officerName?: string;
    officerBadge?: string;
    officerNotes?: string;
    gpsAccuracy?: string;
    sensorTelemetries?: { label: string; value: string; status: 'normal' | 'alert' | 'warning' }[];
  };
  suggestedActions: {
    id: string;
    label: string;
    actionType: 'dispatch' | 'evacuate' | 'suppression' | 'broadcast' | 'lockdown';
    primary?: boolean;
  }[];
}

export const CCTV_CAMERAS = [
  { id: 'CAM-B3-01', name: 'Science Lab 302', location: 'Science Block B – Floor 3', zone: 'Z-SCIB', status: 'alert', resolution: '4K · 60 FPS', bitrate: '6.4 Mbps', defaultIncident: 'scen-fire' },
  { id: 'CAM-IT-02', name: 'IT Substation B1', location: 'IT Building – Basement', zone: 'Z-ITB', status: 'alert', resolution: '1080P · 30 FPS', bitrate: '4.2 Mbps', defaultIncident: 'scen-electrical' },
  { id: 'CAM-ATH-03', name: 'Athletic Track Arena', location: 'Athletic Pavilion', zone: 'Z-ATH', status: 'alert', resolution: '4K · 60 FPS', bitrate: '8.1 Mbps', defaultIncident: 'scen-medical' },
  { id: 'CAM-LIB-04', name: 'Library Archives B1', location: 'Main Library B1', zone: 'Z-LIB', status: 'warning', resolution: '1080P · 30 FPS', bitrate: '3.8 Mbps', defaultIncident: 'scen-gas' },
  { id: 'CAM-GATE-01', name: 'Main North Gate', location: 'North Perimeter Gate', zone: 'Z-GATE', status: 'normal', resolution: '4K · 60 FPS', bitrate: '5.5 Mbps', defaultIncident: 'scen-violence' },
  { id: 'CAM-QUAD-05', name: 'Central Quad Walkway', location: 'Auditorium Plaza', zone: 'Z-ADMIN', status: 'warning', resolution: '4K · 60 FPS', bitrate: '7.0 Mbps', defaultIncident: 'scen-crowd' },
];

export const DETECTION_SCENARIOS: Record<string, DetectionScenario> = {
  // 1. FIRE
  'scen-fire': {
    id: 'scen-fire',
    type: 'fire',
    title: 'Thermal Spike & Active Flame',
    severity: 'critical',
    source: 'cctv',
    confidence: 96,
    riskScore: 92,
    occupancy: 42,
    location: 'Science Block B – Floor 3, Lab 302',
    zone: 'Z-SCIB',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    cameraId: 'CAM-B3-01',
    cameraName: 'Science Lab 302 (Overhead High-Angle)',
    imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Fire detected inside Science Lab 302 with 96% confidence. Estimated occupancy is 42 people. Dispatch Squad Alpha immediately, initiate automatic evacuation through Exit B, and trip chemical hood dampers.',
    objects: [
      { id: 'obj-1', label: 'Active Combustion Flame', confidence: 96, x: 38, y: 26, w: 24, h: 32, color: '#FF4D6D', category: 'hazard', telemetry: { temp: '342 °C', spreadRate: '0.4 m/s', fuelType: 'Hydrocarbon / Solvent' } },
      { id: 'obj-2', label: 'Dense Smoke Plume', confidence: 91, x: 28, y: 12, w: 45, h: 28, color: '#FFB347', category: 'hazard', telemetry: { co2: '1420 ppm', opacity: '78%' } },
      { id: 'obj-3', label: 'Person (Evacuating)', confidence: 88, x: 70, y: 48, w: 14, h: 38, color: '#14F1D9', category: 'person', telemetry: { velocity: '1.8 m/s', state: 'Moving to Exit B' } },
      { id: 'obj-4', label: 'Chemical Solvent Cabinet', confidence: 84, x: 18, y: 40, w: 18, h: 30, color: '#7C5CFF', category: 'asset', telemetry: { flammables: 'Ethanol, Acetone', isolationState: 'Compromised' } },
    ],
    riskFactors: {
      incidentTypeScore: 35,
      occupancyScore: 21,
      timeScore: 12,
      locationScore: 14,
      nearbyBuildingsScore: 5,
      previousIncidentsScore: 5,
      totalScore: 92,
    },
    evidence: {
      sourceType: 'CCTV Neural Stream (YOLOv11x + FLIR Thermal)',
      sourceId: 'CAM-B3-01 (Sensor SEN-002)',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.2 meters (Indoor Beacon ID: B3-302)',
      sensorTelemetries: [
        { label: 'Thermal Anomaly', value: '342.4 °C', status: 'alert' },
        { label: 'Optical Smoke', value: '87 ppm (Limit: 40)', status: 'alert' },
        { label: 'Sprinkler Solenoid', value: 'Armed (Pressure 120 PSI)', status: 'warning' },
      ],
    },
    suggestedActions: [
      { id: 'act-1', label: 'Dispatch Squad Alpha (Fire Lead Cpt. Rivera)', actionType: 'dispatch', primary: true },
      { id: 'act-2', label: 'Initiate Zone B Mass Evacuation via Exit B', actionType: 'evacuate' },
      { id: 'act-3', label: 'Deploy Halon / CO2 Fire Suppression System', actionType: 'suppression' },
      { id: 'act-4', label: 'Broadcast Audio Evacuation Sirens to Science Block', actionType: 'broadcast' },
    ],
  },

  // 2. SMOKE
  'scen-smoke': {
    id: 'scen-smoke',
    type: 'smoke',
    title: 'Heavy Smoke Dispersion & Particulate Spike',
    severity: 'high',
    source: 'cctv',
    confidence: 94,
    riskScore: 78,
    occupancy: 24,
    location: 'Main Library – Basement Archives B1',
    zone: 'Z-LIB',
    coordinates: { lat: 28.6148, lng: 77.2098 },
    cameraId: 'CAM-LIB-04',
    cameraName: 'Library B1 Stack Corridor',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Heavy smoke plume identified in Library Archives B1 with 94% confidence. Optical visibility reduced to 40%. Trigger HVAC negative-pressure exhaust and deploy inspection team.',
    objects: [
      { id: 'obj-s1', label: 'Heavy Smoke Cloud', confidence: 94, x: 22, y: 18, w: 56, h: 48, color: '#FFB347', category: 'hazard', telemetry: { opacity: '64%', particulateDensity: 'PM2.5 > 380' } },
      { id: 'obj-s2', label: 'Obscured Emergency Exit', confidence: 89, x: 76, y: 35, w: 18, h: 42, color: '#FF4D6D', category: 'hazard', telemetry: { visibility: 'Low (1.2m)' } },
    ],
    riskFactors: {
      incidentTypeScore: 24,
      occupancyScore: 16,
      timeScore: 12,
      locationScore: 14,
      nearbyBuildingsScore: 6,
      previousIncidentsScore: 6,
      totalScore: 78,
    },
    evidence: {
      sourceType: 'Multi-Sensor Fusion (CCTV + Optical Smoke)',
      sourceId: 'CAM-LIB-04',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±2.0 meters',
      sensorTelemetries: [
        { label: 'Optical Obscuration', value: '4.8 %/m', status: 'alert' },
        { label: 'Air Quality PM2.5', value: '412 µg/m³', status: 'alert' },
      ],
    },
    suggestedActions: [
      { id: 'act-s1', label: 'Dispatch HVAC & Safety Patrol', actionType: 'dispatch', primary: true },
      { id: 'act-s2', label: 'Activate Emergency Basement Smoke Evacuation Fans', actionType: 'suppression' },
    ],
  },

  // 3. PERSON FALLEN
  'scen-person-fallen': {
    id: 'scen-person-fallen',
    type: 'person_fallen',
    title: 'Unresponsive Fallen Individual',
    severity: 'high',
    source: 'cctv',
    confidence: 91,
    riskScore: 68,
    occupancy: 6,
    location: 'Central Student Quad – West Walkway',
    zone: 'Z-ADMIN',
    coordinates: { lat: 28.6152, lng: 77.2088 },
    cameraId: 'CAM-QUAD-05',
    cameraName: 'Quad West Walkway PTZ',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Pose estimation neural model detected prone fallen subject motionless for >45 seconds. Immediate medical assessment required.',
    objects: [
      { id: 'obj-f1', label: 'Motionless Fallen Person', confidence: 91, x: 42, y: 55, w: 32, h: 22, color: '#FF4D6D', category: 'threat', telemetry: { posture: 'Prone horizontal', motionlessDuration: '52s' } },
      { id: 'obj-f2', label: 'Bystander (Approaching)', confidence: 85, x: 22, y: 38, w: 14, h: 42, color: '#14F1D9', category: 'person', telemetry: { distance: '4.2m' } },
    ],
    riskFactors: {
      incidentTypeScore: 22,
      occupancyScore: 10,
      timeScore: 12,
      locationScore: 12,
      nearbyBuildingsScore: 6,
      previousIncidentsScore: 6,
      totalScore: 68,
    },
    evidence: {
      sourceType: 'AI Pose Estimation & Anomaly Tracker',
      sourceId: 'CAM-QUAD-05',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.5 meters',
    },
    suggestedActions: [
      { id: 'act-f1', label: 'Dispatch Nearest First Responder (Off. Marcus Webb)', actionType: 'dispatch', primary: true },
      { id: 'act-f2', label: 'Notify Campus Health Center EMT', actionType: 'dispatch' },
    ],
  },

  // 4. MEDICAL EMERGENCY
  'scen-medical': {
    id: 'scen-medical',
    type: 'medical',
    title: 'Cardiac Emergency / Student Collapse',
    severity: 'critical',
    source: 'cctv',
    confidence: 98,
    riskScore: 88,
    occupancy: 18,
    location: 'Athletic Center – Indoor Running Track',
    zone: 'Z-ATH',
    coordinates: { lat: 28.6130, lng: 77.2095 },
    cameraId: 'CAM-ATH-03',
    cameraName: 'Athletic Arena Track Sector 2',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Cardiac event detected on Athletic Track. Automated AED Beacon #4 activated. Dispatch Paramedic Dr. Sarah Mills with advanced life support unit immediately.',
    objects: [
      { id: 'obj-m1', label: 'Collapsed Athlete (Cardiac Event)', confidence: 98, x: 44, y: 50, w: 26, h: 28, color: '#FF4D6D', category: 'hazard', telemetry: { vitalsAlert: 'Pulse Anomaly', aedProximity: '14 meters' } },
      { id: 'obj-m2', label: 'AED Station Beacon #4', confidence: 95, x: 18, y: 22, w: 12, h: 18, color: '#22D3A5', category: 'asset', telemetry: { beaconState: 'Transmitting', battery: '99%' } },
      { id: 'obj-m3', label: 'First Aid Responder / Coach', confidence: 89, x: 32, y: 44, w: 16, h: 36, color: '#14F1D9', category: 'person', telemetry: { cprInProg: 'Active' } },
    ],
    riskFactors: {
      incidentTypeScore: 32,
      occupancyScore: 18,
      timeScore: 14,
      locationScore: 12,
      nearbyBuildingsScore: 6,
      previousIncidentsScore: 6,
      totalScore: 88,
    },
    evidence: {
      sourceType: 'CCTV Vision + AED BLE Telemetry Gateway',
      sourceId: 'CAM-ATH-03 (AED-BEACON-04)',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±0.8 meters',
      sensorTelemetries: [
        { label: 'AED Beacon #4', value: 'Beacon Deployed & Lid Open', status: 'alert' },
        { label: 'Campus Ambulance Gate', value: 'South Gate Intercom Opened', status: 'normal' },
      ],
    },
    suggestedActions: [
      { id: 'act-m1', label: 'Dispatch ALS Paramedic Unit (Dr. Sarah Mills)', actionType: 'dispatch', primary: true },
      { id: 'act-m2', label: 'Open Emergency Vehicle Gate 3 for Ambulance', actionType: 'evacuate' },
    ],
  },

  // 5. VIOLENCE
  'scen-violence': {
    id: 'scen-violence',
    type: 'violence',
    title: 'Physical Altercation & High Aggression',
    severity: 'high',
    source: 'cctv',
    confidence: 93,
    riskScore: 85,
    occupancy: 12,
    location: 'North Entrance Gate Complex',
    zone: 'Z-GATE',
    coordinates: { lat: 28.6155, lng: 77.2075 },
    cameraId: 'CAM-GATE-01',
    cameraName: 'Gate 1 Perimeter Entrance',
    imageUrl: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Aggression vectors and rapid physical conflict detected between multiple individuals near Gate 1. Dispatch Security Squad Beta to de-escalate and secure perimeter.',
    objects: [
      { id: 'obj-v1', label: 'Aggression Interaction Vector', confidence: 93, x: 38, y: 35, w: 28, h: 42, color: '#FF4D6D', category: 'threat', telemetry: { kineticVelocity: '3.4 m/s', strikeCount: '4 flagged' } },
      { id: 'obj-v2', label: 'Subject A', confidence: 90, x: 34, y: 38, w: 14, h: 40, color: '#7C5CFF', category: 'person' },
      { id: 'obj-v3', label: 'Subject B', confidence: 89, x: 48, y: 36, w: 15, h: 42, color: '#7C5CFF', category: 'person' },
    ],
    riskFactors: {
      incidentTypeScore: 28,
      occupancyScore: 16,
      timeScore: 15,
      locationScore: 14,
      nearbyBuildingsScore: 6,
      previousIncidentsScore: 6,
      totalScore: 85,
    },
    evidence: {
      sourceType: 'CCTV Neural Movement Kinematics Model',
      sourceId: 'CAM-GATE-01',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.8 meters',
    },
    suggestedActions: [
      { id: 'act-v1', label: 'Dispatch Security Lead Sgt. Priya Sharma', actionType: 'dispatch', primary: true },
      { id: 'act-v2', label: 'Lock Outer Gate Barrier Turnstiles', actionType: 'lockdown' },
    ],
  },

  // 6. CROWD GATHERING
  'scen-crowd': {
    id: 'scen-crowd',
    type: 'crowd',
    title: 'Abnormal Crowd Density & Bottleneck Surge',
    severity: 'medium',
    source: 'cctv',
    confidence: 89,
    riskScore: 74,
    occupancy: 280,
    location: 'Auditorium Central Corridor Plaza',
    zone: 'Z-ADMIN',
    coordinates: { lat: 28.6146, lng: 77.2086 },
    cameraId: 'CAM-QUAD-05',
    cameraName: 'Auditorium Plaza High-Wide',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Crowd density exceeded 4.2 persons/m² at Entry D. Predictive model warns of 92% bottleneck risk. Deploy 2 crowd marshals to redirect flow through Quad Wing E.',
    objects: [
      { id: 'obj-c1', label: 'High Density Crowd Cluster', confidence: 89, x: 25, y: 30, w: 55, h: 50, color: '#38BDF8', category: 'hazard', telemetry: { density: '4.4 persons/m²', capacityExceeded: '+160%' } },
      { id: 'obj-c2', label: 'Entry Door Bottleneck', confidence: 92, x: 68, y: 25, w: 18, h: 32, color: '#FFB347', category: 'hazard', telemetry: { throughputRate: '0.6 p/sec (Choked)' } },
    ],
    riskFactors: {
      incidentTypeScore: 20,
      occupancyScore: 24,
      timeScore: 12,
      locationScore: 10,
      nearbyBuildingsScore: 4,
      previousIncidentsScore: 4,
      totalScore: 74,
    },
    evidence: {
      sourceType: 'AI Crowd Density Estimator (YOLOv11x-Crowd)',
      sourceId: 'CAM-QUAD-05',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±2.5 meters',
    },
    suggestedActions: [
      { id: 'act-c1', label: 'Pre-position 2 Campus Patrol Officers', actionType: 'dispatch', primary: true },
      { id: 'act-c2', label: 'Open Aux Exit Doors E1 & E2', actionType: 'evacuate' },
    ],
  },

  // 7. FLOOD
  'scen-flood': {
    id: 'scen-flood',
    type: 'flood',
    title: 'Substation Water Pipe Rupture & Pooling',
    severity: 'high',
    source: 'cctv',
    confidence: 87,
    riskScore: 79,
    occupancy: 8,
    location: 'IT Building – Substation Basement B1',
    zone: 'Z-ITB',
    coordinates: { lat: 28.6145, lng: 77.2085 },
    cameraId: 'CAM-IT-02',
    cameraName: 'IT Server Room B1 Utility Corridor',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Water accumulation pooling detected near server racks B4-B8. Water level sensor reads 4.2cm. Cut main chiller valve and dispatch facilities engineer.',
    objects: [
      { id: 'obj-w1', label: 'Water Pooling & Reflection', confidence: 87, x: 20, y: 55, w: 60, h: 35, color: '#22D3A5', category: 'hazard', telemetry: { depthEst: '4.2 cm', areaSqM: '18 m²' } },
      { id: 'obj-w2', label: 'High Voltage Server Rack', confidence: 94, x: 65, y: 20, w: 22, h: 55, color: '#FF4D6D', category: 'asset', telemetry: { breakerRisk: 'Critical - Proximity < 1m' } },
    ],
    riskFactors: {
      incidentTypeScore: 26,
      occupancyScore: 10,
      timeScore: 12,
      locationScore: 15,
      nearbyBuildingsScore: 8,
      previousIncidentsScore: 8,
      totalScore: 79,
    },
    evidence: {
      sourceType: 'Computer Vision Water Specular Analysis + Flow Sensor',
      sourceId: 'CAM-IT-02 (SEN-FLOOD-02)',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.2 meters',
      sensorTelemetries: [
        { label: 'Liquid Immersion Sensor', value: '4.2 cm (Water Level High)', status: 'alert' },
        { label: 'Chiller Loop Pressure', value: 'Drop to 18 PSI', status: 'warning' },
      ],
    },
    suggestedActions: [
      { id: 'act-w1', label: 'Dispatch Facilities Electrical & Plumbing Lead', actionType: 'dispatch', primary: true },
      { id: 'act-w2', label: 'Remotely Isolate Substation B Breaker #3', actionType: 'suppression' },
    ],
  },

  // 8. ELECTRICAL HAZARD
  'scen-electrical': {
    id: 'scen-electrical',
    type: 'electrical',
    title: 'High-Voltage Arc Flash & Spark Anomaly',
    severity: 'critical',
    source: 'cctv',
    confidence: 95,
    riskScore: 94,
    occupancy: 14,
    location: 'IT Building – Basement Substation B',
    zone: 'Z-ITB',
    coordinates: { lat: 28.6145, lng: 77.2085 },
    cameraId: 'CAM-IT-02',
    cameraName: 'Power Distribution Room B',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Arc flash plasma sparks identified at Transformer Panel 4. High risk of electrical combustion. De-energize feeder line 11kV-B and dispatch HazMat/Fire squad.',
    objects: [
      { id: 'obj-e1', label: 'High Voltage Arc Flash Sparks', confidence: 95, x: 42, y: 32, w: 22, h: 26, color: '#7C5CFF', category: 'hazard', telemetry: { voltage: '11,000 V', sparkFlashes: '12 per sec' } },
      { id: 'obj-e2', label: 'Main Transformer Unit 2', confidence: 92, x: 26, y: 25, w: 48, h: 58, color: '#FF4D6D', category: 'asset', telemetry: { internalTemp: '118 °C (Overheat)' } },
    ],
    riskFactors: {
      incidentTypeScore: 35,
      occupancyScore: 15,
      timeScore: 14,
      locationScore: 15,
      nearbyBuildingsScore: 8,
      previousIncidentsScore: 7,
      totalScore: 94,
    },
    evidence: {
      sourceType: 'High-Speed Optical Flame / Arc Detector + Grid Relay',
      sourceId: 'CAM-IT-02 (RELAY-SUB-04)',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.0 meters',
      sensorTelemetries: [
        { label: 'Relay Trip Status', value: 'Overcurrent Zone 4 Trip', status: 'alert' },
        { label: 'Transformer Oil Temp', value: '118.2 °C', status: 'alert' },
      ],
    },
    suggestedActions: [
      { id: 'act-e1', label: 'Emergency De-Energize Feeder Line 11kV-B', actionType: 'suppression', primary: true },
      { id: 'act-e2', label: 'Dispatch HAZMAT Tactical Squad Alpha', actionType: 'dispatch' },
    ],
  },

  // 9. GAS LEAK
  'scen-gas': {
    id: 'scen-gas',
    type: 'gas_leak',
    title: 'Hazardous Chemical Vapour & VOC Spike',
    severity: 'high',
    source: 'cctv',
    confidence: 92,
    riskScore: 89,
    occupancy: 36,
    location: 'Science Block B – Chemistry Wing B2',
    zone: 'Z-SCIB',
    coordinates: { lat: 28.6140, lng: 77.2091 },
    cameraId: 'CAM-B3-01',
    cameraName: 'Chemistry Wing Storage B2',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&auto=format&fit=crop&q=80',
    recommendation: 'Toxic VOC/Ammonia vapour plume detected in Chemistry Wing. Concentration reached 850ppm. Evacuate Floor 2 & 3 and activate emergency scrubber ventilation.',
    objects: [
      { id: 'obj-g1', label: 'Vapour Plume (Chemical Gas)', confidence: 92, x: 30, y: 25, w: 42, h: 45, color: '#22D3A5', category: 'hazard', telemetry: { chemical: 'Ammonia / VOC', concentration: '850 ppm' } },
      { id: 'obj-g2', label: 'Exhaust Scrubber Duct', confidence: 88, x: 72, y: 15, w: 18, h: 35, color: '#14F1D9', category: 'asset', telemetry: { status: 'Damper closed' } },
    ],
    riskFactors: {
      incidentTypeScore: 32,
      occupancyScore: 20,
      timeScore: 12,
      locationScore: 15,
      nearbyBuildingsScore: 5,
      previousIncidentsScore: 5,
      totalScore: 89,
    },
    evidence: {
      sourceType: 'Photoionization Detector + FLIR Optical Gas Imaging',
      sourceId: 'CAM-B3-01 (SEN-006)',
      timestamp: new Date().toLocaleTimeString(),
      gpsAccuracy: '±1.1 meters',
      sensorTelemetries: [
        { label: 'VOC Detector', value: '850 ppm (LEL: 18%)', status: 'alert' },
        { label: 'CO2 Level', value: '1840 ppm', status: 'warning' },
      ],
    },
    suggestedActions: [
      { id: 'act-g1', label: 'Dispatch HAZMAT Lead Cpt. Rivera', actionType: 'dispatch', primary: true },
      { id: 'act-g2', label: 'Activate Emergency Chemical Air Scrubbers', actionType: 'suppression' },
    ],
  },
};

// ─── Student SOS Scenario ──────────────────────────────────────────────────
export const STUDENT_SOS_PRESET: DetectionScenario = {
  id: 'scen-sos-1',
  type: 'medical',
  title: 'Student Mobile Panic SOS Beacon',
  severity: 'critical',
  source: 'student_sos',
  confidence: 99,
  riskScore: 91,
  occupancy: 2,
  location: 'Dormitory Quad – Building A Floor 2',
  zone: 'Z-ADMIN',
  coordinates: { lat: 28.6151, lng: 77.2084 },
  imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
  recommendation: 'Student Maya Lin triggered Emergency SOS Beacon (3 panic taps). Message indicates severe allergic reaction / anaphylaxis. Immediate epinephrine / EMT dispatch required.',
  objects: [
    { id: 'sos-1', label: 'Student SOS GPS Ping', confidence: 99, x: 45, y: 40, w: 20, h: 25, color: '#FF4D6D', category: 'hazard' },
  ],
  riskFactors: {
    incidentTypeScore: 32,
    occupancyScore: 10,
    timeScore: 15,
    locationScore: 14,
    nearbyBuildingsScore: 10,
    previousIncidentsScore: 10,
    totalScore: 91,
  },
  evidence: {
    sourceType: 'CampusShield Mobile App SOS Trigger',
    sourceId: 'SOS-USER-8821 (App v2.4.1)',
    timestamp: new Date().toLocaleTimeString(),
    studentName: 'Maya Lin',
    studentId: 'STU-2024-8841 (Bioengineering, Sophomore)',
    studentMessage: 'HELP! Severe anaphylactic reaction in Dorm A room 214. Throat swelling fast, epi-pen expired.',
    gpsAccuracy: '±3.2 meters (Indoor Wi-Fi Triangulation: Dorm A AP-08)',
  },
  suggestedActions: [
    { id: 'act-sos-1', label: 'Dispatch EMT / Paramedic Dr. Mills with Epinephrine', actionType: 'dispatch', primary: true },
    { id: 'act-sos-2', label: 'Send Automated Reassurance SMS to Student', actionType: 'broadcast' },
  ],
};

// ─── Voice Transcript Scenario ─────────────────────────────────────────────
export const VOICE_TRANSCRIPT_PRESET: DetectionScenario = {
  id: 'scen-voice-1',
  type: 'fire',
  title: '911 Emergency Radio Dispatch Audio',
  severity: 'critical',
  source: 'voice_transcript',
  confidence: 96,
  riskScore: 93,
  occupancy: 42,
  location: 'Science Block B – Floor 3, Chemistry Lab',
  zone: 'Z-SCIB',
  coordinates: { lat: 28.6139, lng: 77.2090 },
  imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=900&auto=format&fit=crop&q=80',
  recommendation: 'Voice transcript indicates active chemical flame with dense acrid smoke in Science Lab 302. Evacuation in progress. Multiple students in hallway.',
  objects: [
    { id: 'v-1', label: 'Audio Flag: "Fire inside Lab 302"', confidence: 98, x: 35, y: 30, w: 30, h: 30, color: '#FF4D6D', category: 'hazard' },
  ],
  riskFactors: {
    incidentTypeScore: 35,
    occupancyScore: 22,
    timeScore: 12,
    locationScore: 14,
    nearbyBuildingsScore: 5,
    previousIncidentsScore: 5,
    totalScore: 93,
  },
  evidence: {
    sourceType: 'Emergency 911 Call Stream (Whisper + Gemini Audio NLP)',
    sourceId: 'AUDIO-CH-911-042',
    timestamp: new Date().toLocaleTimeString(),
    audioDuration: '00:34',
    audioWaveform: [24, 45, 78, 92, 60, 45, 88, 95, 72, 50, 65, 89, 94, 76, 40, 58, 85, 91, 70, 35],
    voiceTranscript: '"Campus Dispatch, this is Professor Vance in Science Lab 302! A solvent beaker ignited near fume hood 2. We have active flames spreading to the overhead shelf and heavy black smoke. We are evacuating about 40 students right now through Exit B! Send Squad Alpha immediately!"',
  },
  suggestedActions: [
    { id: 'act-v-1', label: 'Dispatch Squad Alpha Fire Suppression', actionType: 'dispatch', primary: true },
    { id: 'act-v-2', label: 'Broadcast Fire Alarm Signal to Science Block', actionType: 'broadcast' },
  ],
};

// ─── Security Officer Report Preset ────────────────────────────────────────
export const OFFICER_REPORT_PRESET: DetectionScenario = {
  id: 'scen-officer-1',
  type: 'violence',
  title: 'Officer Field Triage & Rapid Incident Scan',
  severity: 'high',
  source: 'officer_report',
  confidence: 95,
  riskScore: 84,
  occupancy: 15,
  location: 'North Entrance Gate 1 Complex',
  zone: 'Z-GATE',
  coordinates: { lat: 28.6155, lng: 77.2075 },
  imageUrl: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=900&auto=format&fit=crop&q=80',
  recommendation: 'Officer #105 reports perimeter disturbance with aggressive breach attempt. Officer requesting backup unit to secure turnstile entrance.',
  objects: [
    { id: 'off-1', label: 'Field Flag: Perimeter Breach', confidence: 95, x: 40, y: 35, w: 25, h: 30, color: '#FF4D6D', category: 'threat' },
  ],
  riskFactors: {
    incidentTypeScore: 28,
    occupancyScore: 16,
    timeScore: 14,
    locationScore: 14,
    nearbyBuildingsScore: 6,
    previousIncidentsScore: 6,
    totalScore: 84,
  },
  evidence: {
    sourceType: 'Security Officer Handheld Terminal (Radio ID: CH-2)',
    sourceId: 'OFFICER-UNIT-105',
    timestamp: new Date().toLocaleTimeString(),
    officerName: 'Off. Marcus Webb',
    officerBadge: 'BADGE-#105 (Security Wing A)',
    officerNotes: 'Encountered 2 non-campus individuals attempting forced entry past Barrier Gate 1. Verbal hostility escalated. Requesting Sgt. Sharma unit for backup.',
    gpsAccuracy: '±1.0 meters',
  },
  suggestedActions: [
    { id: 'act-off-1', label: 'Dispatch Sgt. Priya Sharma (Backup Unit)', actionType: 'dispatch', primary: true },
    { id: 'act-off-2', label: 'Engage Gate 1 Emergency Lockdown Bar', actionType: 'lockdown' },
  ],
};
