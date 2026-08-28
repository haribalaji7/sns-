'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'primary' | 'purple' | 'red' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  animate?: boolean;
  delay?: number;
}

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

const glowMap = {
  none:    '',
  primary: 'hover:shadow-[0_0_24px_rgba(20,241,217,0.18)] hover:border-[rgba(20,241,217,0.35)]',
  purple:  'hover:shadow-[0_0_24px_rgba(124,92,255,0.22)] hover:border-[rgba(124,92,255,0.4)]',
  red:     'hover:shadow-[0_0_24px_rgba(255,77,109,0.22)] hover:border-[rgba(255,77,109,0.4)]',
};

export function GlassCard({
  children,
  className,
  hover = false,
  glow = 'primary',
  padding = 'md',
  animate = true,
  delay = 0,
  ...props
}: GlassCardProps) {
  const base = (
    <div
      className={cn(
        'glass rounded-2xl transition-all duration-300',
        paddingMap[padding],
        hover && 'cursor-pointer',
        hover && glowMap[glow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (!animate) return base;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className={cn(
          'glass rounded-2xl transition-all duration-300',
          paddingMap[padding],
          hover && 'cursor-pointer',
          hover && glowMap[glow],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </motion.div>
  );
}
