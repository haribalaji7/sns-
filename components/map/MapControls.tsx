'use client';

import React from 'react';
import {
  Plus,
  Minus,
  Navigation2,
  Compass,
  Maximize,
  Minimize,
  Eye,
  Locate,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onToggleTilt: () => void;
  onToggleStreetView?: () => void;
  onLocateMe?: () => void;
  onToggleFullscreen?: () => void;
  is3D?: boolean;
  isStreetViewActive?: boolean;
  isFullscreen?: boolean;
  className?: string;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleTilt,
  onToggleStreetView,
  onLocateMe,
  onToggleFullscreen,
  is3D = false,
  isStreetViewActive = false,
  isFullscreen = false,
  className,
}: MapControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-1.5 rounded-2xl glass border border-[rgba(20,241,217,0.25)] bg-[#070B12]/90 backdrop-blur-xl shadow-2xl z-20 select-none',
        className,
      )}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        title="Zoom In"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.08] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.08] transition-all cursor-pointer"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-white/10 my-0.5" />

      {/* 3D Tilt Toggle */}
      <button
        onClick={onToggleTilt}
        title="Toggle 3D Perspective"
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer',
          is3D
            ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_12px_rgba(20,241,217,0.5)] font-bold'
            : 'text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.08]',
        )}
      >
        <Box className="w-4 h-4" />
      </button>

      {/* Recenter */}
      <button
        onClick={onRecenter}
        title="Recenter on Campus"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.08] transition-all cursor-pointer"
      >
        <Compass className="w-4 h-4" />
      </button>

      {/* Street View Toggle */}
      {onToggleStreetView && (
        <button
          onClick={onToggleStreetView}
          title="Toggle Street View 360"
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer',
            isStreetViewActive
              ? 'bg-[#7C5CFF] text-[#F0F4FF] shadow-[0_0_12px_rgba(124,92,255,0.5)]'
              : 'text-[#8B9AB4] hover:text-[#7C5CFF] hover:bg-white/[0.08]',
          )}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* Locate Me */}
      {onLocateMe && (
        <button
          onClick={onLocateMe}
          title="Locate Current Position"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#00E59B] hover:bg-white/[0.08] transition-all cursor-pointer"
        >
          <Locate className="w-4 h-4" />
        </button>
      )}

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.08] transition-all cursor-pointer"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
