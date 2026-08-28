'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  ArrowRight,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  Cpu,
  Activity,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { GradientButton } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Central Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Glowing Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#14F1D9]/10 via-[#7C5CFF]/10 to-[#14F1D9]/10 border border-[rgba(20,241,217,0.3)] shadow-[0_0_20px_rgba(20,241,217,0.2)] mb-6 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F1D9] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F1D9]" />
          </span>
          <span className="text-xs font-mono font-medium tracking-wide text-[#14F1D9] uppercase">
            Next-Gen AI Emergency Overwatch Matrix
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(20,241,217,0.2)] text-[#F0F4FF] font-mono">
            v2.4 Live
          </span>
        </motion.div>

        {/* Hero Title (Exact Requested Text) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="space-y-1 mb-6"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.95]">
            <span className="block bg-gradient-to-r from-[#14F1D9] via-[#7C5CFF] to-[#14F1D9] bg-clip-text text-fill-transparent drop-shadow-[0_0_35px_rgba(20,241,217,0.4)] animate-gradient">
              SMART CAMPUS
            </span>
            <span className="block text-[#F0F4FF] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 sm:mt-3">
              Emergency Response &amp;
            </span>
            <span className="block bg-gradient-to-r from-[#14F1D9] via-[#38BDF8] to-[#7C5CFF] bg-clip-text text-fill-transparent text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-[0_0_25px_rgba(124,92,255,0.4)]">
              Safety Management
            </span>
          </h1>
        </motion.div>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="max-w-3xl text-sm sm:text-base lg:text-lg text-[#8B9AB4] leading-relaxed mb-8 font-normal"
        >
          Autonomous campus defense platform unifying <span className="text-[#14F1D9] font-medium">multimodal computer vision</span>,
          220+ distributed IoT sensor telemetry, sub-second threat scoring, and <span className="text-[#7C5CFF] font-medium">real-time responder dispatch</span> with dynamic evacuation routing.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <GradientButton
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full sm:w-auto text-sm sm:text-base font-bold tracking-wide px-8 py-4 shadow-[0_0_30px_rgba(20,241,217,0.45)] hover:shadow-[0_0_50px_rgba(20,241,217,0.7)] group"
            >
              Launch Command Center
            </GradientButton>
          </Link>

          <Link href="/dashboard/digital-twin" className="w-full sm:w-auto">
            <GradientButton
              variant="outline"
              size="lg"
              icon={<Eye className="w-4 h-4" />}
              iconPosition="left"
              className="w-full sm:w-auto text-sm font-semibold px-6 py-4 border-[rgba(20,241,217,0.3)] hover:border-[rgba(20,241,217,0.7)] hover:bg-[rgba(20,241,217,0.06)]"
            >
              Enter 3D Digital Twin
            </GradientButton>
          </Link>
        </motion.div>

        {/* Live System Metrics Quick Strip */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl"
        >
          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-[rgba(20,241,217,0.2)] bg-[#070B12]/60 hover:border-[rgba(20,241,217,0.5)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">Response ETA</span>
              <Clock className="w-3.5 h-3.5 text-[#14F1D9] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F0F4FF] tracking-tight">
              &lt; 90s
            </div>
            <span className="text-[11px] text-[#22D3A5] font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 68% faster dispatch
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-[rgba(124,92,255,0.2)] bg-[#070B12]/60 hover:border-[rgba(124,92,255,0.5)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">AI Accuracy</span>
              <Cpu className="w-3.5 h-3.5 text-[#7C5CFF] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F0F4FF] tracking-tight">
              99.4%
            </div>
            <span className="text-[11px] text-[#14F1D9] font-medium flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3" /> Zero false negatives
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-[rgba(20,241,217,0.2)] bg-[#070B12]/60 hover:border-[rgba(20,241,217,0.5)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">IoT Sensor Grid</span>
              <Activity className="w-3.5 h-3.5 text-[#14F1D9] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F0F4FF] tracking-tight">
              224 Nodes
            </div>
            <span className="text-[11px] text-[#22D3A5] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] animate-pulse" /> 100% Online
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-[rgba(255,77,109,0.2)] bg-[#070B12]/60 hover:border-[rgba(255,77,109,0.5)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">Lives Protected</span>
              <Shield className="w-3.5 h-3.5 text-[#FF4D6D] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F0F4FF] tracking-tight">
              4,800+
            </div>
            <span className="text-[11px] text-[#8B9AB4] font-medium flex items-center gap-1 mt-0.5">
              Across 8 Campus Zones
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating Hologram Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl w-full mt-12"
      >
        <div className="relative rounded-2xl p-1 bg-gradient-to-r from-[#14F1D9]/40 via-[#7C5CFF]/30 to-[#14F1D9]/40 shadow-[0_0_50px_rgba(20,241,217,0.2)]">
          <div className="rounded-2xl bg-[#070B12]/90 backdrop-blur-2xl p-4 sm:p-6 border border-white/10">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF4D6D]" />
                <span className="w-3 h-3 rounded-full bg-[#FFB347]" />
                <span className="w-3 h-3 rounded-full bg-[#22D3A5]" />
                <span className="ml-2 text-xs font-mono text-[#8B9AB4]">campusshield-defense-grid.live</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(255,77,109,0.15)] text-[#FF4D6D] text-[11px] font-mono font-semibold border border-[rgba(255,77,109,0.3)]">
                  <Flame className="w-3 h-3 animate-pulse" /> LIVE INCIDENT INC-0091
                </span>
                <span className="hidden sm:inline-block text-xs font-mono text-[#14F1D9]">
                  LATENCY 8MS
                </span>
              </div>
            </div>

            {/* Live Card Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Box 1: Threat Detection */}
              <div className="rounded-xl p-3.5 bg-white/[0.03] border border-[rgba(255,77,109,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4D6D]/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#FF4D6D] font-semibold uppercase">Thermal Anomaly</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF4D6D]/20 text-[#FF4D6D] font-mono">CRITICAL</span>
                </div>
                <h4 className="text-sm font-bold text-[#F0F4FF]">Science Block B · Lab 302</h4>
                <p className="text-xs text-[#8B9AB4] mt-1">Multi-sensor thermal spike (340°C) with active smoke trigger.</p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#8B9AB4] pt-2 border-t border-white/5">
                  <span>AI Confidence</span>
                  <span className="text-[#14F1D9] font-bold">98.4%</span>
                </div>
              </div>

              {/* Box 2: Tactical Unit Response */}
              <div className="rounded-xl p-3.5 bg-white/[0.03] border border-[rgba(20,241,217,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#14F1D9]/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#14F1D9] font-semibold uppercase">Tactical Unit</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#14F1D9]/20 text-[#14F1D9] font-mono">ON SCENE</span>
                </div>
                <h4 className="text-sm font-bold text-[#F0F4FF]">Squad Alpha · Cpt. Rivera</h4>
                <p className="text-xs text-[#8B9AB4] mt-1">Deploying SCBA suppression kit. Radio Channel CH-4.</p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#8B9AB4] pt-2 border-t border-white/5">
                  <span>Reinforcement ETA</span>
                  <span className="text-[#22D3A5] font-bold">45s (Lt. Chen)</span>
                </div>
              </div>

              {/* Box 3: Safe Evacuation Routing */}
              <div className="rounded-xl p-3.5 bg-white/[0.03] border border-[rgba(124,92,255,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C5CFF]/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#7C5CFF] font-semibold uppercase">Smart Evacuation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C5CFF]/20 text-[#7C5CFF] font-mono">ACTIVE ROUTE</span>
                </div>
                <h4 className="text-sm font-bold text-[#F0F4FF]">East Stairwell → North Quad</h4>
                <p className="text-xs text-[#8B9AB4] mt-1">Hazard bypass enabled. 42 occupants safely rerouted.</p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#8B9AB4] pt-2 border-t border-white/5">
                  <span>Clearance Time</span>
                  <span className="text-[#7C5CFF] font-bold">2m 30s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
