'use client';

import { GlassCard, SectionHeader, NeonBadge, GradientButton } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';
import { timeAgo, severityColor } from '@/lib/utils';
import {
  AlertTriangle,
  Filter,
  ChevronRight,
  Flame,
  UserX,
  Heart,
  Wind,
  Package,
  Zap,
  ListOrdered,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { EmergencyResponseStudio } from '@/components/workflow/EmergencyResponseStudio';
import { soundEffects } from '@/lib/audio-effects';

const TYPE_ICONS: Record<string, any> = {
  fire: Flame,
  intrusion: UserX,
  medical: Heart,
  gas_leak: Wind,
  suspicious: Package,
};

const FILTERS = ['All', 'Active', 'Responding', 'Resolved', 'Critical', 'High', 'Medium'];

export default function IncidentsPage() {
  const { incidents, selectIncident } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'workflow'>('feed');
  const [filter, setFilter] = React.useState('All');

  const filtered = incidents.filter((inc) => {
    if (filter === 'All') return true;
    if (['Active', 'Responding', 'Resolved'].includes(filter)) {
      return (
        inc.status.toLowerCase().replace('_', ' ') === filter.toLowerCase() ||
        inc.status === filter.toLowerCase()
      );
    }
    return inc.severity === filter.toLowerCase();
  });

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col gap-4 overflow-y-auto">
      {/* ─── Top Header & Dual Tab Switcher ──────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#F0F4FF] flex items-center gap-2">
            Incident Operations & Response Lifecycle
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/40 uppercase">
              REALTIME
            </span>
          </h1>
          <p className="text-xs text-[#8B9AB4]">
            {incidents.length} total recorded · {incidents.filter((i) => i.status === 'active').length} active alarms
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass border border-white/[0.08] bg-[#070B12]/80">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('feed');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] shadow-[0_0_15px_rgba(20,241,217,0.4)]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Incidents Feed</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('workflow');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-gradient-to-r from-[#7C5CFF] to-[#14F1D9] text-white shadow-[0_0_15px_rgba(124,92,255,0.4)]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>12-State Lifecycle Studio</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Incidents Operations Feed ────────────────────────── */}
      {activeTab === 'feed' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono uppercase text-[#8B9AB4] font-bold">Filter Incidents</span>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    soundEffects.playClick();
                    setFilter(f);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-[#14F1D9] text-[#070B12] font-bold shadow-md'
                      : 'glass text-[#8B9AB4] hover:text-[#F0F4FF]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <GlassCard padding="none" animate>
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((inc, i) => {
                const Icon = TYPE_ICONS[inc.type] ?? AlertTriangle;
                const sc = severityColor[inc.severity] || '#8B9AB4';

                return (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                    onClick={() => {
                      soundEffects.playClick();
                      selectIncident(inc.id);
                    }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer group transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${sc}15`, border: `1px solid ${sc}25` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: sc }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#F0F4FF] group-hover:text-[#14F1D9] transition-colors">
                          {inc.title}
                        </span>
                        <NeonBadge variant={inc.severity as 'critical' | 'high' | 'medium' | 'low'} dot size="xs">
                          {inc.severity}
                        </NeonBadge>
                      </div>
                      <p className="text-xs text-[#8B9AB4] truncate">{inc.location}</p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-mono text-[#8B9AB4] block">{timeAgo(inc.reportedAt)}</span>
                      <span className="text-[10px] font-mono text-[#22D3A5] capitalize">{inc.status}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#4A5568] group-hover:text-white transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      ) : (
        /* ─── TAB 2: 12-State Emergency Lifecycle Studio ──────────────── */
        <div className="flex-1 min-h-0">
          <EmergencyResponseStudio />
        </div>
      )}
    </div>
  );
}
