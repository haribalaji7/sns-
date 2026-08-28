'use client';

/**
 * Scene.tsx — Top-Level Campus Safety AI Digital Twin 3D View
 * Dynamic Next.js client component with React Three Fiber, Drei, & Postprocessing.
 */

import React, { useEffect, useRef, useState, Suspense, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Building2, AlertTriangle, Users, RotateCcw, Layers,
  Zap, Eye, EyeOff, X, Flame, MapPin, Shield,
  Navigation, RefreshCw, Maximize2, Minimize2, Gauge,
} from 'lucide-react';
import { useDigitalTwin } from '@/context/DigitalTwinContext';
import {
  buildings,
  CampusBuilding,
  toXZ,
  BASE_LAT,
  BASE_LNG,
  SCALE,
  HEALTH_COLORS,
  INCIDENT_COLORS,
  ROLE_COLORS,
} from '@/lib/scene/buildings';
import { BuildingLayer } from './BuildingLayer';
import { IncidentLayer, DEMO_INCIDENTS } from './IncidentLayer';
import { ResponderLayer, DEMO_RESPONDERS } from './ResponderLayer';
import { CampusGround } from './CampusGround';

// Default Campus Overview Camera Coordinates
const DEFAULT_CAMERA_POS = new THREE.Vector3(85, 80, 145);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 10, 90);

// ─── 3D: Smooth Camera Tween Controller ───────────────────────────────────────
interface CameraTweenProps {
  targetPos: THREE.Vector3;
  cameraPos: THREE.Vector3;
  isTransitioning: boolean;
  onTransitionEnd: () => void;
  orbitRef: React.RefObject<any>;
}

function SmoothCameraController({
  targetPos,
  cameraPos,
  isTransitioning,
  onTransitionEnd,
  orbitRef,
}: CameraTweenProps) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!isTransitioning) return;

    const dampSpeed = 6.0;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraPos.x, dampSpeed, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraPos.y, dampSpeed, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraPos.z, dampSpeed, delta);

    if (orbitRef.current) {
      orbitRef.current.target.x = THREE.MathUtils.damp(orbitRef.current.target.x, targetPos.x, dampSpeed, delta);
      orbitRef.current.target.y = THREE.MathUtils.damp(orbitRef.current.target.y, targetPos.y, dampSpeed, delta);
      orbitRef.current.target.z = THREE.MathUtils.damp(orbitRef.current.target.z, targetPos.z, dampSpeed, delta);
      orbitRef.current.update();
    }

    const distCam = camera.position.distanceTo(cameraPos);
    const distTarget = orbitRef.current ? orbitRef.current.target.distanceTo(targetPos) : 0;

    if (distCam < 0.25 && distTarget < 0.25) {
      camera.position.copy(cameraPos);
      if (orbitRef.current) {
        orbitRef.current.target.copy(targetPos);
        orbitRef.current.update();
      }
      onTransitionEnd();
    }
  });

  return null;
}

// ─── 3D: Dynamic Emergency Lighting Controller ───────────────────────────────
function DynamicLighting({ emergencyMode }: { emergencyMode: boolean }) {
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const dirLightRef = useRef<THREE.DirectionalLight>(null!);
  const strobeLightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }, delta) => {
    const targetAmbientIntensity = emergencyMode ? 0.22 : 0.55;
    const targetDirIntensity = emergencyMode ? 0.45 : 1.2;
    const targetAmbientColor = emergencyMode ? new THREE.Color('#FF1E40') : new THREE.Color('#1E293B');
    const targetDirColor = emergencyMode ? new THREE.Color('#990018') : new THREE.Color('#F0F4FF');

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = THREE.MathUtils.damp(ambientLightRef.current.intensity, targetAmbientIntensity, 4, delta);
      ambientLightRef.current.color.lerp(targetAmbientColor, delta * 3);
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.damp(dirLightRef.current.intensity, targetDirIntensity, 4, delta);
      dirLightRef.current.color.lerp(targetDirColor, delta * 3);
    }
    if (strobeLightRef.current) {
      if (emergencyMode) {
        const pulse = (Math.sin(clock.getElapsedTime() * 7) + 1) / 2;
        strobeLightRef.current.intensity = 0.6 + pulse * 2.8;
      } else {
        strobeLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.55} color="#1E293B" />
      <directionalLight
        ref={dirLightRef}
        position={[40, 80, 40]}
        intensity={1.2}
        color="#F0F4FF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      {/* Cyan Campus Accent Ambient Light */}
      <pointLight position={[0, 25, 90]} color="#14F1D9" intensity={0.7} distance={260} />
      {/* Emergency Red Flashing Strobe Beacon Light */}
      <pointLight ref={strobeLightRef} position={[0, 40, 90]} color="#FF1E40" intensity={0} distance={320} />
    </>
  );
}

// ─── 3D: Realtime Performance & FPS Monitor ──────────────────────────────────
function PerformanceMonitor({
  onFpsUpdate,
  onAutoTierChange,
}: {
  onFpsUpdate: (fps: number) => void;
  onAutoTierChange: (tier: 'high' | 'medium' | 'low') => void;
}) {
  const frameCount = useRef(0);
  const timeAcc = useRef(0);
  const sampleFrames = useRef<number[]>([]);
  const hasAutoAssessed = useRef(false);

  useFrame((_, delta) => {
    frameCount.current++;
    timeAcc.current += delta;

    if (timeAcc.current >= 0.5) {
      const currentFps = Math.round(frameCount.current / timeAcc.current);
      onFpsUpdate(currentFps);

      if (!hasAutoAssessed.current) {
        sampleFrames.current.push(currentFps);
        if (sampleFrames.current.length >= 6) {
          hasAutoAssessed.current = true;
          const avgFps = sampleFrames.current.reduce((a, b) => a + b, 0) / sampleFrames.current.length;
          if (avgFps < 30) {
            onAutoTierChange('low');
          } else if (avgFps < 50) {
            onAutoTierChange('medium');
          } else {
            onAutoTierChange('high');
          }
        }
      }

      frameCount.current = 0;
      timeAcc.current = 0;
    }
  });

  return null;
}

// ─── UI: Command Bar ──────────────────────────────────────────────────────────
function CommandBar({
  onResetCamera,
  fps,
  effectiveQuality,
}: {
  onResetCamera: () => void;
  fps: number;
  effectiveQuality: 'high' | 'medium' | 'low';
}) {
  const { state, setState } = useDigitalTwin();
  const { emergencyMode, quality, showBuildings, showIncidents, showResponders } = state;

  const toggleLayer = (key: 'showBuildings' | 'showIncidents' | 'showResponders') =>
    setState((p) => ({ ...p, [key]: !p[key] }));

  const toggleEmergency = () =>
    setState((p) => ({ ...p, emergencyMode: !p.emergencyMode }));

  const cycleQuality = () => {
    setState((p) => {
      const modes: Array<'auto' | 'high' | 'medium' | 'low'> = ['auto', 'high', 'medium', 'low'];
      const nextIdx = (modes.indexOf(p.quality || 'auto') + 1) % modes.length;
      return { ...p, quality: modes[nextIdx] };
    });
  };

  const toggleDefs = [
    { key: 'showBuildings' as const, label: 'Buildings', color: '#14F1D9', icon: Building2, active: showBuildings },
    { key: 'showIncidents' as const, label: 'Incidents', color: '#FF4D6D', icon: AlertTriangle, active: showIncidents },
    { key: 'showResponders' as const, label: 'Responders', color: '#22D3A5', icon: Users, active: showResponders },
  ];

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl select-none"
      style={{
        background: 'rgba(7,11,18,0.88)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
        <Layers size={13} className="text-[#14F1D9]" />
        <span className="text-[10px] font-bold text-[#14F1D9] uppercase tracking-widest">Digital Twin</span>
      </div>

      {/* Layer toggles */}
      {toggleDefs.map(({ key, label, color, icon: Icon, active }) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleLayer(key)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
            color: active ? color : '#8B9AB4',
            boxShadow: active ? `0 0 12px ${color}30` : 'none',
          }}
        >
          <Icon size={12} />
          {label}
          {active ? <Eye size={10} className="opacity-70" /> : <EyeOff size={10} className="opacity-40" />}
        </motion.button>
      ))}

      <div className="w-px h-5 bg-white/10" />

      {/* Reset Camera */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onResetCamera}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#8B9AB4] hover:text-white border border-white/10 hover:border-white/20 transition-all"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <RotateCcw size={11} /> Reset Cam
      </motion.button>

      {/* Quality Gate Selector */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={cycleQuality}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border border-white/10 hover:border-white/25"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: effectiveQuality === 'high' ? '#14F1D9' : effectiveQuality === 'medium' ? '#FFB347' : '#8B9AB4',
        }}
        title={`Render Quality: ${quality?.toUpperCase()} (Active: ${effectiveQuality.toUpperCase()}, ${fps} FPS)`}
      >
        <Gauge size={12} />
        <span className="font-mono text-[10px]">
          {quality === 'auto' ? `AUTO (${effectiveQuality.toUpperCase()})` : quality?.toUpperCase()}
        </span>
        <span className="text-[9px] text-[#8B9AB4] font-mono">{fps} FPS</span>
      </motion.button>

      {/* Emergency Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleEmergency}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
        style={{
          background: emergencyMode ? 'rgba(255,77,109,0.22)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${emergencyMode ? '#FF4D6D' : 'rgba(255,255,255,0.1)'}`,
          color: emergencyMode ? '#FF4D6D' : '#8B9AB4',
          boxShadow: emergencyMode ? '0 0 20px rgba(255,77,109,0.35)' : 'none',
        }}
      >
        <Zap size={12} className={emergencyMode ? 'animate-pulse text-[#FF4D6D]' : ''} />
        {emergencyMode ? 'EMERGENCY ON' : 'Emergency'}
      </motion.button>

      {/* Live Status Indicator */}
      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
        <span className={`w-1.5 h-1.5 rounded-full ${emergencyMode ? 'bg-[#FF4D6D] animate-ping' : 'bg-[#22D3A5] animate-pulse'}`} />
        <span className="text-[9px] font-mono font-bold" style={{ color: emergencyMode ? '#FF4D6D' : '#22D3A5' }}>
          {emergencyMode ? 'ALERT' : 'LIVE'}
        </span>
      </div>
    </motion.div>
  );
}

// ─── UI: Side Panel ───────────────────────────────────────────────────────────
function SidePanel({
  selectedBuilding,
  onClose,
}: {
  selectedBuilding: CampusBuilding | null;
  onClose: () => void;
}) {
  const { state, setState } = useDigitalTwin();
  const { showPanel } = state;
  const [tab, setTab] = useState<'incidents' | 'responders' | 'info'>('incidents');
  const [genRoute, setGenRoute] = useState(false);

  const incidents = state.incidents.length > 0 ? state.incidents : DEMO_INCIDENTS;
  const responders = state.responders.length > 0 ? state.responders : DEMO_RESPONDERS;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          className="absolute top-0 right-0 h-full flex flex-col z-40"
          style={{
            width: 320,
            background: 'rgba(7,11,18,0.92)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          }}
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-white/[0.07]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/30 flex items-center justify-center">
                  <Shield size={15} className="text-[#14F1D9]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F0F4FF]">Campus Status</div>
                  <div className="text-[10px] text-[#8B9AB4]">AI Digital Twin Command</div>
                </div>
              </div>
              <button
                onClick={() => setState((p) => ({ ...p, showPanel: false }))}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={13} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { l: 'Incidents', v: incidents.length, c: '#FF4D6D' },
                { l: 'Responders', v: responders.length, c: '#22D3A5' },
                { l: 'Buildings', v: buildings.length, c: '#14F1D9' },
              ].map(({ l, v, c }) => (
                <div
                  key={l}
                  className="p-2 rounded-xl text-center"
                  style={{ background: `${c}0D`, border: `1px solid ${c}25` }}
                >
                  <div className="text-base font-bold" style={{ color: c }}>{v}</div>
                  <div className="text-[9px] text-[#8B9AB4]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Building Details */}
          <AnimatePresence>
            {selectedBuilding && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex-shrink-0 px-4 py-3 border-b border-white/[0.07] overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 size={14} style={{ color: HEALTH_COLORS[selectedBuilding.health] ?? '#8B9AB4' }} />
                  <span className="text-sm font-semibold text-[#F0F4FF]">{selectedBuilding.name}</span>
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: `${HEALTH_COLORS[selectedBuilding.health]}20`,
                      color: HEALTH_COLORS[selectedBuilding.health] ?? '#8B9AB4',
                    }}
                  >
                    {selectedBuilding.health?.toUpperCase()}
                  </span>
                </div>

                <div className="text-[10px] text-[#8B9AB4] mb-2 flex items-center gap-2">
                  <span>{selectedBuilding.floors} Floors</span>
                  <span>•</span>
                  <span>{selectedBuilding.footprint[0]}m × {selectedBuilding.footprint[1]}m</span>
                  {selectedBuilding.occupancy && (
                    <>
                      <span>•</span>
                      <span>👥 {selectedBuilding.occupancy}</span>
                    </>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setGenRoute(true);
                    setTimeout(() => setGenRoute(false), 2000);
                  }}
                  disabled={genRoute}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: 'rgba(20,241,217,0.12)',
                    border: '1px solid rgba(20,241,217,0.4)',
                    color: '#14F1D9',
                  }}
                >
                  {genRoute ? (
                    <>
                      <div className="w-3 h-3 border-2 border-t-[#14F1D9] border-r-transparent rounded-full animate-spin" />
                      Computing A* Safe Trail…
                    </>
                  ) : (
                    <>
                      <Navigation size={12} />
                      Generate Safe Evacuation Route
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex-shrink-0 flex gap-1 px-4 py-2 border-b border-white/[0.07]">
            {(['incidents', 'responders', 'info'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={{
                  background: tab === t ? 'rgba(20,241,217,0.1)' : 'transparent',
                  color: tab === t ? '#14F1D9' : '#8B9AB4',
                  border: `1px solid ${tab === t ? 'rgba(20,241,217,0.3)' : 'transparent'}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
          >
            {tab === 'incidents' &&
              (incidents as typeof DEMO_INCIDENTS).map((inc) => {
                const c = INCIDENT_COLORS[inc.type] ?? '#8B9AB4';
                return (
                  <div key={inc.id} className="p-2.5 rounded-xl" style={{ background: `${c}08`, border: `1px solid ${c}25` }}>
                    <div className="flex items-center gap-2">
                      <Flame size={12} style={{ color: c }} />
                      <span className="text-[11px] font-semibold text-[#F0F4FF] flex-1">{inc.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${c}20`, color: c }}>
                        {inc.severity?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={9} className="text-[#4A5568]" />
                      <span className="text-[9px] text-[#8B9AB4]">{inc.location}</span>
                    </div>
                  </div>
                );
              })}

            {tab === 'responders' &&
              (responders as typeof DEMO_RESPONDERS).map((r) => {
                const c = ROLE_COLORS[r.role] ?? '#F0F4FF';
                return (
                  <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22D3A5' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-[#C5CDE8]">{r.name}</div>
                      <div className="text-[9px] uppercase" style={{ color: c }}>{r.role.replace('_', ' ')}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,211,165,0.12)', color: '#22D3A5' }}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}

            {tab === 'info' && (
              <div className="space-y-2">
                {[
                  { l: 'Supabase Realtime', s: 'Connected', c: '#22D3A5' },
                  { l: '3D Render Engine', s: 'Active (R3F)', c: '#22D3A5' },
                  { l: 'AI Blast Simulation', s: 'Running', c: '#14F1D9' },
                  { l: 'A* Pathfinder', s: 'Optimized', c: '#14F1D9' },
                ].map(({ l, s, c }) => (
                  <div key={l} className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-[11px] text-[#8B9AB4]">{l}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: c }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c }} />
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-2 border-t border-white/[0.07] flex items-center justify-between">
            <span className="text-[9px] text-[#4A5568] font-mono">
              REALTIME · <span className="text-[#22D3A5]">ACTIVE</span>
            </span>
            <button className="flex items-center gap-1 text-[9px] text-[#4A5568] hover:text-[#8B9AB4]">
              <RefreshCw size={9} /> Sync
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── UI: Mini Map Widget ──────────────────────────────────────────────────────
function MiniMapWidget({ onSelectBuilding }: { onSelectBuilding: (b: CampusBuilding) => void }) {
  const { state } = useDigitalTwin();
  const [expanded, setExpanded] = useState(false);

  if (!state.showMiniMap) return null;

  const w = expanded ? 240 : 150;
  const h = expanded ? 180 : 120;

  return (
    <motion.div
      className="absolute bottom-6 left-6 z-40 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(7,11,18,0.88)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      animate={{ width: w, height: h }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(7,11,18,0.95), transparent)' }}
      >
        <span className="text-[9px] font-bold text-[#14F1D9] uppercase tracking-widest">Campus Map</span>
        <button onClick={() => setExpanded((v) => !v)} className="text-[#8B9AB4] hover:text-white transition-colors">
          {expanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
        </button>
      </div>

      {/* Schematic 2D Campus SVG */}
      <svg width="100%" height="100%" viewBox="0 0 240 180" style={{ display: 'block' }}>
        <rect width="240" height="180" fill="#0A0F1A" />
        {/* Main Central Spine Path */}
        <line x1="120" y1="10" x2="120" y2="170" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />

        {/* Buildings with distinct footprint sizes */}
        {buildings.map((b) => {
          const col = (lng: number) => (lng - BASE_LNG) * SCALE * 0.7 + 120;
          const row = (lat: number) => -(lat - BASE_LAT) * SCALE * 0.7 + 160;
          const bx = col(b.position.lng);
          const by = row(b.position.lat);
          const color = HEALTH_COLORS[b.health] ?? '#8B9AB4';
          const [fw, fd] = b.footprint;
          const mapW = fw * 0.6;
          const mapH = fd * 0.6;

          return (
            <g key={b.id} onClick={() => onSelectBuilding(b)} style={{ cursor: 'pointer' }}>
              <rect
                x={bx - mapW / 2}
                y={by - mapH / 2}
                width={mapW}
                height={mapH}
                rx="2"
                fill={color}
                opacity="0.85"
                stroke="#14F1D9"
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Incident Hotspot Markers */}
        {DEMO_INCIDENTS.map((inc) => {
          const col = (lng: number) => (lng - BASE_LNG) * SCALE * 0.7 + 120;
          const row = (lat: number) => -(lat - BASE_LAT) * SCALE * 0.7 + 160;
          const c = INCIDENT_COLORS[inc.type] ?? '#8B9AB4';
          return (
            <circle key={inc.id} cx={col(inc.longitude)} cy={row(inc.latitude)} r="4" fill={c} opacity="0.9">
              <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-1"
        style={{ background: 'linear-gradient(to top, rgba(7,11,18,0.95), transparent)' }}
      >
        <span className="flex items-center gap-1 text-[8px] text-[#8B9AB4]">
          <span className="w-1.5 h-1.5 rounded-sm bg-[#FF4D6D]" />Incident
        </span>
        <span className="flex items-center gap-1 text-[8px] text-[#8B9AB4]">
          <span className="w-1.5 h-1.5 rounded-sm bg-[#22D3A5]" />Safe
        </span>
      </div>
    </motion.div>
  );
}

// ─── Master Digital Twin Scene ───────────────────────────────────────────────
export default function Scene() {
  const { state, setState } = useDigitalTwin();
  const { emergencyMode, quality } = state;

  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [fps, setFps] = useState(60);
  const [autoTier, setAutoTier] = useState<'high' | 'medium' | 'low'>('high');

  // Camera tween states
  const orbitRef = useRef<any>(null);
  const [targetCameraPos, setTargetCameraPos] = useState<THREE.Vector3>(DEFAULT_CAMERA_POS.clone());
  const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3>(DEFAULT_CAMERA_TARGET.clone());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine effective quality tier ('auto' uses detected autoTier)
  const effectiveQuality = useMemo<'high' | 'medium' | 'low'>(() => {
    if (quality === 'auto' || !quality) {
      return autoTier;
    }
    return quality;
  }, [quality, autoTier]);

  const openPanel = () => setState((p) => ({ ...p, showPanel: true }));

  // Handle building selection -> Smooth fly camera to building & open side panel
  const handleSelectBuilding = useCallback((b: CampusBuilding) => {
    setSelectedBuilding(b);
    openPanel();

    const [bx, bz] = toXZ(b.position.lat, b.position.lng);
    const height = b.height;

    // Smoothly fly camera to close-up perspective angle
    setTargetLookAt(new THREE.Vector3(bx, height * 0.4, bz));
    setTargetCameraPos(new THREE.Vector3(bx + 32, height + 22, bz + 32));
    setIsTransitioning(true);
  }, []);

  // Handle camera reset
  const handleResetCamera = useCallback(() => {
    setSelectedBuilding(null);
    setTargetLookAt(DEFAULT_CAMERA_TARGET.clone());
    setTargetCameraPos(DEFAULT_CAMERA_POS.clone());
    setIsTransitioning(true);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#070B12', overflow: 'hidden' }}>
      {/* ── Three.js Canvas ──────────────────────────────────────── */}
      <Canvas
        camera={{ position: [85, 80, 145], fov: 45 }}
        gl={{ antialias: effectiveQuality !== 'low', alpha: false, powerPreference: 'high-performance' }}
        shadows={effectiveQuality !== 'low'}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={({ gl }) => {
          gl.setClearColor(emergencyMode ? '#100508' : '#070B12');
        }}
      >
        <Suspense fallback={null}>
          {/* Performance & FPS Measurement */}
          <PerformanceMonitor onFpsUpdate={setFps} onAutoTierChange={setAutoTier} />

          {/* Dynamic Emergency Lighting */}
          <DynamicLighting emergencyMode={emergencyMode} />

          {/* Stars Field */}
          <Stars radius={220} depth={80} count={effectiveQuality === 'low' ? 1500 : 5000} factor={5} saturation={0} fade speed={0.4} />

          {/* Campus Ground (Pedestal, Grid, Walkways, Parking Lot, Low-Poly Trees) */}
          <CampusGround emergencyMode={emergencyMode} />

          {/* Buildings Layer */}
          <BuildingLayer
            onSelect={handleSelectBuilding}
            selectedId={selectedBuilding?.id}
          />

          {/* Incidents Layer (Particle effects, Blast radius, A* Laser Trail) */}
          <IncidentLayer />

          {/* Responders Layer */}
          <ResponderLayer />

          {/* Orbit Controls */}
          <OrbitControls
            ref={orbitRef}
            makeDefault
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={0.05}
            minDistance={8}
            maxDistance={500}
            target={[0, 10, 90]}
          />

          {/* Camera Smooth Tweening Controller */}
          <SmoothCameraController
            targetPos={targetLookAt}
            cameraPos={targetCameraPos}
            isTransitioning={isTransitioning}
            onTransitionEnd={() => setIsTransitioning(false)}
            orbitRef={orbitRef}
          />

          {/* Quality-Gated Post Processing Pipeline */}
          {effectiveQuality === 'high' && (
            <EffectComposer enableNormalPass={false}>
              <Bloom
                luminanceThreshold={0.2}
                mipmapBlur
                intensity={emergencyMode ? 1.8 : 1.4}
              />
              <ChromaticAberration
                offset={new THREE.Vector2(0.0018, 0.0018)}
                blendFunction={BlendFunction.NORMAL}
              />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          )}

          {effectiveQuality === 'medium' && (
            <EffectComposer enableNormalPass={false}>
              <Bloom
                luminanceThreshold={0.25}
                mipmapBlur
                intensity={1.0}
              />
              <Vignette eskil={false} offset={0.1} darkness={1.0} />
            </EffectComposer>
          )}
          {/* Low quality bypasses EffectComposer entirely for optimal mobile & GPU speed */}
        </Suspense>
      </Canvas>

      {/* ── Overlay UI Panels & HUD ──────────────────────────────── */}
      <CommandBar
        onResetCamera={handleResetCamera}
        fps={fps}
        effectiveQuality={effectiveQuality}
      />

      <SidePanel
        selectedBuilding={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
      />

      <MiniMapWidget onSelectBuilding={handleSelectBuilding} />

      {/* Re-open panel button when side panel is closed */}
      {!state.showPanel && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={openPanel}
          className="absolute top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: 'rgba(7,11,18,0.88)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#14F1D9',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Shield size={13} /> Campus Status
        </motion.button>
      )}
    </div>
  );
}
