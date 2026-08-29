'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type Incident = Database['public']['Tables']['incidents']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export interface StudentProfile {
  name: string;
  studentId: string;
  email: string;
  department: string;
  status?: string;
  bloodGroup?: string;
  blood_group?: string;
  medicalNotes?: string;
  accessibility?: string;
  hostel?: string;
  emergencyContact?: { name: string; relation: string; phone: string } | null;
  currentAssemblyPoint?: string | null;
}

export interface AssemblyPoint {
  id: string;
  code: string;
  name: string;
  location: string;
  distanceMeters: number;
  capacity: number;
  currentCount: number;
  safeCount: number;
  status: 'safe' | 'crowded' | 'full';
  coordinates: { lat: number; lng: number };
}

export interface AssignedResponder {
  id: string;
  name: string;
  badge: string;
  role: string;
  team: string;
  vehicle: string;
  phone: string;
  radioChannel: string;
  avatar: string;
  coordinates: { lat: number; lng: number };
}

export const INITIAL_ASSEMBLY_POINTS: AssemblyPoint[] = [
  {
    id: 'SAFE-NORTH-QUAD',
    code: 'ZONE-A',
    name: 'Assembly Zone Alpha (North Quad)',
    location: 'North Lawn by Library Fountain',
    distanceMeters: 120,
    capacity: 500,
    currentCount: 84,
    safeCount: 84,
    status: 'safe',
    coordinates: { lat: 28.6155, lng: 77.2090 },
  },
  {
    id: 'SAFE-WEST-GATE',
    code: 'ZONE-B',
    name: 'Assembly Zone Beta (Main Gate)',
    location: 'Open Courtyard near Gate 1',
    distanceMeters: 280,
    capacity: 800,
    currentCount: 162,
    safeCount: 162,
    status: 'safe',
    coordinates: { lat: 28.6155, lng: 77.2075 },
  },
  {
    id: 'SAFE-ATH-FIELD',
    code: 'ZONE-C',
    name: 'Assembly Zone Gamma (Athletic Field)',
    location: 'Synthetic Turf Football Pavilion',
    distanceMeters: 450,
    capacity: 1200,
    currentCount: 310,
    safeCount: 310,
    status: 'safe',
    coordinates: { lat: 28.6125, lng: 77.2092 },
  },
];

interface StudentStore {
  activeIncidents: Incident[];
  recentAlerts: Alert[];
  myStatus: any | null;
  profile: StudentProfile;
  campusStatus: 'SAFE' | 'WARNING' | 'CRITICAL';
  myDistanceToSafeZone: string;

  // Live Incident Tracking
  assignedResponder: AssignedResponder | null;
  etaSeconds: number;
  distanceMeters: number;
  incidentStatus: string;
  assemblyPoints: AssemblyPoint[];

  // Actions
  initializeRealtime: (userId?: string) => void;
  markSafe: (userId?: string, location?: { lat: number; lng: number }) => Promise<void>;
  setProfile: (profile: Partial<StudentProfile>) => void;
  loginAsStudent: (profile: Partial<StudentProfile>) => void;
  triggerSOS: (payload: any, details?: any) => Promise<any>;
  resolveEmergency: () => void;
  tickLiveSimulation: () => void;
  checkInAssemblyPoint: (codeOrId: string) => boolean | void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  activeIncidents: [],
  recentAlerts: [],
  myStatus: null,
  profile: {
    name: 'Rahul Sharma',
    studentId: 'STU-8821',
    email: 'r.sharma@campusshield.edu',
    department: 'Computer Science & AI (B.Tech)',
    bloodGroup: 'O+',
    blood_group: 'O+',
    medicalNotes: 'Asthma inhaler required in smoke conditions',
    accessibility: 'Standard mobility',
    hostel: 'Oak Hall Dorm 402',
    emergencyContact: {
      name: 'Sunita Sharma',
      relation: 'Parent / Mother',
      phone: '+1 (555) 019-2831',
    },
    currentAssemblyPoint: 'Assembly Zone Alpha (North Quad)',
  },
  campusStatus: 'CRITICAL',
  myDistanceToSafeZone: '120m',

  assignedResponder: {
    id: 'SEC-7749',
    name: 'Officer Marcus Vance',
    badge: 'SEC-7749',
    role: 'QRF Tactical Responder',
    team: 'Alpha Tactical Unit',
    vehicle: 'Interceptor Cruiser 04',
    phone: '+1 (555) 019-4820',
    radioChannel: 'Security Ch 1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coordinates: { lat: 28.6143, lng: 77.2089 },
  },
  etaSeconds: 54,
  distanceMeters: 185,
  incidentStatus: 'responder_assigned',
  assemblyPoints: INITIAL_ASSEMBLY_POINTS,

  initializeRealtime: (userId?: string) => {
    supabase.from('incidents').select('*').in('status', ['active', 'responding']).then(({ data }) => {
      if (data) set({ activeIncidents: data });
    });

    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10).then(({ data }) => {
      if (data) set({ recentAlerts: data });
    });
  },

  markSafe: async (userId?: string, location?: { lat: number; lng: number }) => {
    set((s) => ({
      campusStatus: 'SAFE',
      profile: {
        ...s.profile,
        medicalNotes: 'Marked Safe by Student self-checkin',
      },
    }));
  },

  setProfile: (newProfile) => {
    set((s) => ({
      profile: { ...s.profile, ...newProfile },
    }));
  },

  loginAsStudent: (studentProfile) => {
    set((s) => ({
      profile: { ...s.profile, ...studentProfile },
    }));
  },

  triggerSOS: async (payload: any, details?: any) => {
    set({
      campusStatus: 'CRITICAL',
      incidentStatus: 'responder_assigned',
      etaSeconds: 54,
      distanceMeters: 185,
    });
    return { success: true, incidentId: 'SOS-8841' };
  },

  resolveEmergency: () => {
    set({
      incidentStatus: 'resolved',
      campusStatus: 'SAFE',
    });
  },

  tickLiveSimulation: () => {
    set((s) => {
      const nextEta = Math.max(0, s.etaSeconds - 1);
      const nextDist = Math.max(0, s.distanceMeters - 3);
      return {
        etaSeconds: nextEta,
        distanceMeters: nextDist,
        incidentStatus: nextEta === 0 ? 'on_scene' : 'en_route',
      };
    });
  },

  checkInAssemblyPoint: (codeOrId: string) => {
    const state = get();
    const pt = state.assemblyPoints.find(
      (p) => p.id === codeOrId || p.code === codeOrId
    );
    if (pt) {
      set({
        profile: {
          ...state.profile,
          currentAssemblyPoint: pt.name,
        },
        campusStatus: 'SAFE',
      });
      return true;
    }
    return false;
  },
}));
