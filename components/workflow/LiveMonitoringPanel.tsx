'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Shield,
  Users,
  Flame,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  Maximize2,
  Activity,
  Layers,
} from 'lucide-react';
import { EmergencyStateDef } from '@/lib/workflow/emergency-lifecycle';
import { soundEffects } from '@/lib/audio-effects';

interface LiveMonitoringPanelProps {
  currentState: EmergencyStateDef;
  evacuatedCount: number;
  totalOccupants: number;
  selectedResponderId: string;
  onSelectResponder: (id: string) => void;
}

export function LiveMonitoringPanel({
  currentState,
  evacuatedCount,
  totalOccupants,
  selectedResponderId,
  onSelectResponder,
}: LiveMonitoringPanelProps) {
  const evacPercent = Math.min(100, Math.round((evacuatedCount / totalOccupants) * 100));

  const responders = [
    { id: 'RESP-01', name: 'Squad Alpha (Cpt. Alex Rivera)', spec: 'Fire Suppression & SCBA', dist: '140m away', eta: '45s', isRecommended: true },
    { id: 'RESP-02', name: 'Security Wing B (Off. Webb)', spec: 'Perimeter Access Control', dist: '220m away', eta: '1m 15s', isRecommended: false },
    { id: 'RESP-03', name: 'Medical ALS Unit (Dr. Mills)', spec: 'Advanced Life Support / Triage', dist: '340m away', eta: '2m 00s', isRecommended: false },
  ];

  return (
    <div className="space-y-4">
      {/* ─── 1. Evacuation Progress Live Gauge ──────────────────────────── */}
      <div className="p-4 rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#14F1D9]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">Live Evacuation Progress</h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#14F1D9]">
            {evacuatedCount} / {totalOccupants} Evacuated ({evacPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#14F1D9] via-[#22D3A5] to-[#7C5CFF] shadow-[0_0_12px_#14F1D9]"
            initial={{ width: 0 }}
            animate={{ width: `${evacPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9AB4]">
          <span className="text-[#22D3A5] font-bold">
            {totalOccupants - evacuatedCount} remaining in corridor
          </span>
          <span>Target Clearance: &le; 8 mins</span>
        </div>
      </div>

      {/* ─── 2. A* Evacuation Engine Vector Blueprint ──────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/90 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#030407]/80">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#22D3A5]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">A* Vector Pathfinding Engine</h3>
          </div>
          <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2 py-0.5 rounded border border-[#22D3A5]/30">
            HAZARD AVOIDANCE ACTIVE
          </span>
        </div>

        <div className="p-3 bg-[#030407] flex items-center justify-center">
          <svg viewBox="0 0 500 240" className="w-full h-auto max-h-[220px] select-none">
            <defs>
              <pattern id="wf-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.05)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="500" height="240" fill="#030407" />
            <rect width="500" height="240" fill="url(#wf-grid)" />

            {/* Building Outer Frame */}
            <rect x="40" y="30" width="420" height="180" rx="8" fill="none" stroke="rgba(20,241,217,0.2)" strokeWidth="1.5" />

            {/* Hallway Arteries */}
            <line x1="40" y1="130" x2="460" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />

            {/* Danger Origin at Lab 302 */}
            <circle cx="160" cy="80" r="35" fill="rgba(255,77,109,0.2)" className="animate-pulse" />
            <circle cx="160" cy="80" r="10" fill="#FF4D6D" />
            <text x="160" y="55" textAnchor="middle" fill="#FF4D6D" fontSize="9" fontWeight="bold" fontFamily="monospace">LAB 302 (FIRE)</text>

            {/* Blocked West Corridor */}
            <line x1="160" y1="130" x2="60" y2="130" stroke="#FF4D6D" strokeWidth="4" strokeDasharray="4,4" />
            <text x="100" y="150" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold" fontFamily="monospace">BLOCKED</text>

            {/* A* Computed Primary Safe Exit Path (East) */}
            <path d="M 190 130 L 440 130" stroke="#22D3A5" strokeWidth="4" strokeDasharray="8,4" fill="none" />
            <polygon points="440,130 428,124 428,136" fill="#22D3A5" />

            {/* Exit B Door */}
            <rect x="450" y="115" width="15" height="30" rx="3" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
            <text x="450" y="165" textAnchor="middle" fill="#22D3A5" fontSize="9" fontWeight="bold" fontFamily="monospace">EXIT B</text>

            {/* Assembly Point Alpha */}
            <circle cx="450" cy="205" r="12" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
            <text x="450" y="209" textAnchor="middle" fill="#070B12" fontSize="8" fontWeight="bold" fontFamily="monospace">SAFE</text>
          </svg>
        </div>
      </div>

      {/* ─── 3. Automated Dispatch Recommendation Engine ───────────────── */}
      <div className="p-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/90 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#14F1D9]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">Tactical Dispatch Engine</h3>
          </div>
          <span className="text-[9px] font-mono text-[#14F1D9] bg-[#14F1D9]/10 px-2 py-0.5 rounded border border-[#14F1D9]/30">
            AUTO-RECOMMEND
          </span>
        </div>

        <div className="space-y-2">
          {responders.map((r) => {
            const isSelected = selectedResponderId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectResponder(r.id);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#14F1D9]/15 border-[#14F1D9] shadow-[0_0_15px_rgba(20,241,217,0.2)]'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[#F0F4FF]">{r.name}</p>
                    {r.isRecommended && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40">
                        BEST ETA
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8B9AB4]">{r.spec}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#14F1D9] block">{r.dist}</span>
                  <span className="text-[10px] font-mono text-[#8B9AB4]">ETA: {r.eta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
