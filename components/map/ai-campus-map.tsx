'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  UserX,
  Heart,
  Wind,
  Zap,
  Droplets,
  Users,
  Navigation,
  Shield,
  ShieldAlert,
  Radio,
  MapPin,
  Layers,
  Eye,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Activity,
} from 'lucide-react';
import {
  CAMPUS_NODES,
  CAMPUS_EDGES,
  HazardZone,
  findShortestSafePath,
  AStarResult,
  MapPoint,
} from '@/lib/pathfinding/astar';
import { useDashboardStore } from '@/store/dashboard';

export type IncidentCategory = 'all' | 'fire' | 'medical' | 'crowd' | 'electrical' | 'flood';

interface BuildingPolygon {
  id: string;
  name: string;
  code: string;
  points: string; // SVG polygon points
  labelX: number;
  labelY: number;
  riskScore: number;
  occupancy: number;
  capacity: number;
  status: 'safe' | 'caution' | 'danger';
}

const BUILDINGS: BuildingPolygon[] = [
  {
    id: 'b-scib',
    name: 'Science Block B',
    code: 'Z-SCIB',
    points: '160,250 360,240 370,390 170,400',
    labelX: 265,
    labelY: 320,
    riskScore: 94,
    occupancy: 340,
    capacity: 500,
    status: 'danger',
  },
  {
    id: 'b-itb',
    name: 'IT Data Center',
    code: 'Z-ITB',
    points: '640,200 820,190 830,340 650,350',
    labelX: 735,
    labelY: 270,
    riskScore: 62,
    occupancy: 120,
    capacity: 300,
    status: 'caution',
  },
  {
    id: 'b-ath',
    name: 'Athletic Center',
    code: 'Z-ATH',
    points: '240,620 440,610 450,780 250,790',
    labelX: 345,
    labelY: 700,
    riskScore: 71,
    occupancy: 190,
    capacity: 400,
    status: 'caution',
  },
  {
    id: 'b-lib',
    name: 'Main Library',
    code: 'Z-LIB',
    points: '580,500 780,490 790,670 590,680',
    labelX: 685,
    labelY: 590,
    riskScore: 18,
    occupancy: 620,
    capacity: 800,
    status: 'safe',
  },
  {
    id: 'b-admin',
    name: 'Administration Quad',
    code: 'Z-ADMIN',
    points: '400,160 560,150 570,250 410,260',
    labelX: 485,
    labelY: 205,
    riskScore: 12,
    occupancy: 280,
    capacity: 400,
    status: 'safe',
  },
  {
    id: 'b-gate',
    name: 'Main Gate Complex',
    code: 'Z-GATE',
    points: '80,120 180,110 190,210 90,220',
    labelX: 135,
    labelY: 165,
    riskScore: 22,
    occupancy: 45,
    capacity: 100,
    status: 'safe',
  },
];

const SAFE_ASSEMBLY_ZONES = [
  { id: 'safe-1', name: 'North Quad Assembly', x: 500, y: 120, radius: 45, occupancy: 210 },
  { id: 'safe-2', name: 'West Gate Safe Haven', x: 120, y: 180, radius: 40, occupancy: 45 },
  { id: 'safe-3', name: 'Athletic Field Alpha', x: 420, y: 880, radius: 55, occupancy: 180 },
  { id: 'safe-4', name: 'East Perimeter Park', x: 880, y: 480, radius: 45, occupancy: 95 },
];

const BLOCKED_ROAD_SEGMENTS = [
  { id: 'block-1', x1: 180, y1: 340, x2: 120, y2: 180, label: 'West Fume Corridor Blocked (Smoke)' },
  { id: 'block-2', x1: 680, y1: 280, x2: 640, y2: 520, label: 'IT South Crossway Flooded' },
];

interface MapIncident {
  id: string;
  type: IncidentCategory;
  title: string;
  location: string;
  x: number;
  y: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  radius: number; // Danger radius
  nodeId: string;
  description: string;
}

const MAP_INCIDENTS: MapIncident[] = [
  {
    id: 'inc-fire',
    type: 'fire',
    title: 'Lab 302 Chemical Fire',
    location: 'Science Block B – Floor 3',
    x: 230,
    y: 320,
    severity: 'critical',
    radius: 75,
    nodeId: 'N-SCIB-302',
    description: '340°C thermal anomaly + smoke detected near fume hood.',
  },
  {
    id: 'inc-medical',
    type: 'medical',
    title: 'Cardiac Emergency',
    location: 'Athletic Pavilion – Track',
    x: 320,
    y: 680,
    severity: 'high',
    radius: 50,
    nodeId: 'N-ATH-TRACK',
    description: 'Student collapsed on track. AED beacon activated.',
  },
  {
    id: 'inc-crowd',
    type: 'crowd',
    title: 'Auditorium Surge',
    location: 'Science Quad Corridor',
    x: 450,
    y: 380,
    severity: 'medium',
    radius: 55,
    nodeId: 'N-CENTRAL-QUAD',
    description: 'Predicted 94% bottleneck at Entry D.',
  },
  {
    id: 'inc-electrical',
    type: 'electrical',
    title: 'Substation Arc Flash',
    location: 'IT Building – Basement',
    x: 740,
    y: 260,
    severity: 'high',
    radius: 65,
    nodeId: 'N-IT-B1',
    description: 'High-voltage relay trip. Automatic fire suppression armed.',
  },
  {
    id: 'inc-flood',
    type: 'flood',
    title: 'Archive Pipe Burst',
    location: 'Main Library Archives B1',
    x: 680,
    y: 580,
    severity: 'medium',
    radius: 50,
    nodeId: 'N-LIB-B1',
    description: 'Water sensor triggered in server archives.',
  },
];

interface AnimatedResponder {
  id: string;
  name: string;
  role: string;
  team: string;
  status: 'on_scene' | 'dispatched' | 'available';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  eta: number;
  avatar: string;
  color: string;
}

export function AICampusMap({
  height = '580px',
  onSelectIncident,
}: {
  height?: string;
  onSelectIncident?: (id: string) => void;
}) {
  const { selectIncident } = useDashboardStore();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showDangerRadius, setShowDangerRadius] = useState(true);
  const [showBlockedRoads, setShowBlockedRoads] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('inc-fire');
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingPolygon | null>(null);

  // Animated responder GPS tracking simulation
  const [responders, setResponders] = useState<AnimatedResponder[]>([
    {
      id: 'r-101',
      name: 'Cpt. Alex Rivera',
      role: 'Fire Lead',
      team: 'Squad Alpha',
      status: 'on_scene',
      x: 245,
      y: 335,
      targetX: 230,
      targetY: 320,
      eta: 0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      color: '#FF4D6D',
    },
    {
      id: 'r-102',
      name: 'Sgt. Priya Sharma',
      role: 'Security Lead',
      team: 'Squad Beta',
      status: 'dispatched',
      x: 580,
      y: 310,
      targetX: 740,
      targetY: 260,
      eta: 45,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      color: '#7C5CFF',
    },
    {
      id: 'r-103',
      name: 'Lt. James Chen',
      role: 'Tactical Rescue',
      team: 'Squad Alpha',
      status: 'dispatched',
      x: 380,
      y: 280,
      targetX: 230,
      targetY: 320,
      eta: 35,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      color: '#14F1D9',
    },
    {
      id: 'r-104',
      name: 'Dr. Sarah Mills',
      role: 'ALS Paramedic',
      team: 'Medical Unit',
      status: 'on_scene',
      x: 335,
      y: 695,
      targetX: 320,
      targetY: 680,
      eta: 0,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      color: '#FFB347',
    },
  ]);

  // Subtle smooth responder movement ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setResponders((prev) =>
        prev.map((r) => {
          if (r.status === 'dispatched') {
            const dx = (r.targetX - r.x) * 0.08 + (Math.random() - 0.5) * 1.5;
            const dy = (r.targetY - r.y) * 0.08 + (Math.random() - 0.5) * 1.5;
            const newEta = Math.max(0, r.eta - 2);
            return {
              ...r,
              x: r.x + dx,
              y: r.y + dy,
              eta: newEta,
              status: newEta === 0 ? 'on_scene' : 'dispatched',
            };
          }
          return r;
        }),
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Filtered incidents
  const visibleIncidents = useMemo(() => {
    if (selectedCategory === 'all') return MAP_INCIDENTS;
    return MAP_INCIDENTS.filter((i) => i.type === selectedCategory);
  }, [selectedCategory]);

  const activeIncident = useMemo(() => {
    return MAP_INCIDENTS.find((i) => i.id === activeIncidentId) || MAP_INCIDENTS[0];
  }, [activeIncidentId]);

  // Active danger zones for A* algorithm
  const hazards: HazardZone[] = useMemo(() => {
    return visibleIncidents.map((inc) => ({
      id: inc.id,
      x: inc.x,
      y: inc.y,
      radius: inc.radius,
      severity: inc.severity,
    }));
  }, [visibleIncidents]);

  // Blocked edges for A*
  const blockedEdges = useMemo(() => {
    return showBlockedRoads ? ['N-SCIB-CORR->N-SCIB-STAIR-W', 'N-IT-CORR->N-LIB-MAIN'] : [];
  }, [showBlockedRoads]);

  // Compute Shortest Safe Path using A* algorithm
  const aStarRoute: AStarResult | null = useMemo(() => {
    if (!activeIncident) return null;
    return findShortestSafePath(activeIncident.nodeId, hazards, blockedEdges);
  }, [activeIncident, hazards, blockedEdges]);

  // SVG Polyline Path for A* route
  const routePathD = useMemo(() => {
    if (!aStarRoute || aStarRoute.path.length < 2) return '';
    return aStarRoute.path.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [aStarRoute]);

  const handleIncidentClick = (inc: MapIncident) => {
    setActiveIncidentId(inc.id);
    onSelectIncident?.(inc.id);
    selectIncident(inc.id === 'inc-fire' ? 'INC-0091' : inc.id === 'inc-medical' ? 'INC-0089' : 'INC-0090');
  };

  return (
    <div className="relative rounded-2xl glass border border-[rgba(20,241,217,0.25)] overflow-hidden flex flex-col w-full shadow-2xl bg-[#070B12]/80">
      {/* ─── Top Map Control Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02] z-20">
        {/* Left: Category Filter Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-[#8B9AB4] mr-1 hidden sm:inline">HAZARDS:</span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#14F1D9] text-[#070B12] shadow-[0_0_12px_rgba(20,241,217,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-white'
            }`}
          >
            All
          </button>

          <button
            onClick={() => {
              setSelectedCategory('fire');
              setActiveIncidentId('inc-fire');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'fire'
                ? 'bg-[#FF4D6D] text-white shadow-[0_0_12px_rgba(255,77,109,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-[#FF4D6D]'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Fire</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('medical');
              setActiveIncidentId('inc-medical');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'medical'
                ? 'bg-[#FFB347] text-[#070B12] shadow-[0_0_12px_rgba(255,179,71,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-[#FFB347]'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Medical</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('crowd');
              setActiveIncidentId('inc-crowd');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'crowd'
                ? 'bg-[#38BDF8] text-[#070B12] shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-[#38BDF8]'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Crowd</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('electrical');
              setActiveIncidentId('inc-electrical');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'electrical'
                ? 'bg-[#7C5CFF] text-white shadow-[0_0_12px_rgba(124,92,255,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-[#7C5CFF]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Electrical</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('flood');
              setActiveIncidentId('inc-flood');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'flood'
                ? 'bg-[#22D3A5] text-[#070B12] shadow-[0_0_12px_rgba(34,211,165,0.5)]'
                : 'bg-white/5 text-[#8B9AB4] hover:text-[#22D3A5]'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Flood</span>
          </button>
        </div>

        {/* Right: Layer Toggle Switches */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowHeatmap((prev) => !prev)}
            className={`px-2 py-1 rounded-md border text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
              showHeatmap
                ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D]'
                : 'bg-white/5 border-white/10 text-[#8B9AB4]'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setShowDangerRadius((prev) => !prev)}
            className={`px-2 py-1 rounded-md border text-[11px] transition-all cursor-pointer ${
              showDangerRadius
                ? 'bg-[#14F1D9]/20 border-[#14F1D9] text-[#14F1D9]'
                : 'bg-white/5 border-white/10 text-[#8B9AB4]'
            }`}
          >
            Danger Radius
          </button>

          <button
            onClick={() => setShowSafeZones((prev) => !prev)}
            className={`px-2 py-1 rounded-md border text-[11px] transition-all cursor-pointer ${
              showSafeZones
                ? 'bg-[#22D3A5]/20 border-[#22D3A5] text-[#22D3A5]'
                : 'bg-white/5 border-white/10 text-[#8B9AB4]'
            }`}
          >
            Safe Zones
          </button>
        </div>
      </div>

      {/* ─── Map Canvas & SVG Overlay ────────────────────────────────────── */}
      <div className="relative w-full flex-1 overflow-hidden" style={{ minHeight: height }}>
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Map Defs: Gradients, Filters, Patterns */}
          <defs>
            {/* Grid Pattern */}
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20, 241, 217, 0.05)" strokeWidth="0.8" />
            </pattern>

            {/* Blocked Road Pattern (Caution Stripes) */}
            <pattern id="hazard-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#FF4D6D" strokeWidth="4" />
              <line x1="5" y1="0" x2="5" y2="10" stroke="#070B12" strokeWidth="4" />
            </pattern>

            {/* Danger Radius Gradient */}
            <radialGradient id="danger-gradient-red" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#FF4D6D" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="danger-gradient-amber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB347" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#FFB347" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </radialGradient>

            {/* Safe Zone Gradient */}
            <radialGradient id="safe-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22D3A5" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#22D3A5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#22D3A5" stopOpacity="0" />
            </radialGradient>

            {/* Heatmap Density Gradients */}
            <radialGradient id="heat-lab" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#FFB347" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#14F1D9" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Canvas */}
          <rect width="1000" height="1000" fill="#070B12" />
          <rect width="1000" height="1000" fill="url(#campus-grid)" />

          {/* Outer Campus Boundary Fence */}
          <rect
            x="40"
            y="40"
            width="920"
            height="920"
            rx="20"
            fill="none"
            stroke="rgba(20, 241, 217, 0.15)"
            strokeWidth="2"
            strokeDasharray="6,6"
          />

          {/* ─── Heatmap Layer ───────────────────────────────────────────── */}
          {showHeatmap && (
            <g opacity="0.85" className="transition-opacity duration-500">
              <circle cx="230" cy="320" r="140" fill="url(#heat-lab)" />
              <circle cx="740" cy="260" r="110" fill="url(#heat-lab)" />
              <circle cx="320" cy="680" r="100" fill="url(#heat-lab)" />
              <circle cx="450" cy="380" r="90" fill="url(#heat-lab)" />
            </g>
          )}

          {/* ─── Campus Roads & Walkways ─────────────────────────────────── */}
          <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" strokeLinecap="round">
            {CAMPUS_EDGES.map((edge, i) => {
              const n1 = CAMPUS_NODES.find((n) => n.id === edge.from);
              const n2 = CAMPUS_NODES.find((n) => n.id === edge.to);
              if (!n1 || !n2) return null;
              return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} />;
            })}
          </g>

          {/* Walkway Center Dashes */}
          <g stroke="rgba(20, 241, 217, 0.2)" strokeWidth="1.5" strokeDasharray="4,6">
            {CAMPUS_EDGES.map((edge, i) => {
              const n1 = CAMPUS_NODES.find((n) => n.id === edge.from);
              const n2 = CAMPUS_NODES.find((n) => n.id === edge.to);
              if (!n1 || !n2) return null;
              return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} />;
            })}
          </g>

          {/* ─── Safe Assembly Zones ─────────────────────────────────────── */}
          {showSafeZones && (
            <g>
              {SAFE_ASSEMBLY_ZONES.map((zone) => (
                <g key={zone.id}>
                  {/* Outer pulse */}
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={zone.radius + 15}
                    fill="none"
                    stroke="rgba(34, 211, 165, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                  {/* Glow Area */}
                  <circle cx={zone.x} cy={zone.y} r={zone.radius} fill="url(#safe-gradient)" />
                  {/* Assembly Icon & Badge */}
                  <circle cx={zone.x} cy={zone.y} r="14" fill="#22D3A5" stroke="#070B12" strokeWidth="2" />
                  <text
                    x={zone.x}
                    y={zone.y + 4}
                    textAnchor="middle"
                    fill="#070B12"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    SAFE
                  </text>
                  <text
                    x={zone.x}
                    y={zone.y + zone.radius + 14}
                    textAnchor="middle"
                    fill="#22D3A5"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    filter="drop-shadow(0 0 4px #070B12)"
                  >
                    {zone.name}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* ─── Blocked Roads / Hazard Closures ─────────────────────────── */}
          {showBlockedRoads && (
            <g>
              {BLOCKED_ROAD_SEGMENTS.map((b) => (
                <g key={b.id}>
                  <line
                    x1={b.x1}
                    y1={b.y1}
                    x2={b.x2}
                    y2={b.y2}
                    stroke="url(#hazard-stripes)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <line
                    x1={b.x1}
                    y1={b.y1}
                    x2={b.x2}
                    y2={b.y2}
                    stroke="#FF4D6D"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  {/* Blocked Tag */}
                  <rect
                    x={(b.x1 + b.x2) / 2 - 32}
                    y={(b.y1 + b.y2) / 2 - 10}
                    width="64"
                    height="20"
                    rx="4"
                    fill="#070B12"
                    stroke="#FF4D6D"
                    strokeWidth="1.5"
                  />
                  <text
                    x={(b.x1 + b.x2) / 2}
                    y={(b.y1 + b.y2) / 2 + 4}
                    textAnchor="middle"
                    fill="#FF4D6D"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    BLOCKED
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* ─── Building Polygons ───────────────────────────────────────── */}
          <g>
            {BUILDINGS.map((b) => {
              const isDanger = b.status === 'danger';
              const isCaution = b.status === 'caution';
              const strokeColor = isDanger ? '#FF4D6D' : isCaution ? '#FFB347' : '#14F1D9';
              const fillColor = isDanger
                ? 'rgba(255, 77, 109, 0.15)'
                : isCaution
                ? 'rgba(255, 179, 71, 0.12)'
                : 'rgba(20, 241, 217, 0.08)';

              return (
                <g
                  key={b.id}
                  className="cursor-pointer group transition-all"
                  onMouseEnter={() => setHoveredBuilding(b)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                >
                  {/* Building Footprint Polygon */}
                  <polygon
                    points={b.points}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray={isDanger ? 'none' : 'none'}
                    className="transition-all duration-300 group-hover:brightness-125"
                  />

                  {/* 3D Roof Wireframe Extrusion Line */}
                  <polygon
                    points={b.points}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1"
                    opacity="0.4"
                    transform="translate(-4, -6)"
                  />

                  {/* Building Name Tag */}
                  <text
                    x={b.labelX}
                    y={b.labelY - 6}
                    textAnchor="middle"
                    fill="#F0F4FF"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    filter="drop-shadow(0 0 6px #070B12)"
                  >
                    {b.name}
                  </text>
                  <text
                    x={b.labelX}
                    y={b.labelY + 10}
                    textAnchor="middle"
                    fill={strokeColor}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {b.code} · {b.occupancy} OCC
                  </text>
                </g>
              );
            })}
          </g>

          {/* ─── Danger Radius Buffers ───────────────────────────────────── */}
          {showDangerRadius && (
            <g>
              {visibleIncidents.map((inc) => {
                const isCrit = inc.severity === 'critical';
                const gradId = isCrit ? 'url(#danger-gradient-red)' : 'url(#danger-gradient-amber)';
                const color = isCrit ? '#FF4D6D' : '#FFB347';

                return (
                  <g key={`radius-${inc.id}`}>
                    {/* Animated Pulsing Danger Ring */}
                    <circle
                      cx={inc.x}
                      cy={inc.y}
                      r={inc.radius}
                      fill={gradId}
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                    <circle
                      cx={inc.x}
                      cy={inc.y}
                      r={inc.radius + 15}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.3"
                      className="animate-pulse-ring"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ─── A* Safe Evacuation Route (Animated Glowing Path) ───────── */}
          {aStarRoute && routePathD && (
            <g>
              {/* Outer Route Glow */}
              <path
                d={routePathD}
                fill="none"
                stroke="#14F1D9"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />

              {/* Animated Flowing Route Line */}
              <path
                d={routePathD}
                fill="none"
                stroke="#14F1D9"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8,6"
                className="animate-pulse"
              />

              {/* Path Node Dots */}
              {aStarRoute.path.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#14F1D9" stroke="#070B12" strokeWidth="1.5" />
              ))}
            </g>
          )}

          {/* ─── Incident Emergency Markers & Pulse Rings ────────────────── */}
          <g>
            {visibleIncidents.map((inc) => {
              const isSelected = activeIncidentId === inc.id;
              const color =
                inc.type === 'fire'
                  ? '#FF4D6D'
                  : inc.type === 'medical'
                  ? '#FFB347'
                  : inc.type === 'crowd'
                  ? '#38BDF8'
                  : inc.type === 'electrical'
                  ? '#7C5CFF'
                  : '#22D3A5';

              return (
                <g
                  key={inc.id}
                  className="cursor-pointer"
                  onClick={() => handleIncidentClick(inc)}
                >
                  {/* Radar Pulse Rings */}
                  <circle
                    cx={inc.x}
                    cy={inc.y}
                    r="24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <circle
                    cx={inc.x}
                    cy={inc.y}
                    r="32"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.4"
                    className="animate-pulse-ring"
                  />

                  {/* Marker Base Shield */}
                  <circle
                    cx={inc.x}
                    cy={inc.y}
                    r="14"
                    fill="#070B12"
                    stroke={color}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Marker Icon Type */}
                  <text
                    x={inc.x}
                    y={inc.y + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {inc.type === 'fire'
                      ? '🔥'
                      : inc.type === 'medical'
                      ? '🩺'
                      : inc.type === 'crowd'
                      ? '👥'
                      : inc.type === 'electrical'
                      ? '⚡'
                      : '🌊'}
                  </text>

                  {/* Incident Title Tag */}
                  <rect
                    x={inc.x - 45}
                    y={inc.y - 30}
                    width="90"
                    height="16"
                    rx="4"
                    fill="#070B12"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x={inc.x}
                    y={inc.y - 18}
                    textAnchor="middle"
                    fill="#F0F4FF"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {inc.title.slice(0, 14)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ─── Live Responder Movement Markers ─────────────────────────── */}
          {showResponders && (
            <g>
              {responders.map((r) => (
                <g key={r.id} className="transition-all duration-700">
                  {/* Responder Halo */}
                  <circle
                    cx={r.x}
                    cy={r.y}
                    r="12"
                    fill={`${r.color}20`}
                    stroke={r.color}
                    strokeWidth="1.5"
                  />
                  <circle cx={r.x} cy={r.y} r="5" fill={r.color} />

                  {/* Responder Name & ETA Flag */}
                  <rect
                    x={r.x + 10}
                    y={r.y - 14}
                    width="78"
                    height="16"
                    rx="3"
                    fill="#070B12"
                    stroke={r.color}
                    strokeWidth="1"
                  />
                  <text
                    x={r.x + 14}
                    y={r.y - 3}
                    fill="#F0F4FF"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {r.name.split(' ')[1]} · {r.eta > 0 ? `${r.eta}s` : 'HERE'}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* ─── Floating A* Evacuation HUD Card ─────────────────────────── */}
        {aStarRoute && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md glass rounded-xl p-3 border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 backdrop-blur-xl shadow-2xl z-20"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14F1D9]">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                <span>A* OPTIMAL SAFE EVACUATION ROUTE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(34,211,165,0.2)] text-[#22D3A5] font-semibold">
                HAZARD BYPASS ACTIVE
              </span>
            </div>

            <p className="text-xs text-[#F0F4FF] font-medium">
              From <span className="text-[#FF4D6D] font-bold">{activeIncident.location}</span> → Safe Exit:{' '}
              <span className="text-[#22D3A5] font-bold">{aStarRoute.safeExit.name}</span>
            </p>

            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#8B9AB4] pt-2 border-t border-white/10">
              <span>Path Distance: {Math.round(aStarRoute.distance * 0.8)}m</span>
              <span>Est. Clearance: {Math.round((aStarRoute.distance * 0.8) / 1.3)}s</span>
              <span className="text-[#14F1D9] font-bold">Steps: {aStarRoute.steps.length}</span>
            </div>
          </motion.div>
        )}

        {/* ─── Building Inspection Tooltip ─────────────────────────────── */}
        {hoveredBuilding && (
          <div
            className="absolute top-3 right-3 glass rounded-xl p-3 border border-white/15 bg-[#070B12]/90 backdrop-blur-md text-left z-20 shadow-xl"
            style={{ minWidth: '180px' }}
          >
            <span className="text-[10px] font-mono text-[#8B9AB4]">{hoveredBuilding.code}</span>
            <h4 className="text-xs font-bold text-[#F0F4FF]">{hoveredBuilding.name}</h4>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8B9AB4]">Occupancy:</span>
              <span className="text-[#14F1D9] font-bold">{hoveredBuilding.occupancy} / {hoveredBuilding.capacity}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8B9AB4]">Risk Level:</span>
              <span className="text-[#FF4D6D] font-bold">{hoveredBuilding.riskScore}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
