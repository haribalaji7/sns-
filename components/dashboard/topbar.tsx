'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, ChevronDown, Wifi, Cpu, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveIndicator } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';

export function DashboardTopBar() {
  const [time, setTime] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { metrics, toasts, removeToast } = useDashboardStore();

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const systemStatus = [
    { icon: Wifi,     label: 'Network',   value: 'Online',   ok: true },
    { icon: Cpu,      label: 'AI Engine', value: '99.8%',    ok: true },
    { icon: Database, label: 'Database',  value: '12ms RTT', ok: true },
  ];

  return (
    <header className="h-14 flex-shrink-0 flex items-center gap-4 px-5 border-b border-white/[0.06] bg-[rgba(7,11,18,0.8)] backdrop-blur-xl z-20">
      {/* Live + System status */}
      <div className="flex items-center gap-4">
        <LiveIndicator color="red" size="sm" />
        <div className="hidden lg:flex items-center gap-3">
          {systemStatus.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <s.icon className="w-3 h-3 text-[#4A5568]" />
              <span className="text-[10px] text-[#4A5568]">{s.label}:</span>
              <span className={`text-[10px] font-medium ${s.ok ? 'text-[#22D3A5]' : 'text-[#FF4D6D]'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A5568]" />
        <input
          type="text"
          placeholder="Search incidents, zones, responders…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full h-8 pl-9 pr-4 rounded-xl text-xs text-[#F0F4FF] placeholder:text-[#4A5568] outline-none transition-all duration-200 ${
            searchFocused
              ? 'bg-[rgba(255,255,255,0.07)] border border-[rgba(20,241,217,0.3)] shadow-[0_0_12px_rgba(20,241,217,0.1)]'
              : 'bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.08)]'
          }`}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Clock */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-mono font-semibold text-[#F0F4FF] tabular-nums">{time}</span>
          <span className="text-[9px] text-[#4A5568]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Notification bell */}

        <button className="relative w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.06] transition-colors">
          <Bell className="w-4 h-4" />
          {metrics.activeIncidents > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF4D6D] text-white text-[8px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(255,77,109,0.5)]">
              {metrics.activeIncidents}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#14F1D9] to-[#7C5CFF] flex items-center justify-center text-[10px] font-bold text-[#070B12]">
            AK
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-[11px] font-medium text-[#F0F4FF]">Admin</span>
            <span className="text-[9px] text-[#14F1D9]">Command Center</span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#4A5568] group-hover:text-[#8B9AB4] transition-colors hidden md:block" />
        </button>
      </div>
    </header>
  );
}
