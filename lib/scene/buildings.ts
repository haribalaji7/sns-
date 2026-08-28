export interface CampusBuilding {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  height: number;
  health: 'safe' | 'warning' | 'critical' | 'medical';
  footprint: [number, number]; // [width (X), depth (Z)]
  floors: number;
  occupancy?: number;
  type?: 'academic' | 'residential' | 'facility' | 'medical' | 'amenity';
}

export const BASE_LAT = 37.4220;
export const BASE_LNG = -122.0840;
export const SCALE = 40000;

export function toXZ(lat: number, lng: number): [number, number] {
  return [
    (lng - BASE_LNG) * SCALE,
    (lat - BASE_LAT) * SCALE,
  ];
}

export const HEALTH_COLORS: Record<string, string> = {
  safe: '#22D3A5',
  warning: '#FFB347',
  critical: '#FF4D6D',
  medical: '#7C5CFF',
};

export const INCIDENT_COLORS: Record<string, string> = {
  fire: '#FF4D6D',
  medical: '#7C5CFF',
  crowd: '#FFB347',
  electrical: '#14F1D9',
  flood: '#3B82F6',
  default: '#8B9AB4',
};

export const ROLE_COLORS: Record<string, string> = {
  fire_fighter: '#FF4D6D',
  medic: '#7C5CFF',
  security: '#14F1D9',
  officer: '#FFB347',
  default: '#F0F4FF',
};

export const buildings: CampusBuilding[] = [
  {
    id: 'science',
    name: 'Science Block',
    position: { lat: 37.4221, lng: -122.0841 },
    height: 30,
    health: 'safe',
    footprint: [18, 14],
    floors: 6,
    occupancy: 240,
    type: 'academic',
  },
  {
    id: 'engineering',
    name: 'Engineering Block',
    position: { lat: 37.4225, lng: -122.0845 },
    height: 35,
    health: 'warning',
    footprint: [22, 16],
    floors: 7,
    occupancy: 410,
    type: 'academic',
  },
  {
    id: 'library',
    name: 'Library',
    position: { lat: 37.4230, lng: -122.0835 },
    height: 28,
    health: 'safe',
    footprint: [16, 20],
    floors: 5,
    occupancy: 180,
    type: 'academic',
  },
  {
    id: 'hostelA',
    name: 'Hostel A',
    position: { lat: 37.4240, lng: -122.0840 },
    height: 20,
    health: 'medical',
    footprint: [14, 24],
    floors: 4,
    occupancy: 320,
    type: 'residential',
  },
  {
    id: 'hostelB',
    name: 'Hostel B',
    position: { lat: 37.4245, lng: -122.0838 },
    height: 22,
    health: 'safe',
    footprint: [14, 24],
    floors: 4,
    occupancy: 310,
    type: 'residential',
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    position: { lat: 37.4250, lng: -122.0842 },
    height: 25,
    health: 'critical',
    footprint: [24, 20],
    floors: 3,
    occupancy: 550,
    type: 'amenity',
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    position: { lat: 37.4255, lng: -122.0839 },
    height: 18,
    health: 'safe',
    footprint: [16, 16],
    floors: 2,
    occupancy: 150,
    type: 'amenity',
  },
  {
    id: 'parking',
    name: 'Parking Structure',
    position: { lat: 37.4260, lng: -122.0845 },
    height: 12,
    health: 'safe',
    footprint: [28, 22],
    floors: 2,
    occupancy: 80,
    type: 'facility',
  },
  {
    id: 'medical',
    name: 'Medical Center',
    position: { lat: 37.4265, lng: -122.0840 },
    height: 24,
    health: 'medical',
    footprint: [16, 14],
    floors: 4,
    occupancy: 95,
    type: 'medical',
  },
];
