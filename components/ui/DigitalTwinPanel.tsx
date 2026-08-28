'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Building2, AlertTriangle, Users, ChevronRight,
  Flame, Activity, MapPin, Clock, Shield, Zap, Radio,
  Navigation, Info, RefreshCw,
} from 'lucide-react';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

interface Building {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  height: number;
  health: string;
  occupancy?: number;
  floors?: number;
}

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  latitude: number;
  longitude: number;
  location?: string;
  created_at?: string;
}

interface Responder {
  id: string;
  name: string;
  role: string;
  status: string;
  latitude: number;
  longitude: number;
}

const severityColor: Record<string, string> = {
  critical: '#FF4D6D',
  high: '#FF8C42',
  medium: '#FFB347',
  low: '#22D3A5',
};

const typeIcon: Record<string, any> = {
  fire: Flame,
  medical: Activity,
  crowd: Users,
  electrical: Zap,
  flood: Radio,
  default: AlertTriangle,
};

const healthColor: Record<string, string> = {
  safe: '#22D3A5',
  warning: '#FFB347',
  critical: '#FF4D6D',
  medical: '#7C5CFF',
};

function IncidentItem({ incident }: { incident: Incident }) {
  const Icon = typeIcon[incident.type] ?? typeIcon.default;
  const sColor = severityColor[incident.severity] ?? '#8B9AB4';

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2.5 p-2.5 rounded-xl border"
      style={{
        background: `${sColor}08`,
        borderColor: `${sColor}30`,
      }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${sColor}20` }}>
        <Icon size={13} style={{ color: sColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-semibold text-[#F0F4FF] truncate">{incident.title}</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${sColor}25`, color: sColor }}
          >
            {incident.severity?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={9} className="text-[#8B9AB4]" />
          <span className="text-[9px] text-[#8B9AB4] truncate">{incident.location ?? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}</span>
        </div>
        {incident.created_at && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={9} className="text-[#4A5568]" />
            <span className="text-[9px] text-[#4A5568]">
              {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ResponderItem({ responder }: { responder: Responder }) {
  const isActive = responder.status === 'active' || responder.status === 'en_route';
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-[#22D3A5] animate-pulse' : 'bg-[#4A5568]'}`} />
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-medium text-[#C5CDE8] truncate block">{responder.name}</span>
        <span className="text-[9px] text-[#4A5568] uppercase">{responder.role?.replace('_', ' ')}</span>
      </div>
      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
        style={{ background: isActive ? 'rgba(34,211,165,0.12)' : 'rgba(74,85,104,0.2)', color: isActive ? '#22D3A5' : '#8B9AB4' }}>
        {responder.status?.replace('_', ' ')}
      </span>
    </div>
  );
}

export function DigitalTwinPanel() {
  const { state, setState } = useDigitalTwin();
  const { showPanel, incidents, responders } = state;
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [activeTab, setActiveTab] = useState<'incidents' | 'responders' | 'info'>('incidents');
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent) => setSelectedBuilding(e.detail as Building);
    window.addEventListener('building-selected', handler as EventListener);
    return () => window.removeEventListener('building-selected', handler as EventListener);
  }, []);

  const handleGenerateEvacRoute = () => {
    setIsGeneratingRoute(true);
    setTimeout(() => {
      setIsGeneratingRoute(false);
      window.dispatchEvent(new CustomEvent('generate-evac-route', { detail: selectedBuilding }));
    }, 1800);
  };

  const tabs = [
    { id: 'incidents', label: 'Incidents', count: incidents.length, color: '#FF4D6D' },
    { id: 'responders', label: 'Responders', count: responders.length, color: '#22D3A5' },
    { id: 'info', label: 'Info', count: null, color: '#14F1D9' },
  ] as const;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          className="absolute top-0 right-0 h-full flex flex-col z-20 overflow-hidden"
          style={{
            width: 320,
            background: 'rgba(7,11,18,0.88)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
          }}
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/30 flex items-center justify-center">
                  <Shield size={16} className="text-[#14F1D9]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F0F4FF]">Campus Status</div>
                  <div className="text-[10px] text-[#8B9AB4]">AI Digital Twin Command</div>
                </div>
              </div>
              <button
                onClick={() => setState((p) => ({ ...p, showPanel: false }))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4A5568] hover:text-[#F0F4FF] hover:bg-white/[0.06] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Incidents', value: incidents.length, color: '#FF4D6D', icon: AlertTriangle },
                { label: 'Responders', value: responders.length, color: '#22D3A5', icon: Users },
                { label: 'Buildings', value: 9, color: '#14F1D9', icon: Building2 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2 rounded-xl text-center"
                  style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}
                >
                  <s.icon size={14} style={{ color: s.color }} className="mx-auto mb-0.5" />
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] text-[#4A5568]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected building */}
          <AnimatePresence>
            {selectedBuilding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 px-4 py-3 border-b border-white/[0.07]"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${healthColor[selectedBuilding.health] ?? '#8B9AB4'}20` }}
                  >
                    <Building2 size={15} style={{ color: healthColor[selectedBuilding.health] ?? '#8B9AB4' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#F0F4FF] truncate">{selectedBuilding.name}</span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${healthColor[selectedBuilding.health] ?? '#8B9AB4'}20`,
                          color: healthColor[selectedBuilding.health] ?? '#8B9AB4',
                        }}
                      >
                        {selectedBuilding.health?.toUpperCase()}
                      </span>
                    </div>
                    {selectedBuilding.occupancy && (
                      <div className="text-[10px] text-[#8B9AB4] mt-0.5">
                        👥 {selectedBuilding.occupancy} occupants · {selectedBuilding.floors ?? '?'} floors
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-[#4A5568] flex-shrink-0 mt-1" />
                </div>

                {/* Generate evacuation route */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateEvacRoute}
                  disabled={isGeneratingRoute}
                  className="w-full mt-2.5 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: isGeneratingRoute ? 'rgba(20,241,217,0.08)' : 'rgba(20,241,217,0.15)',
                    border: '1px solid rgba(20,241,217,0.4)',
                    color: '#14F1D9',
                    boxShadow: isGeneratingRoute ? 'none' : '0 0 20px rgba(20,241,217,0.15)',
                  }}
                >
                  {isGeneratingRoute ? (
                    <>
                      <div className="w-3 h-3 border-2 border-t-[#14F1D9] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                      Generating Route…
                    </>
                  ) : (
                    <>
                      <Navigation size={13} />
                      Generate Evacuation Route
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab nav */}
          <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/[0.07]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                  color: activeTab === tab.id ? tab.color : '#4A5568',
                  border: activeTab === tab.id ? `1px solid ${tab.color}40` : '1px solid transparent',
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className="text-[9px] px-1 rounded-full font-bold"
                    style={{ background: `${tab.color}25`, color: tab.color }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
            {activeTab === 'incidents' && (
              <>
                {incidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#22D3A5]/10 flex items-center justify-center mb-3">
                      <Shield size={22} className="text-[#22D3A5]" />
                    </div>
                    <div className="text-sm font-semibold text-[#F0F4FF]">All Clear</div>
                    <div className="text-xs text-[#4A5568] mt-1">No active incidents on campus</div>
                  </div>
                ) : (
                  incidents.map((inc: any) => <IncidentItem key={inc.id} incident={inc} />)
                )}
              </>
            )}

            {activeTab === 'responders' && (
              <>
                {responders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#14F1D9]/10 flex items-center justify-center mb-3">
                      <Users size={22} className="text-[#14F1D9]" />
                    </div>
                    <div className="text-sm font-semibold text-[#F0F4FF]">No Active Responders</div>
                    <div className="text-xs text-[#4A5568] mt-1">Dispatch responders from the command center</div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {responders.map((r: any) => <ResponderItem key={r.id} responder={r} />)}
                  </div>
                )}
              </>
            )}

            {activeTab === 'info' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-[10px] font-bold text-[#8B9AB4] uppercase tracking-wider mb-2">System Status</div>
                  {[
                    { label: 'Supabase Realtime', status: 'Connected', color: '#22D3A5' },
                    { label: '3D Render Engine', status: 'Active', color: '#22D3A5' },
                    { label: 'AI Simulation', status: 'Standby', color: '#FFB347' },
                    { label: 'Evacuation Pathfinder', status: 'Ready', color: '#14F1D9' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-[#8B9AB4]">{s.label}</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color }} />
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-[10px] font-bold text-[#8B9AB4] uppercase tracking-wider mb-2">Legend</div>
                  {[
                    { color: '#14F1D9', label: 'Safe Building' },
                    { color: '#22D3A5', label: 'No Threat' },
                    { color: '#FFB347', label: 'Warning' },
                    { color: '#FF4D6D', label: 'Critical Incident' },
                    { color: '#7C5CFF', label: 'Medical Emergency' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2 py-1">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                      <span className="text-[11px] text-[#C5CDE8]">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 px-4 py-3 border-t border-white/[0.07] flex items-center justify-between"
            style={{ background: 'rgba(7,11,18,0.5)' }}
          >
            <span className="text-[9px] text-[#4A5568] font-mono">
              REALTIME · <span className="text-[#22D3A5]">CONNECTED</span>
            </span>
            <button className="flex items-center gap-1 text-[9px] text-[#4A5568] hover:text-[#8B9AB4] transition-colors">
              <RefreshCw size={10} />
              Refresh
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
