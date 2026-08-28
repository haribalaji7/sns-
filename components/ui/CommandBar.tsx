'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, AlertTriangle, Users, RotateCcw,
  Layers, Zap, Eye, EyeOff, Activity,
} from 'lucide-react';
import { useDigitalTwin } from '@/context/DigitalTwinContext';

interface LayerToggleProps {
  label: string;
  active: boolean;
  color: string;
  icon: React.ElementType;
  onToggle: () => void;
}

function LayerToggle({ label, active, color, icon: Icon, onToggle }: LayerToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
      style={{
        background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
        borderColor: active ? color : 'rgba(255,255,255,0.1)',
        color: active ? color : '#8B9AB4',
        boxShadow: active ? `0 0 12px ${color}30` : 'none',
      }}
    >
      <Icon size={13} />
      <span>{label}</span>
      {active
        ? <Eye size={11} className="opacity-60" />
        : <EyeOff size={11} className="opacity-40" />}
    </motion.button>
  );
}

export function CommandBar() {
  const { state, setState } = useDigitalTwin();
  const { showBuildings, showIncidents, showResponders } = state;
  const [emergencyMode, setEmergencyMode] = useState(false);
  const cameraResetRef = useRef<(() => void) | null>(null);

  // Listen for camera reset dispatched from the 3D canvas
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      cameraResetRef.current = e.detail;
    };
    window.addEventListener('register-camera-reset', handler as EventListener);
    return () => window.removeEventListener('register-camera-reset', handler as EventListener);
  }, []);

  const toggle = (key: 'showBuildings' | 'showIncidents' | 'showResponders') =>
    setState((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleEmergency = () => {
    setEmergencyMode((v) => !v);
    document.documentElement.style.setProperty(
      '--emergency-overlay',
      emergencyMode ? '0' : '0.06',
    );
  };

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(7,11,18,0.82)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Brand chip */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#14F1D9]/30 to-[#7C5CFF]/30 flex items-center justify-center">
          <Layers size={11} className="text-[#14F1D9]" />
        </div>
        <span className="text-[10px] font-bold text-[#14F1D9] tracking-wider uppercase">Digital Twin</span>
      </div>

      {/* Layer toggles */}
      <div className="flex items-center gap-1.5">
        <LayerToggle
          label="Buildings"
          active={showBuildings}
          color="#14F1D9"
          icon={Building2}
          onToggle={() => toggle('showBuildings')}
        />
        <LayerToggle
          label="Incidents"
          active={showIncidents}
          color="#FF4D6D"
          icon={AlertTriangle}
          onToggle={() => toggle('showIncidents')}
        />
        <LayerToggle
          label="Responders"
          active={showResponders}
          color="#22D3A5"
          icon={Users}
          onToggle={() => toggle('showResponders')}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10" />

      {/* Camera Reset */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => window.dispatchEvent(new CustomEvent('camera-reset'))}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8B9AB4] hover:text-[#F0F4FF] border border-white/10 hover:border-white/20 transition-all"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <RotateCcw size={12} />
        Reset Cam
      </motion.button>

      {/* Emergency Mode */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleEmergency}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
        style={{
          background: emergencyMode ? 'rgba(255,77,109,0.15)' : 'rgba(255,255,255,0.03)',
          borderColor: emergencyMode ? '#FF4D6D' : 'rgba(255,255,255,0.1)',
          color: emergencyMode ? '#FF4D6D' : '#8B9AB4',
          boxShadow: emergencyMode ? '0 0 20px rgba(255,77,109,0.3)' : 'none',
        }}
      >
        <Zap size={12} className={emergencyMode ? 'animate-pulse' : ''} />
        {emergencyMode ? 'EMERGENCY ON' : 'Emergency'}
      </motion.button>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
        <Activity size={11} className="text-[#22D3A5]" />
        <span className="text-[9px] font-mono text-[#22D3A5] font-bold">LIVE</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] animate-pulse" />
      </div>
    </motion.div>
  );
}
