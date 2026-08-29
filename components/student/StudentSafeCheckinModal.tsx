'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  Shield,
  MapPin,
  Users,
  Camera,
  X,
  Scan,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStudentStore, AssemblyPoint } from '@/store/student';
import { soundEffects } from '@/lib/audio-effects';

interface StudentSafeCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentSafeCheckinModal({ isOpen, onClose }: StudentSafeCheckinModalProps) {
  const { assemblyPoints, checkInAssemblyPoint, profile } = useStudentStore();
  const [selectedPoint, setSelectedPoint] = useState<string>('AP-ALPHA');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTriggerScan = async (code: string) => {
    setIsScanning(true);
    soundEffects.playScan();

    setTimeout(async () => {
      setIsScanning(false);
      const ok = await checkInAssemblyPoint(code);
      if (ok) {
        soundEffects.playSuccess();
        setScannedSuccess(true);
        setTimeout(() => {
          setScannedSuccess(false);
          onClose();
        }, 1500);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md rounded-3xl glass border border-[rgba(34,211,165,0.4)] bg-[#070B12] p-6 shadow-[0_0_60px_rgba(34,211,165,0.2)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#22D3A5] via-[#14F1D9] to-[#7C5CFF]" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#22D3A5]/20 border border-[#22D3A5]/40 flex items-center justify-center text-[#22D3A5] shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F0F4FF]">Safe Zone Check-In</h3>
              <p className="text-[10px] font-mono text-[#22D3A5]">ASSEMBLY MUSTER VERIFICATION</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B9AB4] hover:text-white p-1 rounded-xl bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Scanner Viewport Simulation */}
        <div className="relative w-full h-44 rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col items-center justify-center mb-4">
          {/* Viewfinder Reticle */}
          <div className="relative w-32 h-32 border-2 border-[#22D3A5]/60 rounded-xl flex items-center justify-center">
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#14F1D9]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#14F1D9]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#14F1D9]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#14F1D9]" />

            <QrCode className="w-20 h-20 text-white/30" />

            {/* Animated Laser Scanning Line */}
            {isScanning && (
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-[#14F1D9] shadow-[0_0_12px_#14F1D9]"
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>

          <p className="text-[10px] font-mono text-[#8B9AB4] mt-2">
            {isScanning ? 'Verifying Safe Zone QR Telemetry...' : 'Align Assembly Point QR in Frame'}
          </p>

          {/* Success Overlay */}
          <AnimatePresence>
            {scannedSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20"
              >
                <div className="w-12 h-12 rounded-full bg-[#22D3A5]/20 border border-[#22D3A5] flex items-center justify-center text-[#22D3A5] mb-2 shadow-[0_0_20px_rgba(34,211,165,0.6)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-[#F0F4FF]">Checked In Successfully!</h4>
                <p className="text-[10px] font-mono text-[#22D3A5]">ATTENDANCE BROADCAST LIVE TO DISPATCH</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 1-Tap Assembly Point Selector */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block">
            Select Assembly Point or Scan QR
          </span>

          <div className="space-y-2">
            {assemblyPoints.map((point) => {
              const isSelected = selectedPoint === point.id;
              const isCheckedInHere = profile.currentAssemblyPoint === point.name;

              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedPoint(point.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCheckedInHere
                      ? 'bg-[#22D3A5]/20 border-[#22D3A5] text-white shadow-[0_0_15px_rgba(34,211,165,0.3)]'
                      : isSelected
                      ? 'bg-white/[0.06] border-[#14F1D9] text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#8B9AB4] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#22D3A5]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F0F4FF]">{point.name}</p>
                      <p className="text-[10px] text-[#8B9AB4] font-mono flex items-center gap-2">
                        <span>{point.location}</span>
                        <span className="text-[#22D3A5] font-bold flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {point.safeCount} / {point.capacity} Safe
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerScan(point.code);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#22D3A5]/20 hover:bg-[#22D3A5]/30 text-[#22D3A5] border border-[#22D3A5]/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Check In</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            const pt = assemblyPoints.find((p) => p.id === selectedPoint);
            handleTriggerScan(pt?.code || 'QR-SAFE-ALPHA-01');
          }}
          disabled={isScanning}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22D3A5] to-[#14F1D9] text-[#070B12] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,211,165,0.4)] hover:brightness-110 cursor-pointer transition-all disabled:opacity-50"
        >
          <Scan className="w-4 h-4" />
          <span>Confirm Check-In at Selected Point</span>
        </button>
      </motion.div>
    </div>
  );
}
