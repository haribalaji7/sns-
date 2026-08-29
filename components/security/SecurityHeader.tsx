'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Radio,
  Clock,
  Wifi,
  WifiOff,
  ChevronDown,
  AlertTriangle,
  Flame,
  Volume2,
  LogOut,
  MapPin,
  CheckCircle2,
  Compass,
  BatteryCharging
} from 'lucide-react';
import { useSecurityStore, OfficerStatus } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function SecurityHeader() {
  const { officer, setStatus, toggleRadio, radioMessages, logoutOfficer, isOnline } = useSecurityStore();
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [shiftElapsed, setShiftElapsed] = useState('03:42:18');

  // Live Shift Timer
  useEffect(() => {
    const start = new Date(officer.shiftStartTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setShiftElapsed(`${h}:${m}:${s}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [officer.shiftStartTime]);

  const getStatusColor = (status: OfficerStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-[#22D3A5] text-[#070B12] border-[#22D3A5]/40 shadow-[0_0_12px_#22D3A5]';
      case 'On Patrol':
        return 'bg-[#14F1D9] text-[#070B12] border-[#14F1D9]/40 shadow-[0_0_12px_#14F1D9]';
      case 'Responding':
        return 'bg-[#FF4D6D] text-white border-[#FF4D6D]/60 animate-pulse shadow-[0_0_16px_#FF4D6D]';
      case 'Busy':
        return 'bg-[#FFB347] text-[#070B12] border-[#FFB347]/40';
      case 'Offline':
      default:
        return 'bg-white/20 text-[#8B9AB4] border-white/10';
    }
  };

  const statusOptions: OfficerStatus[] = ['Available', 'On Patrol', 'Responding', 'Busy', 'Offline'];

  return (
    <header className="sticky top-0 z-40 bg-[#070B12]/90 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-5 py-2.5 shadow-2xl select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Officer Identity & Avatar */}
        <div className="flex items-center gap-3">
          <Link href="/security/profile" className="relative group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={officer.avatarUrl}
              alt={officer.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#14F1D9]/60 shadow-[0_0_15px_rgba(20,241,217,0.3)] group-hover:scale-105 transition-transform"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#070B12] ${
                officer.status === 'Responding'
                  ? 'bg-[#FF4D6D] animate-ping'
                  : officer.status === 'Available'
                  ? 'bg-[#22D3A5]'
                  : officer.status === 'On Patrol'
                  ? 'bg-[#14F1D9]'
                  : 'bg-[#FFB347]'
              }`}
            />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[#F0F4FF] tracking-tight">
                {officer.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-[#14F1D9] font-bold">
                {officer.badgeNumber}
              </span>
              <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(255,77,109,0.15)] border border-[#FF4D6D]/30 text-[9px] font-mono text-[#FF4D6D] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-ping" />
                <span>TACTICAL LIVE</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8B9AB4] font-mono truncate max-w-[200px] sm:max-w-xs">
              {officer.team} · {officer.vehicle}
            </p>
          </div>
        </div>

        {/* Center: Shift Timer & Battery Telemetry */}
        <div className="hidden lg:flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#14F1D9]" />
            <span className="text-[#8B9AB4] text-[10px] uppercase">Shift:</span>
            <span className="text-[#F0F4FF] font-bold">{shiftElapsed}</span>
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <BatteryCharging className="w-3.5 h-3.5 text-[#22D3A5]" />
            <span className="text-[#22D3A5] font-bold">{officer.batteryLevel}%</span>
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isOnline ? (
              <span className="flex items-center gap-1 text-[#22D3A5] text-[10px] font-bold">
                <Wifi className="w-3 h-3" /> ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#FF4D6D] text-[10px] font-bold animate-pulse">
                <WifiOff className="w-3 h-3" /> OFFLINE CACHE
              </span>
            )}
          </div>
        </div>

        {/* Right: Status Selector Dropdown & Radio Button */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Status Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${getStatusColor(
                officer.status
              )}`}
            >
              <span>{officer.status}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {statusMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-[#070B12] border border-white/15 shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                >
                  <div className="text-[9px] font-mono uppercase text-[#8B9AB4] px-2 py-1 font-bold">
                    Change Officer Status
                  </div>
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatus(opt);
                        setStatusMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                        officer.status === opt
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-[#8B9AB4] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{opt}</span>
                      {officer.status === opt && <CheckCircle2 className="w-3.5 h-3.5 text-[#14F1D9]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Emergency Tactical Radio Button */}
          <button
            onClick={toggleRadio}
            className="relative p-2 rounded-xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#14F1D9]/20 border border-[rgba(124,92,255,0.4)] text-[#14F1D9] hover:brightness-125 shadow-[0_0_15px_rgba(124,92,255,0.25)] transition-all cursor-pointer flex items-center justify-center"
            title="Emergency Radio Transceiver"
          >
            <Radio className="w-4 h-4 text-[#14F1D9] animate-pulse" />
            {radioMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4D6D] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow">
                {radioMessages.length}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              logoutOfficer();
              window.location.href = '/security/login';
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-[#FF4D6D]/15 hover:text-[#FF4D6D] border border-white/10 hover:border-[#FF4D6D]/30 transition-all cursor-pointer flex items-center justify-center"
            title="Log Out / End Shift"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
