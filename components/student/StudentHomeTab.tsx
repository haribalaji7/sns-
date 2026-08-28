'use client';

import React from 'react';
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
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

interface StudentHomeTabProps {
  onTriggerSOS: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
}

export function StudentHomeTab({
  onTriggerSOS,
  onNavigateToMap,
  onNavigateToAlerts,
}: StudentHomeTabProps) {
  const nearbyResponders = [
    { name: 'Off. Marcus Webb', role: 'Campus Patrol', distance: '140m away', eta: '45s', status: 'available', color: '#14F1D9' },
    { name: 'Dr. Sarah Mills', role: 'ALS Paramedic', distance: '280m away', eta: '1m 30s', status: 'on_scene', color: '#FFB347' },
    { name: 'Sgt. Priya Sharma', role: 'Security Lead', distance: '420m away', eta: '2m 10s', status: 'available', color: '#7C5CFF' },
  ];

  const quickContacts = [
    { label: 'Campus Police', sub: '24/7 Rapid Patrol', number: 'tel:+18005557233', color: '#14F1D9' },
    { label: 'Health EMT', sub: 'Urgent Care Center', number: 'tel:+18005554325', color: '#FF4D6D' },
    { label: 'Dorm Warden', sub: 'Building Alpha RA', number: 'tel:+18005553676', color: '#FFB347' },
    { label: 'Direct 911', sub: 'City Emergency Services', number: 'tel:911', color: '#7C5CFF' },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 pb-20 overflow-y-auto">
      {/* ─── Safety Status Banner ────────────────────────────────────────── */}
      <div className="rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-gradient-to-r from-[rgba(20,241,217,0.12)] via-[#070B12] to-transparent p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#22D3A5]/20 border border-[#22D3A5]/40 flex items-center justify-center text-[#22D3A5] shadow-[0_0_15px_rgba(34,211,165,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22D3A5] animate-ping" />
              <h3 className="text-xs font-mono font-bold text-[#22D3A5] uppercase">
                Zone: Central Quad · SAFE
              </h3>
            </div>
            <p className="text-xs font-bold text-[#F0F4FF] mt-0.5">
              Campus Shield Active (98% Coverage)
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToMap}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-[#14F1D9] border border-white/10 flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>Map</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Large Animated SOS Emergency Button ───────────────────────── */}
      <div className="flex flex-col items-center justify-center my-2 select-none">
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Outer Concentric Animated Pulse Rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FF4D6D]/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-6 rounded-full border-2 border-[#FF4D6D]/40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />

          {/* Glowing Radial Halo */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#FF4D6D]/30 to-[#FF8C42]/20 blur-xl pointer-events-none" />

          {/* Main Tap SOS Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              soundEffects.playAlert();
              onTriggerSOS();
            }}
            className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-b from-[#FF4D6D] via-[#D90429] to-[#800016] text-white flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,77,109,0.7)] border-4 border-white/30 cursor-pointer active:brightness-125 transition-all"
          >
            <ShieldAlert className="w-10 h-10 mb-1 drop-shadow-md" />
            <span className="text-3xl font-black tracking-wider uppercase drop-shadow-md">
              SOS
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-90 font-bold">
              TAP FOR HELP
            </span>
          </motion.button>
        </div>

        <p className="text-xs font-mono text-[#8B9AB4] mt-1 text-center">
          Instant GPS Beacon · Dispatches Nearest Squad
        </p>
      </div>

      {/* ─── Today's Active Alerts (Proximity Aware) ────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF4D6D]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">Today's Flash Alerts</h3>
          </div>
          <button
            onClick={onNavigateToAlerts}
            className="text-[10px] font-mono text-[#14F1D9] hover:underline cursor-pointer"
          >
            View All (2)
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
                Science Lab B – Active Evacuation
              </span>
              <span className="text-[9px] font-mono text-[#FF4D6D] font-bold">CRITICAL</span>
            </div>
            <p className="text-[11px] text-[#8B9AB4] line-clamp-1 mt-0.5">
              Avoid Floor 3 corridors. Proceed to North Quad.
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
            3 ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          {nearbyResponders.map((resp, i) => (
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
