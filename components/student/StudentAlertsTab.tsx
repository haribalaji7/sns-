'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Flame,
  AlertTriangle,
  Wind,
  ShieldAlert,
  Navigation,
  ChevronRight,
  CheckCircle2,
  Share2,
  Volume2,
  Check,
  Zap,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useStudentStore } from '@/store/student';
import { useDashboardStore } from '@/store/dashboard';

interface StudentAlertsTabProps {
  onNavigateToMap?: () => void;
}

export function StudentAlertsTab({ onNavigateToMap }: StudentAlertsTabProps) {
  const { markSafe } = useStudentStore();
  const { incidents, aiAlerts, acknowledgeAlert } = useDashboardStore();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(incidents[0]?.id || 'ALT-1');

  const defaultAlerts = [
    {
      id: 'ALT-1',
      title: 'Science Lab B3 – Active Thermal Runaway',
      location: 'Science Block B – Floor 3, Room 302',
      severity: 'critical',
      time: 'Just now',
      distance: '320m from you',
      desc: 'Multiple smoke sensors triggered simultaneously. Fire suppression deployed. All occupants must evacuate immediately.',
      action: 'Avoid Science Block B. Do NOT use elevators. Muster at Assembly Point Alpha (North Quad).',
      active: true,
    },
    {
      id: 'ALT-2',
      title: 'Library Archives B1 – Chemical VOC Spike',
      location: 'Main Library – Basement Level',
      severity: 'high',
      time: '24 mins ago',
      distance: '650m from you',
      desc: 'Automated air scrubber exhaust fans running. Basement archives locked down for maintenance.',
      action: 'Basement study rooms closed. Upper library floors operating under normal conditions.',
      active: true,
    },
    {
      id: 'ALT-3',
      title: 'Perimeter Gate 1 – Routine Drill Complete',
      location: 'North Perimeter Gate',
      severity: 'low',
      time: '1 hour ago',
      distance: '820m from you',
      desc: 'Security officers completed annual access control simulation. Normal pedestrian flow resumed.',
      action: 'No action required. Gate turnstiles fully operational.',
      active: false,
    },
  ];

  const handleMarkSafeAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playSuccess();
    await markSafe();
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
      {/* ─── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF4D6D]" />
            Emergency Broadcast Feed
          </h2>
          <p className="text-[10px] font-mono text-[#8B9AB4]">
            Official Campus Safety Bulletins · Realtime Supabase Stream
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#FF4D6D] bg-[#FF4D6D]/15 px-2.5 py-0.5 rounded-full border border-[#FF4D6D]/30 font-bold">
          {incidents.length || 2} ACTIVE
        </span>
      </div>

      {/* ─── Alerts Stream ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {defaultAlerts.map((alt) => {
          const isSelected = selectedAlertId === alt.id;
          const isCritical = alt.severity === 'critical';

          return (
            <div
              key={alt.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedAlertId(isSelected ? null : alt.id);
              }}
              className={`rounded-3xl glass border transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? isCritical
                    ? 'border-[#FF4D6D] bg-[rgba(255,77,109,0.12)] shadow-[0_0_25px_rgba(255,77,109,0.25)]'
                    : 'border-[#14F1D9] bg-[rgba(20,241,217,0.08)]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                        isCritical ? 'bg-[#FF4D6D]/20 text-[#FF4D6D]' : 'bg-[#FFB347]/20 text-[#FFB347]'
                      }`}
                    >
                      {isCritical ? <Flame className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-[#F0F4FF] leading-snug">
                      {alt.title}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                      isCritical
                        ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40'
                        : 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/40'
                    }`}
                  >
                    {alt.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8B9AB4] mt-2 pt-2 border-t border-white/[0.05]">
                  <span className="flex items-center gap-1 text-[#14F1D9]">
                    <Navigation className="w-3 h-3" /> {alt.distance}
                  </span>
                  <span>{alt.time}</span>
                </div>
              </div>

              {/* Expandable Details Card */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-3 text-xs bg-black/40"
                  >
                    <p className="text-[#C5CDE8] leading-relaxed">
                      {alt.desc}
                    </p>

                    <div className="p-3 rounded-2xl bg-[rgba(20,241,217,0.08)] border border-[rgba(20,241,217,0.25)] space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#14F1D9] uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Recommended Tactical Directive
                      </span>
                      <p className="text-xs font-bold text-[#F0F4FF] leading-snug">
                        {alt.action}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      {onNavigateToMap && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToMap();
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0F4FF] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#14F1D9]" />
                          <span>View Safe Route</span>
                        </button>
                      )}

                      <button
                        onClick={handleMarkSafeAction}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#22D3A5]/20 hover:bg-[#22D3A5]/30 text-[#22D3A5] border border-[#22D3A5]/40 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>I Am Safe</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
