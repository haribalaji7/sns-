'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
  X,
  FileText,
  User,
  Activity,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

export function StudentHistoryTab() {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const logs = [
    {
      id: 'SOS-8841-A',
      title: 'Emergency Medical Beacon Triggered',
      type: 'Medical Alert',
      location: 'Central Quad Walkway',
      date: 'Aug 28, 2026 · 17:52',
      status: 'Resolved & Cleared',
      responder: 'Dr. Sarah Mills (ALS Paramedic)',
      duration: '4m 12s total resolution',
      aiSummary: 'Student reported sudden acute asthma distress. Squad Alpha dispatched ALS Paramedic with oxygen & albuterol. Student vitals stabilized within 4m 12s.',
      vitalNotes: 'O2 Saturation restored to 99%. Heart rate normalized at 76 bpm.',
    },
    {
      id: 'DRILL-2026-03',
      title: 'Campus-Wide Fire Evacuation Drill',
      type: 'Routine Drill',
      location: 'Science Block B',
      date: 'Aug 14, 2026 · 10:00 AM',
      status: 'Completed',
      responder: 'Squad Alpha (Fire Lead)',
      duration: '6m 40s evacuation time',
      aiSummary: 'Simulated thermal runaway in Chem Lab 302. All 142 students evacuated via East Stairwell to Assembly Point Alpha within 6m 40s.',
      vitalNotes: '100% attendance verified via QR safe check-in scanner.',
    },
    {
      id: 'SOS-8192-B',
      title: 'Night Escort Request (SafeWalk)',
      type: 'Security Escort',
      location: 'Library to Dormitory A',
      date: 'Aug 02, 2026 · 11:30 PM',
      status: 'Safely Completed',
      responder: 'Off. Marcus Webb',
      duration: '12 mins escort',
      aiSummary: 'SafeWalk companion service engaged after late library study hours. Officer escorted student to Dorm A-214 with live perimeter monitoring.',
      vitalNotes: 'Direct digital check-in completed at Dormitory A gate.',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <History className="w-4 h-4 text-[#14F1D9]" />
            Safety Activity History
          </h2>
          <p className="text-[10px] font-mono text-[#8B9AB4]">
            Past SOS Dispatches & Verified Drills
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2.5 py-0.5 rounded-full border border-[#22D3A5]/30 font-bold">
          3 LOGS
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            onClick={() => {
              soundEffects.playClick();
              setSelectedLog(log);
            }}
            className="p-4 rounded-3xl glass border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#14F1D9] font-bold block mb-0.5">
                  {log.id} · {log.type}
                </span>
                <h3 className="text-xs font-bold text-[#F0F4FF]">{log.title}</h3>
              </div>
              <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2 py-0.5 rounded-full border border-[#22D3A5]/30 font-bold">
                {log.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#8B9AB4] pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#FFB347]" />
                <span className="truncate">{log.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-right justify-end">
                <Clock className="w-3 h-3 text-[#14F1D9]" />
                <span>{log.duration}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/30 text-[10px] font-mono text-[#C5CDE8] flex items-center justify-between">
              <span className="truncate max-w-[180px]">Unit: {log.responder}</span>
              <span className="text-[#8B9AB4] flex items-center gap-1 text-[9px]">
                <span>Details</span>
                <ChevronRight className="w-3 h-3 text-[#14F1D9]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Incident History Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative w-full max-w-md rounded-3xl glass border border-[rgba(20,241,217,0.4)] bg-[#070B12] p-5 shadow-[0_0_60px_rgba(20,241,217,0.3)] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F0F4FF]">{selectedLog.title}</h3>
                    <p className="text-[9px] font-mono text-[#14F1D9]">{selectedLog.id} · {selectedLog.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-[#8B9AB4] hover:text-white p-1 rounded-xl bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* AI Executive Summary */}
                <div className="p-3 rounded-2xl bg-[rgba(20,241,217,0.08)] border border-[rgba(20,241,217,0.25)] space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#14F1D9] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Incident De-Brief</span>
                  </div>
                  <p className="text-xs text-[#F0F4FF] leading-relaxed">
                    {selectedLog.aiSummary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[#8B9AB4] block">RESOLVING UNIT</span>
                    <span className="text-xs font-bold text-[#F0F4FF] truncate block mt-0.5">{selectedLog.responder}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[#8B9AB4] block">RESPONSE TIME</span>
                    <span className="text-xs font-bold text-[#22D3A5] truncate block mt-0.5">{selectedLog.duration}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-[11px]">
                  <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">Medical / Security Notes:</span>
                  <p className="text-[#D0D6E0]">{selectedLog.vitalNotes}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase transition-all"
              >
                Close Report
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
