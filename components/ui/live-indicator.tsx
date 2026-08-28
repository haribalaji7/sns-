'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  label?: string;
  color?: 'primary' | 'red' | 'amber' | 'green';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const colorMap = {
  primary: '#14F1D9',
  red:     '#FF4D6D',
  amber:   '#FFB347',
  green:   '#22D3A5',
};

const sizeMap = {
  xs: { dot: 'w-1.5 h-1.5', ring: 'w-1.5 h-1.5', text: 'text-[9px]' },
  sm: { dot: 'w-2 h-2',   ring: 'w-2 h-2',   text: 'text-[10px]' },
  md: { dot: 'w-2.5 h-2.5', ring: 'w-2.5 h-2.5', text: 'text-xs' },
};

export function LiveIndicator({
  label = 'LIVE',
  color = 'red',
  size = 'sm',
  className,
}: LiveIndicatorProps) {
  const hexColor = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      {/* Pulsing dot with ring */}
      <span className="relative inline-flex">
        {/* Outer ring */}
        <span
          className={cn('absolute rounded-full opacity-75', sizes.ring)}
          style={{
            background: hexColor,
            animation: 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
          }}
        />
        {/* Inner dot */}
        <span
          className={cn('relative rounded-full', sizes.dot)}
          style={{ background: hexColor }}
        />
      </span>

      {label && (
        <span
          className={cn('font-bold tracking-widest uppercase', sizes.text)}
          style={{ color: hexColor }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
