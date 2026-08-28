'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map as MapIcon,
  Shield,
  Layers,
  Radio,
  Flame,
  UserX,
  Heart,
  Wind,
  Navigation,
  Activity,
  Maximize2,
  Sparkles,
  Eye,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { CampusMap } from '@/components/map/CampusMap';
import { useDashboardStore } from '@/store/dashboard';
import { GradientButton } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

export default function CampusMapPage() {
  const { incidents, responders, zones, selectIncident, selectedIncidentId, addToast } =
    useDashboardStore();

  const activeIncidents = incidents.filter(
    (i) => i.status === 'active' || i.status === 'responding',
  );
  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) || activeIncidents[0] || incidents[0];

  return (
    <div className="p-4 sm:p-5 flex flex-col h-full gap-4 max-w-full">
      {/* ─── Page Header Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14F1D9] animate-pulse" />
            <h1 className="text-xl font-bold text-[#F0F4FF] tracking-tight">
              Google Maps Emergency Command Center
            </h1>
            <span className="px-2 py-0.5 rounded bg-[rgba(20,241,217,0.15)] text-[#14F1D9] text-xs font-mono font-semibold border border-[rgba(20,241,217,0.3)]">
              STREET VIEW 360 · 3D TILT
            </span>
          </div>
          <p className="text-xs text-[#8B9AB4] mt-0.5">
            Geospatial command center featuring satellite imagery, Street View 360 spherical panoramas, live squad telemetry, and A* evacuation corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8B9AB4]">
            <span className="w-2 h-2 rounded-full bg-[#00E59B]" />
            <span>4 SAFE ASSEMBLY ZONES</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8B9AB4]">
            <span className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
            <span>{responders.length} UNITS TRACKED</span>
          </div>
        </div>
      </div>

      {/* ─── Master Map Layout (Map + Intelligence Panel) ─────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[660px]">
        {/* Left: Google Maps Component (8 cols on desktop) */}
        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-[580px]">
          <CampusMap height="100%" onSelectIncident={(id) => selectIncident(id)} />
        </div>

        {/* Right: Tactical Intelligence Feed (4 cols on desktop) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          {/* Active Incident Tactical Card */}
          {activeIncident && (
            <div className="glass rounded-2xl p-4 border border-[rgba(255,77,109,0.3)] bg-[#070B12]/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40">
                  {activeIncident.severity.toUpperCase()} ALERT
                </span>
                <span className="text-[10px] font-mono text-[#8B9AB4]">
                  {timeAgo(activeIncident.reportedAt)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F0F4FF]">{activeIncident.title}</h3>
                <p className="text-xs text-[#8B9AB4] mt-0.5">{activeIncident.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[9px] text-[#8B9AB4] block">PEOPLE AT RISK</span>
                  <span className="text-sm font-bold text-[#FF4D6D]">
                    {activeIncident.peopleAtRisk}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[9px] text-[#8B9AB4] block">AI CONFIDENCE</span>
                  <span className="text-sm font-bold text-[#14F1D9]">
                    {activeIncident.aiConfidence}%
                  </span>
                </div>
              </div>

              <GradientButton
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'Tactical Squad Alpha Dispatched',
                    message: `Dispatched to ${activeIncident.location}. ETA 45s.`,
                  });
                }}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Dispatch Nearest Squad
              </GradientButton>
            </div>
          )}

          {/* Quick Incident Triage Queue */}
          <div className="glass rounded-2xl p-4 border border-white/10 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  Active Incident Queue
                </h4>
                <span className="text-[10px] font-mono text-[#8B9AB4]">
                  {activeIncidents.length} Active
                </span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {incidents.map((inc) => {
                  const isSelected = selectedIncidentId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => selectIncident(inc.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[rgba(20,241,217,0.5)] bg-white/[0.06] shadow-[0_0_12px_rgba(20,241,217,0.2)]'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#F0F4FF] truncate">
                          {inc.title}
                        </span>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor:
                              inc.severity === 'critical' ? '#FF4D6D25' : '#F59E0B25',
                            color: inc.severity === 'critical' ? '#FF4D6D' : '#F59E0B',
                          }}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B9AB4] truncate">{inc.location}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8B9AB4]">
              <span>Realtime Sync: Active</span>
              <span className="text-[#14F1D9]">3D Vector Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
