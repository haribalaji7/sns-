'use client';

import React, { useRef } from 'react';
import { useStreetView } from '@/hooks/useStreetView';
import { Eye, ArrowLeft, AlertCircle, Compass, Sparkles } from 'lucide-react';
import { GradientButton } from '@/components/ui';

interface StreetViewPanelProps {
  lat: number;
  lng: number;
  title?: string;
  onClose: () => void;
  className?: string;
}

export function StreetViewPanel({
  lat,
  lng,
  title = 'Tactical Point 360',
  onClose,
  className,
}: StreetViewPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isAvailable, isLoading } = useStreetView(containerRef, { lat, lng });

  return (
    <div className="relative w-full h-full flex flex-col glass border border-[rgba(20,241,217,0.3)] bg-[#070B12] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.04] z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#14F1D9]" />
              <h3 className="text-xs font-bold text-[#F0F4FF] uppercase tracking-wider truncate">
                {title}
              </h3>
            </div>
            <p className="text-[10px] font-mono text-[#8B9AB4]">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[rgba(124,92,255,0.2)] text-[#7C5CFF] text-[10px] font-mono font-semibold border border-[rgba(124,92,255,0.4)]">
            GOOGLE STREET VIEW 360
          </span>
        </div>
      </div>

      {/* Street View Canvas Container */}
      <div className="relative flex-1 w-full bg-[#070B12]">
        <div ref={containerRef} className="w-full h-full" />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B12]/80 backdrop-blur-sm z-20 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#14F1D9] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#14F1D9]">CONNECTING TO 360 SPHERICAL PANORAMA...</p>
          </div>
        )}

        {/* Fallback card if Street View is unavailable for indoor/restricted point */}
        {isAvailable === false && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#070B12]/90 backdrop-blur-md z-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.4)] flex items-center justify-center text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="max-w-sm space-y-1">
              <h4 className="text-sm font-bold text-[#F0F4FF]">
                Street View Panorama Unavailable
              </h4>
              <p className="text-xs text-[#8B9AB4] leading-relaxed">
                Google Street View coverage is restricted for this internal building quadrant. 3D Digital Twin building wireframe remains active.
              </p>
            </div>
            <GradientButton variant="outline" size="sm" onClick={onClose}>
              Return to 3D Campus Map
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
}
