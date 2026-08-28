'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Maximize2,
  Download,
  Share2,
  RefreshCw,
  FilePlus,
  Flame,
  Shield,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Printer,
  ChevronRight,
  ExternalLink,
  Users,
  Clock,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { VisualCardData } from '@/lib/ai/intelligent-prompt-builder';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

interface VisualCardProps {
  visual: VisualCardData;
  onExpand?: (visual: VisualCardData) => void;
  onRegenerate?: () => void;
}

export function VisualCard({ visual, onExpand, onRegenerate }: VisualCardProps) {
  const { addToast } = useDashboardStore();
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    if (!visual.imageUrl) return;
    const a = document.createElement('a');
    a.href = visual.imageUrl;
    a.download = `${visual.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast({
      type: 'success',
      title: 'Visual Asset Downloaded',
      message: `${visual.title} saved to disk.`,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    if (visual.imageUrl) {
      navigator.clipboard.writeText(visual.imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({
        type: 'info',
        title: 'Image Link Copied',
        message: 'Shareable asset link copied.',
      });
    }
  };

  const handleAddToReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playSuccess();
    setAdded(true);
    addToast({
      type: 'success',
      title: 'Attached to Incident Report',
      message: `${visual.title} integrated into dossier.`,
    });
  };

  // ─── 1. Evacuation Diagram Generator (SVG) ─────────────────────────────────
  if (visual.type === 'evacuation_map') {
    const buildingName = (visual.metadata.buildingName as string) || 'Science Block B';
    return (
      <div className="mt-3 rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#030407] overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-white/[0.08] bg-[#070B12]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-ping" />
            <span className="text-xs font-bold text-[#F0F4FF]">{visual.title}</span>
          </div>
          <span className="text-[9px] font-mono text-[#14F1D9] bg-[#14F1D9]/10 px-2 py-0.5 rounded border border-[#14F1D9]/30">
            VECTOR BLUEPRINT
          </span>
        </div>

        {/* SVG Diagram */}
        <div className="p-3 relative bg-[#070B12]/90 flex items-center justify-center">
          <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[300px] select-none">
            <defs>
              <pattern id="diag-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.06)" strokeWidth="0.8" />
              </pattern>
              <radialGradient id="danger-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="360" fill="#030407" />
            <rect width="600" height="360" fill="url(#diag-grid)" />

            {/* Building Outer Blueprint Walls */}
            <rect x="60" y="40" width="480" height="260" rx="8" fill="rgba(20,241,217,0.03)" stroke="#14F1D9" strokeWidth="2" />
            
            {/* Rooms / Internal Walls */}
            <line x1="220" y1="40" x2="220" y2="200" stroke="rgba(20,241,217,0.3)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="380" y1="40" x2="380" y2="200" stroke="rgba(20,241,217,0.3)" strokeWidth="2" strokeDasharray="4,4" />
            <line x1="60" y1="200" x2="540" y2="200" stroke="rgba(20,241,217,0.4)" strokeWidth="3" />

            {/* Hallway Label */}
            <text x="300" y="235" textAnchor="middle" fill="#8B9AB4" fontSize="10" fontFamily="monospace">MAIN CORRIDOR (EVACUATION ARTERY)</text>

            {/* Room Labels */}
            <text x="140" y="110" textAnchor="middle" fill="#F0F4FF" fontSize="11" fontWeight="bold">Room 301</text>
            <text x="300" y="90" textAnchor="middle" fill="#FF4D6D" fontSize="12" fontWeight="bold">Lab 302 (HAZARD)</text>
            <text x="460" y="110" textAnchor="middle" fill="#F0F4FF" fontSize="11" fontWeight="bold">Room 303</text>

            {/* Danger Zone Glow at Lab 302 */}
            <circle cx="300" cy="120" r="50" fill="url(#danger-glow)" />
            <circle cx="300" cy="120" r="30" fill="none" stroke="#FF4D6D" strokeWidth="1.5" strokeDasharray="4,4" className="animate-pulse" />
            <circle cx="300" cy="120" r="8" fill="#FF4D6D" />
            <text x="300" y="145" textAnchor="middle" fill="#FF4D6D" fontSize="9" fontWeight="bold" fontFamily="monospace">342°C FIRE ORIGIN</text>

            {/* Safe Exits */}
            {/* Exit A - West */}
            <rect x="50" y="215" width="20" height="35" rx="3" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
            <text x="35" y="235" textAnchor="end" fill="#22D3A5" fontSize="10" fontWeight="bold" fontFamily="monospace">EXIT A</text>

            {/* Exit B - East (Recommended Primary) */}
            <rect x="530" y="215" width="20" height="35" rx="3" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
            <text x="565" y="235" textAnchor="start" fill="#22D3A5" fontSize="10" fontWeight="bold" fontFamily="monospace">EXIT B (PRIMARY)</text>

            {/* Direction Arrows along Corridor */}
            {/* Left to Exit A */}
            <path d="M 220 230 L 80 230" stroke="#FFB347" strokeWidth="3" strokeDasharray="6,4" fill="none" />
            <polygon points="80,230 92,225 92,235" fill="#FFB347" />

            {/* Right to Exit B (Primary Safe Route) */}
            <path d="M 380 230 L 520 230" stroke="#22D3A5" strokeWidth="4" strokeDasharray="8,4" fill="none" />
            <polygon points="520,230 508,223 508,237" fill="#22D3A5" />

            {/* Assembly Point Alpha (Exterior) */}
            <circle cx="530" cy="330" r="16" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
            <text x="530" y="334" textAnchor="middle" fill="#070B12" fontSize="9" fontWeight="bold" fontFamily="monospace">SAFE</text>
            <text x="495" y="334" textAnchor="end" fill="#22D3A5" fontSize="10" fontWeight="bold">Assembly Point Alpha (North Quad)</text>
          </svg>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-[#070B12] border-t border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono text-[#8B9AB4]">
            Building: {buildingName} · 42 Occupants Routing
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onExpand?.(visual)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-white/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" /> Expand
            </button>
            <button
              onClick={handleAddToReport}
              className="px-2.5 py-1 rounded-lg bg-[#14F1D9]/20 hover:bg-[#14F1D9]/30 text-[#14F1D9] border border-[#14F1D9]/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <FilePlus className="w-3 h-3" /> {added ? 'Attached' : 'Add to Report'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. Risk Heatmap Generator (SVG) ───────────────────────────────────────
  if (visual.type === 'risk_heatmap') {
    return (
      <div className="mt-3 rounded-2xl glass border border-[rgba(255,77,109,0.3)] bg-[#030407] overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-white/[0.08] bg-[#070B12]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF4D6D] animate-pulse" />
            <span className="text-xs font-bold text-[#F0F4FF]">Realtime Campus Risk & Occupancy Heatmap</span>
          </div>
          <span className="text-[9px] font-mono text-[#FF4D6D] bg-[#FF4D6D]/15 px-2 py-0.5 rounded border border-[#FF4D6D]/30">
            GRADIENT DENSITY
          </span>
        </div>

        <div className="p-3 relative bg-[#070B12]/90 flex items-center justify-center">
          <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[300px] select-none">
            <defs>
              <radialGradient id="heat-crit" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#FF8C42" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#FFB347" stopOpacity="0.25" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-med" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFB347" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#22D3A5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-safe" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3A5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="600" height="360" fill="#070B12" />
            
            {/* Campus Outline */}
            <rect x="40" y="30" width="520" height="300" rx="12" fill="none" stroke="rgba(20,241,217,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Heatmap Density Gradients */}
            <circle cx="160" cy="130" r="100" fill="url(#heat-crit)" />
            <circle cx="440" cy="120" r="80" fill="url(#heat-med)" />
            <circle cx="220" cy="250" r="75" fill="url(#heat-med)" />
            <circle cx="420" cy="240" r="70" fill="url(#heat-safe)" />

            {/* Building Boxes */}
            {/* Science Block B */}
            <rect x="110" y="90" width="100" height="80" rx="4" fill="rgba(255,77,109,0.2)" stroke="#FF4D6D" strokeWidth="2" />
            <text x="160" y="125" textAnchor="middle" fill="#F0F4FF" fontSize="10" fontWeight="bold">Science Block B</text>
            <text x="160" y="140" textAnchor="middle" fill="#FF4D6D" fontSize="9" fontWeight="bold" fontFamily="monospace">RISK: 94 · 340 OCC</text>

            {/* IT Building */}
            <rect x="390" y="80" width="100" height="75" rx="4" fill="rgba(255,179,71,0.2)" stroke="#FFB347" strokeWidth="1.5" />
            <text x="440" y="115" textAnchor="middle" fill="#F0F4FF" fontSize="10" fontWeight="bold">IT Building</text>
            <text x="440" y="130" textAnchor="middle" fill="#FFB347" fontSize="9" fontWeight="bold" fontFamily="monospace">RISK: 62 · 120 OCC</text>

            {/* Athletic Arena */}
            <rect x="170" y="215" width="100" height="75" rx="4" fill="rgba(255,179,71,0.2)" stroke="#FFB347" strokeWidth="1.5" />
            <text x="220" y="248" textAnchor="middle" fill="#F0F4FF" fontSize="10" fontWeight="bold">Athletic Arena</text>
            <text x="220" y="263" textAnchor="middle" fill="#FFB347" fontSize="9" fontWeight="bold" fontFamily="monospace">RISK: 71 · 190 OCC</text>

            {/* Main Library */}
            <rect x="370" y="205" width="100" height="75" rx="4" fill="rgba(34,211,165,0.15)" stroke="#22D3A5" strokeWidth="1.5" />
            <text x="420" y="238" textAnchor="middle" fill="#F0F4FF" fontSize="10" fontWeight="bold">Main Library</text>
            <text x="420" y="253" textAnchor="middle" fill="#22D3A5" fontSize="9" fontWeight="bold" fontFamily="monospace">RISK: 18 · 620 OCC</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 bg-[#070B12] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-[#FF4D6D]"><span className="w-2 h-2 rounded-full bg-[#FF4D6D]" /> Critical (80-100)</span>
            <span className="flex items-center gap-1 text-[10px] text-[#FFB347]"><span className="w-2 h-2 rounded-full bg-[#FFB347]" /> High (50-79)</span>
            <span className="flex items-center gap-1 text-[10px] text-[#22D3A5]"><span className="w-2 h-2 rounded-full bg-[#22D3A5]" /> Safe (0-49)</span>
          </div>
          <button
            onClick={() => onExpand?.(visual)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-white/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" /> Full View
          </button>
        </div>
      </div>
    );
  }

  // ─── 3. Emergency Awareness Poster Generator ───────────────────────────────
  if (visual.type === 'emergency_poster') {
    return (
      <div className="mt-3 rounded-2xl glass border border-[rgba(124,92,255,0.4)] bg-[#030407] overflow-hidden shadow-2xl max-w-md mx-auto">
        <div className="p-6 bg-gradient-to-b from-[#7C5CFF]/15 via-[#070B12] to-[#070B12] text-center border-b border-white/[0.08]">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 text-[#FF4D6D] mx-auto mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(255,77,109,0.3)]">
            <Flame className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#14F1D9] uppercase">
            CAMPUSSHIELD EMERGENCY ADVISORY
          </span>
          <h2 className="text-xl font-black text-[#F0F4FF] tracking-tight mt-1 mb-2 uppercase">
            Laboratory Fire Safety & Evacuation
          </h2>
          <p className="text-xs text-[#8B9AB4] leading-relaxed max-w-xs mx-auto">
            Official emergency response instructions for science block occupants and students.
          </p>
        </div>

        <div className="p-5 space-y-3 bg-[#070B12]">
          {[
            { step: '01', title: 'Remain Calm & Evacuate', desc: 'Cease experiment, do NOT use elevators. Proceed via Exit B.', color: '#14F1D9' },
            { step: '02', title: 'Close Containment Doors', desc: 'Pull manual fire pull station and trip fume hood sashes.', color: '#FFB347' },
            { step: '03', title: 'Assemble at North Quad', desc: 'Check in with Emergency Warden A-7 at Assembly Point Alpha.', color: '#22D3A5' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-sm font-black font-mono" style={{ color: s.color }}>{s.step}</span>
              <div>
                <p className="text-xs font-bold text-[#F0F4FF]">{s.title}</p>
                <p className="text-[10px] text-[#8B9AB4] leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}

          {/* QR Code & University Branding Placeholder */}
          <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-black" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-[#F0F4FF]">Scan for Live Route</p>
                <p className="text-[9px] font-mono text-[#8B9AB4]">CampusShield SOS Portal</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-[#14F1D9] block">CAMPUS SAFETY DIV.</span>
              <span className="text-[8px] font-mono text-[#4A5568]">REF: POSTER-2026-F04</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-[#030407] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#22D3A5] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Print Ready (A3 / Tabloid)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleAddToReport}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <FilePlus className="w-3.5 h-3.5" /> {added ? 'Attached' : 'Add to Report'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. Standard Generated AI Emergency Illustration Card ───────────────────
  return (
    <div className="mt-3 rounded-2xl glass border border-[rgba(20,241,217,0.35)] bg-[#070B12]/95 overflow-hidden shadow-2xl group transition-all duration-300">
      {/* Top Media Header Bar */}
      <div className="px-4 py-2.5 bg-[#030407]/90 border-b border-white/[0.08] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9]">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold text-[#F0F4FF] truncate max-w-[220px]">{visual.title}</span>
        </div>
        <span className="text-[10px] font-mono text-[#14F1D9] bg-[#14F1D9]/10 px-2 py-0.5 rounded border border-[#14F1D9]/30">
          {visual.category}
        </span>
      </div>

      {/* Main Render Image Preview */}
      <div
        onClick={() => onExpand?.(visual)}
        className="relative w-full aspect-video bg-[#030407] overflow-hidden cursor-pointer flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        {visual.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.imageUrl}
              alt={visual.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter contrast-110"
            />
            {/* Hover overlay button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <span className="px-3 py-1.5 rounded-xl bg-black/70 text-[#14F1D9] border border-[#14F1D9]/50 text-xs font-bold font-mono flex items-center gap-1.5 shadow-xl">
                <Maximize2 className="w-3.5 h-3.5" /> Click to Expand Lightbox
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-[#8B9AB4] animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#14F1D9] border-r-transparent border-b-[#7C5CFF] border-l-transparent animate-spin mb-2" />
            <p className="text-xs font-mono text-[#14F1D9]">Rendering Emergency Visual...</p>
          </div>
        )}

        {/* Resolution Badge Overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/20 text-[9px] font-mono text-white/80 backdrop-blur-sm">
          {visual.resolution || '4K UHD'}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="px-4 py-2.5 bg-[#070B12] border-t border-white/[0.08] flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-[#8B9AB4] truncate max-w-[180px]">
          DALL-E 3 · Cinematic Lighting
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExpand?.(visual)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-[#14F1D9] border border-white/10 transition-all cursor-pointer"
            title="Expand Lightbox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleAddToReport}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              added
                ? 'bg-[#22D3A5]/20 border-[#22D3A5] text-[#22D3A5]'
                : 'bg-white/5 hover:bg-white/10 text-[#F0F4FF] border-white/10'
            }`}
          >
            <FilePlus className="w-3 h-3" />
            <span>{added ? 'Attached' : 'Add to Report'}</span>
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
