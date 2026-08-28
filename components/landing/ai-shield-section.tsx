'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Cpu,
  Eye,
  Radio,
  Activity,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';

const defenseLayers = [
  {
    id: 'layer-1',
    title: 'Perimeter Optical Overwatch',
    subtitle: 'Computer Vision & Thermal Camera Mesh',
    description:
      'Continuous neural analysis of RTSP camera streams detecting flame signatures, weapon silhouettes, and unauthorized access with sub-50ms inference latency.',
    icon: Eye,
    status: 'ACTIVE',
    color: '#14F1D9',
    badge: 'YOLOv8 + Vision Transformer',
  },
  {
    id: 'layer-2',
    title: 'Multimodal Telemetry Fusion',
    subtitle: '224 IoT Sensor Mesh (Smoke, VOC, Thermal, Access)',
    description:
      'Sub-second ingestion of environmental telemetry, cross-correlating smoke ppm, thermal differentials, and motion sensors to eliminate 100% of false alarms.',
    icon: Activity,
    status: 'OPTIMAL',
    color: '#7C5CFF',
    badge: 'Kalman Filter Ensemble',
  },
  {
    id: 'layer-3',
    title: 'Predictive Blast Radius & Dispersion',
    subtitle: 'Fluid Dynamics & Spread Forecasting',
    description:
      'AI model predicts fire travel vectors, chemical vapor cloud dispersion corridors, and crowd evacuation bottlenecks 15 minutes before escalation.',
    icon: Cpu,
    status: 'FORECASTING',
    color: '#38BDF8',
    badge: 'Physics-Informed Neural Network',
  },
  {
    id: 'layer-4',
    title: 'Autonomous Protocol Orchestrator',
    subtitle: 'Instant Dispatch & Smart Exit Signage',
    description:
      'Instantly dispatches nearest tactical squad, coordinates hospital AED routes, and updates digital hallway directional displays away from danger.',
    icon: Zap,
    status: 'READY',
    color: '#22D3A5',
    badge: 'Autonomous Event Bus',
  },
];

export function AIShieldSection() {
  const [activeLayer, setActiveLayer] = useState(0);

  return (
    <section id="ai-shield" className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#14F1D9]/10 via-[#7C5CFF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#14F1D9]/10 border border-[rgba(20,241,217,0.3)] text-[#14F1D9] text-xs font-mono mb-4"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTONOMOUS THREAT MITIGATION MATRIX</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-[#F0F4FF] tracking-tight uppercase"
          >
            AI Emergency{' '}
            <span className="bg-gradient-to-r from-[#14F1D9] via-[#38BDF8] to-[#7C5CFF] bg-clip-text text-fill-transparent">
              Shield Architecture
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#8B9AB4] mt-4"
          >
            Four synchronized layers of artificial intelligence safeguarding every square meter of the campus in real time.
          </motion.p>
        </div>

        {/* Shield Visualizer & Layer Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: 3D Holographic Shield Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
              {/* Outer Rotating Concentric Ring 1 */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[rgba(20,241,217,0.3)] animate-radar" />

              {/* Middle Rotating Ring 2 (Reversed) */}
              <div
                className="absolute inset-6 rounded-full border border-[rgba(124,92,255,0.35)]"
                style={{ animation: 'radar 8s linear infinite reverse' }}
              />

              {/* Inner Pulsing Radar Circle */}
              <div className="absolute inset-14 rounded-full border border-[rgba(20,241,217,0.2)] animate-pulse-ring" />

              {/* Orbiting Satellite Node 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-start justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-[#14F1D9] shadow-[0_0_15px_#14F1D9] border-2 border-[#070B12] -translate-y-2" />
              </motion.div>

              {/* Orbiting Satellite Node 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 flex items-end justify-center"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#7C5CFF] shadow-[0_0_15px_#7C5CFF] border-2 border-[#070B12] translate-y-2" />
              </motion.div>

              {/* Core Shield Emblem Glass Core */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-[#14F1D9]/20 via-[#7C5CFF]/20 to-[#070B12]/80 backdrop-blur-xl border border-[rgba(20,241,217,0.6)] shadow-[0_0_40px_rgba(20,241,217,0.4)] flex flex-col items-center justify-center p-4 text-center">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-[#14F1D9] animate-pulse drop-shadow-[0_0_20px_#14F1D9]" />
                <span className="text-[11px] font-mono font-bold text-[#F0F4FF] uppercase tracking-wider mt-1">
                  SHIELD ACTIVE
                </span>
                <span className="text-[9px] font-mono text-[#14F1D9]">
                  0 THREAT BREACHES
                </span>
              </div>

              {/* Floating Shield Status Pills */}
              <div className="absolute -top-2 left-4 glass rounded-xl px-3 py-1.5 border-[rgba(20,241,217,0.4)] text-[10px] font-mono text-[#14F1D9] shadow-lg">
                ⚡ 99.98% UPTIME
              </div>
              <div className="absolute -bottom-2 right-4 glass rounded-xl px-3 py-1.5 border-[rgba(124,92,255,0.4)] text-[10px] font-mono text-[#7C5CFF] shadow-lg">
                🔒 RLS PROTECTED
              </div>
            </div>
          </motion.div>

          {/* Right: Interactive Layer Selector Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            {defenseLayers.map((layer, idx) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === idx;

              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveLayer(idx)}
                  className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
                    isSelected
                      ? 'glass border-[rgba(20,241,217,0.5)] bg-white/[0.06] shadow-[0_0_25px_rgba(20,241,217,0.2)]'
                      : 'glass-subtle border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl flex-shrink-0 transition-colors duration-300"
                      style={{
                        backgroundColor: isSelected ? 'rgba(20, 241, 217, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isSelected ? 'rgba(20, 241, 217, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5 transition-transform duration-300"
                        style={{ color: layer.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <h4 className="text-base font-bold text-[#F0F4FF]">
                          {layer.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8B9AB4]">
                            {layer.badge}
                          </span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${layer.color}20`,
                              color: layer.color,
                              border: `1px solid ${layer.color}40`,
                            }}
                          >
                            {layer.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#8B9AB4] leading-relaxed">
                        {layer.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
