'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Award,
  Clock,
  BatteryCharging,
  Activity,
  CheckCircle2,
  Navigation2,
  LogOut,
  Radio,
  FileCheck,
  Zap,
  Flame,
  Wrench,
  Smartphone
} from 'lucide-react';
import { useSecurityStore } from '@/store/security';
import { useRouter } from 'next/navigation';
import { soundEffects } from '@/lib/audio-effects';

export default function SecurityProfilePage() {
  const router = useRouter();
  const { officer, logoutOfficer, setStatus } = useSecurityStore();

  const handleLogout = () => {
    logoutOfficer();
    router.push('/security/login');
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* ─── Profile Overview Hero Card ─────────────────────────────── */}
      <div className="rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#14F1D9]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={officer.avatarUrl}
            alt={officer.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#14F1D9] shadow-[0_0_25px_rgba(20,241,217,0.4)]"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#F0F4FF] tracking-tight">
                {officer.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14F1D9]/20 text-[#14F1D9] border border-[#14F1D9]/40 font-mono text-[10px] font-bold">
                {officer.badgeNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40 font-mono text-[10px] font-bold uppercase">
                {officer.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#D0D6E0] mb-0.5">
              {officer.team} · {officer.vehicle}
            </p>
            <p className="text-xs text-[#8B9AB4] font-mono">
              {officer.specialization} · {officer.currentShift}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[rgba(255,77,109,0.15)] text-[#FF4D6D] border border-white/10 hover:border-[#FF4D6D]/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow relative z-10"
        >
          <LogOut className="w-4 h-4" />
          <span>End Shift &amp; Logout</span>
        </button>
      </div>

      {/* ─── Radial Performance Analytics Grid ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3A5]" /> Incidents Resolved
          </span>
          <div className="my-2">
            <span className="text-3xl font-black text-[#22D3A5] font-mono">
              {officer.incidentsResolved}
            </span>
          </div>
          <span className="text-[9px] text-[#8B9AB4] font-mono">Top 5% Response Unit</span>
        </div>

        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#14F1D9]" /> Avg Response Time
          </span>
          <div className="my-2">
            <span className="text-3xl font-black text-[#14F1D9] font-mono">
              {Math.floor(officer.avgResponseSeconds / 60)}m {officer.avgResponseSeconds % 60}s
            </span>
          </div>
          <span className="text-[9px] text-[#8B9AB4] font-mono">Target: &lt; 2m 00s</span>
        </div>

        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold flex items-center gap-1">
            <Navigation2 className="w-3.5 h-3.5 text-[#FFB347]" /> Distance Patrolled
          </span>
          <div className="my-2">
            <span className="text-3xl font-black text-[#FFB347] font-mono">
              {officer.distancePatrolledKm} km
            </span>
          </div>
          <span className="text-[9px] text-[#8B9AB4] font-mono">Current Shift Telemetry</span>
        </div>

        <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md flex flex-col justify-between shadow-lg">
          <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#7C5CFF]" /> AI Copilot Adoption
          </span>
          <div className="my-2">
            <span className="text-3xl font-black text-[#7C5CFF] font-mono">
              96.4%
            </span>
          </div>
          <span className="text-[9px] text-[#8B9AB4] font-mono">Autonomous Route Adherence</span>
        </div>
      </div>

      {/* ─── Tactical Gear Status & Certifications ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tactical Gear & Bodycam Telemetry */}
        <div className="p-5 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 backdrop-blur-xl shadow-xl space-y-3">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#14F1D9]" /> Tactical Gear &amp; Hardware Status
          </span>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Axon Bodycam 4K Stream:</span>
              <span className="text-[#22D3A5] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] animate-pulse" /> LIVE STREAMING
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-[#8B9AB4]">AES Radio Intercom:</span>
              <span className="text-[#14F1D9] font-bold">CHANNEL {officer.radioChannel.toUpperCase()}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Mobile Battery &amp; Comms:</span>
              <span className="text-[#22D3A5] font-bold">{officer.batteryLevel}% · 5G ULTRA</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Patrol Vehicle GPS Beacon:</span>
              <span className="text-[#F0F4FF] font-bold">{officer.vehicle} (Active)</span>
            </div>
          </div>
        </div>

        {/* Tactical Certifications & Training Badges */}
        <div className="p-5 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 backdrop-blur-xl shadow-xl space-y-3">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#FFB347]" /> Verified Officer Credentials
          </span>

          <div className="space-y-2">
            {officer.certifications.map((cert, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <span className="font-bold text-[#F0F4FF]">{cert}</span>
                <span className="px-2 py-0.5 rounded bg-[#22D3A5]/15 text-[#22D3A5] font-mono text-[9px] font-bold">
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
