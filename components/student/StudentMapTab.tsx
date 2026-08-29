'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Crosshair,
  Radio,
  Users,
  Heart,
  Eye,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useStudentStore } from '@/store/student';
import { useDashboardStore } from '@/store/dashboard';

export function StudentMapTab() {
  const { assemblyPoints, profile } = useStudentStore();
  const { incidents, responders } = useDashboardStore();

  const [selectedRoute, setSelectedRoute] = useState<'primary' | 'secondary'>('primary');
  const [activeLayer, setActiveLayer] = useState<'all' | 'safe_zones' | 'hazards' | 'responders'>('all');
  const [followMode, setFollowMode] = useState(true);
  const [compassAngle, setCompassAngle] = useState(0);

  const waypoints = [
    { step: '01', text: 'You are currently at Central Quad Walkway (Safe Sector)' },
    { step: '02', text: 'Proceed 120m East along Quad Pavilion path' },
    { step: '03', text: 'Avoid West Science Block corridor (ACTIVE HAZARD DETECTED)' },
    { step: '04', text: 'Muster at Assembly Point Alpha (North Quad Safe Lawn)' },
  ];

  const handleCompassRotate = () => {
    soundEffects.playClick();
    setCompassAngle((prev) => (prev + 90) % 360);
  };

  const handleLocateMe = () => {
    soundEffects.playScan();
    setFollowMode(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#070B12] text-[#F0F4FF] overflow-y-auto pb-20">
      {/* ─── Top Control Banner ─────────────────────────────────────────── */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#070B12]/90 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#14F1D9]" />
            Live Safe Route Navigation
          </h2>
          <p className="text-[9px] font-mono text-[#8B9AB4]">
            Dynamic GPS Pathfinding · Avoids Active Threat Polygons
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRoute('primary');
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
              selectedRoute === 'primary'
                ? 'bg-[#22D3A5] text-[#070B12]'
                : 'text-[#8B9AB4]'
            }`}
          >
            Safe Primary
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedRoute('secondary');
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
              selectedRoute === 'secondary'
                ? 'bg-[#7C5CFF] text-white'
                : 'text-[#8B9AB4]'
            }`}
          >
            Alternative
          </button>
        </div>
      </div>

      {/* ─── Layer Filter Bar ───────────────────────────────────────────── */}
      <div className="px-3.5 py-2 bg-black/40 border-b border-white/[0.05] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono flex-shrink-0">
        {[
          { id: 'all', label: 'All Layers' },
          { id: 'safe_zones', label: 'Safe Assembly' },
          { id: 'hazards', label: 'Threat Hazards' },
          { id: 'responders', label: 'Patrol Radar' },
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => {
              soundEffects.playClick();
              setActiveLayer(layer.id as any);
            }}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              activeLayer === layer.id
                ? 'bg-[#14F1D9]/20 border-[#14F1D9] text-[#14F1D9] font-bold'
                : 'bg-white/[0.02] border-white/[0.06] text-[#8B9AB4]'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* ─── Interactive Vector Map Viewport ───────────────────────────── */}
      <div className="relative w-full h-80 bg-[#030407] overflow-hidden flex items-center justify-center border-b border-white/[0.08] flex-shrink-0">
        <svg
          viewBox="0 0 400 320"
          className="w-full h-full object-cover select-none transition-transform duration-500"
          style={{ transform: `rotate(${compassAngle}deg)` }}
        >
          <defs>
            <pattern id="stu-grid-layer" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.06)" strokeWidth="0.8" />
            </pattern>
            <pattern id="hazard-pattern-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#FF4D6D" strokeWidth="3" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#070B12" strokeWidth="3" />
            </pattern>
          </defs>

          <rect width="400" height="320" fill="#030407" />
          <rect width="400" height="320" fill="url(#stu-grid-layer)" />

          {/* Campus Outer Boundary */}
          <rect x="20" y="20" width="360" height="280" rx="12" fill="none" stroke="rgba(20,241,217,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Campus Buildings with Safety Glows */}
          {/* 1. North Quad Dormitory (Green - Safe) */}
          <rect x="40" y="210" width="90" height="70" rx="8" fill="rgba(34,211,165,0.12)" stroke="#22D3A5" strokeWidth="1.5" />
          <text x="85" y="245" textAnchor="middle" fill="#22D3A5" fontSize="8" fontWeight="bold">Dorm Quad A</text>
          <text x="85" y="258" textAnchor="middle" fill="#22D3A5" fontSize="7" fontFamily="monospace">STATUS: SAFE</text>

          {/* 2. Main Library (Orange - Warning) */}
          <rect x="250" y="200" width="110" height="80" rx="8" fill="rgba(255,179,71,0.12)" stroke="#FFB347" strokeWidth="1.5" />
          <text x="305" y="235" textAnchor="middle" fill="#FFB347" fontSize="8" fontWeight="bold">Main Library</text>
          <text x="305" y="248" textAnchor="middle" fill="#FFB347" fontSize="7" fontFamily="monospace">CAUTION (VOC)</text>

          {/* 3. Science Block B (Red - Danger Zone) */}
          {(activeLayer === 'all' || activeLayer === 'hazards') && (
            <g>
              <rect x="40" y="40" width="90" height="70" rx="8" fill="rgba(255,77,109,0.2)" stroke="#FF4D6D" strokeWidth="2" />
              {/* Pulsating danger radius */}
              <circle cx="85" cy="75" r="45" fill="rgba(255,77,109,0.15)" className="animate-pulse" />
              <text x="85" y="70" textAnchor="middle" fill="#FF4D6D" fontSize="8" fontWeight="bold">Science Lab B</text>
              <text x="85" y="82" textAnchor="middle" fill="#FF4D6D" fontSize="7" fontWeight="bold" fontFamily="monospace">EVACUATE</text>
            </g>
          )}

          {/* 4. Campus Health Center (Medical Blue) */}
          <rect x="250" y="40" width="90" height="60" rx="8" fill="rgba(20,241,217,0.1)" stroke="#14F1D9" strokeWidth="1.5" />
          <text x="295" y="68" textAnchor="middle" fill="#14F1D9" fontSize="8" fontWeight="bold">Health Clinic</text>
          <text x="295" y="80" textAnchor="middle" fill="#14F1D9" fontSize="7" fontFamily="monospace">ALS PARICS</text>

          {/* Walkways */}
          <path d="M 85 150 L 200 150 L 320 80" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 200 150 L 200 240" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" fill="none" />

          {/* Blocked Path (Hazard Zone near Science Block) */}
          {(activeLayer === 'all' || activeLayer === 'hazards') && (
            <g>
              <line x1="85" y1="150" x2="85" y2="75" stroke="url(#hazard-pattern-stripes)" strokeWidth="10" strokeLinecap="round" />
              <rect x="55" y="105" width="60" height="16" rx="4" fill="#070B12" stroke="#FF4D6D" strokeWidth="1" />
              <text x="85" y="116" textAnchor="middle" fill="#FF4D6D" fontSize="7" fontWeight="bold" fontFamily="monospace">AVOID</text>
            </g>
          )}

          {/* Animated Safe Walking Path */}
          <motion.path
            d={selectedRoute === 'primary' ? 'M 140 180 L 200 150 L 320 80' : 'M 140 180 L 200 240 L 320 240 L 320 110'}
            stroke={selectedRoute === 'primary' ? '#22D3A5' : '#7C5CFF'}
            strokeWidth="3.5"
            strokeDasharray="6,4"
            fill="none"
          />

          {/* Student Live Position */}
          <circle cx="140" cy="180" r="14" fill="rgba(20,241,217,0.3)" className="animate-pulse" />
          <circle cx="140" cy="180" r="6" fill="#14F1D9" stroke="#FFFFFF" strokeWidth="2" />
          <text x="140" y="202" textAnchor="middle" fill="#14F1D9" fontSize="8" fontWeight="bold" fontFamily="monospace">YOU (GPS)</text>

          {/* Live Moving Patrol Responders */}
          {(activeLayer === 'all' || activeLayer === 'responders') && (
            <g>
              <circle cx="210" cy="150" r="10" fill="rgba(34,211,165,0.3)" className="animate-ping" />
              <circle cx="210" cy="150" r="5" fill="#22D3A5" stroke="#070B12" strokeWidth="1.5" />
              <text x="210" y="140" textAnchor="middle" fill="#22D3A5" fontSize="7" fontFamily="monospace" fontWeight="bold">SQUAD-01</text>
            </g>
          )}

          {/* Assembly Point Alpha */}
          {(activeLayer === 'all' || activeLayer === 'safe_zones') && (
            <g>
              <circle cx="320" cy="80" r="16" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
              <text x="320" y="84" textAnchor="middle" fill="#070B12" fontSize="8" fontWeight="bold" fontFamily="monospace">SAFE</text>
              <text x="320" y="104" textAnchor="middle" fill="#22D3A5" fontSize="8" fontWeight="bold">Assembly Alpha</text>
            </g>
          )}
        </svg>

        {/* Floating Map Action Buttons (Locate Me, Compass, Follow) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={handleCompassRotate}
            className="w-8 h-8 rounded-xl bg-black/80 border border-white/20 text-[#14F1D9] flex items-center justify-center backdrop-blur-md shadow-lg cursor-pointer hover:bg-black"
            title="Rotate Compass Heading"
          >
            <Compass className="w-4 h-4 transition-transform duration-500" style={{ transform: `rotate(-${compassAngle}deg)` }} />
          </button>

          <button
            onClick={handleLocateMe}
            className="w-8 h-8 rounded-xl bg-black/80 border border-white/20 text-[#22D3A5] flex items-center justify-center backdrop-blur-md shadow-lg cursor-pointer hover:bg-black"
            title="Recenter On My GPS"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Live Safety Status Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/80 border border-[#22D3A5]/40 text-[9px] font-mono text-[#22D3A5] backdrop-blur-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22D3A5] animate-ping" />
          <span>ROUTE SECURED · NO THREATS</span>
        </div>
      </div>

      {/* ─── Turn-By-Turn Waypoints Guide ──────────────────────────────── */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-[#22D3A5]" />
            Turn-by-Turn Safe Directives
          </h3>
          <span className="text-[9px] font-mono text-[#8B9AB4]">EST: 2 MIN WALK</span>
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
