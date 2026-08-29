'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, ChevronDown, Wifi, Cpu, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveIndicator } from '@/components/ui';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useDashboardStore } from '@/store/dashboard';

export function DashboardTopBar() {
  const [time, setTime] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { metrics, toasts, removeToast, toggleCopilot } = useDashboardStore();

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
    <header className="h-14 flex-shrink-0 flex items-center gap-4 px-5 border-b border-border bg-card/85 dark:bg-[rgba(7,11,18,0.8)] backdrop-blur-xl z-20 transition-colors duration-300">
      {/* Live + System status */}
      <div className="flex items-center gap-4">
        <LiveIndicator color="red" size="sm" />
        <div className="hidden lg:flex items-center gap-3">
          {systemStatus.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <s.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{s.label}:</span>
              <span className={`text-[10px] font-medium ${s.ok ? 'text-success' : 'text-danger'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search incidents, zones, responders…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full h-8 pl-9 pr-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 ${
            searchFocused
              ? 'bg-card border border-primary shadow-[0_0_12px_rgba(20,241,217,0.15)]'
              : 'bg-black/5 dark:bg-white/[0.04] border border-border hover:border-primary/40'
          }`}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Clock */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-mono font-semibold text-foreground tabular-nums">{time}</span>
          <span className="text-[9px] text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Theme Switcher Toggle */}
        <ThemeToggle />

        {/* AI Copilot Slide-over Button */}
        <button
          onClick={toggleCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-all shadow-[0_0_15px_rgba(20,241,217,0.2)] cursor-pointer text-xs font-bold"
          title="Open AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notification bell */}
        <button className="relative w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors">
          <Bell className="w-4 h-4" />
          {metrics.activeIncidents > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[8px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(255,77,109,0.5)]">
              {metrics.activeIncidents}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-black">
            AK
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-[11px] font-medium text-foreground">Admin</span>
            <span className="text-[9px] text-primary">Command Center</span>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors hidden md:block" />
        </button>
      </div>
    </header>
  );
}
