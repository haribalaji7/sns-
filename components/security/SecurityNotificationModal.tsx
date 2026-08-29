'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  Heart,
  ShieldAlert,
  Navigation2,
  CheckCircle2,
  Users,
  X,
  Radio,
  Zap,
  MapPin
} from 'lucide-react';
import { useSecurityStore } from '@/store/security';
import { useRouter } from 'next/navigation';
import { soundEffects } from '@/lib/audio-effects';

export function SecurityNotificationModal() {
  const { activeNotification, dismissNotification, acceptIncident, requestBackup } = useSecurityStore();
  const router = useRouter();

  if (!activeNotification) return null;

  const handleAcceptAndNav = () => {
    acceptIncident(activeNotification.incidentId);
    router.push('/security/navigation');
  };

  const handleAcceptOnly = () => {
    acceptIncident(activeNotification.incidentId);
    router.push('/security/incidents');
  };

  const handleBackup = () => {
    requestBackup(`Assistance needed for ${activeNotification.title} at ${activeNotification.location}`);
    dismissNotification();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-lg rounded-2xl glass border-2 border-[#FF4D6D] bg-[#070B12] p-5 sm:p-6 shadow-[0_0_60px_rgba(255,77,109,0.5)] overflow-hidden"
      >
        {/* Glowing emergency accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF4D6D] via-[#FFB347] to-[#FF4D6D] animate-pulse" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/50 flex items-center justify-center text-[#FF4D6D] shadow-[0_0_25px_rgba(255,77,109,0.4)] flex-shrink-0 animate-bounce">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FF4D6D] text-black font-black font-mono text-[10px] uppercase">
                  CRITICAL DISPATCH
                </span>
                <span className="text-xs font-mono text-[#FFB347] font-bold">
                  {activeNotification.incidentId}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {activeNotification.title}
              </h3>
            </div>
          </div>

          <button
            onClick={dismissNotification}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Details Card */}
        <div className="bg-black/50 rounded-xl p-4 border border-white/10 space-y-2 mb-5 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-[#8B9AB4]">Location:</span>
            <span className="text-[#F0F4FF] font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#14F1D9]" />
              {activeNotification.location}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#8B9AB4]">Distance from you:</span>
            <span className="text-[#14F1D9] font-bold">
              {activeNotification.distanceMeters} meters (~55s walk/run)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#8B9AB4]">AI Threat Risk Score:</span>
            <span className="text-[#FF4D6D] font-bold">
              {activeNotification.aiRiskScore}/100 (HIGH RISK)
            </span>
          </div>

          <p className="text-[11px] text-[#D0D6E0] pt-2 border-t border-white/[0.06] leading-relaxed">
            {activeNotification.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleAcceptAndNav}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(20,241,217,0.4)] cursor-pointer"
          >
            <Navigation2 className="w-4 h-4" />
            <span>Accept & Navigate</span>
          </button>

          <button
            onClick={handleAcceptOnly}
            className="py-3 px-4 rounded-xl bg-[rgba(255,77,109,0.2)] hover:bg-[#FF4D6D] text-[#FF4D6D] hover:text-white border border-[#FF4D6D]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept Incident</span>
          </button>

          <button
            onClick={handleBackup}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#FFB347] border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Request Backup Unit</span>
          </button>

          <button
            onClick={dismissNotification}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 font-bold text-xs cursor-pointer"
          >
            Dismiss Alert
          </button>
        </div>
      </motion.div>
    </div>
  );
}
