'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import { ArrivalStage, useSecurityStore } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';

const STAGES: { id: ArrivalStage; label: string; description: string }[] = [
  { id: 'accepted', label: 'Accepted', description: 'Dispatched & En Route' },
  { id: 'arrived', label: 'Arrived', description: 'On Scene at Building' },
  { id: 'assisting', label: 'Assisting', description: 'Active Containment' },
  { id: 'secured', label: 'Secured', description: 'Area Clear & Safe' },
  { id: 'resolved', label: 'Resolved', description: 'Incident Concluded' },
];

export function ArrivalWorkflowStepper() {
  const { arrivalStage, advanceArrivalStage, stageTimestamps } = useSecurityStore();

  const currentIdx = STAGES.findIndex((s) => s.id === arrivalStage);

  const handleNextStage = () => {
    soundEffects.playScan();
    advanceArrivalStage();
  };

  const getNextStageLabel = () => {
    switch (arrivalStage) {
      case 'accepted':
        return 'Mark As Arrived On Scene';
      case 'arrived':
        return 'Engage Assisting / Containment';
      case 'assisting':
        return 'Confirm Area Secured';
      case 'secured':
        return 'Finalize & Resolve Incident';
      case 'resolved':
      default:
        return 'Incident Resolved & Closed';
    }
  };

  return (
    <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#14F1D9]" /> Incident Response Lifecycle
        </span>
        <span className="text-[10px] font-mono text-[#22D3A5] font-bold bg-[#22D3A5]/10 px-2 py-0.5 rounded border border-[#22D3A5]/30">
          STAGE {Math.max(1, currentIdx + 1)} OF 5
        </span>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {STAGES.map((stg, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div
              key={stg.id}
              className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                isCurrent
                  ? 'bg-[rgba(20,241,217,0.15)] border-[#14F1D9] text-[#14F1D9] shadow-[0_0_15px_rgba(20,241,217,0.3)]'
                  : isDone
                  ? 'bg-[rgba(34,211,165,0.08)] border-[#22D3A5]/40 text-[#22D3A5]'
                  : 'bg-white/[0.02] border-white/[0.05] text-[#8B9AB4]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mb-1 ${
                  isDone ? 'bg-[#22D3A5] text-[#070B12]' : 'bg-white/10 text-[#8B9AB4]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-[10px] sm:text-xs font-bold leading-tight truncate w-full">
                {stg.label}
              </span>
              <span className="text-[8px] font-mono opacity-70 hidden sm:block truncate w-full">
                {stg.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Advance Button */}
      {arrivalStage !== 'resolved' && (
        <button
          onClick={handleNextStage}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(20,241,217,0.3)] cursor-pointer transition-all"
        >
          <span>{getNextStageLabel()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
