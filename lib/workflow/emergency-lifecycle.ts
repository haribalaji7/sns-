/**
 * CampusShield AI — Complete Emergency Response Workflow
 * Manages the 12-state emergency response lifecycle with Supabase Realtime synchronization
 */

export type EmergencyStateKey =
  | 'normal'
  | 'potential_incident'
  | 'ai_detection'
  | 'verification'
  | 'confirmed'
  | 'risk_analysis'
  | 'responder_assigned'
  | 'evacuation'
  | 'live_monitoring'
  | 'contained'
  | 'resolved'
  | 'ai_report';

export interface EmergencyStateDef {
  key: EmergencyStateKey;
  stepNumber: number;
  label: string;
  shortLabel: string;
  responsibleActor: string;
  color: string;
  iconType: string;
  description: string;
  telemetryLog: string;
  durationEst: string;
}

export const EMERGENCY_12_STATES: EmergencyStateDef[] = [
  {
    key: 'normal',
    stepNumber: 1,
    label: 'Normal Operating Status',
    shortLabel: 'Normal',
    responsibleActor: 'CampusShield Autonomous Monitor',
    color: '#22D3A5',
    iconType: 'shield',
    description: 'All 86 zones nominal. Zero active alerts.',
    telemetryLog: 'Optical sensors nominal · Baseline air quality 12 ppm · 18 standby patrol units.',
    durationEst: 'Continuous',
  },
  {
    key: 'potential_incident',
    stepNumber: 2,
    label: 'Potential Anomaly Ingested',
    shortLabel: 'Anomaly',
    responsibleActor: 'Optical Thermal Sensor SEN-B3-04',
    color: '#FFB347',
    iconType: 'radio',
    description: 'Thermal rise detected (+18°C above threshold in 4 seconds).',
    telemetryLog: 'SEN-B3-04 triggered 342°C spike · Optical transmittance dropped to 42%.',
    durationEst: '0.8s',
  },
  {
    key: 'ai_detection',
    stepNumber: 3,
    label: 'AI Computer Vision & YOLO Scan',
    shortLabel: 'AI Detection',
    responsibleActor: 'YOLOv11x Vision & Edge Inference',
    color: '#14F1D9',
    iconType: 'scan',
    description: 'Camera CAM-B3-01 flagged active flame and dense smoke plume.',
    telemetryLog: 'Bounding box #01 (flame: 98.6%) · Bounding box #02 (smoke: 96.2%) detected.',
    durationEst: '1.2s',
  },
  {
    key: 'verification',
    stepNumber: 4,
    label: 'Telemetry Verification & Validation',
    shortLabel: 'Verification',
    responsibleActor: 'Duty Dispatcher Maya Lin',
    color: '#7C5CFF',
    iconType: 'check-shield',
    description: 'Multi-modal evidence corroborated across camera, IoT sensor & student SOS.',
    telemetryLog: 'Confidence score validated at 98.4% · False alarm probability < 0.2%.',
    durationEst: '8.4s',
  },
  {
    key: 'confirmed',
    stepNumber: 5,
    label: 'Emergency Confirmed & Alarm Raised',
    shortLabel: 'Confirmed',
    responsibleActor: 'Command Chief Officer',
    color: '#FF4D6D',
    iconType: 'alert',
    description: 'Code Red broadcast initiated. Campus horn and PA sirens engaged.',
    telemetryLog: 'Building alarm triggered · Electromagnetic door releases activated.',
    durationEst: '3.0s',
  },
  {
    key: 'risk_analysis',
    stepNumber: 6,
    label: 'Dynamic AI Risk Scoring & Modeling',
    shortLabel: 'Risk Score',
    responsibleActor: 'CampusShield Risk Matrix Engine',
    color: '#FF8C42',
    iconType: 'cpu',
    description: 'Computed composite hazard index of 94/100 for Science Block B Floor 3.',
    telemetryLog: '6-factor risk calculation evaluated 340 occupants at risk and chemical fuel load.',
    durationEst: '0.5s',
  },
  {
    key: 'responder_assigned',
    stepNumber: 7,
    label: 'Tactical Responder Squad Dispatched',
    shortLabel: 'Dispatch',
    responsibleActor: 'Squad Alpha (Cpt. Alex Rivera)',
    color: '#14F1D9',
    iconType: 'users',
    description: 'Emergency Squad Alpha dispatched via shortest Haversine route (140m / 45s ETA).',
    telemetryLog: 'Tactical channel CH-4 assigned · Turnout gear and SCBA respirators equipped.',
    durationEst: '45s ETA',
  },
  {
    key: 'evacuation',
    stepNumber: 8,
    label: 'A* Vector Safe Evacuation Routing',
    shortLabel: 'Evacuation',
    responsibleActor: 'Spatial Pathfinding Navigation Subsystem',
    color: '#22D3A5',
    iconType: 'navigation',
    description: 'Student mobile navigation activated routing occupants via Exit B to North Quad.',
    telemetryLog: 'A* computed 120m safe vector route avoiding West Corridor hazard zone.',
    durationEst: '6–9m',
  },
  {
    key: 'live_monitoring',
    stepNumber: 9,
    label: 'Realtime Live Telemetry & Personnel Tracking',
    shortLabel: 'Monitoring',
    responsibleActor: 'Command Center Dispatch Board',
    color: '#14F1D9',
    iconType: 'activity',
    description: 'Tracking 284/340 evacuated (83.5%). Responders advancing on-scene.',
    telemetryLog: 'Live GPS responder telemetry syncing at 60 Hz via Supabase broadcast channels.',
    durationEst: 'Active',
  },
  {
    key: 'contained',
    stepNumber: 10,
    label: 'Hazard Contained & Suppression Active',
    shortLabel: 'Contained',
    responsibleActor: 'Squad Alpha Lead',
    color: '#FFB347',
    iconType: 'flame',
    description: 'Halon suppression discharged. Thermal envelope isolated to Lab 302.',
    telemetryLog: 'Thermal anomaly reduced from 342°C to 54°C · 100% building clearance verified.',
    durationEst: '4m 20s',
  },
  {
    key: 'resolved',
    stepNumber: 11,
    label: 'Incident Resolved & Area Cleared',
    shortLabel: 'Resolved',
    responsibleActor: 'Chief Safety Marshal',
    color: '#22D3A5',
    iconType: 'check-circle',
    description: 'All 340 occupants verified safe. Zero casualties. Ventilation clearing fumes.',
    telemetryLog: 'Incident status marked resolved in central database · Stand-down order dispatched.',
    durationEst: 'Finalized',
  },
  {
    key: 'ai_report',
    stepNumber: 12,
    label: 'Autonomous AI Incident Dossier Generated',
    shortLabel: 'AI Report',
    responsibleActor: 'CampusShield Autonomous Auditor',
    color: '#7C5CFF',
    iconType: 'file-text',
    description: 'Comprehensive compliance report, sensor logs, and post-action review generated.',
    telemetryLog: 'Executive PDF ready · Total response time 2m 14s (26s below statutory SLA).',
    durationEst: 'Instant',
  },
];
