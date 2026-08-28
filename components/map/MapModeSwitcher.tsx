'use client';

import React from 'react';
import { MapMode } from '@/hooks/useMapMode';
import { Layers, Globe, Box, Mountain, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapModeSwitcherProps {
  currentMode: MapMode;
  onModeChange: (mode: MapMode) => void;
  className?: string;
}

const MODES: { id: MapMode; label: string; icon: any }[] = [
  { id: 'roadmap', label: 'MAP', icon: MapIcon },
  { id: 'satellite', label: 'SATELLITE', icon: Globe },
  { id: 'hybrid', label: 'HYBRID', icon: Layers },
  { id: 'terrain', label: 'TERRAIN', icon: Mountain },
  { id: '3d', label: '3D TILT', icon: Box },
];

export function MapModeSwitcher({
  currentMode,
  onModeChange,
  className,
}: MapModeSwitcherProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-2xl glass border border-[rgba(20,241,217,0.25)] bg-[#070B12]/90 backdrop-blur-xl shadow-2xl z-20 select-none',
        className,
      )}
    >
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer',
              isActive
                ? 'bg-gradient-to-r from-[#14F1D9] to-[#0BB8A7] text-[#070B12] shadow-[0_0_15px_rgba(20,241,217,0.45)]'
                : 'text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.05]',
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#070B12]' : 'text-[#8B9AB4]')} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
