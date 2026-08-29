'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
  divider?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  accent = false,
  className,
  divider = false,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', divider && 'pb-3 border-b border-border', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className={cn(
            'font-semibold leading-tight truncate',
            accent ? 'text-sm text-primary' : 'text-sm text-foreground',
          )}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-3">
          {action}
        </div>
      )}
    </div>
  );
}
