'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;             // % change; + is up, - is down
  trendLabel?: string;
  icon?: React.ReactNode;
  accent?: 'primary' | 'purple' | 'red' | 'amber' | 'green';
  className?: string;
  delay?: number;
  valueSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const accentMap = {
  primary: { text: 'text-[#14F1D9]', bg: 'rgba(20,241,217,0.1)', border: 'rgba(20,241,217,0.2)' },
  purple:  { text: 'text-[#7C5CFF]', bg: 'rgba(124,92,255,0.1)', border: 'rgba(124,92,255,0.2)' },
  red:     { text: 'text-[#FF4D6D]', bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.2)' },
  amber:   { text: 'text-[#FFB347]', bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.2)' },
  green:   { text: 'text-[#22D3A5]', bg: 'rgba(34,211,165,0.1)', border: 'rgba(34,211,165,0.2)' },
};

const valueSizeMap = {
  sm:  'text-xl',
  md:  'text-2xl',
  lg:  'text-3xl',
  xl:  'text-4xl',
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  accent = 'primary',
  className,
  delay = 0,
  valueSize = 'lg',
}: StatCardProps) {
  const colors = accentMap[accent];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('glass rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all duration-300', className)}
      style={{ borderColor: colors.border }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
          {title}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: colors.bg }}
          >
            <span className={colors.text}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <span className={cn('font-bold text-foreground leading-none tabular-nums', valueSizeMap[valueSize])}>
          {value}
        </span>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
            isPositive ? 'bg-success/15 text-success' :
            isNegative ? 'bg-danger/15 text-danger' :
                         'bg-black/10 dark:bg-white/[0.08] text-muted-foreground',
          )}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> :
             isNegative ? <TrendingDown className="w-2.5 h-2.5" /> :
                          <Minus className="w-2.5 h-2.5" />}
            {Math.abs(trend)}%
          </div>
          {trendLabel && (
            <span className="text-[10px] text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
