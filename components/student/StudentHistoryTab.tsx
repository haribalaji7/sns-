'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
} from 'lucide-react';

export function StudentHistoryTab() {
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
        <span className="text-[10px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2 py-0.5 rounded-full border border-[#22D3A5]/30">
          3 LOGS
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-3xl glass border border-white/[0.08] bg-white/[0.02] space-y-2.5"
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
              <span>Unit: {log.responder}</span>
              <span className="text-[#8B9AB4]">{log.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
