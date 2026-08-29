'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Background Cyber Mesh Grid */}
      <div className="absolute inset-0 bg-grid opacity-25 dark:opacity-25 light:opacity-10" />

      {/* Top Left Cyan Aurora Orb */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.18, 0.12],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#14F1D9] blur-[160px] dark:opacity-100 opacity-30"
      />

      {/* Center-Right Purple Cosmic Aurora Orb */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-[#7C5CFF] blur-[180px] dark:opacity-100 opacity-20"
      />

      {/* Bottom Amber Warm Glow */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
          opacity: [0.06, 0.1, 0.06],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full bg-[#FF8C42] blur-[160px] dark:opacity-100 opacity-15"
      />

      {/* Scanline Overlay — dark only */}
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,transparent_60%,rgba(3,4,7,0.85)_100%)] bg-[radial-gradient(ellipse_at_top,transparent_60%,rgba(245,247,251,0.5)_100%)]" />
    </div>
  );
}
