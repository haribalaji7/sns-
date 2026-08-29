'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Map as MapIcon,
  Bell,
  History,
  User,
  Shield,
  Smartphone,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Wifi,
  Battery,
  Sparkles,
} from 'lucide-react';
import { StudentHomeTab } from '@/components/student/StudentHomeTab';
import { StudentMapTab } from '@/components/student/StudentMapTab';
import { StudentAlertsTab } from '@/components/student/StudentAlertsTab';
import { StudentHistoryTab } from '@/components/student/StudentHistoryTab';
import { StudentProfileTab } from '@/components/student/StudentProfileTab';
import { StudentSOSModal } from '@/components/student/StudentSOSModal';
import { StudentLiveTracking } from '@/components/student/StudentLiveTracking';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';

type TabType = 'home' | 'map' | 'alerts' | 'history' | 'profile';

export default function StudentMobilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [emergencyCategory, setEmergencyCategory] = useState<string>('medical');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true); // true = iPhone mockup frame

  const handleTabChange = (tab: TabType) => {
    soundEffects.playClick();
    setActiveTab(tab);
  };

  const handleSOSSubmitted = (data: { category: string }) => {
    setIsSOSModalOpen(false);
    setEmergencyCategory(data.category);
    setIsLiveTracking(true);
  };

  return (
    <div className="min-h-screen bg-[#030407] text-[#F0F4FF] flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none">
      {/* ─── Top Control Bar for Showcase / Switching Views ─────────────── */}
      <div className="w-full max-w-5xl mb-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#14F1D9] border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </Link>

          <span className="hidden sm:inline-block text-xs font-bold text-[#F0F4FF]">
            CampusShield Student Mobile App
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#8B9AB4] hover:text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#14F1D9]" />
            <span>{deviceFrameMode ? 'Fullscreen Mode' : 'Phone Frame Mode'}</span>
          </button>
        </div>
      </div>

      {/* ─── Native Phone Simulator / Container ───────────────────────── */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          deviceFrameMode
            ? 'max-w-[420px] h-[860px] rounded-[48px] border-[8px] border-[#1C2538] shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_30px_rgba(20,241,217,0.2)] bg-[#070B12] overflow-hidden'
            : 'max-w-2xl min-h-[85vh] rounded-3xl border border-white/10 bg-[#070B12] shadow-2xl overflow-hidden'
        }`}
      >
        {/* Dynamic Island / Status Bar */}
        <div className="flex-shrink-0 h-12 px-7 flex items-center justify-between bg-[#070B12] border-b border-white/[0.04] z-30">
          <span className="text-xs font-mono font-bold text-[#F0F4FF]">9:41</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-pulse" />
            <span className="text-[8px] font-mono text-[#14F1D9] font-bold">SHIELD ACTIVE</span>
          </div>

          <div className="flex items-center gap-2 text-[#8B9AB4]">
            <Wifi className="w-3.5 h-3.5 text-[#F0F4FF]" />
            <span className="text-[10px] font-mono font-bold text-[#22D3A5]">5G</span>
            <Battery className="w-4 h-4 text-[#F0F4FF]" />
          </div>
        </div>

        {/* ─── Main Content Viewport ──────────────────────────────────── */}
        <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col bg-[#070B12]">
          {isLiveTracking ? (
            <StudentLiveTracking
              category={emergencyCategory}
              onDismiss={() => setIsLiveTracking(false)}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <StudentHomeTab
                  onTriggerSOS={() => setIsSOSModalOpen(true)}
                  onNavigateToMap={() => setActiveTab('map')}
                  onNavigateToAlerts={() => setActiveTab('alerts')}
                />
              )}
              {activeTab === 'map' && <StudentMapTab />}
              {activeTab === 'alerts' && <StudentAlertsTab />}
              {activeTab === 'history' && <StudentHistoryTab />}
              {activeTab === 'profile' && <StudentProfileTab />}
            </>
          )}
        </div>

        {/* ─── Bottom Tab Navigation Bar ──────────────────────────────── */}
        <div className="flex-shrink-0 h-16 bg-[#030407]/95 border-t border-white/[0.08] px-4 flex items-center justify-around z-30 backdrop-blur-xl">
          {[
            { id: 'home' as TabType, label: 'Home', icon: Home },
            { id: 'map' as TabType, label: 'Map', icon: MapIcon },
            { id: 'alerts' as TabType, label: 'Alerts', icon: Bell },
            { id: 'history' as TabType, label: 'History', icon: History },
            { id: 'profile' as TabType, label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#14F1D9] scale-105'
                    : 'text-[#8B9AB4] hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.span
                      layoutId="active-tab-glow"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#14F1D9] shadow-[0_0_8px_#14F1D9]"
                    />
                  )}
                </div>
                <span className="text-[10px] font-mono font-medium tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="flex-shrink-0 h-4 bg-[#030407] flex items-center justify-center pb-1">
          <div className="w-32 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* SOS Multi-step Emergency Modal */}
      <StudentSOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmitted={handleSOSSubmitted}
      />
    </div>
  );
}
