'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  Heart,
  Zap,
  Shield,
  Activity,
  Navigation2,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Compass,
  Radio,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import { useSecurityStore } from '@/store/security';
import { IncidentCard } from '@/components/security/IncidentCard';
import { AIRescueAssistantCard } from '@/components/security/AIRescueAssistantCard';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Incident } from '@/types';

export default function SecurityDashboardPage() {
  const router = useRouter();
  const { incidents } = useDashboardStore();
  const { officer, activeIncidentId, acceptIncident, toggleRadio } = useSecurityStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncidentForPreview, setSelectedIncidentForPreview] = useState<Incident | null>(null);

  // Active Incidents
  const activeIncidents = incidents.filter((inc) => inc.status !== 'resolved' && inc.status !== 'false_alarm');
  const myAssignedCase = incidents.find((inc) => inc.id === activeIncidentId);

  // Filtering & Sorting (1. Severity -> 2. Distance/Confidence -> 3. Time)
  const filteredIncidents = incidents
    .filter((inc) => {
      if (activeCategory === 'my_cases') return inc.id === activeIncidentId;
      if (activeCategory === 'critical') return inc.severity === 'critical';
      if (activeCategory === 'fire') return inc.type === 'fire' || inc.type === 'smoke';
      if (activeCategory === 'medical') return inc.type === 'medical' || inc.type === 'person_fallen';
      return true;
    })
    .filter((inc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Critical incidents stay pinned to top
      const sevOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const sevDiff = (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });

  const handleAcceptCase = (inc: Incident) => {
    acceptIncident(inc.id);
    router.push('/security/navigation');
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ─── 4 Realtime Tactical KPI Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Incidents */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass border border-[rgba(255,77,109,0.3)] bg-[#070B12]/80 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold">
              Active Incidents
            </span>
            <div className="p-1.5 rounded-lg bg-[#FF4D6D]/15 text-[#FF4D6D]">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {activeIncidents.length}
              </span>
              <span className="text-[10px] font-mono text-[#FF4D6D] font-bold">
                1 CRITICAL
              </span>
            </div>
            <p className="text-[9px] text-[#8B9AB4] font-mono mt-0.5 truncate">
              Campus Sector B & Gym Area
            </p>
          </div>
        </div>

        {/* KPI 2: My Assigned Cases */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/80 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold">
              My Assigned Case
            </span>
            <div className="p-1.5 rounded-lg bg-[#14F1D9]/15 text-[#14F1D9]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#14F1D9] font-mono">
                {myAssignedCase ? myAssignedCase.id : 'NONE'}
              </span>
              {myAssignedCase && (
                <span className="text-[10px] font-mono text-[#22D3A5] font-bold uppercase">
                  EN ROUTE
                </span>
              )}
            </div>
            <p className="text-[9px] text-[#8B9AB4] font-mono mt-0.5 truncate">
              {myAssignedCase ? myAssignedCase.location : 'Available for dispatch'}
            </p>
          </div>
        </div>

        {/* KPI 3: Nearest Incident */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass border border-[rgba(255,179,71,0.3)] bg-[#070B12]/80 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold">
              Nearest Incident
            </span>
            <div className="p-1.5 rounded-lg bg-[#FFB347]/15 text-[#FFB347]">
              <Navigation2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#FFB347] font-mono">
                185m
              </span>
              <span className="text-[10px] font-mono text-[#FFB347] font-bold">
                ~54s ETA
              </span>
            </div>
            <p className="text-[9px] text-[#8B9AB4] font-mono mt-0.5 truncate">
              Science Block B (Floor 3)
            </p>
          </div>
        </div>

        {/* KPI 4: Average Officer Response Time */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass border border-[rgba(34,211,165,0.3)] bg-[#070B12]/80 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold">
              Avg Dispatch ETA
            </span>
            <div className="p-1.5 rounded-lg bg-[#22D3A5]/15 text-[#22D3A5]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#22D3A5] font-mono">
                1m 34s
              </span>
              <span className="text-[10px] font-mono text-[#22D3A5] font-bold">
                98.4% AI CONF
              </span>
            </div>
            <p className="text-[9px] text-[#8B9AB4] font-mono mt-0.5 truncate">
              -18s vs National Campus Avg
            </p>
          </div>
        </div>
      </div>

      {/* ─── Active Assigned Incident Priority Banner (If Assigned) ───── */}
      {myAssignedCase && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[rgba(255,77,109,0.2)] via-[rgba(255,179,71,0.1)] to-[rgba(20,241,217,0.1)] border-2 border-[#FF4D6D] shadow-[0_0_30px_rgba(255,77,109,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4D6D] text-black flex items-center justify-center flex-shrink-0 font-black shadow-lg">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FF4D6D] text-black font-mono font-black text-[9px] uppercase">
                  ACTIVE RESPONSE CASE
                </span>
                <span className="text-xs font-mono font-bold text-[#F0F4FF]">
                  {myAssignedCase.id}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mt-0.5">
                {myAssignedCase.title}
              </h3>
              <p className="text-[11px] font-mono text-[#14F1D9] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {myAssignedCase.location} (185m away)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/security/navigation"
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[0_0_15px_#14F1D9] hover:brightness-110"
            >
              <Navigation2 className="w-4 h-4" />
              <span>Resume GPS Navigation</span>
            </Link>

            <Link
              href="/security/incidents"
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20"
            >
              Details
            </Link>
          </div>
        </div>
      )}

      {/* ─── Search & Category Filters Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Cases', count: incidents.length },
            { id: 'critical', label: '🚨 Critical', count: incidents.filter((i) => i.severity === 'critical').length },
            { id: 'fire', label: '🔥 Fire & Smoke', count: incidents.filter((i) => i.type === 'fire' || i.type === 'smoke').length },
            { id: 'medical', label: '🚑 Medical', count: incidents.filter((i) => i.type === 'medical' || i.type === 'person_fallen').length },
            { id: 'my_cases', label: '👤 Assigned to Me', count: myAssignedCase ? 1 : 0 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_12px_#14F1D9]'
                  : 'bg-white/[0.03] text-[#8B9AB4] hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${activeCategory === cat.id ? 'bg-black/30 text-black' : 'bg-white/10 text-white'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B9AB4]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search incident ID, building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#14F1D9]"
          />
        </div>
      </div>

      {/* ─── Main Incident Feed & AI Intelligence Split Grid ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left 7 Cols: Live Incident Cards List */}
        <div className="lg:col-span-7 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B9AB4] px-1">
            <span className="font-bold uppercase">
              Live Feed ({filteredIncidents.length} Records)
            </span>
            <span>Sorted by Severity &amp; Distance</span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-8 rounded-2xl glass border border-white/10 bg-black/40 text-center flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-[#22D3A5]" />
              <p className="text-sm font-bold text-white">No active incidents in this category</p>
              <p className="text-xs text-[#8B9AB4] font-mono">All campus zones currently nominal.</p>
            </div>
          ) : (
            filteredIncidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                distanceMeters={inc.id === 'INC-0091' ? 185 : inc.id === 'INC-0090' ? 340 : 520}
                onSelect={(selected) => setSelectedIncidentForPreview(selected)}
                onAccept={(accepted) => handleAcceptCase(accepted)}
                isAssignedToMe={activeIncidentId === inc.id}
              />
            ))
          )}
        </div>

        {/* Right 5 Cols: AI Rescue Copilot & Tactical Quick Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pl-1">
          {/* AI Rescue Assistant */}
          <AIRescueAssistantCard
            title={selectedIncidentForPreview?.title || myAssignedCase?.title}
            location={selectedIncidentForPreview?.location || myAssignedCase?.location}
            occupancy={selectedIncidentForPreview?.peopleAtRisk || myAssignedCase?.peopleAtRisk || 42}
            summaryText="Fire confirmed in Science Block B Lab 302. Estimated 42 occupants. Recommended approach: East Entrance. Avoid Corridor B due to heavy smoke plume."
          />

          {/* Quick Tactical Radio Widget */}
          <div className="p-4 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#14F1D9]" /> Dispatch Radio Hotline
              </span>
              <button
                onClick={toggleRadio}
                className="text-[10px] font-mono text-[#14F1D9] hover:underline cursor-pointer"
              >
                Open Full Radio
              </button>
            </div>

            <p className="text-xs text-[#F0F4FF] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/[0.04] font-mono text-[11px]">
              &quot;Command to Unit {officer.badgeNumber}: Science Block East entrance unlocked. Security door 3F damper active.&quot;
            </p>

            <button
              onClick={toggleRadio}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-[#14F1D9]/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast on {officer.radioChannel.toUpperCase()} Channel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
