'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  UserX,
  Heart,
  Wind,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  Users,
  Navigation,
  Cpu,
  CheckCircle2,
  Lock,
  Volume2,
  Sparkles,
  ChevronRight,
  Eye,
  Sliders,
  Zap,
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';
import { timeAgo, severityColor, statusColor } from '@/lib/utils';
import type { Incident } from '@/types';

export function DashboardRightPanel() {
  const {
    incidents,
    responders,
    selectedIncidentId,
    selectIncident,
    updateIncidentStatus,
    addToast,
  } = useDashboardStore();

  const [filterType, setFilterType] = useState<string>('all');

  // Selected or top critical incident
  const activeIncident: Incident =
    incidents.find((i) => i.id === selectedIncidentId) ||
    incidents.find((i) => i.severity === 'critical') ||
    incidents[0];

  // Assigned responders for this incident
  const assignedResponders = responders.filter(
    (r) =>
      r.currentIncidentId === activeIncident?.id ||
      activeIncident?.assignedResponders?.includes(r.id),
  );

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType === 'all') return true;
    if (filterType === 'critical') return inc.severity === 'critical';
    if (filterType === 'active') return inc.status === 'active' || inc.status === 'responding';
    return true;
  });

  const handleAction = (actionName: string) => {
    addToast({
      type: 'success',
      title: `Action Executed: ${actionName}`,
      message: `Protocol dispatched to ${activeIncident.location}. Telemetry updated.`,
    });
  };

  const handleResolve = () => {
    updateIncidentStatus(activeIncident.id, 'resolved');
    addToast({
      type: 'info',
      title: 'Incident Resolved',
      message: `${activeIncident.title} has been marked contained & resolved.`,
    });
  };

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 border-l border-[rgba(20,241,217,0.12)] bg-card/95 dark:bg-[#070B12]/95 backdrop-blur-xl">
      {/* ─── 1. EMERGENCY CARD ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 glass border border-[rgba(255,77,109,0.35)] bg-gradient-to-b from-[#FF4D6D]/10 via-transparent to-transparent shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF4D6D]/20 text-[#FF4D6D] text-[10px] font-mono font-bold border border-[#FF4D6D]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-ping" />
            CRITICAL EMERGENCY
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            ID: {activeIncident.id}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground leading-snug">
          {activeIncident.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {activeIncident.description}
        </p>

        {/* Location & Risk Matrix */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-left">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <span className="text-[10px] font-mono text-muted-foreground block">LOCATION</span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {activeIncident.location}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <span className="text-[10px] font-mono text-muted-foreground block">PEOPLE AT RISK</span>
            <span className="text-xs font-bold text-[#FF4D6D]">
              {activeIncident.peopleAtRisk} Occupants
            </span>
          </div>
        </div>

        {/* ─── 2. AI SEVERITY & CONFIDENCE GAUGE ───────────────────────── */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground block">AI CONFIDENCE</span>
            <span className="text-xs font-bold text-[#14F1D9] flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {activeIncident.aiConfidence}% (YOLOv8)
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-muted-foreground block">THREAT SCORE</span>
            <span className="text-xs font-bold text-[#FF4D6D]">
              {activeIncident.severity.toUpperCase()} · 95/100
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ASSIGNED RESPONSE SQUAD ────────────────────────────────── */}
      <div className="rounded-2xl p-4 glass border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-bold text-foreground uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#14F1D9]" />
            Assigned Team ({assignedResponders.length})
          </h4>
          <span className="text-[10px] font-mono text-[#14F1D9]">CH-4 TACTICAL</span>
        </div>

        {assignedResponders.length > 0 ? (
          <div className="space-y-2.5">
            {assignedResponders.map((resp) => (
              <div
                key={resp.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center font-bold text-xs text-[#14F1D9] flex-shrink-0">
                    {resp.name.split(' ')[0][0]}
                    {resp.name.split(' ')[1]?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{resp.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{resp.role}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: resp.status === 'on_scene' ? 'rgba(34,211,165,0.2)' : 'rgba(20,241,217,0.2)',
                      color: resp.status === 'on_scene' ? '#22D3A5' : '#14F1D9',
                    }}
                  >
                    {resp.status === 'on_scene' ? 'ON SCENE' : `${resp.etaSeconds}s ETA`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-muted-foreground rounded-xl bg-white/[0.02]">
            No tactical units dispatched yet.
          </div>
        )}
      </div>

      {/* ─── 4. QUICK ACTIONS ──────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 glass border border-white/10">
        <h4 className="text-xs font-mono font-bold text-foreground uppercase mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#FFB347]" />
          Autonomous Quick Actions
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <GradientButton
            variant="purple"
            size="sm"
            onClick={() => handleAction('Backup Squad Dispatched')}
            className="text-[11px] font-semibold"
          >
            Dispatch Squad
          </GradientButton>

          <GradientButton
            variant="red"
            size="sm"
            onClick={() => handleAction('Zone Evacuation Broadcast')}
            className="text-[11px] font-semibold"
          >
            Broadcast Evac
          </GradientButton>

          <button
            onClick={() => handleAction('Lockdown Activated')}
            className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground border border-border transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Lock className="w-3 h-3 text-[#FF4D6D]" />
            Lockdown
          </button>

          <button
            onClick={() => handleAction('HVAC Purge Engaged')}
            className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground border border-border transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Wind className="w-3 h-3 text-[#14F1D9]" />
            HVAC Purge
          </button>
        </div>

        <div className="mt-3">
          <GradientButton
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleResolve}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#22D3A5]" />}
            className="text-xs font-semibold border-[rgba(34,211,165,0.4)] text-[#22D3A5] hover:bg-[rgba(34,211,165,0.1)]"
          >
            Mark Incident Contained
          </GradientButton>
        </div>
      </div>

      {/* ─── 5. LIVE INCIDENT FEED ─────────────────────────────────────── */}
      <div className="rounded-2xl p-4 glass border border-white/10 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-bold text-foreground uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#FF4D6D] animate-pulse" />
            Live Feed ({filteredIncidents.length})
          </h4>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                filterType === 'all' ? 'bg-black/10 dark:bg-white/20 text-foreground' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                filterType === 'active' ? 'bg-[#FF4D6D]/20 text-[#FF4D6D]' : 'text-muted-foreground'
              }`}
            >
              Active
            </button>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
          {filteredIncidents.map((inc) => {
            const isSelected = inc.id === activeIncident.id;
            return (
              <div
                key={inc.id}
                onClick={() => selectIncident(inc.id)}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'glass border-[rgba(20,241,217,0.5)] bg-white/[0.08] shadow-[0_0_15px_rgba(20,241,217,0.2)]'
                    : 'glass-subtle border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#FF4D6D] uppercase">
                    {inc.type}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {timeAgo(inc.reportedAt)}
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-foreground line-clamp-1">{inc.title}</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">{inc.location}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
