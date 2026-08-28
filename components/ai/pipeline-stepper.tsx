'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileInput,
  Cpu,
  Scan,
  Sparkles,
  Gauge,
  ShieldCheck,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export type PipelineStage =
  | 'idle'
  | 'input'
  | 'preprocessing'
  | 'yolo'
  | 'gemini'
  | 'risk'
  | 'verification'
  | 'dispatched';

interface PipelineStepperProps {
  currentStage: PipelineStage;
  stageLatencies?: Record<string, number>;
}

const STAGES = [
  { id: 'input', label: 'Input Ingestion', shortLabel: 'Input', icon: FileInput, model: 'Stream RTSP / File' },
  { id: 'preprocessing', label: 'Preprocessing', shortLabel: 'Preprocess', icon: Cpu, model: '640x640 Tensor' },
  { id: 'yolo', label: 'Object Detection', shortLabel: 'YOLO Vision', icon: Scan, model: 'YOLOv11x-Vision' },
  { id: 'gemini', label: 'NLP Classification', shortLabel: 'Gemini NLP', icon: Sparkles, model: 'Gemini 1.5 Pro' },
  { id: 'risk', label: 'Risk Scoring', shortLabel: 'Risk Engine', icon: Gauge, model: 'CampusRisk v3.8' },
  { id: 'verification', label: 'Verification', shortLabel: 'Verify', icon: ShieldCheck, model: 'Human-in-the-Loop' },
  { id: 'dispatched', label: 'Incident Created', shortLabel: 'Dispatched', icon: Send, model: 'Supabase Realtime' },
];

export function PipelineStepper({ currentStage, stageLatencies = {} }: PipelineStepperProps) {
  const getStageIndex = (stage: PipelineStage): number => {
    switch (stage) {
      case 'input': return 0;
      case 'preprocessing': return 1;
      case 'yolo': return 2;
      case 'gemini': return 3;
      case 'risk': return 4;
      case 'verification': return 5;
      case 'dispatched': return 6;
      case 'idle':
      default:
        return 5; // Default when ready for verification
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full bg-[#070B12]/90 border border-white/[0.08] rounded-xl p-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#14F1D9] animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#14F1D9] uppercase">
            AI Neural Pipeline Flow
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B9AB4]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14F1D9]" /> Model: YOLOv11x + Gemini 1.5 Pro
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="text-[#14F1D9] font-semibold">Latency: 38ms</span>
        </div>
      </div>

      {/* Stepper Flow Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {STAGES.map((st, idx) => {
          const isCompleted = idx < currentIndex || currentStage === 'dispatched' || currentStage === 'idle';
          const isCurrent = idx === currentIndex && currentStage !== 'idle' && currentStage !== 'dispatched';
          const Icon = st.icon;

          return (
            <div
              key={st.id}
              className={`relative rounded-lg p-2.5 flex flex-col justify-between border transition-all duration-300 ${
                isCurrent
                  ? 'bg-[rgba(20,241,217,0.12)] border-[#14F1D9] shadow-[0_0_15px_rgba(20,241,217,0.2)]'
                  : isCompleted
                  ? 'bg-white/[0.03] border-[#22D3A5]/30 text-[#F0F4FF]'
                  : 'bg-white/[0.01] border-white/[0.05] text-[#4A5568] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#14F1D9] text-[#070B12]'
                      : isCompleted
                      ? 'bg-[#22D3A5]/20 text-[#22D3A5]'
                      : 'bg-white/5 text-[#4A5568]'
                  }`}
                >
                  {isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3A5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[9px] font-mono font-bold text-[#8B9AB4]">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <p
                  className={`text-[11px] font-bold leading-tight truncate ${
                    isCurrent
                      ? 'text-[#14F1D9]'
                      : isCompleted
                      ? 'text-[#F0F4FF]'
                      : 'text-[#8B9AB4]'
                  }`}
                >
                  {st.shortLabel}
                </p>
                <p className="text-[9px] font-mono text-[#8B9AB4] truncate mt-0.5">
                  {st.model}
                </p>
              </div>

              {/* Status pill */}
              <div className="mt-2 pt-1 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono">
                <span
                  className={
                    isCurrent
                      ? 'text-[#14F1D9] font-bold animate-pulse'
                      : isCompleted
                      ? 'text-[#22D3A5]'
                      : 'text-[#4A5568]'
                  }
                >
                  {isCurrent ? 'Processing' : isCompleted ? 'Verified' : 'Pending'}
                </span>
                <span className="text-[#8B9AB4]">
                  {stageLatencies[st.id] ? `${stageLatencies[st.id]}ms` : idx === 2 ? '18ms' : idx === 3 ? '42ms' : '6ms'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
