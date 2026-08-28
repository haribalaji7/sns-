/**
 * CampusShield AI — Synthetic Campus Safety & ML Risk Dataset
 * Generates 5,000+ realistic campus safety records across buildings, weather,
 * occupancy, event schedules, historical incidents, and multi-factor risk scores.
 */

export interface CampusSafetyRecord {
  id: string;
  building: string;
  hour: number; // 0..23
  dayOfWeek: number; // 0..6 (Sun..Sat)
  occupancy: number;
  capacityRatio: number; // 0..1
  weather: 'Clear' | 'Heatwave' | 'Thunderstorm' | 'Heavy Rain' | 'High Humidity' | 'Dense Fog';
  temperatureC: number;
  event: 'Lab Practicals' | 'Normal Classes' | 'Exam Session' | 'Sports Game' | 'Concert / Gathering' | 'Night Maintenance' | 'None';
  isExamDay: boolean;
  crowdDensity: number; // people per 10m²
  previousIncidents: number; // incidents in last 30 days
  sensorAlerts: number;
  riskScore: number; // 0..100
  riskCategory: 'low' | 'medium' | 'high' | 'critical';
}

export const CAMPUS_BUILDINGS = [
  { name: 'Science Block B', baseRisk: 45, maxCap: 500, type: 'lab' },
  { name: 'IT Data Center', baseRisk: 30, maxCap: 300, type: 'tech' },
  { name: 'Athletic Arena', baseRisk: 35, maxCap: 800, type: 'sports' },
  { name: 'Main Library', baseRisk: 15, maxCap: 900, type: 'study' },
  { name: 'Admin Quad', baseRisk: 10, maxCap: 400, type: 'admin' },
  { name: 'Dormitory Wing A', baseRisk: 25, maxCap: 600, type: 'residential' },
  { name: 'Student Center', baseRisk: 20, maxCap: 700, type: 'common' },
];

export const WEATHER_CONDITIONS: Array<CampusSafetyRecord['weather']> = [
  'Clear', 'Heatwave', 'Thunderstorm', 'Heavy Rain', 'High Humidity', 'Dense Fog'
];

export const EVENT_SCHEDULES: Array<CampusSafetyRecord['event']> = [
  'Lab Practicals', 'Normal Classes', 'Exam Session', 'Sports Game', 'Concert / Gathering', 'Night Maintenance', 'None'
];

// Seeded pseudo-random generator for reproducible 5000+ dataset
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate 5,000 synthetic campus risk records with realistic feature correlations.
 */
export function generateCampusRiskDataset(count = 5000): CampusSafetyRecord[] {
  const records: CampusSafetyRecord[] = [];

  for (let i = 0; i < count; i++) {
    const r1 = pseudoRandom(i * 11 + 1);
    const r2 = pseudoRandom(i * 17 + 2);
    const r3 = pseudoRandom(i * 23 + 3);
    const r4 = pseudoRandom(i * 29 + 4);
    const r5 = pseudoRandom(i * 31 + 5);
    const r6 = pseudoRandom(i * 37 + 6);
    const r7 = pseudoRandom(i * 41 + 7);

    // Pick building
    const buildingObj = CAMPUS_BUILDINGS[Math.floor(r1 * CAMPUS_BUILDINGS.length)];
    const building = buildingObj.name;

    // Time & Day
    const hour = Math.floor(r2 * 24);
    const dayOfWeek = Math.floor(r3 * 7);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weather & Temp
    const weather = WEATHER_CONDITIONS[Math.floor(r4 * WEATHER_CONDITIONS.length)];
    const temperatureC = weather === 'Heatwave' ? 36 + Math.round(r5 * 6) : 18 + Math.round(r5 * 14);

    // Events & Exams
    const isExamDay = r6 > 0.75;
    let event: CampusSafetyRecord['event'] = 'Normal Classes';
    if (isExamDay) {
      event = 'Exam Session';
    } else if (buildingObj.type === 'lab' && hour >= 13 && hour <= 17 && !isWeekend) {
      event = 'Lab Practicals';
    } else if (buildingObj.type === 'sports' && (hour >= 16 || isWeekend)) {
      event = 'Sports Game';
    } else if (hour >= 22 || hour <= 5) {
      event = 'Night Maintenance';
    } else if (isWeekend) {
      event = r7 > 0.5 ? 'Concert / Gathering' : 'None';
    }

    // Occupancy
    let occupancyFactor = 0.2;
    if (hour >= 9 && hour <= 17 && !isWeekend) {
      occupancyFactor = 0.6 + r7 * 0.35;
    } else if (hour >= 18 && hour <= 21) {
      occupancyFactor = 0.3 + r7 * 0.4;
    } else if (buildingObj.type === 'residential' && (hour >= 20 || hour <= 7)) {
      occupancyFactor = 0.7 + r7 * 0.25;
    }
    const occupancy = Math.min(buildingObj.maxCap, Math.round(buildingObj.maxCap * occupancyFactor));
    const capacityRatio = Number((occupancy / buildingObj.maxCap).toFixed(2));
    const crowdDensity = Number((capacityRatio * 8.5).toFixed(1));

    // Historical Incidents & Sensor Anomalies
    const previousIncidents = Math.floor(r1 * 5) + (buildingObj.type === 'lab' ? 2 : 0);
    const sensorAlerts = Math.floor(r5 * 4) + (weather === 'Thunderstorm' ? 2 : 0);

    // Compute Multi-Factor Ground Truth Risk Score
    let risk = buildingObj.baseRisk;

    // Factor 1: Occupancy & Crowd
    if (capacityRatio > 0.8) risk += 18;
    else if (capacityRatio > 0.5) risk += 10;

    // Factor 2: Event Risks
    if (event === 'Lab Practicals') risk += 24;
    if (event === 'Concert / Gathering') risk += 16;
    if (event === 'Sports Game') risk += 12;

    // Factor 3: Weather
    if (weather === 'Heatwave') risk += 14;
    if (weather === 'Thunderstorm') risk += 12;
    if (weather === 'Heavy Rain') risk += 8;

    // Factor 4: Temporal (Peak afternoon lab hours)
    if (hour >= 13 && hour <= 17 && buildingObj.type === 'lab') risk += 15;
    if (hour >= 23 || hour <= 4) risk += 8; // Night reduced surveillance

    // Factor 5: Historical & Sensors
    risk += previousIncidents * 3.5;
    risk += sensorAlerts * 4;

    // Random variance
    risk += (r7 - 0.5) * 8;
    risk = Math.max(5, Math.min(98, Math.round(risk)));

    let riskCategory: CampusSafetyRecord['riskCategory'] = 'low';
    if (risk >= 75) riskCategory = 'critical';
    else if (risk >= 50) riskCategory = 'high';
    else if (risk >= 25) riskCategory = 'medium';

    records.push({
      id: `REC-${(i + 1).toString().padStart(5, '0')}`,
      building,
      hour,
      dayOfWeek,
      occupancy,
      capacityRatio,
      weather,
      temperatureC,
      event,
      isExamDay,
      crowdDensity,
      previousIncidents,
      sensorAlerts,
      riskScore: risk,
      riskCategory,
    });
  }

  return records;
}

// Pre-computed dataset reference
export const SYNTHETIC_SAFETY_DATASET = generateCampusRiskDataset(5000);
