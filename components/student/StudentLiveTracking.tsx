'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  X,
  AlertTriangle,
  User,
  ExternalLink,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

interface StudentLiveTrackingProps {
  onDismiss: () => void;
  category?: string;
}

export function StudentLiveTracking({ onDismiss, category = 'medical' }: StudentLiveTrackingProps) {
  const { addToast } = useDashboardStore();

  const [etaSeconds, setEtaSeconds] = useState(105); // 1m 45s
  const [distanceM, setDistanceM] = useState(180);
  const [currentStep, setCurrentStep] = useState<number>(1); // 0: Dispatched, 1: En Route, 2: Arrived, 3: Resolved
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Live countdown ticker & distance decrease
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) {
          setCurrentStep(2); // Arrived
          soundEffects.playSuccess();
          return 0;
        }
        return prev - 1;
      });

      setDistanceM((prev) => {
        if (prev <= 10) return 0;
        return Math.max(0, prev - 3);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const formatEta = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleCall = () => {
    soundEffects.playClick();
    window.open('tel:+18005550101');
    addToast({
      type: 'info',
      title: 'Connecting Radio Channel',
      message: 'Direct voice patch to Lead Responder Cpt. Rivera.',
    });
  };

  const handleMarkSafe = () => {
    soundEffects.playSuccess();
    setCurrentStep(3);
    addToast({
      type: 'success',
      title: 'Emergency Resolved',
      message: 'Student marked safe. Responders stood down.',
    });
    setTimeout(() => {
      onDismiss();
    }, 1200);
  };

  const timelineSteps = [
    { label: 'Dispatched', desc: 'Squad Alpha assigned by AI Command Center', time: '17:52:10' },
    { label: 'En Route', desc: 'Tactical vehicle travelling at 28 km/h via Quad corridor', time: '17:52:45' },
    { label: 'Arrived on Scene', desc: 'Responders securing immediate student perimeter', time: etaSeconds === 0 ? 'Just now' : 'ETA 1m' },
    { label: 'Incident Resolved', desc: 'Medical triage administered & cleared', time: 'Pending' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#070B12] text-[#F0F4FF] overflow-y-auto">
      {/* ─── Top Live Alert Bar ─────────────────────────────────────────── */}
      <div className="p-4 bg-gradient-to-b from-[#FF4D6D]/20 via-[#070B12] to-[#070B12] border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#FF4D6D] tracking-wider uppercase">
              LIVE EMERGENCY TRACKING
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8B9AB4]">ID: SOS-8841</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-lg font-black text-[#F0F4FF]">
              Help is On The Way
            </h2>
            <p className="text-xs text-[#8B9AB4]">
              Stay in place · Keep phone line open
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase block">
              Estimated Arrival
            </span>
            <span className="text-2xl font-black font-mono text-[#FF4D6D] tabular-nums drop-shadow-[0_0_12px_rgba(255,77,109,0.6)]">
              {formatEta(etaSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Interactive Live Mini-Map Canvas ──────────────────────────── */}
      <div className="relative w-full h-56 bg-[#030407] border-y border-white/[0.08] overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <svg viewBox="0 0 400 240" className="w-full h-full object-cover select-none">
          <defs>
            <pattern id="live-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.06)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="400" height="240" fill="#030407" />
          <rect width="400" height="240" fill="url(#live-grid)" />

          {/* Campus Roads */}
          <path d="M 40 180 L 200 180 L 200 60 L 360 60" stroke="rgba(255,255,255,0.12)" strokeWidth="12" strokeLinecap="round" fill="none" />
          
          {/* Animated Route Line */}
          <path
            d="M 60 180 L 200 180 L 200 100 L 320 100"
            stroke="#14F1D9"
            strokeWidth="3"
            strokeDasharray="6,6"
            fill="none"
          />

          {/* Student GPS Pin (Target) */}
          <circle cx="320" cy="100" r="18" fill="rgba(255,77,109,0.25)" className="animate-pulse" />
          <circle cx="320" cy="100" r="7" fill="#FF4D6D" stroke="#FFFFFF" strokeWidth="2" />
          <text x="320" y="80" textAnchor="middle" fill="#FF4D6D" fontSize="10" fontWeight="bold" fontFamily="monospace">YOU (GPS)</text>

          {/* Moving Responder GPS Pin */}
          <g transform={`translate(${Math.min(300, 60 + (180 - distanceM) * 1.3)}, 180)`}>
            <circle cx="0" cy="0" r="14" fill="rgba(20,241,217,0.3)" className="animate-pulse" />
            <circle cx="0" cy="0" r="6" fill="#14F1D9" stroke="#070B12" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#14F1D9" fontSize="9" fontWeight="bold" fontFamily="monospace">SQUAD ALPHA</text>
          </g>
        </svg>

        {/* Live Distance Overlay Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 text-xs font-mono backdrop-blur-md flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#14F1D9]" />
          <span>Distance: <strong className="text-[#14F1D9]">{distanceM}m away</strong></span>
        </div>
      </div>

      {/* ─── Assigned Responder Profile Card ───────────────────────────── */}
      <div className="p-4 space-y-4 flex-1">
        <div className="p-4 rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 flex items-center justify-center text-sm font-bold text-[#14F1D9] shadow-md">
              AR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#F0F4FF]">Cpt. Alex Rivera</h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40">
                  LEAD
                </span>
              </div>
              <p className="text-xs text-[#8B9AB4]">Fire & HAZMAT Squad Alpha</p>
              <p className="text-[10px] font-mono text-[#14F1D9]">Radio Channel: CH-4 Tactical</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCall}
              className="p-3 rounded-2xl bg-[#22D3A5] hover:bg-[#22D3A5]/90 text-[#070B12] shadow-[0_0_15px_rgba(34,211,165,0.4)] transition-all cursor-pointer"
              title="Call Lead Responder"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── 4-Stage Response Timeline ───────────────────────────────── */}
        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-white/[0.01]">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-3">
            Live Dispatch Lifecycle
          </span>
          <div className="space-y-3">
            {timelineSteps.map((st, idx) => {
              const isPast = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isPast
                          ? 'bg-[#22D3A5] text-[#070B12] shadow-[0_0_8px_#22D3A5]'
                          : 'bg-white/5 text-[#4A5568] border border-white/10'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-6 my-0.5 ${
                          isPast ? 'bg-[#22D3A5]' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-[#14F1D9]' : isPast ? 'text-[#F0F4FF]' : 'text-[#4A5568]'}`}>
                        {st.label}
                      </p>
                      <span className="text-[9px] font-mono text-[#8B9AB4]">{st.time}</span>
                    </div>
                    <p className="text-[10px] text-[#8B9AB4] leading-snug">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom Actions ─────────────────────────────────────────────── */}
      <div className="p-4 border-t border-white/[0.08] bg-[#070B12] flex gap-3">
        <button
          onClick={handleMarkSafe}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22D3A5] to-[#14F1D9] text-[#070B12] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,165,0.4)] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Am Safe Now (Resolve)</span>
        </button>
      </div>
    </div>
  );
}
