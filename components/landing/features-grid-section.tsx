'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  MapPin,
  Send,
  Navigation,
  Activity,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Flame,
    title: 'Multimodal AI Incident Triage',
    subtitle: 'Zero-latency anomaly detection',
    description:
      'Computer vision models (YOLOv8) detect thermal anomalies and smoke plumes in 40ms while NLP models triage emergency radio audio streams.',
    gradient: 'from-[#FF4D6D]/20 to-[#FF4D6D]/0',
    borderGlow: 'hover:border-[rgba(255,77,109,0.5)]',
    accentColor: '#FF4D6D',
    tag: 'CV + NLP',
    span: 'col-span-1 lg:col-span-2',
  },
  {
    icon: MapPin,
    title: '3D Campus Digital Twin',
    subtitle: 'Spatial zone awareness',
    description:
      'Interactive 3D spatial mapping tracking real-time building occupancy, hazard perimeter boundaries, and sensor telemetry on a unified campus canvas.',
    gradient: 'from-[#14F1D9]/20 to-[#14F1D9]/0',
    borderGlow: 'hover:border-[rgba(20,241,217,0.5)]',
    accentColor: '#14F1D9',
    tag: 'Mapbox 3D',
    span: 'col-span-1 lg:col-span-1',
  },
  {
    icon: Send,
    title: 'Autonomous Unit Dispatch',
    subtitle: 'Sub-minute responder routing',
    description:
      'Algorithms match incident severity with responder skillsets, assigning squads and broadcasting tactical channel frequencies automatically.',
    gradient: 'from-[#7C5CFF]/20 to-[#7C5CFF]/0',
    borderGlow: 'hover:border-[rgba(124,92,255,0.5)]',
    accentColor: '#7C5CFF',
    tag: 'GPS + Radio',
    span: 'col-span-1 lg:col-span-1',
  },
  {
    icon: Navigation,
    title: 'Dynamic Safe Evacuation Routing',
    subtitle: 'Hazard-aware pathfinding',
    description:
      'A* pathfinding calculates egress routes bypassing compromised stairwells, pushing step-by-step turn guidance directly to mobile and IoT hall signage.',
    gradient: 'from-[#22D3A5]/20 to-[#22D3A5]/0',
    borderGlow: 'hover:border-[rgba(34,211,165,0.5)]',
    accentColor: '#22D3A5',
    tag: 'A* Pathfinding',
    span: 'col-span-1 lg:col-span-2',
  },
  {
    icon: Activity,
    title: '220+ IoT Sensor Mesh',
    subtitle: 'Continuous environmental telemetry',
    description:
      'High-throughput WebSocket telemetry ingestion monitoring smoke ppm, CO2, thermal deltas, and access badge failures across 8 campus blocks.',
    gradient: 'from-[#38BDF8]/20 to-[#38BDF8]/0',
    borderGlow: 'hover:border-[rgba(56,189,248,0.5)]',
    accentColor: '#38BDF8',
    tag: 'MQTT / WebSockets',
    span: 'col-span-1 lg:col-span-1',
  },
  {
    icon: ShieldCheck,
    title: 'Row Level Security & Realtime',
    subtitle: 'Sub-10ms Supabase synchronization',
    description:
      'Role-based access control isolating dispatcher, responder, and student data streams with automatic PostgreSQL triggers and instant live broadcasts.',
    gradient: 'from-[#14F1D9]/20 to-[#7C5CFF]/10',
    borderGlow: 'hover:border-[rgba(20,241,217,0.5)]',
    accentColor: '#14F1D9',
    tag: 'Supabase RLS',
    span: 'col-span-1 lg:col-span-2',
  },
];

export function FeaturesGridSection() {
  return (
    <section id="features" className="relative py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C5CFF]/10 border border-[rgba(124,92,255,0.3)] text-[#7C5CFF] text-xs font-mono mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ENTERPRISE COMMAND CAPABILITIES</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-[#F0F4FF] tracking-tight uppercase"
          >
            Engineered For{' '}
            <span className="bg-gradient-to-r from-[#14F1D9] to-[#7C5CFF] bg-clip-text text-fill-transparent">
              Zero-Failure Operations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#8B9AB4] mt-4"
          >
            Modular architecture designed for rapid deployment, campus-wide resilience, and sub-second decision support.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`group relative rounded-2xl p-6 sm:p-7 glass border border-white/10 ${item.borderGlow} transition-all duration-300 overflow-hidden flex flex-col justify-between ${item.span}`}
              >
                {/* Subtle top glow gradient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${item.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-lg"
                      style={{
                        backgroundColor: `${item.accentColor}15`,
                        borderColor: `${item.accentColor}40`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.accentColor }} />
                    </div>

                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#8B9AB4] group-hover:border-white/20 transition-colors">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#F0F4FF] mb-1 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-[#8B9AB4] mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-[#8B9AB4] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#8B9AB4] group-hover:text-[#14F1D9] transition-colors">
                  <span>Explore Feature</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
