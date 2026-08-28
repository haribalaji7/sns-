'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Heart,
  AlertOctagon,
  UserX,
  HelpCircle,
  Camera,
  Mic,
  MapPin,
  Send,
  X,
  StopCircle,
  Radio,
  CheckCircle2,
  Volume2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

export type EmergencyCategory = 'fire' | 'medical' | 'violence' | 'harassment' | 'other';

interface StudentSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (data: {
    category: EmergencyCategory;
    notes: string;
    hasPhoto: boolean;
    hasVoiceNote: boolean;
    coordinates: { lat: number; lng: number };
  }) => void;
}

const CATEGORIES = [
  { id: 'fire' as EmergencyCategory, label: 'Fire / Smoke', icon: Flame, color: '#FF4D6D', desc: 'Active flames, smoke, or explosion' },
  { id: 'medical' as EmergencyCategory, label: 'Medical Emergency', icon: Heart, color: '#FF4D6D', desc: 'Injury, collapse, or severe reaction' },
  { id: 'violence' as EmergencyCategory, label: 'Violence / Threat', icon: AlertOctagon, color: '#FFB347', desc: 'Physical altercation or weapon' },
  { id: 'harassment' as EmergencyCategory, label: 'Harassment', icon: UserX, color: '#7C5CFF', desc: 'Stalking, intimidation, or distress' },
  { id: 'other' as EmergencyCategory, label: 'Other Hazard', icon: HelpCircle, color: '#14F1D9', desc: 'Chemical leak, trapped, or outage' },
];

export function StudentSOSModal({ isOpen, onClose, onSubmitted }: StudentSOSModalProps) {
  const { verifyIncident, addToast } = useDashboardStore();

  const [step, setStep] = useState<'countdown' | 'details' | 'submitting'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [category, setCategory] = useState<EmergencyCategory>('medical');
  const [notes, setNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start 3-second emergency countdown on open
  useEffect(() => {
    if (isOpen) {
      setStep('countdown');
      setCountdown(3);
      soundEffects.playAlert();

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            setStep('details');
            setGpsLocked(true);
            soundEffects.playScan();
            return 0;
          }
          soundEffects.playAlert();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen]);

  // Voice note timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setVoiceDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleToggleVoice = () => {
    soundEffects.playClick();
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setHasVoiceNote(true);
    } else {
      setIsRecordingVoice(true);
      setVoiceDuration(0);
    }
  };

  const handlePhotoUpload = () => {
    soundEffects.playClick();
    setHasPhoto(true);
    addToast({
      type: 'info',
      title: 'Incident Snapshot Attached',
      message: 'Camera frame queued with SOS telemetry.',
    });
  };

  const handleSubmit = async () => {
    soundEffects.playSuccess();
    setStep('submitting');

    const sosData = {
      type: category === 'harassment' ? 'violence' : category,
      title: `Student Emergency SOS: ${category.toUpperCase()}`,
      severity: category === 'fire' || category === 'medical' ? 'critical' : 'high',
      location: 'Central Student Quad – Walkway Alpha',
      zone: 'Z-ADMIN',
      coordinates,
      occupancy: 1,
      confidence: 99.4,
      recommendation: `Student Maya Lin triggered Emergency SOS Beacon (${category.toUpperCase()}). Immediate responder dispatch and telemetry tracking engaged.`,
    };

    try {
      await verifyIncident(sosData);
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      onSubmitted({
        category,
        notes,
        hasPhoto,
        hasVoiceNote,
        coordinates,
      });
    }, 600);
  };

  const handleAbort = () => {
    soundEffects.playClick();
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    onClose();
    addToast({
      type: 'info',
      title: 'SOS Cancelled',
      message: 'Emergency trigger safely aborted by student.',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md rounded-3xl glass border border-[rgba(255,77,109,0.4)] bg-[#070B12] p-5 shadow-[0_0_60px_rgba(255,77,109,0.3)] overflow-hidden"
      >
        {/* Top Emergency Highlight Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF4D6D] via-[#FFB347] to-[#FF4D6D] animate-pulse" />

        {/* ─── STEP 1: COUNTDOWN CANCEL SAFETY ───────────────────────── */}
        {step === 'countdown' && (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="relative w-32 h-32 mb-5 flex items-center justify-center">
              {/* Outer pulsing red wave */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#FF4D6D]/20 border border-[#FF4D6D]/40"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4D6D] to-[#990024] flex items-center justify-center text-white font-black text-4xl shadow-[0_0_30px_rgba(255,77,109,0.8)] border-4 border-white/20">
                {countdown}
              </div>
            </div>

            <h3 className="text-xl font-black text-[#F0F4FF] uppercase tracking-tight mb-1">
              Transmitting Emergency SOS
            </h3>
            <p className="text-xs text-[#8B9AB4] mb-6 max-w-xs">
              Campus Security Dispatch is being notified. Tap below if triggered by mistake.
            </p>

            <div className="flex w-full gap-3">
              <button
                onClick={handleAbort}
                className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#F0F4FF] font-bold text-xs uppercase transition-all cursor-pointer"
              >
                Cancel SOS
              </button>
              <button
                onClick={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  setStep('details');
                  setGpsLocked(true);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#FF4D6D] hover:bg-[#FF4D6D]/90 text-white font-bold text-xs uppercase shadow-[0_0_20px_rgba(255,77,109,0.5)] transition-all cursor-pointer"
              >
                Send Now
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: CATEGORY & EVIDENCE DETAILS ───────────────────── */}
        {step === 'details' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 flex items-center justify-center text-[#FF4D6D]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F0F4FF]">Emergency Classification</h3>
                  <p className="text-[10px] font-mono text-[#22D3A5] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> GPS Locked (±1.2m Accuracy)
                  </p>
                </div>
              </div>
              <button onClick={handleAbort} className="text-[#8B9AB4] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Select Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4]">
                Select Emergency Type
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setCategory(cat.id);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-white shadow-[0_0_15px_rgba(255,77,109,0.3)]'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#8B9AB4] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className="w-4 h-4" style={{ color: cat.color }} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]" />}
                      </div>
                      <p className="text-xs font-bold text-[#F0F4FF]">{cat.label}</p>
                      <p className="text-[9px] text-[#8B9AB4] leading-tight truncate">{cat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence: Snapshot & Voice Note */}
            <div className="grid grid-cols-2 gap-2">
              {/* Photo Button */}
              <button
                onClick={handlePhotoUpload}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  hasPhoto
                    ? 'bg-[#22D3A5]/15 border-[#22D3A5] text-[#22D3A5]'
                    : 'bg-white/[0.02] border-white/[0.08] text-[#8B9AB4] hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-bold">
                  {hasPhoto ? 'Photo Attached ✓' : 'Add Photo'}
                </span>
              </button>

              {/* Voice Note Button */}
              <button
                onClick={handleToggleVoice}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isRecordingVoice
                    ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D] animate-pulse'
                    : hasVoiceNote
                    ? 'bg-[#14F1D9]/15 border-[#14F1D9] text-[#14F1D9]'
                    : 'bg-white/[0.02] border-white/[0.08] text-[#8B9AB4] hover:text-white'
                }`}
              >
                {isRecordingVoice ? (
                  <>
                    <Radio className="w-4 h-4 mb-1 text-[#FF4D6D] animate-ping" />
                    <span className="text-[11px] font-bold font-mono">00:{voiceDuration.toString().padStart(2, '0')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-bold">
                      {hasVoiceNote ? 'Voice Note (0:08) ✓' : 'Record Voice'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Message Notes */}
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional: Enter room number or urgent details (e.g. Room 214, severe asthma)..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F0F4FF] placeholder:text-[#4A5568] outline-none resize-none font-sans focus:border-[#FF4D6D]/50"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#FF8C42] hover:brightness-110 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,77,109,0.5)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast SOS to Dispatch</span>
            </button>
          </div>
        )}

        {/* ─── STEP 3: SUBMITTING / DISPATCH BROADCAST ───────────────── */}
        {step === 'submitting' && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Loader2 className="w-12 h-12 text-[#FF4D6D] animate-spin mb-3" />
            <h3 className="text-base font-bold text-[#F0F4FF]">Transmitting Encrypted SOS</h3>
            <p className="text-xs text-[#8B9AB4] font-mono mt-1">
              Broadcasting GPS beacon & assigning tactical squad...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
