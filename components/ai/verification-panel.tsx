'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  Radio,
  FileText,
  Smartphone,
  Mic,
  Shield,
  Activity,
  Send,
  Loader2,
} from 'lucide-react';
import { DetectionScenario } from './detection-scenarios';
import { soundEffects } from '@/lib/audio-effects';

interface VerificationPanelProps {
  scenario: DetectionScenario;
  onConfirm: () => void;
  onFalseAlarm: () => void;
  onRequestHuman: () => void;
  isConfirming?: boolean;
}

export function VerificationPanel({
  scenario,
  onConfirm,
  onFalseAlarm,
  onRequestHuman,
  isConfirming = false,
}: VerificationPanelProps) {
  const [humanRequested, setHumanRequested] = useState(false);

  const handleConfirmClick = () => {
    soundEffects.playSuccess();
    onConfirm();
  };

  const handleFalseAlarmClick = () => {
    soundEffects.playAlert();
    onFalseAlarm();
  };

  const handleHumanClick = () => {
    soundEffects.playRadioPing();
    setHumanRequested(true);
    onRequestHuman();
  };

  const { evidence } = scenario;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ─── Evidence Dossier Glass Card ─────────────────────────────── */}
      <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#14F1D9]/15 border border-[#14F1D9]/30 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14F1D9]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F0F4FF]">Evidence Dossier</h4>
              <p className="text-[9px] font-mono text-[#8B9AB4]">Multi-source sensor correlation</p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2 py-0.5 rounded border border-[#22D3A5]/30">
            VERIFIED TELEMETRY
          </span>
        </div>

        <div className="space-y-2 text-xs font-sans">
          {/* Source & Sensor ID */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[#8B9AB4] flex items-center gap-1.5 text-[11px]">
              <Camera className="w-3.5 h-3.5 text-[#14F1D9]" /> Source / Sensor:
            </span>
            <span className="text-[#F0F4FF] font-mono font-semibold text-[11px]">
              {evidence.sourceId}
            </span>
          </div>

          {/* Location & GPS */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[#8B9AB4] flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#FF4D6D]" /> Location (GPS):
            </span>
            <span className="text-[#F0F4FF] font-mono font-semibold text-[11px] text-right truncate max-w-[180px]">
              {scenario.coordinates.lat.toFixed(4)}°N, {scenario.coordinates.lng.toFixed(4)}°E
            </span>
          </div>

          {/* Time & Latency */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[#8B9AB4] flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#FFB347]" /> Timestamp:
            </span>
            <span className="text-[#F0F4FF] font-mono font-semibold text-[11px]">
              {evidence.timestamp}
            </span>
          </div>

          {/* Student SOS Message if present */}
          {evidence.studentMessage && (
            <div className="p-2.5 rounded-lg bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#FF4D6D] flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Student SOS: {evidence.studentName}
                </span>
                <span className="text-[9px] font-mono text-[#8B9AB4]">{evidence.studentId}</span>
              </div>
              <p className="text-[11px] text-[#F0F4FF] leading-snug italic">
                &ldquo;{evidence.studentMessage}&rdquo;
              </p>
            </div>
          )}

          {/* Voice Transcript if present */}
          {evidence.voiceTranscript && (
            <div className="p-2.5 rounded-lg bg-[rgba(124,92,255,0.08)] border border-[rgba(124,92,255,0.25)] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#7C5CFF] flex items-center gap-1">
                <Mic className="w-3 h-3" /> Emergency Audio Transcript ({evidence.audioDuration})
              </span>
              <p className="text-[11px] text-[#F0F4FF] leading-snug italic">
                {evidence.voiceTranscript}
              </p>
            </div>
          )}

          {/* Security Officer Notes if present */}
          {evidence.officerNotes && (
            <div className="p-2.5 rounded-lg bg-[rgba(20,241,217,0.08)] border border-[rgba(20,241,217,0.25)] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#14F1D9] flex items-center gap-1">
                <FileText className="w-3 h-3" /> Field Officer: {evidence.officerName} ({evidence.officerBadge})
              </span>
              <p className="text-[11px] text-[#F0F4FF] leading-snug">
                {evidence.officerNotes}
              </p>
            </div>
          )}

          {/* Live Sensor Telemetry Array */}
          {evidence.sensorTelemetries && evidence.sensorTelemetries.length > 0 && (
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-1.5">
                Coupled IoT Sensor Feeds
              </span>
              <div className="space-y-1">
                {evidence.sensorTelemetries.map((sens, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono p-1 rounded bg-black/30">
                    <span className="text-[#8B9AB4]">{sens.label}:</span>
                    <span
                      className={`font-bold ${
                        sens.status === 'alert'
                          ? 'text-[#FF4D6D]'
                          : sens.status === 'warning'
                          ? 'text-[#FFB347]'
                          : 'text-[#22D3A5]'
                      }`}
                    >
                      {sens.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Escalation Alert Banner if Human Requested ─────────────── */}
      <AnimatePresence>
        {humanRequested && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-[rgba(255,179,71,0.15)] border border-[#FFB347] flex items-center gap-3 shadow-lg"
          >
            <Radio className="w-5 h-5 text-[#FFB347] animate-pulse flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#FFB347]">Human Verification Escalated</p>
              <p className="text-[10px] text-[#F0F4FF]">
                Radio ping transmitted to Shift Commander Sgt. Sharma on CH-2.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Verification Action Buttons ─────────────────────────────── */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Main Confirm Button */}
        <button
          onClick={handleConfirmClick}
          disabled={isConfirming}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#14F1D9] via-[#22D3A5] to-[#14F1D9] hover:brightness-110 text-[#070B12] font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(20,241,217,0.4)] transition-all cursor-pointer disabled:opacity-50"
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#070B12]" />
              <span>Broadcasting Realtime Dispatch...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm Incident & Dispatch</span>
            </>
          )}
        </button>

        {/* Secondary False Alarm & Human Review Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleFalseAlarmClick}
            className="py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-[rgba(255,77,109,0.15)] text-[#8B9AB4] hover:text-[#FF4D6D] border border-white/[0.08] hover:border-[#FF4D6D]/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>False Alarm</span>
          </button>

          <button
            onClick={handleHumanClick}
            className={`py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              humanRequested
                ? 'bg-[#FFB347]/20 border-[#FFB347] text-[#FFB347]'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#8B9AB4] hover:text-[#F0F4FF] border-white/[0.08]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Req. Human</span>
          </button>
        </div>
      </div>
    </div>
  );
}
