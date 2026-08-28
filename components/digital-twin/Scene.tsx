'use client';

/**
 * Scene.tsx — The top-level Digital Twin scene.
 * This file is dynamically imported with ssr:false from page.tsx,
 * so it is 100% client-side. All Three.js / R3F imports are safe here.
 */

import React, { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Html, Text, Edges } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Building2, AlertTriangle, Users, RotateCcw, Layers,
  Zap, Eye, EyeOff, Activity, X, ChevronRight,
  Flame, MapPin, Clock, Shield, Navigation, RefreshCw, Maximize2, Minimize2,
} from 'lucide-react';
import { useDigitalTwin } from '@/context/DigitalTwinContext';
import { buildings } from '@/lib/scene/buildings';

// ─── Coordinate helpers ───────────────────────────────────────────────────────

// Scale factor to convert lat/lng to 3D units. 
// A higher scale spreads the buildings out more.
const SCALE = 40000;
const BASE_LAT = 37.4220;
const BASE_LNG = -122.0840;

function toXZ(lat: number, lng: number): [number, number] {
  return [
    (lng - BASE_LNG) * SCALE,
    (lat - BASE_LAT) * SCALE,
  ];
}

// ─── 3D: Campus Ground ────────────────────────────────────────────────────────

function CampusGround() {
  return (
    <group>
      {/* Base Pedestal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[250, 260, 1, 64]} />
        <meshStandardMaterial color="#0A0F1A" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Glowing Edge Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[248, 250, 64]} />
        <meshBasicMaterial color="#14F1D9" transparent opacity={0.15} />
      </mesh>

      {/* Main Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color="#050810" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Grid */}
      <Grid
        args={[800, 800]}
        cellSize={15}
        cellThickness={0.4}
        cellColor="#14F1D9"
        sectionSize={75}
        sectionThickness={1}
        sectionColor="#7C5CFF"
        fadeDistance={300}
        fadeStrength={3}
        infiniteGrid
      />
    </group>
  );
}

// ─── 3D: Buildings ────────────────────────────────────────────────────────────

const HEALTH_COLORS: Record<string, string> = {
  safe: '#22D3A5',
  warning: '#FFB347',
  critical: '#FF4D6D',
  medical: '#7C5CFF',
};

function BuildingMesh({
  building,
  onSelect,
}: {
  building: typeof buildings[number];
  onSelect: (b: typeof buildings[number]) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [x, z] = toXZ(building.position.lat, building.position.lng);
  const h = building.height;
  const color = HEALTH_COLORS[building.health] ?? '#8B9AB4';

  return (
    <group position={[x, 0, z]}>
      {/* Main building box */}
      <mesh
        position={[0, h / 2 + (hovered ? 1 : 0), 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(building); }}
      >
        <boxGeometry args={[12, h, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
        <Edges
          linewidth={2}
          threshold={15}
          color={color}
          transparent
          opacity={hovered ? 1 : 0.5}
        />
      </mesh>

      {/* Rooftop glow ring */}
      <mesh position={[0, h + (hovered ? 1 : 0) + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, h + 6, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div style={{
            background: 'rgba(7,11,18,0.92)',
            border: `1px solid ${color}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            color,
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
          }}>
            {building.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function BuildingLayer({ onSelect }: { onSelect: (b: typeof buildings[number]) => void }) {
  const { state } = useDigitalTwin();
  if (!state.showBuildings) return null;
  return (
    <group>
      {buildings.map((b) => (
        <BuildingMesh key={b.id} building={b} onSelect={onSelect} />
      ))}
    </group>
  );
}

// ─── 3D: Incidents ────────────────────────────────────────────────────────────

const INCIDENT_COLORS: Record<string, string> = {
  fire: '#FF4D6D',
  medical: '#7C5CFF',
  crowd: '#FFB347',
  electrical: '#14F1D9',
  flood: '#3B82F6',
  default: '#8B9AB4',
};

// Demo incidents shown when Supabase has no data
const DEMO_INCIDENTS = [
  { id: 'd1', title: 'Lab Fire', type: 'fire', severity: 'critical', latitude: 37.4221, longitude: -122.0841, location: 'Science Block' },
  { id: 'd2', title: 'Cardiac Event', type: 'medical', severity: 'high', latitude: 37.4240, longitude: -122.0840, location: 'Hostel A' },
  { id: 'd3', title: 'Crowd Surge', type: 'crowd', severity: 'medium', latitude: 37.4250, longitude: -122.0842, location: 'Auditorium' },
];

function IncidentMarker({ incident }: { incident: typeof DEMO_INCIDENTS[number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const color = INCIDENT_COLORS[incident.type] ?? INCIDENT_COLORS.default;
  const [x, z] = toXZ(incident.latitude, incident.longitude);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      if (ref.current) {
        const t = Date.now() / 600;
        ref.current.position.y = 14 + Math.sin(t) * 1.5;
        ref.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15);
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <group position={[x, 0, z]}>
      {/* Vertical beam */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 14, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Pulsing sphere */}
      <mesh ref={ref} position={[0, 14, 0]}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Label */}
      <Html position={[0, 20, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(7,11,18,0.88)',
          border: `1px solid ${color}`,
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: 10,
          color,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)',
        }}>
          {incident.type.toUpperCase()} · {incident.location}
        </div>
      </Html>
    </group>
  );
}

function IncidentLayer() {
  const { state } = useDigitalTwin();
  if (!state.showIncidents) return null;
  const data = state.incidents.length > 0 ? state.incidents : DEMO_INCIDENTS;
  return (
    <group>
      {(data as typeof DEMO_INCIDENTS).map((inc) => (
        <IncidentMarker key={inc.id} incident={inc} />
      ))}
    </group>
  );
}

// ─── 3D: Responders ───────────────────────────────────────────────────────────

const DEMO_RESPONDERS = [
  { id: 'r1', name: 'Unit Alpha', role: 'fire_fighter', status: 'en_route', latitude: 37.4222, longitude: -122.0843 },
  { id: 'r2', name: 'Medic 7', role: 'medic', status: 'active', latitude: 37.4238, longitude: -122.0839 },
];

const ROLE_COLORS: Record<string, string> = {
  fire_fighter: '#FF4D6D',
  medic: '#7C5CFF',
  security: '#14F1D9',
  officer: '#FFB347',
};

function ResponderMarker({ responder }: { responder: typeof DEMO_RESPONDERS[number] }) {
  const ref = useRef<THREE.Group>(null!);
  const [x, z] = toXZ(responder.latitude, responder.longitude);
  const color = ROLE_COLORS[responder.role] ?? '#F0F4FF';

  useEffect(() => {
    let raf: number;
    const animate = () => {
      if (ref.current) {
        ref.current.position.y = Math.sin(Date.now() / 500) * 0.5;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <group position={[x, 2, z]}>
      <group ref={ref}>
        {/* Body */}
        <mesh position={[0, 1.5, 0]}>
          <capsuleGeometry args={[0.6, 1.5, 4, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function ResponderLayer() {
  const { state } = useDigitalTwin();
  if (!state.showResponders) return null;
  const data = state.responders.length > 0 ? state.responders : DEMO_RESPONDERS;
  return (
    <group>
      {(data as typeof DEMO_RESPONDERS).map((r) => (
        <ResponderMarker key={r.id} responder={r} />
      ))}
    </group>
  );
}

// ─── UI: Command Bar ──────────────────────────────────────────────────────────

function CommandBar({ onResetCamera }: { onResetCamera: () => void }) {
  const { state, setState } = useDigitalTwin();
  const [emergencyMode, setEmergencyMode] = useState(false);

  const toggle = (key: 'showBuildings' | 'showIncidents' | 'showResponders') =>
    setState((p) => ({ ...p, [key]: !p[key] }));

  const toggleDefs = [
    { key: 'showBuildings' as const, label: 'Buildings', color: '#14F1D9', icon: Building2 },
    { key: 'showIncidents' as const, label: 'Incidents', color: '#FF4D6D', icon: AlertTriangle },
    { key: 'showResponders' as const, label: 'Responders', color: '#22D3A5', icon: Users },
  ];

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl select-none"
      style={{ background: 'rgba(7,11,18,0.85)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
        <Layers size={13} className="text-[#14F1D9]" />
        <span className="text-[10px] font-bold text-[#14F1D9] uppercase tracking-widest">Digital Twin</span>
      </div>

      {/* Layer toggles */}
      {toggleDefs.map(({ key, label, color, icon: Icon }) => {
        const active = state[key];
        return (
          <motion.button
            key={key}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => toggle(key)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: active ? `${color}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
              color: active ? color : '#8B9AB4',
              boxShadow: active ? `0 0 12px ${color}30` : 'none',
            }}
          >
            <Icon size={12} />
            {label}
            {active ? <Eye size={10} className="opacity-60" /> : <EyeOff size={10} className="opacity-40" />}
          </motion.button>
        );
      })}

      <div className="w-px h-5 bg-white/10" />

      {/* Camera Reset */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onResetCamera}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#8B9AB4] hover:text-white border border-white/10 hover:border-white/20 transition-all"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <RotateCcw size={11} /> Reset
      </motion.button>

      {/* Emergency Mode */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setEmergencyMode((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
        style={{
          background: emergencyMode ? 'rgba(255,77,109,0.15)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${emergencyMode ? '#FF4D6D' : 'rgba(255,255,255,0.1)'}`,
          color: emergencyMode ? '#FF4D6D' : '#8B9AB4',
          boxShadow: emergencyMode ? '0 0 20px rgba(255,77,109,0.25)' : 'none',
        }}
      >
        <Zap size={11} className={emergencyMode ? 'animate-pulse' : ''} />
        {emergencyMode ? 'EMERGENCY' : 'Emergency'}
      </motion.button>

      {/* Live indicator */}
      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A5] animate-pulse" />
        <span className="text-[9px] font-mono text-[#22D3A5] font-bold">LIVE</span>
      </div>
    </motion.div>
  );
}

// ─── UI: Side Panel ───────────────────────────────────────────────────────────

function SidePanel({
  selectedBuilding,
  onClose,
}: {
  selectedBuilding: typeof buildings[number] | null;
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
          style={{ width: 300, background: 'rgba(7,11,18,0.9)', borderLeft: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
          initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
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
              <button onClick={() => setState((p) => ({ ...p, showPanel: false }))} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-white/10 transition-all">
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
                <div key={l} className="p-2 rounded-xl text-center" style={{ background: `${c}0D`, border: `1px solid ${c}25` }}>
                  <div className="text-base font-bold" style={{ color: c }}>{v}</div>
                  <div className="text-[9px] text-[#4A5568]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected building */}
          <AnimatePresence>
            {selectedBuilding && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="flex-shrink-0 px-4 py-3 border-b border-white/[0.07] overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={13} style={{ color: HEALTH_COLORS[selectedBuilding.health] ?? '#8B9AB4' }} />
                  <span className="text-sm font-semibold text-[#F0F4FF]">{selectedBuilding.name}</span>
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: `${HEALTH_COLORS[selectedBuilding.health]}20`, color: HEALTH_COLORS[selectedBuilding.health] ?? '#8B9AB4' }}>
                    {selectedBuilding.health?.toUpperCase()}
                  </span>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setGenRoute(true); setTimeout(() => setGenRoute(false), 2000); }}
                  disabled={genRoute}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(20,241,217,0.12)', border: '1px solid rgba(20,241,217,0.4)', color: '#14F1D9' }}
                >
                  {genRoute ? (
                    <><div className="w-3 h-3 border-2 border-t-[#14F1D9] border-r-transparent rounded-full animate-spin" />Generating…</>
                  ) : (
                    <><Navigation size={12} />Generate Evacuation Route</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex-shrink-0 flex gap-1 px-4 py-2 border-b border-white/[0.07]">
            {(['incidents', 'responders', 'info'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={{ background: tab === t ? 'rgba(20,241,217,0.1)' : 'transparent', color: tab === t ? '#14F1D9' : '#4A5568', border: `1px solid ${tab === t ? 'rgba(20,241,217,0.3)' : 'transparent'}` }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
            {tab === 'incidents' && (incidents as typeof DEMO_INCIDENTS).map((inc) => {
              const c = INCIDENT_COLORS[inc.type] ?? '#8B9AB4';
              return (
                <div key={inc.id} className="p-2.5 rounded-xl" style={{ background: `${c}08`, border: `1px solid ${c}25` }}>
                  <div className="flex items-center gap-2">
                    <Flame size={12} style={{ color: c }} />
                    <span className="text-[11px] font-semibold text-[#F0F4FF] flex-1">{inc.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${c}20`, color: c }}>{inc.severity?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={9} className="text-[#4A5568]" />
                    <span className="text-[9px] text-[#8B9AB4]">{inc.location}</span>
                  </div>
                </div>
              );
            })}

            {tab === 'responders' && (responders as typeof DEMO_RESPONDERS).map((r) => {
              const c = ROLE_COLORS[r.role] ?? '#F0F4FF';
              return (
                <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22D3A5' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-[#C5CDE8]">{r.name}</div>
                    <div className="text-[9px] uppercase" style={{ color: c }}>{r.role.replace('_', ' ')}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,211,165,0.12)', color: '#22D3A5' }}>{r.status.replace('_', ' ')}</span>
                </div>
              );
            })}

            {tab === 'info' && (
              <div className="space-y-2">
                {[
                  { l: 'Supabase Realtime', s: 'Connected', c: '#22D3A5' },
                  { l: '3D Render Engine', s: 'Active', c: '#22D3A5' },
                  { l: 'AI Simulation', s: 'Standby', c: '#FFB347' },
                  { l: 'Pathfinder', s: 'Ready', c: '#14F1D9' },
                ].map(({ l, s, c }) => (
                  <div key={l} className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-[11px] text-[#8B9AB4]">{l}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: c }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c }} />{s}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-2 border-t border-white/[0.07] flex items-center justify-between">
            <span className="text-[9px] text-[#4A5568] font-mono">REALTIME · <span className="text-[#22D3A5]">ON</span></span>
            <button className="flex items-center gap-1 text-[9px] text-[#4A5568] hover:text-[#8B9AB4]">
              <RefreshCw size={9} /> Sync
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── UI: Mini Map placeholder ─────────────────────────────────────────────────

function MiniMapWidget() {
  const { state } = useDigitalTwin();
  const [expanded, setExpanded] = useState(false);
  if (!state.showMiniMap) return null;
  const w = expanded ? 220 : 140;
  const h = expanded ? 160 : 110;

  return (
    <motion.div
      className="absolute bottom-6 left-6 z-40 rounded-xl overflow-hidden"
      style={{ background: 'rgba(7,11,18,0.85)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      animate={{ width: w, height: h }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(7,11,18,0.95), transparent)' }}>
        <span className="text-[9px] font-bold text-[#14F1D9] uppercase tracking-widest">Campus Map</span>
        <button onClick={() => setExpanded(v => !v)} className="text-[#8B9AB4] hover:text-white transition-colors">
          {expanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
        </button>
      </div>

      {/* Schematic campus map */}
      <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ display: 'block' }}>
        <rect width="220" height="160" fill="#0A0F1A" />
        {/* Roads */}
        <line x1="110" y1="0" x2="110" y2="160" stroke="#1A2535" strokeWidth="8" />
        <line x1="0" y1="80" x2="220" y2="80" stroke="#1A2535" strokeWidth="8" />
        {/* Buildings */}
        {buildings.map((b, i) => {
          const col = x => ((x - BASE_LNG) * SCALE / 5 + 110);
          const row = y => (-(y - BASE_LAT) * SCALE / 5 + 80);
          const bx = col(b.position.lng);
          const by = row(b.position.lat);
          const color = HEALTH_COLORS[b.health] ?? '#8B9AB4';
          return (
            <g key={b.id}>
              <rect x={bx - 6} y={by - 6} width="12" height="12" rx="2" fill={color} opacity="0.8" />
            </g>
          );
        })}
        {/* Incident markers */}
        {DEMO_INCIDENTS.map(inc => {
          const col = x => ((x - BASE_LNG) * SCALE / 5 + 110);
          const row = y => (-(y - BASE_LAT) * SCALE / 5 + 80);
          const c = INCIDENT_COLORS[inc.type] ?? '#8B9AB4';
          return (
            <circle key={inc.id} cx={col(inc.longitude)} cy={row(inc.latitude)} r="4" fill={c} opacity="0.9">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-1"
        style={{ background: 'linear-gradient(to top, rgba(7,11,18,0.95), transparent)' }}>
        <span className="flex items-center gap-1 text-[8px] text-[#8B9AB4]"><span className="w-2 h-2 rounded-sm bg-[#FF4D6D]" />Incident</span>
        <span className="flex items-center gap-1 text-[8px] text-[#8B9AB4]"><span className="w-2 h-2 rounded-sm bg-[#22D3A5]" />Safe</span>
      </div>
    </motion.div>
  );
}

// ─── Root Scene ───────────────────────────────────────────────────────────────

export default function Scene() {
  const { state, setState } = useDigitalTwin();
  const [selectedBuilding, setSelectedBuilding] = useState<typeof buildings[number] | null>(null);
  const orbitRef = useRef<any>(null);

  const resetCamera = useCallback(() => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  }, []);

  const openPanel = () => setState((p) => ({ ...p, showPanel: true }));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#070B12', overflow: 'hidden' }}>
      {/* ── Three.js Canvas ──────────────────────────────────────── */}
      <Canvas
        camera={{ position: [40, 35, 40], fov: 45 }}
        gl={{ antialias: true }}
        shadows
        style={{ position: 'absolute', inset: 0 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#070B12');
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[30, 50, 20]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[0, 20, 0]} color="#14F1D9" intensity={0.8} distance={200} />

          {/* Stars */}
          <Stars radius={200} depth={80} count={5000} factor={5} saturation={0} fade speed={0.4} />

          {/* Ground */}
          <CampusGround />

          {/* Scene Layers */}
          <BuildingLayer onSelect={(b) => { setSelectedBuilding(b); openPanel(); }} />
          <IncidentLayer />
          <ResponderLayer />

          {/* Camera */}
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
            target={[0, 0, 0]}
          />

          {/* Post-processing (Bloom for neon glow + sci-fi lens effects) */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.2} 
              mipmapBlur 
              intensity={1.5} 
            />
            <ChromaticAberration 
              offset={new THREE.Vector2(0.002, 0.002)} 
              blendFunction={BlendFunction.NORMAL} // from postprocessing
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* ── Overlay UI ──────────────────────────────────────────── */}
      <CommandBar onResetCamera={resetCamera} />
      <SidePanel selectedBuilding={selectedBuilding} onClose={() => setSelectedBuilding(null)} />
      <MiniMapWidget />

      {/* Panel toggle button when panel is hidden */}
      {!state.showPanel && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={openPanel}
          className="absolute top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(7,11,18,0.85)', border: '1px solid rgba(255,255,255,0.1)', color: '#14F1D9', backdropFilter: 'blur(16px)' }}
        >
          <Shield size={13} /> Status Panel
        </motion.button>
      )}
    </div>
  );
}
