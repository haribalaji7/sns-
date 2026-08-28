'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';

export default function SettingsPage() {
  const { addToast } = useDashboardStore();
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [thermalThreshold, setThermalThreshold] = useState(80);
  const [smokeThreshold, setSmokeThreshold] = useState(40);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Autonomous response parameters and alert thresholds updated.',
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#14F1D9]" />
            <h1 className="text-xl font-bold text-[#F0F4FF]">Command Center Settings</h1>
          </div>
          <p className="text-xs text-[#8B9AB4] mt-0.5">
            Configure autonomous dispatch rules, IoT threshold triggers, AI vision models, and Supabase keys.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Panel 1: Autonomous Dispatch Rules */}
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#14F1D9]" />
            Autonomous Response Engine
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-xs font-semibold text-[#F0F4FF]">Auto-Dispatch Closest Unit</p>
              <p className="text-[11px] text-[#8B9AB4]">Automatically dispatches squad if AI confidence &gt; {aiConfidenceThreshold}%</p>
            </div>
            <input
              type="checkbox"
              checked={autoDispatch}
              onChange={(e) => setAutoDispatch(e.target.checked)}
              className="w-4 h-4 accent-[#14F1D9] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-xs font-semibold text-[#F0F4FF]">Audible Siren &amp; Broadcast</p>
              <p className="text-[11px] text-[#8B9AB4]">Play high-priority audible tone upon critical alert</p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#14F1D9] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8B9AB4]">AI Confidence Minimum</span>
              <span className="text-[#14F1D9] font-mono font-bold">{aiConfidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={aiConfidenceThreshold}
              onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-[#14F1D9] cursor-pointer"
            />
          </div>
        </div>

        {/* Panel 2: IoT Sensor Thresholds */}
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF4D6D]" />
            IoT Alert Thresholds
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8B9AB4]">Thermal Spike Alarm Trigger</span>
              <span className="text-[#FF4D6D] font-mono font-bold">{thermalThreshold} °C</span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={thermalThreshold}
              onChange={(e) => setThermalThreshold(Number(e.target.value))}
              className="w-full accent-[#FF4D6D] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8B9AB4]">Smoke Concentration Alarm</span>
              <span className="text-[#FFB347] font-mono font-bold">{smokeThreshold} ppm</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={smokeThreshold}
              onChange={(e) => setSmokeThreshold(Number(e.target.value))}
              className="w-full accent-[#FFB347] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8B9AB4] border-t border-white/5">
            <span>Sensors Calibrated: 224</span>
            <span className="text-[#22D3A5] font-semibold">ALL OPERATIONAL</span>
          </div>
        </div>

        {/* Panel 3: Supabase Realtime & Security */}
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-3 md:col-span-2">
          <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7C5CFF]" />
            Supabase Backend &amp; Realtime WebSockets
          </h3>
          <p className="text-xs text-[#8B9AB4]">
            Connected to Supabase Realtime channel <code className="text-[#14F1D9]">supabase_realtime</code> with PostgreSQL Row Level Security (RLS) policies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-[#8B9AB4] block">REALTIME STATUS</span>
              <span className="text-xs font-bold text-[#22D3A5] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#22D3A5] animate-pulse" />
                WebSockets Connected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-[#8B9AB4] block">RLS POLICIES</span>
              <span className="text-xs font-bold text-[#14F1D9] mt-0.5 block">
                9 Tables Enforced
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-[#8B9AB4] block">LATENCY</span>
              <span className="text-xs font-bold text-[#F0F4FF] mt-0.5 block font-mono">
                12ms (Postgres Trigger)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
