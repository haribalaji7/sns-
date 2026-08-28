'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
  Crosshair,
  Flame,
  Layers,
  Thermometer,
  Moon,
  Sun,
  Shield,
  Activity,
} from 'lucide-react';
import { BoundingBoxItem } from './detection-scenarios';
import { soundEffects } from '@/lib/audio-effects';

export type VisionFilterMode = 'normal' | 'thermal' | 'night' | 'wireframe';

interface CCTVScannerCanvasProps {
  imageUrl: string;
  cameraId?: string;
  cameraName?: string;
  objects: BoundingBoxItem[];
  analyzing?: boolean;
  onObjectClick?: (obj: BoundingBoxItem) => void;
  selectedObjectId?: string | null;
}

export function CCTVScannerCanvas({
  imageUrl,
  cameraId = 'CAM-B3-01',
  cameraName = 'Science Lab 302',
  objects = [],
  analyzing = false,
  onObjectClick,
  selectedObjectId,
}: CCTVScannerCanvasProps) {
  const [filterMode, setFilterMode] = useState<VisionFilterMode>('normal');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [timecode, setTimecode] = useState('');

  // Live UTC timestamp ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimecode(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (mode: VisionFilterMode) => {
    soundEffects.playClick();
    setFilterMode(mode);
  };

  const handleZoom = (delta: number) => {
    soundEffects.playClick();
    setZoomLevel((prev) => Math.min(2.0, Math.max(1.0, prev + delta)));
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'thermal':
        return 'filter contrast-150 saturate-200 hue-rotate-180 brightness-110';
      case 'night':
        return 'filter sepia(100%) hue-rotate(85deg) saturate(300%) brightness-90 contrast-125';
      case 'wireframe':
        return 'filter grayscale(100%) contrast(200%) invert(10%)';
      case 'normal':
      default:
        return 'filter contrast-110 brightness-100';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#030407] overflow-hidden flex flex-col shadow-2xl">
      {/* ─── Top Telemetry Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#070B12]/90 border-b border-white/[0.08] backdrop-blur-md z-30 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(255,77,109,0.2)] border border-[#FF4D6D]/40 text-[#FF4D6D] text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-ping" />
            <span>LIVE REC</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F0F4FF]">{cameraName}</span>
              <span className="text-[10px] font-mono text-[#14F1D9] bg-[#14F1D9]/10 px-1.5 py-0.2 rounded border border-[#14F1D9]/30">
                {cameraId}
              </span>
            </div>
          </div>
        </div>

        {/* Vision Filter Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => handleFilterChange('normal')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              filterMode === 'normal'
                ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_8px_#14F1D9]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => handleFilterChange('thermal')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              filterMode === 'thermal'
                ? 'bg-[#FF4D6D] text-white shadow-[0_0_8px_#FF4D6D]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            FLIR Thermal
          </button>
          <button
            onClick={() => handleFilterChange('night')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              filterMode === 'night'
                ? 'bg-[#22D3A5] text-[#070B12] shadow-[0_0_8px_#22D3A5]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            Night Vision
          </button>
          <button
            onClick={() => handleFilterChange('wireframe')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
              filterMode === 'wireframe'
                ? 'bg-[#7C5CFF] text-white shadow-[0_0_8px_#7C5CFF]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            YOLO Edges
          </button>
        </div>

        {/* Right Telemetry Controls */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-[#8B9AB4]">
          <span className="text-[#14F1D9]">{timecode}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Feed Canvas Viewport ────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-[#030407]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none z-10" />

        {/* Thermal Color Gradient Mask Overlay */}
        {filterMode === 'thermal' && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-yellow-500/20 to-blue-900/30 mix-blend-color pointer-events-none z-10" />
        )}

        {/* Night Vision Scanlines & Grain Overlay */}
        {filterMode === 'night' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,40,0,0.8)_100%)] pointer-events-none z-10" />
        )}

        {/* Main Camera Feed Image */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI Detection Feed"
            className={`w-full h-full object-cover select-none ${getFilterStyle()}`}
          />

          {/* ─── Sci-Fi HUD Crosshair & Targeting Grid ──────────────────── */}
          {showCrosshair && (
            <div className="absolute inset-0 pointer-events-none z-15">
              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-[#14F1D9]/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#14F1D9]/60 rounded-full" />
                <div className="absolute top-0 bottom-0 w-[1px] bg-[#14F1D9]/30" />
                <div className="absolute left-0 right-0 h-[1px] bg-[#14F1D9]/30" />
              </div>

              {/* Corner HUD Brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#14F1D9]/60" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#14F1D9]/60" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#14F1D9]/60" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#14F1D9]/60" />
            </div>
          )}

          {/* ─── Interactive Bounding Boxes Overlay ───────────────────── */}
          <AnimatePresence>
            {showLabels &&
              objects.map((obj, i) => {
                const isSelected = selectedObjectId === obj.id;
                const boxColor = obj.color || '#FF4D6D';

                return (
                  <motion.div
                    key={obj.id || i}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 * i }}
                    onClick={() => {
                      soundEffects.playClick();
                      onObjectClick?.(obj);
                    }}
                    className={`absolute border-2 cursor-pointer z-20 transition-all duration-200 group ${
                      isSelected
                        ? 'border-white ring-4 ring-[#14F1D9]/80 shadow-[0_0_25px_rgba(20,241,217,0.8)]'
                        : 'hover:border-white hover:shadow-[0_0_20px_currentColor]'
                    }`}
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      width: `${obj.w}%`,
                      height: `${obj.h}%`,
                      borderColor: isSelected ? '#FFFFFF' : boxColor,
                      backgroundColor: `${boxColor}15`,
                      boxShadow: `0 0 15px ${boxColor}60, inset 0 0 15px ${boxColor}25`,
                    }}
                  >
                    {/* Floating Label Badge */}
                    <div
                      className="absolute -top-6 left-[-2px] px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap flex items-center gap-1.5 shadow-md"
                      style={{ backgroundColor: boxColor }}
                    >
                      <Crosshair className="w-2.5 h-2.5" />
                      <span>{obj.label}</span>
                      <span className="bg-black/40 px-1 py-0.2 rounded text-[9px] font-mono">
                        {obj.confidence}%
                      </span>
                    </div>

                    {/* Corner Reticle Markers */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 bg-white" style={{ borderColor: boxColor, transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 bg-white" style={{ borderColor: boxColor, transform: 'translate(50%, -50%)' }} />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 bg-white" style={{ borderColor: boxColor, transform: 'translate(-50%, 50%)' }} />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 bg-white" style={{ borderColor: boxColor, transform: 'translate(50%, 50%)' }} />

                    {/* Quick Telemetry Hover Popup */}
                    {obj.telemetry && (
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-[#070B12]/95 border border-white/20 rounded p-2 text-[9px] font-mono text-[#F0F4FF] whitespace-nowrap shadow-xl z-30">
                        {Object.entries(obj.telemetry).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#8B9AB4]">{k}:</span>
                            <span className="text-[#14F1D9] font-bold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* ─── Scanning Laser Animation Bar ─────────────────────────── */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#14F1D9] to-transparent shadow-[0_0_20px_#14F1D9] z-25 pointer-events-none"
            style={{ opacity: 0.75 }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4.5, ease: 'linear', repeat: Infinity }}
          />

          {/* Analyzing Pulse Overlay */}
          {analyzing && (
            <div className="absolute inset-0 bg-[#070B12]/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#14F1D9] border-r-transparent border-b-[#7C5CFF] border-l-transparent animate-spin mb-3" />
              <p className="text-xs font-mono font-bold text-[#14F1D9] tracking-widest uppercase animate-pulse">
                Running YOLO Vision & Gemini Multimodal Pipeline...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom HUD Status Footer ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#070B12] border-t border-white/[0.08] text-[10px] font-mono text-[#8B9AB4] select-none flex-wrap gap-2 relative z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#22D3A5] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] animate-pulse" /> 60.0 FPS
          </span>
          <span className="hidden md:inline">Bitrate: 6.4 Mbps</span>
          <span className="hidden lg:inline">Codec: H.265 / NVENC</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="text-[#14F1D9] hover:underline cursor-pointer font-bold px-2 py-0.5 rounded bg-[#14F1D9]/10 border border-[#14F1D9]/30"
          >
            {showLabels ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
          </button>
          <span className="text-[#F0F4FF] font-bold">
            {objects.length} Objects Detected
          </span>
        </div>
      </div>
    </div>
  );
}
