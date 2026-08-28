'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BoundingBoxProps {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  confidence: number;
  color?: string;
  delay?: number;
}

export function BoundingBox({
  x, y, width, height, label, confidence, color = '#FF4D6D', delay = 0,
}: BoundingBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="absolute border-2 bg-[rgba(0,0,0,0.1)] pointer-events-none z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        borderColor: color,
        boxShadow: `0 0 12px ${color}40, inset 0 0 12px ${color}20`,
      }}
    >
      <div
        className="absolute -top-6 left-[-2px] px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {label} <span className="opacity-80 font-medium ml-1">{confidence}%</span>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 bg-white" style={{ borderColor: color, transform: 'translate(-50%, -50%)' }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 bg-white" style={{ borderColor: color, transform: 'translate(50%, -50%)' }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 bg-white" style={{ borderColor: color, transform: 'translate(-50%, 50%)' }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 bg-white" style={{ borderColor: color, transform: 'translate(50%, 50%)' }} />
    </motion.div>
  );
}
