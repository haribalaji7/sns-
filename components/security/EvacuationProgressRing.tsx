'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Navigation2,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useSecurityStore } from '@/store/security';

export function EvacuationProgressRing() {
  const { evacuationZone, evacuatePersonIncrement } = useSecurityStore();

  const total = evacuationZone.peopleTotal || 42;
  const evacuated = evacuationZone.peopleEvacuated || 0;
  const remaining = Math.max(0, total - evacuated);
  const percentage = Math.min(100, Math.round((evacuated / total) * 100));

  // SVG Circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl glass border border-[rgba(255,179,71,0.3)] bg-[#070B12]/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFB347]/20 border border-[#FFB347]/40 flex items-center justify-center text-[#FFB347] shadow-[0_0_12px_rgba(255,179,71,0.3)]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#F0F4FF] tracking-tight">
              Evacuation Zone Supervision
            </h3>
            <p className="text-[10px] text-[#8B9AB4] font-mono">{evacuationZone.zoneName}</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
            percentage >= 100
              ? 'bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40'
              : 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/40 animate-pulse'
          }`}
        >
          {percentage >= 100 ? 'ZONE CLEARED' : 'EVACUATION IN PROGRESS'}
        </span>
      </div>

      {/* Progress Ring & Numbers */}
      <div className="flex items-center justify-around gap-4 bg-black/40 p-4 rounded-xl border border-white/[0.06]">
        {/* Animated Radial Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="url(#evacGrad)"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="evacGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="50%" stopColor="#FFB347" />
                <stop offset="100%" stopColor="#22D3A5" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-white font-mono">{percentage}%</span>
            <span className="text-[8px] font-mono text-[#8B9AB4] uppercase font-bold">Safe</span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#8B9AB4]">Evacuated:</span>
            <span className="text-[#22D3A5] font-bold text-sm">{evacuated}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#8B9AB4]">Remaining:</span>
            <span className="text-[#FF4D6D] font-bold text-sm">{remaining}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#8B9AB4]">Total Initial:</span>
            <span className="text-[#F0F4FF] font-bold">{total}</span>
          </div>
        </div>
      </div>

      {/* Assembly & Exit Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[9px] text-[#8B9AB4] block uppercase">Supervised Exit Door:</span>
          <span className="text-[#14F1D9] font-bold">{evacuationZone.exitName}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[9px] text-[#8B9AB4] block uppercase">Target Safe Assembly Point:</span>
          <span className="text-[#22D3A5] font-bold">{evacuationZone.assemblyPoint}</span>
        </div>
      </div>

      {/* Quick Headcount Increment Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => evacuatePersonIncrement(1)}
          disabled={remaining <= 0}
          className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-[#14F1D9]/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log +1 Safe Exit</span>
        </button>

        <button
          onClick={() => evacuatePersonIncrement(5)}
          disabled={remaining <= 0}
          className="flex-1 py-2 px-3 rounded-xl bg-[rgba(34,211,165,0.15)] hover:bg-[#22D3A5] text-[#22D3A5] hover:text-[#070B12] border border-[#22D3A5]/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log +5 Group Exit</span>
        </button>
      </div>
    </div>
  );
}
