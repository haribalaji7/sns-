'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  Users,
  Radio,
  Activity,
  CheckCircle,
  TrendingDown,
  ShieldAlert,
  Server,
} from 'lucide-react';

const stats = [
  {
    title: 'Average Response Time',
    value: '134s',
    unit: '2m 14s',
    comparison: '-68% faster than benchmark',
    icon: Clock,
    color: '#14F1D9',
    trend: 'down',
  },
  {
    title: 'AI Detection Accuracy',
    value: '99.4%',
    unit: 'Sub-40ms latency',
    comparison: 'Zero critical false negatives',
    icon: Zap,
    color: '#7C5CFF',
    trend: 'up',
  },
  {
    title: 'Protected Campus Occupants',
    value: '4,820',
    unit: 'Across 8 Zones',
    comparison: 'Live density tracking enabled',
    icon: Users,
    color: '#22D3A5',
    trend: 'up',
  },
  {
    title: 'IoT Sensor Mesh Fleet',
    value: '224 / 224',
    unit: '100% Online',
    comparison: '6 Sensor types operational',
    icon: Radio,
    color: '#38BDF8',
    trend: 'up',
  },
];

const zoneStats = [
  { name: 'Science Block B', status: 'DANGER', occupancy: 340, capacity: 500, risk: 94, color: '#FF4D6D' },
  { name: 'IT Building', status: 'CAUTION', occupancy: 120, capacity: 300, risk: 62, color: '#FFB347' },
  { name: 'Athletic Pavilion', status: 'CAUTION', occupancy: 190, capacity: 400, risk: 71, color: '#FFB347' },
  { name: 'Main Library', status: 'SAFE', occupancy: 620, capacity: 800, risk: 18, color: '#22D3A5' },
  { name: 'Main Gate Complex', status: 'SAFE', occupancy: 45, capacity: 100, risk: 22, color: '#22D3A5' },
  { name: 'Admin Block', status: 'SAFE', occupancy: 280, capacity: 400, risk: 12, color: '#22D3A5' },
];

export function LiveStatsSection() {
  return (
    <section id="live-stats" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#070B12]/80 to-transparent">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#22D3A5]/10 border border-[rgba(34,211,165,0.3)] text-[#22D3A5] text-xs font-mono mb-4"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>REAL-TIME PLATFORM TELEMETRY</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-[#F0F4FF] tracking-tight uppercase"
          >
            Live Performance{' '}
            <span className="bg-gradient-to-r from-[#22D3A5] via-[#14F1D9] to-[#7C5CFF] bg-clip-text text-fill-transparent">
              Intelligence
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#8B9AB4] mt-4"
          >
            Quantified emergency mitigation metrics streamed in real-time across high-occupancy campus infrastructure.
          </motion.p>
        </div>

        {/* 4 Hero Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-[rgba(20,241,217,0.4)] transition-all duration-300"
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: item.color }}
                />

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B9AB4]">{item.unit}</span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-[#F0F4FF] tracking-tight mb-1">
                  {item.value}
                </div>
                <h4 className="text-xs font-semibold text-[#8B9AB4] mb-2">{item.title}</h4>

                <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-[#22D3A5]">
                  <CheckCircle className="w-3 h-3" />
                  <span>{item.comparison}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Zone Telemetry Bar Strip */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 sm:p-8 border border-white/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-[#F0F4FF] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#14F1D9]" />
                Live Campus Zone Risk &amp; Occupancy Telemetry
              </h3>
              <p className="text-xs text-[#8B9AB4] mt-1">
                Real-time density sensors recalculating zone risk score every 5 seconds.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#FF4D6D]">
                <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" /> Danger (&gt;70%)
              </span>
              <span className="flex items-center gap-1.5 text-[#FFB347]">
                <span className="w-2 h-2 rounded-full bg-[#FFB347]" /> Caution (40–70%)
              </span>
              <span className="flex items-center gap-1.5 text-[#22D3A5]">
                <span className="w-2 h-2 rounded-full bg-[#22D3A5]" /> Safe (&lt;40%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneStats.map((z) => (
              <div key={z.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F0F4FF]">{z.name}</span>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${z.color}20`,
                      color: z.color,
                      border: `1px solid ${z.color}40`,
                    }}
                  >
                    {z.status} · RISK {z.risk}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(z.occupancy / z.capacity) * 100}%`,
                      backgroundColor: z.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8B9AB4]">
                  <span>Occupancy: {z.occupancy} / {z.capacity}</span>
                  <span>{Math.round((z.occupancy / z.capacity) * 100)}% Cap</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
