/**
 * CampusShield AI — Machine Learning Risk Prediction Engine
 * Classification, Multi-Factor Risk Inference & Cellular Automata Blast Radius Simulator
 */

import { CAMPUS_BUILDINGS, CampusSafetyRecord } from './campus-risk-dataset';

export interface MLPredictionInputs {
  building: string;
  hour: number; // 0..23
  occupancy: number;
  weather: 'Clear' | 'Heatwave' | 'Thunderstorm' | 'Heavy Rain' | 'High Humidity' | 'Dense Fog';
  event: 'Lab Practicals' | 'Normal Classes' | 'Exam Session' | 'Sports Game' | 'Concert / Gathering' | 'Night Maintenance' | 'None';
  isExamDay: boolean;
  previousIncidents: number;
}

export interface FactorImpact {
  factor: string;
  weight: number; // Percentage contribution (e.g. +28%)
  direction: 'increase' | 'decrease';
  category: 'occupancy' | 'activity' | 'weather' | 'temporal' | 'historical';
  description: string;
}

export interface PreventiveActionItem {
  id: string;
  title: string;
  directive: string;
  impactReduction: string;
  iconType: 'patrol' | 'inspect' | 'exit' | 'deploy';
  urgency: 'critical' | 'high' | 'medium';
}

export interface BlastRadiusHazardSnapshot {
  elapsedSeconds: number;
  center: { x: number; y: number; lat: number; lng: number };
  radiusMeters: number;
  radiusUnits: number; // normalized coordinate units
  temperatureMaxC: number;
  spreadRateMps: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  threatLevel: 'contained' | 'expanding' | 'flashover' | 'critical';
  polygonPoints: Array<{ x: number; y: number }>;
  blockedNodeIds: string[];
}

export interface MLRiskPredictionResult {
  riskScore: number; // 0..100
  dominantCategory: 'low' | 'medium' | 'high' | 'critical';
  probabilities: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  factorImpacts: FactorImpact[];
  naturalLanguageExplanation: string;
  preventiveActions: PreventiveActionItem[];
  forecast24h: Array<{ hour: number; timeLabel: string; predictedRisk: number; baseline: number }>;
  blastRadiusSnapshot: BlastRadiusHazardSnapshot;
}

// ─── Cellular Automata & Wind Vector Blast Radius Model ──────────────────────

export function simulateBlastRadiusExpansion(
  origin = { x: 230, y: 320, lat: 28.6139, lng: 77.2090 },
  elapsedSeconds = 45,
  wind = { speedKmh: 14, directionDeg: 45 }, // 14 km/h North-East
): BlastRadiusHazardSnapshot {
  // Base spread model: Non-linear expansion with wind vector elongation
  const baseSpreadRate = 0.85; // meters per second
  const windBoost = (wind.speedKmh / 10) * 0.45;
  const effectiveSpreadRate = baseSpreadRate + windBoost;

  const currentRadiusMeters = Math.min(180, Math.round(15 + elapsedSeconds * effectiveSpreadRate));
  const currentRadiusUnits = Math.min(160, Math.round(currentRadiusMeters * 0.8));

  // Temperature dissipation curve
  const peakTemp = Math.max(65, Math.round(360 - elapsedSeconds * 1.8));

  // Asymmetric blast-radius polygon vertices (elongated downwind)
  const polygonPoints: Array<{ x: number; y: number }> = [];
  const numVertices = 16;
  const windRad = (wind.directionDeg * Math.PI) / 180;

  for (let i = 0; i < numVertices; i++) {
    const angle = (i * 2 * Math.PI) / numVertices;
    // Downwind stretch factor
    const windAlignment = Math.cos(angle - windRad);
    const stretch = 1 + windAlignment * 0.45;
    const r = currentRadiusUnits * stretch;

    polygonPoints.push({
      x: Math.round(origin.x + Math.cos(angle) * r),
      y: Math.round(origin.y + Math.sin(angle) * r),
    });
  }

  // Determine blocked navigation graph nodes based on blast radius
  const blockedNodeIds: string[] = ['N-SCIB-302'];
  if (currentRadiusUnits > 35) blockedNodeIds.push('N-SCIB-CORR');
  if (currentRadiusUnits > 70) blockedNodeIds.push('N-SCIB-STAIR-W');
  if (currentRadiusUnits > 110) blockedNodeIds.push('N-CENTRAL-QUAD');

  let threatLevel: BlastRadiusHazardSnapshot['threatLevel'] = 'contained';
  if (currentRadiusMeters >= 120) threatLevel = 'critical';
  else if (currentRadiusMeters >= 70) threatLevel = 'flashover';
  else if (currentRadiusMeters >= 30) threatLevel = 'expanding';

  return {
    elapsedSeconds,
    center: origin,
    radiusMeters: currentRadiusMeters,
    radiusUnits: currentRadiusUnits,
    temperatureMaxC: peakTemp,
    spreadRateMps: Number(effectiveSpreadRate.toFixed(2)),
    windSpeedKmh: wind.speedKmh,
    windDirectionDeg: wind.directionDeg,
    threatLevel,
    polygonPoints,
    blockedNodeIds,
  };
}

export function predictCampusRisk(inputs: MLPredictionInputs): MLRiskPredictionResult {
  const buildingMeta = CAMPUS_BUILDINGS.find((b) => b.name === inputs.building) || CAMPUS_BUILDINGS[0];
  const maxCap = buildingMeta.maxCap || 500;
  const capacityRatio = Math.min(1.0, inputs.occupancy / maxCap);

  let rawScore = buildingMeta.baseRisk;
  const factors: FactorImpact[] = [];

  // 1. Building Baseline
  factors.push({
    factor: 'Building Inherent Profile',
    weight: buildingMeta.baseRisk,
    direction: 'increase',
    category: 'activity',
    description: `Baseline vulnerability for ${inputs.building} (${buildingMeta.type} classification)`,
  });

  // 2. Occupancy & Density
  let occWeight = 0;
  if (capacityRatio > 0.8) {
    occWeight = 24;
    factors.push({
      factor: 'High Capacity Congestion',
      weight: occWeight,
      direction: 'increase',
      category: 'occupancy',
      description: `Occupancy is at ${Math.round(capacityRatio * 100)}% capacity (${inputs.occupancy}/${maxCap} occupants)`,
    });
  } else if (capacityRatio > 0.5) {
    occWeight = 12;
    factors.push({
      factor: 'Moderate Occupancy',
      weight: occWeight,
      direction: 'increase',
      category: 'occupancy',
      description: `Building occupancy is at ${Math.round(capacityRatio * 100)}% capacity`,
    });
  } else {
    occWeight = -8;
    factors.push({
      factor: 'Low Density Factor',
      weight: 8,
      direction: 'decrease',
      category: 'occupancy',
      description: 'Low building occupancy reduces egress bottlenecks',
    });
  }
  rawScore += occWeight;

  // 3. Event Schedule
  let eventWeight = 0;
  if (inputs.event === 'Lab Practicals') {
    eventWeight = 26;
    factors.push({
      factor: 'Active Chemical / Thermal Lab Sessions',
      weight: eventWeight,
      direction: 'increase',
      category: 'activity',
      description: 'Active chemical fume hoods and high-current electrical rigs engaged',
    });
  } else if (inputs.event === 'Concert / Gathering') {
    eventWeight = 18;
    factors.push({
      factor: 'Large Crowd Gathering Event',
      weight: eventWeight,
      direction: 'increase',
      category: 'activity',
      description: 'Heightened crowd surge probability and exit lane friction',
    });
  } else if (inputs.event === 'Sports Game') {
    eventWeight = 14;
    factors.push({
      factor: 'Athletic Event Congestion',
      weight: eventWeight,
      direction: 'increase',
      category: 'activity',
      description: 'Increased perimeter circulation and spectator density',
    });
  } else if (inputs.isExamDay) {
    eventWeight = 10;
    factors.push({
      factor: 'Exam Period Stress Threshold',
      weight: eventWeight,
      direction: 'increase',
      category: 'activity',
      description: 'High static occupancy and strict entry control requirements',
    });
  }
  rawScore += eventWeight;

  // 4. Weather Conditions
  let weatherWeight = 0;
  if (inputs.weather === 'Heatwave') {
    weatherWeight = 14;
    factors.push({
      factor: 'Heatwave Thermal Load',
      weight: weatherWeight,
      direction: 'increase',
      category: 'weather',
      description: 'Ambient 36°C+ temperatures accelerate transformer and HVAC overheating risk',
    });
  } else if (inputs.weather === 'Thunderstorm') {
    weatherWeight = 15;
    factors.push({
      factor: 'Severe Thunderstorm & Lightning Risk',
      weight: weatherWeight,
      direction: 'increase',
      category: 'weather',
      description: 'Power grid fluctuations and exterior pathway slip hazards',
    });
  } else if (inputs.weather === 'Heavy Rain') {
    weatherWeight = 9;
    factors.push({
      factor: 'Water Ingress & Corridor Flooding',
      weight: weatherWeight,
      direction: 'increase',
      category: 'weather',
      description: 'Sub-level basement moisture risk and reduced walkway traction',
    });
  }
  rawScore += weatherWeight;

  // 5. Temporal (Time of day)
  let timeWeight = 0;
  if (inputs.hour >= 13 && inputs.hour <= 17 && buildingMeta.type === 'lab') {
    timeWeight = 12;
    factors.push({
      factor: 'Peak Afternoon Lab Operating Window',
      weight: timeWeight,
      direction: 'increase',
      category: 'temporal',
      description: 'Statistical incident peak occurs during 1:00 PM – 5:00 PM',
    });
  } else if (inputs.hour >= 23 || inputs.hour <= 4) {
    timeWeight = 8;
    factors.push({
      factor: 'Reduced Night Staffing Window',
      weight: timeWeight,
      direction: 'increase',
      category: 'temporal',
      description: 'Off-hours security posture with fewer on-scene observers',
    });
  }
  rawScore += timeWeight;

  // 6. Historical Incidents
  if (inputs.previousIncidents > 0) {
    const histWeight = Math.min(20, inputs.previousIncidents * 4);
    factors.push({
      factor: 'Historical Incident Recurrence Factor',
      weight: histWeight,
      direction: 'increase',
      category: 'historical',
      description: `${inputs.previousIncidents} logged incidents in this zone over the past 30 days`,
    });
    rawScore += histWeight;
  }

  // Final score clamping
  const finalRiskScore = Math.max(5, Math.min(98, Math.round(rawScore)));

  // Softmax-like probability distributions
  let probLow = 0.05;
  let probMed = 0.15;
  let probHigh = 0.35;
  let probCrit = 0.45;

  if (finalRiskScore < 25) {
    probLow = 0.75;
    probMed = 0.18;
    probHigh = 0.05;
    probCrit = 0.02;
  } else if (finalRiskScore < 50) {
    probLow = 0.15;
    probMed = 0.60;
    probHigh = 0.20;
    probCrit = 0.05;
  } else if (finalRiskScore < 75) {
    probLow = 0.05;
    probMed = 0.20;
    probHigh = 0.55;
    probCrit = 0.20;
  } else {
    probLow = 0.02;
    probMed = 0.08;
    probHigh = 0.30;
    probCrit = 0.60;
  }

  let dominantCategory: MLRiskPredictionResult['dominantCategory'] = 'low';
  if (finalRiskScore >= 75) dominantCategory = 'critical';
  else if (finalRiskScore >= 50) dominantCategory = 'high';
  else if (finalRiskScore >= 25) dominantCategory = 'medium';

  // Natural Language AI Explanation Generation
  const primaryReasons: string[] = [];
  if (capacityRatio > 0.75) primaryReasons.push(`occupancy is critically elevated (${inputs.occupancy}/${maxCap} occupants)`);
  if (inputs.event === 'Lab Practicals') primaryReasons.push('active chemical synthesis laboratory sessions are in progress');
  if (inputs.event === 'Concert / Gathering' || inputs.event === 'Sports Game') primaryReasons.push(`${inputs.event} event is driving high crowd circulation`);
  if (inputs.weather === 'Heatwave') primaryReasons.push('high ambient temperatures (38°C) are stressing HVAC and thermal safety sensors');
  if (inputs.weather === 'Thunderstorm') primaryReasons.push('thunderstorm activity threatens electrical sub-panel stability');
  if (inputs.previousIncidents >= 2) primaryReasons.push(`${inputs.previousIncidents} incidents were previously recorded in this sector`);

  const reasonPhrase = primaryReasons.length > 0
    ? primaryReasons.join(', ')
    : 'standard baseline operational telemetry is being maintained';

  const naturalLanguageExplanation = `${inputs.building} has ${
    finalRiskScore >= 75 ? 'critically elevated' : finalRiskScore >= 50 ? 'moderately high' : 'nominal'
  } risk (${finalRiskScore}/100) because ${reasonPhrase}.`;

  // Preventive Actions
  const preventiveActions: PreventiveActionItem[] = [
    {
      id: 'act-patrol',
      title: 'Increase Patrol Frequency',
      directive: `Deploy 2 security officers on 15-minute staggered rounds through ${inputs.building} corridors.`,
      impactReduction: '-14% Risk',
      iconType: 'patrol',
      urgency: finalRiskScore >= 60 ? 'critical' : 'high',
    },
    {
      id: 'act-inspect',
      title: 'Inspect Electrical & Thermal Systems',
      directive: 'Run diagnostic sweep on breaker panels and optical smoke sensors in Floor 3 utility bays.',
      impactReduction: '-18% Risk',
      iconType: 'inspect',
      urgency: 'high',
    },
    {
      id: 'act-exit',
      title: 'Pre-Unlock Auxiliary Safe Exits',
      directive: 'Disengage electromagnetic hold-backs on Exit Doors B & C to ensure unobstructed egress routes.',
      impactReduction: '-22% Risk',
      iconType: 'exit',
      urgency: finalRiskScore >= 75 ? 'critical' : 'medium',
    },
    {
      id: 'act-deploy',
      title: 'Pre-Position Tactical Responder Unit',
      directive: 'Stage Squad Alpha rapid response vehicle at North Quad perimeter staging area.',
      impactReduction: '-25% Risk',
      iconType: 'deploy',
      urgency: 'critical',
    },
  ];

  // 24-Hour Predictive Forecast Trajectory Curve
  const forecast24h = Array.from({ length: 24 }, (_, h) => {
    let hourRisk = finalRiskScore;
    if (h >= 9 && h <= 12) hourRisk += 6;
    if (h >= 13 && h <= 17) hourRisk += 14;
    if (h >= 18 && h <= 21) hourRisk -= 10;
    if (h >= 22 || h <= 5) hourRisk -= 22;

    const baseline = 28;
    return {
      hour: h,
      timeLabel: `${h.toString().padStart(2, '0')}:00`,
      predictedRisk: Math.max(8, Math.min(98, hourRisk)),
      baseline,
    };
  });

  const blastRadiusSnapshot = simulateBlastRadiusExpansion(
    { x: 230, y: 320, lat: 28.6139, lng: 77.2090 },
    45,
    { speedKmh: inputs.weather === 'Heatwave' ? 18 : 12, directionDeg: 45 }
  );

  return {
    riskScore: finalRiskScore,
    dominantCategory,
    probabilities: {
      low: Math.round(probLow * 100),
      medium: Math.round(probMed * 100),
      high: Math.round(probHigh * 100),
      critical: Math.round(probCrit * 100),
    },
    factorImpacts: factors.sort((a, b) => b.weight - a.weight),
    naturalLanguageExplanation,
    preventiveActions,
    forecast24h,
    blastRadiusSnapshot,
  };
}
