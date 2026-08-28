'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Cpu, Scan } from 'lucide-react';
import { IncidentSeverity } from '@/types';

interface ConfidenceGaugeProps {
  confidence: number; // 0-100
  severity: IncidentSeverity;
  size?: number;
  yoloScore?: number;
  nlpScore?: number;
  sensorScore?: number;
  className?: string;
}

export function ConfidenceGauge({
  confidence = 96,
  severity = 'critical',
  size = 170,
  yoloScore = 97.4,
  nlpScore = 95.8,
  sensorScore = 98.2,
  className = '',
}: ConfidenceGaugeProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (confidence / 100) * circumference;

  const severityColor =
    severity === 'critical'
      ? '#FF4D6D'
      : severity === 'high'
      ? '#FFB347'
      : '#14F1D9';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Gauge SVG Container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="neonTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14F1D9" />
              <stop offset="50%" stopColor="#22D3A5" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>

            <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="60%" stopColor="#FFB347" />
              <stop offset="100%" stopColor="#14F1D9" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ring Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Background Tick Marks */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 10}
            stroke="rgba(20, 241, 217, 0.15)"
            strokeWidth="2"
            strokeDasharray="2,8"
            fill="none"
          />

          {/* Animated Gradient Active Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#neonTealGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-[#F0F4FF] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(20,241,217,0.6)]"
          >
            {Math.round(confidence)}
            <span className="text-xl text-[#14F1D9] font-bold ml-0.5">%</span>
          </motion.span>
          
          <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[rgba(255,77,109,0.15)] border border-[#FF4D6D]/40 shadow-[0_0_8px_rgba(255,77,109,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-ping" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF4D6D]">
              {severity}
            </span>
          </div>

          <span className="text-[9px] font-mono text-[#8B9AB4] uppercase tracking-widest mt-1">
            AI Confidence
          </span>
        </div>
      </div>

      {/* Sub-Score Telemetry Matrix */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-white/[0.08]">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-[#8B9AB4] mb-0.5">
            <Scan className="w-2.5 h-2.5 text-[#14F1D9]" /> YOLOv11
          </div>
          <p className="text-xs font-bold text-[#F0F4FF] tabular-nums font-mono">{yoloScore}%</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-[#8B9AB4] mb-0.5">
            <Cpu className="w-2.5 h-2.5 text-[#7C5CFF]" /> Gemini
          </div>
          <p className="text-xs font-bold text-[#F0F4FF] tabular-nums font-mono">{nlpScore}%</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-[#8B9AB4] mb-0.5">
            <Zap className="w-2.5 h-2.5 text-[#22D3A5]" /> Sensor
          </div>
          <p className="text-xs font-bold text-[#F0F4FF] tabular-nums font-mono">{sensorScore}%</p>
        </div>
      </div>
    </div>
  );
}
