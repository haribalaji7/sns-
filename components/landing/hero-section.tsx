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
            <span className="block text-foreground text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 sm:mt-3">
              Emergency Response &amp;
            </span>
            <span className="block bg-gradient-to-r from-primary via-cyan-400 to-secondary bg-clip-text text-fill-transparent text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-[0_0_25px_rgba(124,92,255,0.4)]">
              Safety Management
            </span>
          </h1>
        </motion.div>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="max-w-3xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 font-normal"
        >
          Autonomous campus defense platform unifying <span className="text-primary font-medium">multimodal computer vision</span>,
          220+ distributed IoT sensor telemetry, sub-second threat scoring, and <span className="text-secondary font-medium">real-time responder dispatch</span> with dynamic evacuation routing.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center flex-wrap gap-4 mb-14 w-full"
        >
          <Link href="/admin/login" className="w-full sm:w-auto">
            <GradientButton
              variant="primary"
              size="lg"
              icon={<Shield className="w-4 h-4" />}
              iconPosition="left"
              className="w-full sm:w-auto text-sm sm:text-base font-bold tracking-wide px-6 py-4 shadow-[0_0_30px_rgba(20,241,217,0.3)] hover:shadow-[0_0_50px_rgba(20,241,217,0.6)] group"
            >
              Admin Command Center
            </GradientButton>
          </Link>

          <Link href="/student/login" className="w-full sm:w-auto">
            <GradientButton
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full sm:w-auto text-sm sm:text-base font-bold tracking-wide px-6 py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D84FF] shadow-[0_0_30px_rgba(124,92,255,0.3)] hover:shadow-[0_0_50px_rgba(124,92,255,0.6)] group border-none"
            >
              Student Portal
            </GradientButton>
          </Link>

          <Link href="/security/login" className="w-full sm:w-auto">
            <GradientButton
              variant="primary"
              size="lg"
              icon={<Radio className="w-4 h-4" />}
              iconPosition="left"
              className="w-full sm:w-auto text-sm sm:text-base font-bold tracking-wide px-6 py-4 bg-gradient-to-r from-[#FFB347] to-[#FF8C00] shadow-[0_0_30px_rgba(255,179,71,0.3)] hover:shadow-[0_0_50px_rgba(255,179,71,0.6)] group border-none"
            >
              Security Portal
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
              3D Digital Twin
            </GradientButton>
          </Link>
        </motion.div>

        {/* Live System Metrics Quick Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full"
        >
          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-primary/20 bg-card/70 dark:bg-[#070B12]/60 hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Response ETA</span>
              <Clock className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              &lt; 90s
            </div>
            <span className="text-[11px] text-success font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 68% faster dispatch
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-secondary/20 bg-card/70 dark:bg-[#070B12]/60 hover:border-secondary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">AI Accuracy</span>
              <Cpu className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              99.4%
            </div>
            <span className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3" /> Zero false negatives
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-primary/20 bg-card/70 dark:bg-[#070B12]/60 hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">IoT Sensor Grid</span>
              <Activity className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              224 Nodes
            </div>
            <span className="text-[11px] text-success font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> 100% Online
            </span>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 text-left border-danger/20 bg-card/70 dark:bg-[#070B12]/60 hover:border-danger/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Lives Protected</span>
              <Shield className="w-3.5 h-3.5 text-danger group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              4,800+
            </div>
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
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
        <div className="relative rounded-2xl p-1 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40 shadow-[0_0_50px_rgba(20,241,217,0.2)]">
          <div className="rounded-2xl bg-card/90 dark:bg-[#070B12]/90 backdrop-blur-2xl p-4 sm:p-6 border border-border">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-danger" />
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">campusshield-defense-grid.live</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-danger/15 text-danger text-[11px] font-mono font-semibold border border-danger/30">
                  <Flame className="w-3 h-3 animate-pulse" /> LIVE INCIDENT INC-0091
                </span>
                <span className="hidden sm:inline-block text-xs font-mono text-primary">
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
