'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Incident, Responder, CampusZone, Sensor, AIAlert,
  SystemMetrics, ToastNotification,
} from '@/types';
import {
  MOCK_INCIDENTS, MOCK_RESPONDERS, MOCK_ZONES, MOCK_SENSORS,
  MOCK_AI_ALERTS, MOCK_METRICS,
} from '@/lib/mock-data';

import { supabase } from '@/lib/supabase/client';

interface DashboardStore {
  // Data
  incidents: Incident[];
  responders: Responder[];
  zones: CampusZone[];
  sensors: Sensor[];
  aiAlerts: AIAlert[];
  metrics: SystemMetrics;
  toasts: ToastNotification[];

  // UI state
  selectedIncidentId: string | null;
  selectedZoneId: string | null;
  activeFilter: string;
  sidebarCollapsed: boolean;
  mapStyle: 'dark' | 'satellite';
  currentDetection: any | null;
  copilotOpen: boolean;
  liveSensorStreaming: boolean;

  // Actions
  selectIncident: (id: string | null) => void;
  selectZone: (id: string | null) => void;
  setFilter: (f: string) => void;
  toggleSidebar: () => void;
  toggleMapStyle: () => void;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  toggleLiveSensorStreaming: () => void;
  tickTelemetry: () => void;
  acknowledgeAlert: (id: string) => void;
  addToast: (t: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  setCurrentDetection: (detection: any | null) => void;
  verifyIncident: (detection: any) => Promise<void>;
  logFalseAlarm: (detection: any, reason?: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set, get) => ({
    incidents:  MOCK_INCIDENTS,
    responders: MOCK_RESPONDERS,
    zones:      MOCK_ZONES,
    sensors:    MOCK_SENSORS,
    aiAlerts:   MOCK_AI_ALERTS,
    metrics:    MOCK_METRICS,
    toasts:     [],

    selectedIncidentId: null,
    selectedZoneId:     null,
    activeFilter:       'all',
    sidebarCollapsed:   false,
    mapStyle:           'dark',
    currentDetection:   null,
    copilotOpen:        false,
    liveSensorStreaming: true,

    selectIncident: (id) => set({ selectedIncidentId: id }),
    selectZone:     (id) => set({ selectedZoneId: id }),
    setFilter:      (f)  => set({ activeFilter: f }),
    toggleSidebar:  ()   => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    toggleMapStyle: ()   => set((s) => ({
      mapStyle: s.mapStyle === 'dark' ? 'satellite' : 'dark',
    })),
    toggleCopilot:  ()   => set((s) => ({ copilotOpen: !s.copilotOpen })),
    setCopilotOpen: (open) => set({ copilotOpen: open }),
    toggleLiveSensorStreaming: () => set((s) => ({ liveSensorStreaming: !s.liveSensorStreaming })),
    tickTelemetry: () => set((s) => {
      const delta = (Math.random() - 0.5) * 0.4;
      const newAccuracy = Number(Math.min(99.9, Math.max(94.0, s.metrics.aiAccuracy + delta)).toFixed(1));
      return {
        metrics: {
          ...s.metrics,
          aiAccuracy: newAccuracy,
          sensorsOnline: Math.min(s.metrics.totalSensors, s.metrics.sensorsOnline),
        },
      };
    }),

    acknowledgeAlert: (id) =>
      set((s) => ({
        aiAlerts: s.aiAlerts.map((a) =>
          a.id === id ? { ...a, acknowledged: true } : a,
        ),
      })),

    addToast: (t) =>
      set((s) => ({
        toasts: [
          { ...t, id: Date.now().toString(), timestamp: new Date().toISOString() },
          ...s.toasts,
        ].slice(0, 5),
      })),

    removeToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    updateIncidentStatus: (id, status) =>
      set((s) => ({
        incidents: s.incidents.map((inc) =>
          inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc,
        ),
      })),
      
    setCurrentDetection: (detection) => set({ currentDetection: detection }),
    
    verifyIncident: async (detection) => {
      const state = get();
      const newId = `INC-00${state.incidents.length + 92}`;
      
      const newIncident: Incident = {
        id: newId,
        type: detection.type || 'fire',
        severity: detection.severity || 'critical',
        status: 'active',
        title: detection.title || 'Verified AI Detection',
        description: detection.recommendation || 'AI generated incident.',
        location: detection.location || 'Science Block B – Floor 3',
        zone: detection.zone || 'Z-SCIB',
        coordinates: detection.coordinates || { lat: 28.6139, lng: 77.2090 },
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiConfidence: detection.confidence || 96,
        peopleAtRisk: detection.occupancy || 42,
        assignedResponders: detection.type === 'medical' ? ['R-104'] : ['R-101', 'R-103'],
        cameraIds: detection.cameraId ? [detection.cameraId] : ['CAM-AI-01'],
        tags: ['ai-verified', detection.type || 'hazard'],
      };

      const newAlert: AIAlert = {
        id: `AI-${Date.now().toString().slice(-4)}`,
        incidentId: newId,
        type: 'prediction',
        severity: detection.severity || 'critical',
        title: `Verified Incident: ${newIncident.title}`,
        message: detection.recommendation || 'Verified by AI Detection Center & dispatched.',
        confidence: detection.confidence || 96,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      };

      // Optimistic UI state update
      set((s) => ({
        incidents: [newIncident, ...s.incidents],
        aiAlerts: [newAlert, ...s.aiAlerts],
        metrics: {
          ...s.metrics,
          activeIncidents: s.metrics.activeIncidents + 1,
          totalIncidents: s.metrics.totalIncidents + 1,
        },
        toasts: [
          {
            id: Date.now().toString(),
            type: 'success' as const,
            title: `Incident ${newId} Verified & Dispatched`,
            message: `${newIncident.title} (${newIncident.location}) broadcast to responders.`,
            timestamp: new Date().toISOString(),
          },
          ...s.toasts,
        ].slice(0, 5),
      }));

      // Asynchronous Supabase insertion & Realtime broadcast
      try {
        await supabase.from('incidents').insert({
          id: newIncident.id,
          title: newIncident.title,
          type: newIncident.type,
          severity: newIncident.severity,
          status: 'active',
          description: newIncident.description,
          latitude: newIncident.coordinates.lat,
          longitude: newIncident.coordinates.lng,
          location: newIncident.location,
          confidence: newIncident.aiConfidence,
          risk_score: detection.riskScore || 90,
          people_at_risk: newIncident.peopleAtRisk,
          assigned_responders: newIncident.assignedResponders,
          camera_ids: newIncident.cameraIds,
          tags: newIncident.tags,
          created_at: newIncident.reportedAt,
          updated_at: newIncident.updatedAt,
        });

        await supabase.from('alerts').insert({
          title: newAlert.title,
          message: newAlert.message,
          audience: 'all',
          type: 'emergency',
          severity: newAlert.severity,
          confidence: newAlert.confidence,
          incident_id: newIncident.id,
          sent_at: newAlert.timestamp,
        });
      } catch (e) {
        // Graceful fallback for mock mode
        console.log('Supabase sync (offline or mock):', e);
      }
    },

    logFalseAlarm: (detection, reason = 'Operator classified as false alarm') => {
      set((s) => ({
        toasts: [
          {
            id: Date.now().toString(),
            type: 'info' as const,
            title: 'False Alarm Logged',
            message: `Feedback recorded for AI model retraining (${detection?.title || 'Unknown'}).`,
            timestamp: new Date().toISOString(),
          },
          ...s.toasts,
        ].slice(0, 5),
      }));
    },
  })),
);
