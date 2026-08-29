'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Navigation2,
  Compass,
  Layers,
  Wrench,
  Users
} from 'lucide-react';
import { speakText, stopSpeech, soundEffects } from '@/lib/audio-effects';

interface AIRescueAssistantProps {
  title?: string;
  location?: string;
  occupancy?: number;
  entryPoint?: string;
  exitPoint?: string;
  equipment?: string[];
  crowdWarning?: string;
  secondaryHazards?: string;
  spreadRate?: string;
  summaryText?: string;
}

export function AIRescueAssistantCard({
  title = 'Thermal Combustion Spike in Lab 302',
  location = 'Science Block B – Floor 3, Room 302',
  occupancy = 42,
  entryPoint = 'East Stairwell Access Ramp (Door E-3)',
  exitPoint = 'Assembly Zone Alpha (North Quad via Exit B)',
  equipment = ['SCBA Breathing Apparatus', 'CO2 Fire Extinguisher (5kg)', 'Thermal FLIR Camera', 'Triage First Aid Kit'],
  crowdWarning = 'Moderate panic bottleneck detected near Central West stairwell. Redirect evacuees to East wing.',
  secondaryHazards = 'Chemical solvent storage lockers located on north wall of Room 302.',
  spreadRate = '0.4 m/s (Combustion plume migrating to hallway ceiling)',
  summaryText = 'Fire confirmed in Science Block B Lab 302. Estimated 42 occupants. Recommended approach: East Entrance. Avoid Corridor B due to heavy smoke plume.',
}: AIRescueAssistantProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceBriefing = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEffects.playScan();
      speakText(summaryText, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="rounded-2xl glass border border-[rgba(20,241,217,0.35)] bg-[#070B12]/90 p-4 sm:p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(20,241,217,0.15)] flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#14F1D9]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Voice Briefing Button */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] flex items-center justify-center text-[#14F1D9] shadow-[0_0_12px_rgba(20,241,217,0.3)]">
            <Sparkles className="w-4 h-4 text-[#14F1D9]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#F0F4FF] tracking-tight flex items-center gap-2">
              AI Rescue & Tactical Copilot
              <span className="text-[9px] font-mono text-[#14F1D9] bg-[#14F1D9]/10 px-1.5 py-0.2 rounded border border-[#14F1D9]/30">
                LIVE INTEL
              </span>
            </h3>
            <p className="text-[10px] text-[#8B9AB4] font-mono">Autonomous Hazard Assessment & Infiltration Guidance</p>
          </div>
        </div>

        <button
          onClick={handleVoiceBriefing}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
            isSpeaking
              ? 'bg-[#FF4D6D] text-white border-[#FF4D6D] animate-pulse shadow-[0_0_15px_#FF4D6D]'
              : 'bg-white/5 hover:bg-white/10 text-[#14F1D9] border-white/10'
          }`}
          title="Play Hands-Free Audio Briefing"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? 'Mute Briefing' : 'Voice Briefing'}</span>
        </button>
      </div>

      {/* Primary AI Intelligence Summary Box */}
      <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] relative z-10">
        <p className="text-xs text-[#F0F4FF] font-medium leading-relaxed">
          &quot;{summaryText}&quot;
        </p>
      </div>

      {/* Grid of Tactical Entry/Exit Guidance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono relative z-10">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <div className="flex items-center gap-1.5 text-[#14F1D9] font-bold">
            <Navigation2 className="w-3.5 h-3.5" />
            <span>Recommended Entry Point</span>
          </div>
          <p className="text-[11px] text-[#D0D6E0]">{entryPoint}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <div className="flex items-center gap-1.5 text-[#22D3A5] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Evacuation Exit Route</span>
          </div>
          <p className="text-[11px] text-[#D0D6E0]">{exitPoint}</p>
        </div>
      </div>

      {/* Tactical Gear & Equipment Checklist */}
      <div className="space-y-2 relative z-10">
        <span className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold flex items-center gap-1.5">
          <Wrench className="w-3 h-3 text-[#FFB347]" /> Required PPE & Emergency Equipment
        </span>
        <div className="flex flex-wrap gap-1.5">
          {equipment.map((eq, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-mono text-[#F0F4FF] font-semibold flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#14F1D9]" />
              {eq}
            </span>
          ))}
        </div>
      </div>

      {/* Secondary Hazard & Crowd Warning Alert */}
      <div className="p-3 rounded-xl bg-[rgba(255,77,109,0.1)] border border-[#FF4D6D]/30 space-y-1.5 text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-[#FF4D6D] font-bold font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Secondary Hazard Alert & Crowd Triage</span>
        </div>
        <p className="text-[11px] text-[#D0D6E0] leading-relaxed">
          {secondaryHazards} {crowdWarning}
        </p>
      </div>
    </div>
  );
}
