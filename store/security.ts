'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Incident, IncidentSeverity, IncidentType, Coordinates } from '@/types';
import { soundEffects } from '@/lib/audio-effects';

export type OfficerStatus = 'Available' | 'On Patrol' | 'Responding' | 'Busy' | 'Offline';
export type ArrivalStage = 'unassigned' | 'accepted' | 'arrived' | 'assisting' | 'secured' | 'resolved';
export type RadioChannel = 'general' | 'medical' | 'fire' | 'security' | 'admin';

export interface SecurityOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  team: string;
  vehicle: string;
  currentShift: string;
  specialization: string;
  status: OfficerStatus;
  batteryLevel: number;
  phone: string;
  radioChannel: RadioChannel;
  avatarUrl: string;
  coordinates: Coordinates;
  certifications: string[];
  incidentsResolved: number;
  avgResponseSeconds: number;
  distancePatrolledKm: number;
  shiftStartTime: string;
}

export interface RadioMessage {
  id: string;
  channel: RadioChannel;
  senderName: string;
  senderBadge: string;
  content: string;
  timestamp: string;
  isVoice?: boolean;
  audioDuration?: string;
  location?: string;
  isCritical?: boolean;
}

export interface SecurityNotification {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  distanceMeters: number;
  timestamp: string;
  aiRiskScore: number;
}

export interface EvacuationZoneInfo {
  zoneId: string;
  zoneName: string;
  building: string;
  exitName: string;
  assemblyPoint: string;
  peopleTotal: number;
  peopleEvacuated: number;
  targetCompletionMin: number;
  status: 'active' | 'cleared' | 'standby';
}

export const DEMO_OFFICERS: SecurityOfficer[] = [
  {
    id: 'SEC-7749',
    name: 'Officer Marcus Vance',
    badgeNumber: 'SEC-7749',
    email: 'm.vance@campusshield.edu',
    team: 'Alpha Tactical Unit (QRF)',
    vehicle: 'Interceptor Cruiser 04',
    currentShift: 'Night Delta Shift (20:00 - 08:00)',
    specialization: 'Hazmat & Structural Fire Response',
    status: 'Available',
    batteryLevel: 94,
    phone: '+1 (555) 019-4820',
    radioChannel: 'security',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coordinates: { lat: 28.6143, lng: 77.2089 }, // Central Quad
    certifications: ['NFPA Firefighter II', 'Tactical Combat Casualty Care (TCCC)', 'Hazardous Materials Tech'],
    incidentsResolved: 42,
    avgResponseSeconds: 94,
    distancePatrolledKm: 8.4,
    shiftStartTime: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'SEC-8821',
    name: 'Cpt. Alex Rivera',
    badgeNumber: 'SEC-8821',
    email: 'a.rivera@campusshield.edu',
    team: 'Emergency Response Squad Alpha',
    vehicle: 'Tactical Command SUV 01',
    currentShift: 'Day Command Shift (08:00 - 20:00)',
    specialization: 'Incident Commander & Crisis Negotiation',
    status: 'On Patrol',
    batteryLevel: 88,
    phone: '+1 (555) 019-4821',
    radioChannel: 'general',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coordinates: { lat: 28.6149, lng: 77.2088 },
    certifications: ['Incident Command System 400', 'Active Threat Response Trainer'],
    incidentsResolved: 68,
    avgResponseSeconds: 88,
    distancePatrolledKm: 12.1,
    shiftStartTime: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'SEC-9014',
    name: 'Officer Sarah Chen',
    badgeNumber: 'SEC-9014',
    email: 's.chen@campusshield.edu',
    team: 'Medical Response Group Bravo',
    vehicle: 'Rapid Ambulance Cart B',
    currentShift: 'Night Delta Shift (20:00 - 08:00)',
    specialization: 'Paramedic / Advanced First Aid',
    status: 'Available',
    batteryLevel: 91,
    phone: '+1 (555) 019-4822',
    radioChannel: 'medical',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    coordinates: { lat: 28.6130, lng: 77.2095 },
    certifications: ['NREMT-Paramedic', 'AED Master Instructor'],
    incidentsResolved: 35,
    avgResponseSeconds: 102,
    distancePatrolledKm: 6.2,
    shiftStartTime: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_RADIO_MESSAGES: RadioMessage[] = [
  {
    id: 'msg-1',
    channel: 'security',
    senderName: 'Cpt. Alex Rivera',
    senderBadge: 'SEC-8821',
    content: 'Command to all units: Science Block B perimeter is restricted. Avoid Corridor B due to thermal ventilation plume.',
    timestamp: new Date(Date.now() - 6 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: 'Science Block B',
    isCritical: true,
  },
  {
    id: 'msg-2',
    channel: 'fire',
    senderName: 'Squad Alpha Dispatch',
    senderBadge: 'DISPATCH-01',
    content: 'Sprinkler dampers triggered on 3rd floor Lab 302. Auto suppression nozzles active.',
    timestamp: new Date(Date.now() - 3 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: 'Science Block B – Fl. 3',
  },
  {
    id: 'msg-3',
    channel: 'general',
    senderName: 'Officer Sarah Chen',
    senderBadge: 'SEC-9014',
    content: 'Athletic track casualty is stabilized. Patient en route to North medical triage.',
    timestamp: new Date(Date.now() - 1 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: 'Athletic Center',
  },
];

export interface IncidentDebrief {
  id: string;
  incidentId: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  resolvedAt: string;
  responseDurationSeconds: number;
  officerBadge: string;
  actionsTaken: string[];
  summary: string;
}

export const INITIAL_HISTORY: IncidentDebrief[] = [
  {
    id: 'deb-1',
    incidentId: 'INC-0087',
    title: 'Chemical Vapour Leak – Library Basement',
    type: 'gas_leak',
    severity: 'medium',
    location: 'Library Archives B1',
    resolvedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    responseDurationSeconds: 114,
    officerBadge: 'SEC-7749',
    actionsTaken: ['Isolated ventilation damper', 'Evacuated 8 archival staff', 'Deployed atmospheric scrubber'],
    summary: 'Secondary chemical container seal failed. Zero toxic exposure detected after scrubber cycle.',
  },
  {
    id: 'deb-2',
    incidentId: 'INC-0086',
    title: 'Power Arc Flash – Substation B',
    type: 'electrical',
    severity: 'high',
    location: 'IT Substation 02',
    resolvedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    responseDurationSeconds: 86,
    officerBadge: 'SEC-7749',
    actionsTaken: ['Tripped main breaker', 'Deployed CO2 fire extinguisher', 'Assisted facilities electrical team'],
    summary: 'Transformer breaker tripped safely. Power rerouted to backup generator 2.',
  },
  {
    id: 'deb-3',
    incidentId: 'INC-0085',
    title: 'Perimeter Barrier Sensor Alarm',
    type: 'intrusion',
    severity: 'low',
    location: 'North Perimeter Fence 12',
    resolvedAt: new Date(Date.now() - 480 * 60000).toISOString(),
    responseDurationSeconds: 74,
    officerBadge: 'SEC-7749',
    actionsTaken: ['Visual patrol inspection', 'Verified optical sensor alignment', 'Cleared perimeter zone'],
    summary: 'Tree branch fallen on perimeter fence wire. Cleared and reset beam.',
  },
];

interface SecurityStore {
  // Authentication & Profile
  officer: SecurityOfficer;
  isAuthenticated: boolean;
  isOnline: boolean;
  radioOpen: boolean;

  // Active Incident & Tactical Workflow
  activeIncidentId: string | null;
  arrivalStage: ArrivalStage;
  stageTimestamps: Partial<Record<ArrivalStage, string>>;
  activeNotification: SecurityNotification | null;

  // Evacuation Coordination
  evacuationZone: EvacuationZoneInfo;

  // Realtime Radio & History
  radioMessages: RadioMessage[];
  incidentHistory: IncidentDebrief[];
  teamOfficers: SecurityOfficer[];

  // Actions
  loginOfficer: (officerData?: Partial<SecurityOfficer>) => void;
  logoutOfficer: () => void;
  setStatus: (status: OfficerStatus) => void;
  setRadioChannel: (channel: RadioChannel) => void;
  toggleRadio: () => void;
  setRadioOpen: (open: boolean) => void;
  updateCoordinates: (coords: Coordinates) => void;

  // Incident lifecycle
  acceptIncident: (incidentId: string) => void;
  setArrivalStage: (stage: ArrivalStage) => void;
  advanceArrivalStage: () => void;
  resolveActiveIncident: (notes: string) => void;
  dismissNotification: () => void;
  triggerNotification: (notif: SecurityNotification) => void;
  requestBackup: (notes?: string) => void;
  transferIncident: (targetOfficerId: string) => void;
  
  // Radio message transmission
  sendRadioMessage: (channel: RadioChannel, content: string, isVoice?: boolean, location?: string) => void;
  
  // Evacuation actions
  evacuatePersonIncrement: (count?: number) => void;
}

export const useSecurityStore = create<SecurityStore>()(
  subscribeWithSelector((set, get) => ({
    officer: DEMO_OFFICERS[0],
    isAuthenticated: true,
    isOnline: true,
    radioOpen: false,

    activeIncidentId: 'INC-0091', // Active Fire in Lab 302
    arrivalStage: 'accepted',
    stageTimestamps: {
      accepted: new Date(Date.now() - 90 * 1000).toISOString(),
    },
    activeNotification: null,

    evacuationZone: {
      zoneId: 'Z-SCIB',
      zoneName: 'Science Block B (Floor 3)',
      building: 'Science Block B',
      exitName: 'Emergency Stairwell East (Exit B)',
      assemblyPoint: 'Assembly Zone Alpha (North Quad)',
      peopleTotal: 42,
      peopleEvacuated: 34,
      targetCompletionMin: 3.5,
      status: 'active',
    },

    radioMessages: INITIAL_RADIO_MESSAGES,
    incidentHistory: INITIAL_HISTORY,
    teamOfficers: DEMO_OFFICERS,

    loginOfficer: (customData) => {
      const selected = customData ? { ...DEMO_OFFICERS[0], ...customData } : DEMO_OFFICERS[0];
      set({
        officer: selected,
        isAuthenticated: true,
        arrivalStage: 'unassigned',
        activeIncidentId: null,
      });
      // Set cookie for middleware
      if (typeof document !== 'undefined') {
        document.cookie = 'demo_security=true; path=/; max-age=86400';
      }
      soundEffects.playSuccess();
    },

    logoutOfficer: () => {
      set({
        isAuthenticated: false,
        activeIncidentId: null,
        arrivalStage: 'unassigned',
      });
      if (typeof document !== 'undefined') {
        document.cookie = 'demo_security=; path=/; max-age=0';
      }
      soundEffects.playClick();
    },

    setStatus: (status) => {
      set((s) => ({
        officer: { ...s.officer, status },
      }));
      soundEffects.playClick();
    },

    setRadioChannel: (radioChannel) => {
      set((s) => ({
        officer: { ...s.officer, radioChannel },
      }));
      soundEffects.playClick();
    },

    toggleRadio: () => {
      set((s) => ({ radioOpen: !s.radioOpen }));
      soundEffects.playRadioPing();
    },

    setRadioOpen: (open) => set({ radioOpen: open }),

    updateCoordinates: (coordinates) => {
      set((s) => ({
        officer: { ...s.officer, coordinates },
      }));
    },

    acceptIncident: (incidentId) => {
      const now = new Date().toISOString();
      set((s) => ({
        activeIncidentId: incidentId,
        arrivalStage: 'accepted',
        stageTimestamps: {
          ...s.stageTimestamps,
          accepted: now,
        },
        officer: {
          ...s.officer,
          status: 'Responding',
        },
        activeNotification: null,
      }));
      soundEffects.playAlert();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([200, 100, 200]); } catch (e) {}
      }
    },

    setArrivalStage: (arrivalStage) => {
      const now = new Date().toISOString();
      set((s) => ({
        arrivalStage,
        stageTimestamps: {
          ...s.stageTimestamps,
          [arrivalStage]: now,
        },
      }));
      soundEffects.playScan();
    },

    advanceArrivalStage: () => {
      const current = get().arrivalStage;
      const order: ArrivalStage[] = ['accepted', 'arrived', 'assisting', 'secured', 'resolved'];
      const nextIdx = order.indexOf(current) + 1;
      if (nextIdx < order.length) {
        const nextStage = order[nextIdx];
        get().setArrivalStage(nextStage);
        if (nextStage === 'resolved' && get().activeIncidentId) {
          get().resolveActiveIncident('Case resolved and area cleared by security unit.');
        }
      }
    },

    resolveActiveIncident: (notes) => {
      const state = get();
      const incId = state.activeIncidentId || 'INC-0091';
      const debrief: IncidentDebrief = {
        id: `deb-${Date.now()}`,
        incidentId: incId,
        title: 'Active Emergency Response Event',
        type: 'fire',
        severity: 'critical',
        location: 'Science Block B – Floor 3',
        resolvedAt: new Date().toISOString(),
        responseDurationSeconds: 142,
        officerBadge: state.officer.badgeNumber,
        actionsTaken: ['Responded to scene', 'Supervised evacuation', notes],
        summary: notes || 'Area verified secure and contained.',
      };

      set((s) => ({
        incidentHistory: [debrief, ...s.incidentHistory],
        arrivalStage: 'resolved',
        activeIncidentId: null,
        officer: {
          ...s.officer,
          status: 'Available',
          incidentsResolved: s.officer.incidentsResolved + 1,
        },
      }));
      soundEffects.playSuccess();
    },

    dismissNotification: () => set({ activeNotification: null }),

    triggerNotification: (notif) => {
      set({ activeNotification: notif });
      soundEffects.playAlert();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([300, 150, 300]); } catch (e) {}
      }
    },

    requestBackup: (notes) => {
      const state = get();
      const newMsg: RadioMessage = {
        id: `backup-${Date.now()}`,
        channel: 'security',
        senderName: state.officer.name,
        senderBadge: state.officer.badgeNumber,
        content: `🚨 PRIORITY 1 BACKUP REQUEST: ${notes || 'Immediate assistance requested at active incident location.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: state.evacuationZone.building,
        isCritical: true,
      };
      set((s) => ({
        radioMessages: [newMsg, ...s.radioMessages],
      }));
      soundEffects.playRadioPing();
    },

    transferIncident: (targetOfficerId) => {
      const target = get().teamOfficers.find((o) => o.id === targetOfficerId);
      set((s) => ({
        activeIncidentId: null,
        arrivalStage: 'unassigned',
        officer: { ...s.officer, status: 'Available' },
      }));
      soundEffects.playClick();
    },

    sendRadioMessage: (channel, content, isVoice, location) => {
      const state = get();
      const newMsg: RadioMessage = {
        id: `rad-${Date.now()}`,
        channel,
        senderName: state.officer.name,
        senderBadge: state.officer.badgeNumber,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice,
        location: location || state.officer.team,
      };
      set((s) => ({
        radioMessages: [newMsg, ...s.radioMessages],
      }));
      soundEffects.playRadioPing();
    },

    evacuatePersonIncrement: (count = 1) => {
      set((s) => {
        const nextEvac = Math.min(s.evacuationZone.peopleTotal, s.evacuationZone.peopleEvacuated + count);
        return {
          evacuationZone: {
            ...s.evacuationZone,
            peopleEvacuated: nextEvac,
            status: nextEvac >= s.evacuationZone.peopleTotal ? 'cleared' : 'active',
          },
        };
      });
      soundEffects.playClick();
    },
  }))
);
