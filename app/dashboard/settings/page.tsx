'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Settings,
  Shield,
  Radio,
  Bell,
  Cpu,
  Lock,
  Key,
  Save,
  CheckCircle2,
  Database,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Palette,
  Sparkles,
  Eye
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';
import { soundEffects } from '@/lib/audio-effects';

export default function SettingsPage() {
  const { addToast } = useDashboardStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [autoDispatch, setAutoDispatch] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [thermalThreshold, setThermalThreshold] = useState(80);
  const [smokeThreshold, setSmokeThreshold] = useState(40);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [highContrast, setHighContrast] = useState(false);
  const [glassBlur, setGlassBlur] = useState(18);

  const handleSave = () => {
    soundEffects.playSuccess();
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Autonomous response parameters, display theme, and alert thresholds updated.',
    });
  };

  const handleThemeChange = (newTheme: string) => {
    soundEffects.playClick();
    setTheme(newTheme);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Command Center Settings</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system appearance, autonomous dispatch rules, IoT threshold triggers, and backend parameters.
          </p>
        </div>

        <GradientButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          Save Configuration
        </GradientButton>
      </div>

      {/* ─── Panel 0: Appearance & Global Theme System ─────────────────── */}
      <div className="glass rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Appearance &amp; Global Theme
          </h3>
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 font-bold">
            CURRENT: {theme?.toUpperCase()} ({resolvedTheme === 'dark' ? 'DARK ENGINE' : 'LIGHT ENGINE'})
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Select your preferred interface mode. The theme system dynamically adapts typography, glassmorphism, maps, and telemetry across all portals.
        </p>

        {/* 3 Interactive Live Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Option 1: Dark Mode */}
          <div
            onClick={() => handleThemeChange('dark')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(20,241,217,0.2)] ring-2 ring-primary/40'
                : 'border-border bg-card/60 hover:border-primary/40 hover:bg-card'
            }`}
          >
            {/* Visual Miniature Preview */}
            <div className="h-20 rounded-xl bg-[#070B12] border border-white/10 p-2 flex flex-col justify-between mb-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#14F1D9]" />
                  <div className="w-10 h-1.5 rounded bg-white/20" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D]" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-6 rounded bg-[#101826] border border-[#14F1D9]/30 p-1">
                  <div className="w-6 h-1 rounded bg-[#14F1D9]" />
                </div>
                <div className="h-6 rounded bg-[#101826] border border-white/10 p-1">
                  <div className="w-6 h-1 rounded bg-[#22D3A5]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Dark (Default)</p>
                  <p className="text-[10px] text-muted-foreground">Tactical Command</p>
                </div>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
          </div>

          {/* Option 2: Light Mode */}
          <div
            onClick={() => handleThemeChange('light')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              theme === 'light'
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(14,165,165,0.2)] ring-2 ring-primary/40'
                : 'border-border bg-card/60 hover:border-primary/40 hover:bg-card'
            }`}
          >
            {/* Visual Miniature Preview */}
            <div className="h-20 rounded-xl bg-[#F5F7FB] border border-slate-300 p-2 flex flex-col justify-between mb-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#0EA5A5]" />
                  <div className="w-10 h-1.5 rounded bg-slate-400" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-6 rounded bg-white border border-slate-200 p-1 shadow-sm">
                  <div className="w-6 h-1 rounded bg-[#0EA5A5]" />
                </div>
                <div className="h-6 rounded bg-white border border-slate-200 p-1 shadow-sm">
                  <div className="w-6 h-1 rounded bg-[#16A34A]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-foreground">Light</p>
                  <p className="text-[10px] text-muted-foreground">Clean Enterprise</p>
                </div>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
          </div>

          {/* Option 3: System Mode */}
          <div
            onClick={() => handleThemeChange('system')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              theme === 'system'
                ? 'border-secondary bg-secondary/5 shadow-[0_0_20px_rgba(124,92,255,0.2)] ring-2 ring-secondary/40'
                : 'border-border bg-card/60 hover:border-secondary/40 hover:bg-card'
            }`}
          >
            {/* Visual Miniature Preview */}
            <div className="h-20 rounded-xl bg-gradient-to-r from-[#070B12] via-slate-700 to-[#F5F7FB] border border-white/20 p-2 flex flex-col justify-between mb-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/20 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#7C5CFF]" />
                  <div className="w-10 h-1.5 rounded bg-white/40" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D]" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-6 rounded bg-black/40 border border-white/20 p-1">
                  <div className="w-6 h-1 rounded bg-[#7C5CFF]" />
                </div>
                <div className="h-6 rounded bg-white/70 border border-black/10 p-1">
                  <div className="w-6 h-1 rounded bg-[#0EA5A5]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs font-bold text-foreground">System</p>
                  <p className="text-[10px] text-muted-foreground">Auto OS Sync</p>
                </div>
              </div>
              {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-secondary" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Panel 1: Autonomous Dispatch Rules */}
        <div className="glass rounded-2xl p-5 border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Autonomous Response Engine
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Auto-Dispatch Closest Unit</p>
              <p className="text-[11px] text-muted-foreground">Automatically dispatches squad if AI confidence &gt; {aiConfidenceThreshold}%</p>
            </div>
            <input
              type="checkbox"
              checked={autoDispatch}
              onChange={(e) => setAutoDispatch(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Audible Siren &amp; Broadcast</p>
              <p className="text-[11px] text-muted-foreground">Play high-priority audible tone upon critical alert</p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">AI Confidence Minimum</span>
              <span className="text-primary font-mono font-bold">{aiConfidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={aiConfidenceThreshold}
              onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Panel 2: IoT Sensor Thresholds */}
        <div className="glass rounded-2xl p-5 border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Radio className="w-4 h-4 text-danger" />
            IoT Alert Thresholds
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Thermal Spike Alarm Trigger</span>
              <span className="text-danger font-mono font-bold">{thermalThreshold} °C</span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={thermalThreshold}
              onChange={(e) => setThermalThreshold(Number(e.target.value))}
              className="w-full accent-danger cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Smoke Concentration Alarm</span>
              <span className="text-warning font-mono font-bold">{smokeThreshold} ppm</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={smokeThreshold}
              onChange={(e) => setSmokeThreshold(Number(e.target.value))}
              className="w-full accent-warning cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border">
            <span>Sensors Calibrated: 224</span>
            <span className="text-success font-semibold">ALL OPERATIONAL</span>
          </div>
        </div>

        {/* Panel 3: Supabase Realtime & Security */}
        <div className="glass rounded-2xl p-5 border border-border space-y-3 md:col-span-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-secondary" />
            Supabase Backend &amp; Realtime WebSockets
          </h3>
          <p className="text-xs text-muted-foreground">
            Connected to Supabase Realtime channel <code className="text-primary font-mono">supabase_realtime</code> with PostgreSQL Row Level Security (RLS) policies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-card/60 border border-border">
              <span className="text-[10px] font-mono text-muted-foreground block">REALTIME STATUS</span>
              <span className="text-xs font-bold text-success flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                WebSockets Connected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card/60 border border-border">
              <span className="text-[10px] font-mono text-muted-foreground block">RLS POLICIES</span>
              <span className="text-xs font-bold text-primary mt-0.5 block">
                9 Tables Enforced
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card/60 border border-border">
              <span className="text-[10px] font-mono text-muted-foreground block">LATENCY</span>
              <span className="text-xs font-bold text-foreground mt-0.5 block font-mono">
                12ms (Postgres Trigger)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
