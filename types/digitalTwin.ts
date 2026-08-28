export type Incident = {
  id: string;
  type: 'fire' | 'medical' | 'crowd' | 'electrical' | 'flood';
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string; // ISO timestamp
};

export type Responder = {
  id: string;
  role: 'security' | 'medical' | 'fire' | 'engineer';
  status: 'idle' | 'enroute' | 'on_scene' | 'unavailable';
  position: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  eta?: number; // seconds
};

export type CrowdPoint = {
  id: string;
  location: { lat: number; lng: number };
  density: 'low' | 'medium' | 'high' | 'critical';
};
