'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Shield,
  Sparkles,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { EMERGENCY_12_STATES, EmergencyStateDef } from '@/lib/workflow/emergency-lifecycle';
import { EmergencyLifecycleTimeline } from './EmergencyLifecycleTimeline';
import { LiveMonitoringPanel } from './LiveMonitoringPanel';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

export function EmergencyResponseStudio() {
  const { addToast } = useDashboardStore();

  const [stateIndex, setStateIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [evacuatedCount, setEvacuatedCount] = useState<number>(0);
  const [selectedResponderId, setSelectedResponderId] = useState<string>('RESP-01');

  const totalOccupants = 340;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentState: EmergencyStateDef = EMERGENCY_12_STATES[stateIndex];

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStateIndex((prev) => {
          if (prev >= EMERGENCY_12_STATES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Handle side-effects cleanly outside the render cycle
  useEffect(() => {
    if (stateIndex <= 6) setEvacuatedCount(0);
    else if (stateIndex === 7) setEvacuatedCount(68);
    else if (stateIndex === 8) setEvacuatedCount(190);
    else if (stateIndex === 9) setEvacuatedCount(284);
    else if (stateIndex >= 10) setEvacuatedCount(340);

    if (stateIndex === 10) {
      soundEffects.playSuccess();
      setShowConfetti(true);
      addToast({
        type: 'success',
        title: 'Incident Successfully Resolved',
        message: 'All 340 occupants verified safe. Zero casualties.',
      });
    } else if (stateIndex === 4) {
      soundEffects.playAlert();
      addToast({
        type: 'error',
        title: 'Code Red Confirmed',
        message: 'Science Block B building evacuation active.',
      });
    }
  }, [stateIndex, addToast]);

  const handleNext = () => {
    if (stateIndex < EMERGENCY_12_STATES.length - 1) {
      soundEffects.playClick();
      setStateIndex(stateIndex + 1);
    }
  };

  const handlePrev = () => {
    if (stateIndex > 0) {
      soundEffects.playClick();
      setStateIndex(stateIndex - 1);
    }
  };

  const handleReset = () => {
    soundEffects.playClick();
    setIsPlaying(false);
    setStateIndex(0);
    setEvacuatedCount(0);
    setShowConfetti(false);
    addToast({
      type: 'info',
      title: 'Workflow Reset',
      message: 'Campus status restored to Normal state (1/12).',
    });
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-0.5 text-[#F0F4FF]">
      {/* ─── Top Control Bar: Step Navigation & Auto-Play ────────────────── */}
      <div className="p-4 rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: currentState.color }} />
            <h2 className="text-sm font-bold text-[#F0F4FF]">
              State {currentState.stepNumber}/12: {currentState.label}
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#8B9AB4] mt-0.5">
            Actor: <strong className="text-[#14F1D9]">{currentState.responsibleActor}</strong> · Est. Duration: {currentState.durationEst}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={stateIndex === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-[#8B9AB4] hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#FFB347] text-[#070B12] shadow-[0_0_15px_rgba(255,179,71,0.5)]'
                : 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] shadow-[0_0_15px_rgba(20,241,217,0.4)] hover:brightness-110'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Auto-Run' : 'Auto-Run 12 States'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={stateIndex === EMERGENCY_12_STATES.length - 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-[#8B9AB4] hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-[#FF4D6D] border border-white/10 transition-all cursor-pointer"
            title="Reset Workflow"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 2-Column Split Studio Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Column: Vertical 12-State Animated Timeline (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#14F1D9]" />
              Emergency Response Lifecycle Timeline
            </h3>
            <span className="text-[9px] font-mono text-[#8B9AB4]">12 FULL STAGES</span>
          </div>

          <EmergencyLifecycleTimeline
            currentStateIndex={stateIndex}
            onSelectState={(idx) => {
              setStateIndex(idx);
              handleStateTransition(idx);
            }}
          />
        </div>

        {/* Right Column: Live Evacuation & Dispatch Board (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto pl-1">
          <LiveMonitoringPanel
            currentState={currentState}
            evacuatedCount={evacuatedCount}
            totalOccupants={totalOccupants}
            selectedResponderId={selectedResponderId}
            onSelectResponder={setSelectedResponderId}
          />
        </div>
      </div>

      {/* Confetti Celebration Cannon on Resolution */}
      <ConfettiEffect active={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  );
}
