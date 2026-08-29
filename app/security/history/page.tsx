'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  FileText,
  Search,
  Flame,
  Zap,
  Shield,
  Filter,
  Calendar
} from 'lucide-react';
import { useSecurityStore } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';

export default function SecurityHistoryPage() {
  const { incidentHistory, officer } = useSecurityStore();
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = incidentHistory.filter((item) => {
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.incidentId.toLowerCase().includes(q)
    );
  });

  const handleExportReport = () => {
    soundEffects.playSuccess();
    const content = JSON.stringify({
      officer: officer.name,
      badge: officer.badgeNumber,
      shift: officer.currentShift,
      exportedAt: new Date().toISOString(),
      casesResolved: incidentHistory.length,
      history: incidentHistory,
    }, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shift_Debrief_${officer.badgeNumber}_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ─── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12]/80 border border-white/[0.08] p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#F0F4FF] flex items-center gap-2">
            Shift Action Debrief &amp; Incident Logs
            <span className="px-2 py-0.5 rounded-full bg-[#22D3A5]/15 text-[#22D3A5] font-mono text-[10px] font-bold uppercase">
              {incidentHistory.length} RESOLVED RECORDS
            </span>
          </h1>
          <p className="text-xs text-[#8B9AB4] font-medium">
            Post-Incident Triage Audits, Response Duration Analytics &amp; Compliance Logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-[#14F1D9]/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Shift Report</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All History' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High Priority' },
            { id: 'medium', label: 'Medium' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundEffects.playClick();
                setFilterSeverity(f.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterSeverity === f.id
                  ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_12px_#14F1D9]'
                  : 'bg-white/[0.03] text-[#8B9AB4] hover:text-white border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B9AB4]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search past logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#14F1D9]"
          />
        </div>
      </div>

      {/* ─── Incident Debrief Cards ─────────────────────────────────── */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl glass border border-white/[0.08] bg-[#070B12]/85 backdrop-blur-md shadow-xl flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40 font-mono text-[9px] font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> RESOLVED
                  </span>
                  <span className="text-xs font-mono text-[#14F1D9] font-bold">
                    {item.incidentId}
                  </span>
                  <span className="text-[10px] font-mono text-[#8B9AB4]">
                    Officer: {item.officerBadge}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#F0F4FF]">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#8B9AB4]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#14F1D9]" />
                  <span>Duration: {Math.floor(item.responseDurationSeconds / 60)}m {item.responseDurationSeconds % 60}s</span>
                </div>
              </div>
            </div>

            {/* Location & Summary */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#14F1D9] font-mono font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.location}</span>
              </div>
              <p className="text-[11px] text-[#D0D6E0] leading-relaxed">
                &quot;{item.summary}&quot;
              </p>
            </div>

            {/* Actions Taken Pills */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#8B9AB4] uppercase font-bold">
                Actions Executed:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.actionsTaken.map((act, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/10 text-[10px] font-mono text-[#F0F4FF] flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5]" />
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
