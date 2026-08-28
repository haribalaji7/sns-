'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'active' | 'resolved' | 'offline' | 'custom';

interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: 'rgba(255,77,109,0.15)',  text: '#FF4D6D', border: 'rgba(255,77,109,0.4)',  dot: '#FF4D6D' },
  high:     { bg: 'rgba(255,179,71,0.15)',  text: '#FFB347', border: 'rgba(255,179,71,0.4)',  dot: '#FFB347' },
  medium:   { bg: 'rgba(20,241,217,0.12)',  text: '#14F1D9', border: 'rgba(20,241,217,0.35)', dot: '#14F1D9' },
  low:      { bg: 'rgba(34,211,165,0.12)',  text: '#22D3A5', border: 'rgba(34,211,165,0.35)', dot: '#22D3A5' },
  info:     { bg: 'rgba(124,92,255,0.12)',  text: '#7C5CFF', border: 'rgba(124,92,255,0.35)', dot: '#7C5CFF' },
  active:   { bg: 'rgba(255,77,109,0.15)',  text: '#FF4D6D', border: 'rgba(255,77,109,0.4)',  dot: '#FF4D6D' },
  resolved: { bg: 'rgba(34,211,165,0.12)',  text: '#22D3A5', border: 'rgba(34,211,165,0.35)', dot: '#22D3A5' },
  offline:  { bg: 'rgba(139,154,180,0.12)', text: '#8B9AB4', border: 'rgba(139,154,180,0.3)', dot: '#8B9AB4' },
  custom:   { bg: 'rgba(255,255,255,0.06)', text: '#F0F4FF', border: 'rgba(255,255,255,0.15)',dot: '#F0F4FF' },
};

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-1',
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export function NeonBadge({
  children,
  variant = 'medium',
  dot = false,
  pulse = false,
  size = 'sm',
  className,
  style,
}: NeonBadgeProps) {
  const colors = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wide border',
        sizeStyles[size],
        className,
      )}
      style={{
        background: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        ...style,
      }}
    >
      {dot && (
        <span
          className={cn('flex-shrink-0 rounded-full', pulse ? 'animate-pulse-dot' : '')}
          style={{
            width: size === 'xs' ? '5px' : '6px',
            height: size === 'xs' ? '5px' : '6px',
            background: colors.dot,
            boxShadow: `0 0 4px ${colors.dot}`,
          }}
        />
      )}
      {children}
    </span>
  );
}
