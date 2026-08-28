import { supabase } from './client';
import type { Database } from './database.types';

type IncidentRow = Database['public']['Tables']['incidents']['Row'];
type ResponderRow = Database['public']['Tables']['responders']['Row'];
type AlertRow = Database['public']['Tables']['alerts']['Row'];
type SensorRow = Database['public']['Tables']['sensors']['Row'];

/**
 * Subscribes to real-time incident updates across all tables or a specific incident
 */
export function subscribeToIncidents(
  onInsert?: (incident: IncidentRow) => void,
  onUpdate?: (incident: IncidentRow) => void,
  onDelete?: (id: string) => void,
) {
  const channel = supabase
    .channel('realtime:incidents')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'incidents' },
      (payload) => {
        onInsert?.(payload.new as IncidentRow);
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'incidents' },
      (payload) => {
        onUpdate?.(payload.new as IncidentRow);
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'incidents' },
      (payload) => {
        if (payload.old && (payload.old as { id?: string }).id) {
          onDelete?.((payload.old as { id: string }).id);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to real-time responder position and status changes
 */
export function subscribeToResponders(
  onUpdate: (responder: ResponderRow) => void,
  onInsert?: (responder: ResponderRow) => void,
) {
  const channel = supabase
    .channel('realtime:responders')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'responders' },
      (payload) => {
        onUpdate(payload.new as ResponderRow);
      },
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'responders' },
      (payload) => {
        onInsert?.(payload.new as ResponderRow);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to high-priority safety alerts
 */
export function subscribeToAlerts(onNewAlert: (alert: AlertRow) => void) {
  const channel = supabase
    .channel('realtime:alerts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => {
        onNewAlert(payload.new as AlertRow);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to live sensor telemetry streams
 */
export function subscribeToSensors(onSensorUpdate: (sensor: SensorRow) => void) {
  const channel = supabase
    .channel('realtime:sensors')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sensors' },
      (payload) => {
        onSensorUpdate(payload.new as SensorRow);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
