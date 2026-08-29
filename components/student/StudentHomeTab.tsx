'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  Flame,
  Phone,
  Radio,
  MapPin,
  Users,
  AlertTriangle,
  ChevronRight,
  Heart,
  Navigation,
  CheckCircle2,
  Bell,
  Sparkles,
  QrCode,
  Sliders,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useStudentStore } from '@/store/student';
import { useDashboardStore } from '@/store/dashboard';
import { soundEffects } from '@/lib/audio-effects';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface StudentHomeTabProps {
  onTriggerSOS: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
  onOpenCheckIn?: () => void;
  onOpenAuth?: () => void;
}

export function StudentHomeTab({
  onTriggerSOS,
  onNavigateToMap,
  onNavigateToAlerts,
  onOpenCheckIn = () => {},
  onOpenAuth = () => {},
}: StudentHomeTabProps) {
  const { profile, campusStatus, myDistanceToSafeZone, markSafe } = useStudentStore();
  const { metrics, incidents, responders } = useDashboardStore();
  const [sliderPosition, setSliderPosition] = useState(0);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const nearbyRespondersList = responders.slice(0, 3).map((r, i) => ({
    name: r.name,
    role: r.role,
    distance: `${120 + i * 110}m away`,
    eta: `${40 + i * 35}s`,
    status: r.status,
    color: i === 0 ? '#14F1D9' : i === 1 ? '#FFB347' : '#7C5CFF',
  }));

  const quickContacts = [
    { label: 'Campus Police', sub: '24/7 Rapid Patrol', number: 'tel:+18005557233', color: '#14F1D9' },
    { label: 'Health EMT', sub: 'Urgent Care Center', number: 'tel:+18005554325', color: '#FF4D6D' },
    { label: 'Dorm Warden', sub: 'Building Alpha RA', number: 'tel:+18005553676', color: '#FFB347' },
    { label: 'Direct 911', sub: 'City Emergency Services', number: 'tel:911', color: '#7C5CFF' },
  ];

  const handleSlideConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderPosition(val);
    if (val >= 90) {
      soundEffects.playAlert();
      onTriggerSOS();
      setTimeout(() => setSliderPosition(0), 1000);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
      {/* ─── Top Student Header & Greeting Card ─────────────────────────── */}
      <div className="rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-gradient-to-br from-[rgba(20,241,217,0.12)] via-[#070B12] to-[rgba(124,92,255,0.08)] p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={onOpenAuth}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/50 flex items-center justify-center text-sm font-black text-[#14F1D9] shadow-md cursor-pointer hover:brightness-125 transition-all flex-shrink-0"
              title="Click to Switch Profile"
            >
              {profile.name.split(' ')[0][0]}
              {profile.name.split(' ')[1]?.[0] || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-[#F0F4FF]">
                  {getGreeting()}, {profile.name.split(' ')[0]}
                </h2>
                <span className="w-2 h-2 rounded-full bg-[#22D3A5] animate-ping" />
              </div>
              <p className="text-[11px] text-[#8B9AB4] font-medium truncate max-w-[190px]">
                {profile.department.split('(')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22D3A5]/15 border border-[#22D3A5]/40 text-[#22D3A5] font-mono text-[10px] font-bold">
                <Shield className="w-3 h-3" />
                <span>{campusStatus}</span>
              </div>
              <span className="text-[9px] font-mono text-[#8B9AB4] block mt-0.5">
                Shield 98%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3 Quick Statistics KPIs ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">
            Active Threats
          </span>
          <span className="text-lg font-black font-mono text-[#FF4D6D] mt-0.5">
            {metrics.activeIncidents}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">
            Nearby Patrol
          </span>
          <span className="text-lg font-black font-mono text-[#14F1D9] mt-0.5">
            {metrics.respondersAvailable}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">
            Safe Zone
          </span>
          <span className="text-lg font-black font-mono text-[#22D3A5] mt-0.5">
            {myDistanceToSafeZone}m
          </span>
        </div>
      </div>

      {/* ─── Primary SOS Emergency Button Section ──────────────────────── */}
      <div className="flex flex-col items-center justify-center my-1 select-none">
        <div className="relative flex items-center justify-center w-60 h-60">
          {/* Outer Concentric Animated Pulse Rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FF4D6D]/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-5 rounded-full border-2 border-[#FF4D6D]/40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />

          {/* Glowing Radial Halo */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#FF4D6D]/40 via-[#FF8C42]/20 to-transparent blur-xl pointer-events-none" />

          {/* Main Tap SOS Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              soundEffects.playAlert();
              onTriggerSOS();
            }}
            className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-b from-[#FF4D6D] via-[#D90429] to-[#800016] text-white flex flex-col items-center justify-center shadow-[0_0_60px_rgba(255,77,109,0.8)] border-4 border-white/30 cursor-pointer active:brightness-125 transition-all"
          >
            <ShieldAlert className="w-10 h-10 mb-1 drop-shadow-lg" />
            <span className="text-3xl font-black tracking-wider uppercase drop-shadow-md">
              EMERGENCY SOS
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase opacity-90 font-bold">
              TAP OR SLIDE BELOW
            </span>
          </motion.button>
        </div>

        {/* SOS Confirmation Slider */}
        <div className="w-full max-w-xs mt-2 relative p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSlideConfirm}
            className="w-full accent-[#FF4D6D] cursor-pointer h-8 opacity-80"
          />
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-mono font-bold text-[#8B9AB4] uppercase tracking-wider">
            {sliderPosition > 10 ? 'Keep Sliding to Confirm...' : 'Slide to Trigger SOS Beacon →'}
          </span>
        </div>
      </div>

      {/* ─── 2 Rapid Actions: Mark Safe & Safe Assembly QR Check-In ────── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={async () => {
            soundEffects.playSuccess();
            await markSafe();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#22D3A5]/20 to-[#14F1D9]/10 hover:bg-[#22D3A5]/30 border border-[#22D3A5]/40 flex items-center gap-2.5 text-left transition-all cursor-pointer shadow-md group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#22D3A5]/20 flex items-center justify-center text-[#22D3A5] flex-shrink-0 group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-[#F0F4FF]">I AM SAFE</p>
            <p className="text-[9px] font-mono text-[#22D3A5]">Mark Safe Status</p>
          </div>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenCheckIn();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#14F1D9]/10 hover:bg-[#7C5CFF]/30 border border-[#7C5CFF]/40 flex items-center gap-2.5 text-left transition-all cursor-pointer shadow-md group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center text-[#7C5CFF] flex-shrink-0 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-[#F0F4FF]">SAFE CHECK-IN</p>
            <p className="text-[9px] font-mono text-[#14F1D9]">Scan Assembly QR</p>
          </div>
        </button>
      </div>

      {/* ─── Today's Active Alerts (Proximity Aware) ────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF4D6D]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">Campus Threat Flash</h3>
          </div>
          <button
            onClick={onNavigateToAlerts}
            className="text-[10px] font-mono text-[#14F1D9] hover:underline cursor-pointer"
          >
            View All ({incidents.length || 2})
          </button>
        </div>

        <div
          onClick={onNavigateToAlerts}
          className="p-3 rounded-2xl bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.3)] flex items-start gap-3 cursor-pointer hover:bg-[rgba(255,77,109,0.15)] transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 flex items-center justify-center text-[#FF4D6D] flex-shrink-0 mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F4FF] truncate">
                {incidents[0]?.title || 'Science Lab B – Active Evacuation'}
              </span>
              <span className="text-[9px] font-mono text-[#FF4D6D] font-bold">CRITICAL</span>
            </div>
            <p className="text-[11px] text-[#8B9AB4] line-clamp-1 mt-0.5">
              {incidents[0]?.description || 'Multiple smoke plumes localized by YOLOv8. Proceed to North Quad.'}
            </p>
            <p className="text-[9px] font-mono text-[#14F1D9] mt-1 flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5" /> 320m from your current position
            </p>
          </div>
        </div>
      </div>

      {/* ─── Nearby Responders Radar ────────────────────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#14F1D9]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">Nearby Responders (Live Radar)</h3>
          </div>
          <span className="text-[10px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-2 py-0.5 rounded border border-[#22D3A5]/30">
            {responders.length} PATROL UNITS
          </span>
        </div>

        <div className="space-y-2">
          {nearbyRespondersList.map((resp, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${resp.color}20`, color: resp.color, border: `1px solid ${resp.color}40` }}
                >
                  {resp.name.split(' ')[0][0]}{resp.name.split(' ')[1]?.[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F0F4FF]">{resp.name}</p>
                  <p className="text-[10px] text-[#8B9AB4]">{resp.role}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono font-bold text-[#14F1D9] block">
                  {resp.distance}
                </span>
                <span className="text-[9px] font-mono text-[#8B9AB4]">
                  ETA ~{resp.eta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 1-Tap Emergency Contacts ─────────────────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#FFB347]" />
            One-Tap Emergency Contacts
          </h3>
          <span className="text-[9px] font-mono text-[#8B9AB4]">DIRECT DIAL</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quickContacts.map((contact, i) => (
            <a
              key={i}
              href={contact.number}
              onClick={() => soundEffects.playClick()}
              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <Phone className="w-3.5 h-3.5" style={{ color: contact.color }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: contact.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F0F4FF] group-hover:text-white truncate">
                  {contact.label}
                </p>
                <p className="text-[9px] text-[#8B9AB4] truncate">{contact.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
