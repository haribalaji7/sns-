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
  Sparkles,
  Zap,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useStudentStore } from '@/store/student';
import { useDashboardStore } from '@/store/dashboard';

interface StudentLiveTrackingProps {
  onDismiss: () => void;
  category?: string;
  incidentId?: string;
}

export function StudentLiveTracking({
  onDismiss,
  category = 'medical',
  incidentId = 'SOS-8841',
}: StudentLiveTrackingProps) {
  const {
    assignedResponder,
    etaSeconds,
    distanceMeters,
    incidentStatus,
    resolveEmergency,
    tickLiveSimulation,
  } = useStudentStore();
  const { addToast } = useDashboardStore();

  const [simulatedEta, setSimulatedEta] = useState(etaSeconds || 95);
  const [simulatedDist, setSimulatedDist] = useState(distanceMeters || 160);
  const [showConfetti, setShowConfetti] = useState(false);

  // Live simulation ticker for moving responder
  useEffect(() => {
    const interval = setInterval(() => {
      tickLiveSimulation();
      setSimulatedEta((prev) => {
        if (prev <= 1) {
          soundEffects.playSuccess();
          return 0;
        }
        return prev - 1;
      });

      setSimulatedDist((prev) => {
        if (prev <= 5) return 0;
        return Math.max(0, prev - 2);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tickLiveSimulation]);

  const formatEta = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleCall = () => {
    soundEffects.playClick();
    window.open(`tel:${assignedResponder?.phone || '+18005550101'}`);
    addToast({
      type: 'info',
      title: 'Voice Patch Active',
      message: `Direct encrypted radio connection to ${assignedResponder?.name || 'Lead Responder'}.`,
    });
  };

  const handleResolve = async () => {
    soundEffects.playSuccess();
    setShowConfetti(true);
    await resolveEmergency();
    setTimeout(() => {
      onDismiss();
    }, 1800);
  };

  const timelineSteps = [
    { key: 'pending', label: 'SOS Transmitted', desc: 'GPS beacon received by Campus Command Center', time: '17:52:10' },
    { key: 'verified', label: 'AI Incident Verified', desc: 'Gemini Safety Engine assigned Priority 1 (Critical)', time: '17:52:20' },
    { key: 'responder_assigned', label: 'Squad Alpha Dispatched', desc: `${assignedResponder?.name || 'Cpt. Rivera'} assigned on Radio CH-4`, time: '17:52:35' },
    { key: 'en_route', label: 'En Route', desc: 'Tactical responder vehicle moving at 26 km/h via Quad', time: '17:52:50' },
    { key: 'on_scene', label: 'Arrived on Scene', desc: 'Responders securing immediate student perimeter', time: simulatedEta === 0 ? 'Just now' : `ETA ${formatEta(simulatedEta)}` },
    { key: 'resolved', label: 'Incident Resolved', desc: 'Medical check cleared & stand-down issued', time: 'Pending' },
  ];

  const getStepIndex = () => {
    if (incidentStatus === 'resolved') return 5;
    if (incidentStatus === 'on_scene' || simulatedEta === 0) return 4;
    if (incidentStatus === 'en_route') return 3;
    if (incidentStatus === 'responder_assigned') return 2;
    if (incidentStatus === 'verified') return 1;
    return 0;
  };

  const currentStep = getStepIndex();

  return (
    <div className="flex flex-col h-full bg-[#070B12] text-[#F0F4FF] overflow-y-auto">
      {/* ─── Top Live Alert Bar ─────────────────────────────────────────── */}
      <div className="p-4 bg-gradient-to-b from-[#FF4D6D]/20 via-[#070B12] to-[#070B12] border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#FF4D6D] tracking-wider uppercase">
              LIVE EMERGENCY TRACKING
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8B9AB4] font-bold">
            ID: {incidentId}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-base font-black text-[#F0F4FF]">
              Help is On The Way
            </h2>
            <p className="text-[11px] text-[#8B9AB4]">
              Stay in place · Responders have your exact GPS coordinates
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">
              Estimated Arrival
            </span>
            <span className="text-2xl font-black font-mono text-[#FF4D6D] tabular-nums drop-shadow-[0_0_12px_rgba(255,77,109,0.6)]">
              {formatEta(simulatedEta)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Interactive Live Mini-Map Canvas ──────────────────────────── */}
      <div className="relative w-full h-52 bg-[#030407] border-y border-white/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 400 220" className="w-full h-full object-cover select-none">
          <defs>
            <pattern id="live-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,241,217,0.06)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="400" height="220" fill="#030407" />
          <rect width="400" height="220" fill="url(#live-grid)" />

          {/* Campus Roads */}
          <path d="M 40 160 L 200 160 L 200 60 L 350 60" stroke="rgba(255,255,255,0.12)" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* Animated Route Line */}
          <path
            d="M 60 160 L 200 160 L 200 90 L 320 90"
            stroke="#14F1D9"
            strokeWidth="3.5"
            strokeDasharray="6,6"
            fill="none"
          />

          {/* Student GPS Pin (Target) */}
          <circle cx="320" cy="90" r="18" fill="rgba(255,77,109,0.25)" className="animate-pulse" />
          <circle cx="320" cy="90" r="7" fill="#FF4D6D" stroke="#FFFFFF" strokeWidth="2" />
          <text x="320" y="70" textAnchor="middle" fill="#FF4D6D" fontSize="9" fontWeight="bold" fontFamily="monospace">YOU (GPS)</text>

          {/* Moving Responder GPS Pin */}
          <g transform={`translate(${Math.min(300, 60 + ((160 - simulatedDist) / 160) * 240)}, ${simulatedDist > 60 ? 160 : 90})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(20,241,217,0.3)" className="animate-pulse" />
            <circle cx="0" cy="0" r="6" fill="#14F1D9" stroke="#070B12" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#14F1D9" fontSize="8" fontWeight="bold" fontFamily="monospace">SQUAD ALPHA</text>
          </g>
        </svg>

        {/* Live Distance Overlay Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 text-xs font-mono backdrop-blur-md flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#14F1D9]" />
          <span>Distance: <strong className="text-[#14F1D9]">{simulatedDist}m away</strong></span>
        </div>
      </div>

      {/* ─── Assigned Responder Profile Card ───────────────────────────── */}
      <div className="p-4 space-y-3.5 flex-1">
        <div className="p-3.5 rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 flex items-center justify-center text-sm font-bold text-[#14F1D9] shadow-md">
              {assignedResponder?.name ? assignedResponder.name.split(' ')[0][0] + (assignedResponder.name.split(' ')[1]?.[0] || '') : 'AR'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-[#F0F4FF]">{assignedResponder?.name || 'Cpt. Alex Rivera'}</h3>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40">
                  LEAD COMMAND
                </span>
              </div>
              <p className="text-[11px] text-[#8B9AB4]">{assignedResponder?.team || 'Squad Alpha Rapid Response'}</p>
              <p className="text-[9px] font-mono text-[#14F1D9]">Radio: {assignedResponder?.radioChannel || 'CH-4 Tactical'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCall}
              className="p-3 rounded-2xl bg-[#22D3A5] hover:bg-[#22D3A5]/90 text-[#070B12] shadow-[0_0_15px_rgba(34,211,165,0.4)] transition-all cursor-pointer"
              title="Voice Call Lead Responder"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── 6-Stage Response Timeline ───────────────────────────────── */}
        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-white/[0.01]">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-3">
            Realtime Dispatch Lifecycle
          </span>
          <div className="space-y-3">
            {timelineSteps.map((st, idx) => {
              const isPast = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isPast
                          ? 'bg-[#22D3A5] text-[#070B12] shadow-[0_0_8px_#22D3A5]'
                          : 'bg-white/5 text-[#4A5568] border border-white/10'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-3 h-3 stroke-[3]" /> : idx + 1}
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

      {/* ─── Bottom Mark Safe / Resolve Action ───────────────────────────── */}
      <div className="p-4 border-t border-white/[0.08] bg-[#070B12] flex gap-3 flex-shrink-0">
        <button
          onClick={handleResolve}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22D3A5] to-[#14F1D9] text-[#070B12] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,165,0.4)] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Am Safe Now (Resolve Emergency)</span>
        </button>
      </div>
    </div>
  );
}
