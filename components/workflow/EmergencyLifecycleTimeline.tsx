'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Radio,
  Scan,
  CheckCircle2,
  AlertOctagon,
  Cpu,
  Users,
  Navigation,
  Activity,
  Flame,
  FileText,
  Clock,
  User,
} from 'lucide-react';
import { EmergencyStateDef, EMERGENCY_12_STATES } from '@/lib/workflow/emergency-lifecycle';
import { soundEffects } from '@/lib/audio-effects';

interface EmergencyLifecycleTimelineProps {
  currentStateIndex: number;
  onSelectState: (index: number) => void;
}

export function EmergencyLifecycleTimeline({
  currentStateIndex,
  onSelectState,
}: EmergencyLifecycleTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'shield': return Shield;
      case 'radio': return Radio;
      case 'scan': return Scan;
      case 'check-shield': return CheckCircle2;
      case 'alert': return AlertOctagon;
      case 'cpu': return Cpu;
      case 'users': return Users;
      case 'navigation': return Navigation;
      case 'activity': return Activity;
      case 'flame': return Flame;
      case 'check-circle': return CheckCircle2;
      case 'file-text': return FileText;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-3">
      {EMERGENCY_12_STATES.map((st, idx) => {
        const Icon = getIcon(st.iconType);
        const isPast = idx < currentStateIndex;
        const isCurrent = idx === currentStateIndex;
        const isFuture = idx > currentStateIndex;

        return (
          <div
            key={st.key}
            onClick={() => {
              soundEffects.playClick();
              onSelectState(idx);
            }}
            className={`p-3.5 rounded-2xl glass border transition-all cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
              isCurrent
                ? 'border-[#14F1D9] bg-[rgba(20,241,217,0.12)] shadow-[0_0_25px_rgba(20,241,217,0.25)]'
                : isPast
                ? 'border-white/[0.08] bg-white/[0.02] opacity-80 hover:opacity-100'
                : 'border-white/[0.04] bg-white/[0.01] opacity-40 hover:opacity-70'
            }`}
          >
            {/* Left Step Badge */}
            <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  isCurrent
                    ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_15px_#14F1D9] animate-pulse'
                    : isPast
                    ? 'bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40'
                    : 'bg-white/5 text-[#4A5568] border border-white/10'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  st.stepNumber
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: st.color }} />
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#14F1D9]' : 'text-[#F0F4FF]'}`}>
                    {st.label}
                  </h4>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                    isCurrent
                      ? 'bg-[#14F1D9]/20 text-[#14F1D9] border border-[#14F1D9]/40'
                      : isPast
                      ? 'bg-[#22D3A5]/10 text-[#22D3A5]'
                      : 'bg-white/5 text-[#4A5568]'
                  }`}
                >
                  {isCurrent ? 'ACTIVE NOW' : isPast ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>

              <p className="text-[11px] text-[#C5CDE8] leading-tight">
                {st.description}
              </p>

              {/* Telemetry log when active */}
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-2 rounded-xl bg-black/40 border border-white/[0.06] text-[10px] font-mono text-[#14F1D9] space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[9px] text-[#8B9AB4]">
                    <span>Actor: {st.responsibleActor}</span>
                    <span>Elapsed: {st.durationEst}</span>
                  </div>
                  <p className="text-white/90">{st.telemetryLog}</p>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
