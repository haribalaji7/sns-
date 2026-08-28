'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Shield,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Layers,
  MapPin,
  Footprints,
  Info,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

export function StudentMapTab() {
  const [selectedRoute, setSelectedRoute] = useState<'primary' | 'secondary'>('primary');
  const [showBlocked, setShowBlocked] = useState(true);

  const waypoints = [
    { step: '01', text: 'You are currently at Central Quad Walkway (Safe Zone)' },
    { step: '02', text: 'Walk 120m East along Quad Pavilion path' },
    { step: '03', text: 'Avoid West Science Block corridor (BLOCKED DUE TO SMOKE)' },
    { step: '04', text: 'Arrive safely at Assembly Point Alpha (North Quad)' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#070B12] text-[#F0F4FF] overflow-y-auto pb-20">
      {/* ─── Top Control Banner ─────────────────────────────────────────── */}
      <div className="p-4 border-b border-white/[0.08] bg-[#070B12]/90 backdrop-blur-md flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#14F1D9]" />
            Live Safe Route Navigation
          </h2>
          <p className="text-[10px] font-mono text-[#8B9AB4]">
            Dynamic GPS Pathfinding Avoids Active Danger Zones
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRoute('primary');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              selectedRoute === 'primary'
                ? 'bg-[#22D3A5] text-[#070B12]'
                : 'text-[#8B9AB4]'
            }`}
          >
            Safe Route
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRoute('secondary');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              selectedRoute === 'secondary'
                ? 'bg-[#7C5CFF] text-white'
                : 'text-[#8B9AB4]'
            }`}
          >
            Alt. Route
          </button>
        </div>
      </div>

      {/* ─── Interactive Vector Map Viewport ───────────────────────────── */}
      <div className="relative w-full h-72 bg-[#030407] overflow-hidden flex items-center justify-center border-b border-white/[0.08]">
        <svg viewBox="0 0 400 300" className="w-full h-full object-cover select-none">
          <defs>
            <pattern id="stu-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.06)" strokeWidth="0.8" />
            </pattern>
            <pattern id="hazard-pattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#FF4D6D" strokeWidth="3" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#070B12" strokeWidth="3" />
            </pattern>
          </defs>

          <rect width="400" height="300" fill="#030407" />
          <rect width="400" height="300" fill="url(#stu-grid)" />

          {/* Campus Outer Boundary */}
          <rect x="20" y="20" width="360" height="260" rx="10" fill="none" stroke="rgba(20,241,217,0.12)" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Walkways */}
          <path d="M 80 150 L 220 150 L 320 70" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 220 150 L 220 240" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" fill="none" />

          {/* Blocked Path (Hazard Zone near Science Block) */}
          {showBlocked && (
            <g>
              <line x1="80" y1="150" x2="80" y2="70" stroke="url(#hazard-pattern)" strokeWidth="10" strokeLinecap="round" />
              <rect x="50" y="100" width="60" height="18" rx="4" fill="#070B12" stroke="#FF4D6D" strokeWidth="1" />
              <text x="80" y="112" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold" fontFamily="monospace">BLOCKED</text>
            </g>
          )}

          {/* Animated Safe Walking Path */}
          <motion.path
            d={selectedRoute === 'primary' ? 'M 140 180 L 220 150 L 320 70' : 'M 140 180 L 220 240 L 330 240 L 330 90'}
            stroke={selectedRoute === 'primary' ? '#22D3A5' : '#7C5CFF'}
            strokeWidth="3.5"
            strokeDasharray="6,4"
            fill="none"
          />

          {/* Science Block Danger Polygon */}
          <rect x="40" y="40" width="80" height="60" rx="6" fill="rgba(255,77,109,0.15)" stroke="#FF4D6D" strokeWidth="1.5" />
          <text x="80" y="70" textAnchor="middle" fill="#FF4D6D" fontSize="9" fontWeight="bold">Science Lab 302</text>
          <text x="80" y="82" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontFamily="monospace">FIRE HAZARD</text>

          {/* Student Live Position */}
          <circle cx="140" cy="180" r="14" fill="rgba(20,241,217,0.3)" className="animate-pulse" />
          <circle cx="140" cy="180" r="6" fill="#14F1D9" stroke="#FFFFFF" strokeWidth="2" />
          <text x="140" y="205" textAnchor="middle" fill="#14F1D9" fontSize="9" fontWeight="bold" fontFamily="monospace">YOU (GPS)</text>

          {/* Assembly Point Alpha */}
          <circle cx="320" cy="70" r="16" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
          <text x="320" y="74" textAnchor="middle" fill="#070B12" fontSize="9" fontWeight="bold" fontFamily="monospace">SAFE</text>
          <text x="320" y="96" textAnchor="middle" fill="#22D3A5" fontSize="9" fontWeight="bold">Assembly Alpha</text>
        </svg>

        {/* Live Status Overlay */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 border border-[#22D3A5]/40 text-[10px] font-mono text-[#22D3A5] backdrop-blur-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22D3A5] animate-ping" />
          <span>ROUTE SECURED · NO THREATS</span>
        </div>
      </div>

      {/* ─── Turn-By-Turn Waypoints Guide ──────────────────────────────── */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-[#22D3A5]" />
            Turn-by-Turn Safe Directives
          </h3>
          <span className="text-[10px] font-mono text-[#8B9AB4]">EST: 3 MIN WALK</span>
        </div>

        <div className="space-y-2">
          {waypoints.map((wp) => (
            <div key={wp.step} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3">
              <span className="text-xs font-mono font-black text-[#14F1D9] mt-0.5">{wp.step}</span>
              <p className="text-xs text-[#D0D6E0] leading-snug">{wp.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
