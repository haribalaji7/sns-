import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Incident, Responder, CrowdPoint } from '@/types/digitalTwin';

interface DigitalTwinState {
  incidents: Incident[];
  responders: Responder[];
  crowd: CrowdPoint[];
  showMiniMap: boolean;
  showCommandBar: boolean;
  showPanel: boolean;
  showBuildings: boolean;
  showIncidents: boolean;
  showResponders: boolean;
  emergencyMode: boolean;
  quality: 'high' | 'medium' | 'low' | 'auto';
}

const defaultState: DigitalTwinState = {
  incidents: [],
  responders: [],
  crowd: [],
  showMiniMap: true,
  showCommandBar: true,
  showPanel: true,
  showBuildings: true,
  showIncidents: true,
  showResponders: true,
  emergencyMode: false,
  quality: 'auto',
};

const DigitalTwinContext = createContext<{
  state: DigitalTwinState;
  setState: React.Dispatch<React.SetStateAction<DigitalTwinState>>;
} | null>(null);

export const DigitalTwinProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DigitalTwinState>(defaultState);

  // Subscribe to Supabase realtime channels
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const incidentsChannel = supabase
      .channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        const newRecord = payload.new as any;
        if (!newRecord?.id) return;
        setState((prev) => {
          const updated = prev.incidents.filter((i) => i.id !== newRecord.id);
          updated.push(newRecord as Incident);
          return { ...prev, incidents: updated };
        });
      })
      .subscribe();

    const respondersChannel = supabase
      .channel('public:responders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responders' }, (payload) => {
        const newRecord = payload.new as any;
        if (!newRecord?.id) return;
        setState((prev) => {
          const updated = prev.responders.filter((r) => r.id !== newRecord.id);
          updated.push(newRecord as Responder);
          return { ...prev, responders: updated };
        });
      })
      .subscribe();

    const crowdChannel = supabase
      .channel('public:crowd')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crowd' }, (payload) => {
        const newRecord = payload.new as any;
        if (!newRecord?.id) return;
        setState((prev) => {
          const updated = prev.crowd.filter((c) => c.id !== newRecord.id);
          updated.push(newRecord as CrowdPoint);
          return { ...prev, crowd: updated };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(respondersChannel);
      supabase.removeChannel(crowdChannel);
    };
  }, []);

  return <DigitalTwinContext.Provider value={{ state, setState }}>{children}</DigitalTwinContext.Provider>;
};

export const useDigitalTwin = () => {
  const ctx = useContext(DigitalTwinContext);
  if (!ctx) throw new Error('useDigitalTwin must be used within DigitalTwinProvider');
  return ctx;
};
