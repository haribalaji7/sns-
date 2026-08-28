'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Users,
  Cpu,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  Printer,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Maximize2,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

// ─── Analytics Dataset ───────────────────────────────────────────────────────

const MONTHLY_INCIDENTS = [
  { month: 'Jan', fire: 4, medical: 6, intrusion: 3, hazard: 2, total: 15 },
  { month: 'Feb', fire: 3, medical: 8, intrusion: 5, hazard: 1, total: 17 },
  { month: 'Mar', fire: 6, medical: 9, intrusion: 4, hazard: 3, total: 22 },
  { month: 'Apr', fire: 5, medical: 7, intrusion: 2, hazard: 2, total: 16 },
  { month: 'May', fire: 8, medical: 12, intrusion: 6, hazard: 4, total: 30 },
  { month: 'Jun', fire: 7, medical: 10, intrusion: 5, hazard: 3, total: 25 },
  { month: 'Jul', fire: 9, medical: 8, intrusion: 4, hazard: 2, total: 23 },
  { month: 'Aug', fire: 12, medical: 14, intrusion: 7, hazard: 5, total: 38 },
];

const RESPONSE_TIME_TREND = [
  { time: '08:00', avgSec: 168, slaTarget: 180 },
  { time: '10:00', avgSec: 142, slaTarget: 180 },
  { time: '12:00', avgSec: 155, slaTarget: 180 },
  { time: '14:00', avgSec: 134, slaTarget: 180 },
  { time: '16:00', avgSec: 122, slaTarget: 180 },
  { time: '18:00', avgSec: 118, slaTarget: 180 },
  { time: '20:00', avgSec: 129, slaTarget: 180 },
  { time: '22:00', avgSec: 110, slaTarget: 180 },
];

const SEVERITY_DISTRIBUTION = [
  { name: 'Critical', value: 8, color: '#FF4D6D' },
  { name: 'High', value: 24, color: '#FF8C42' },
  { name: 'Medium', value: 58, color: '#FFB347' },
  { name: 'Low', value: 52, color: '#22D3A5' },
];

const BUILDING_RISK_RANKING = [
  { building: 'Science Block B', risk: 94, incidents: 48, color: '#FF4D6D' },
  { building: 'Athletic Arena', risk: 71, incidents: 28, color: '#FF8C42' },
  { building: 'IT Data Center', risk: 62, incidents: 22, color: '#FFB347' },
  { building: 'Main Library', risk: 18, incidents: 14, color: '#22D3A5' },
  { building: 'Admin Quad', risk: 12, incidents: 8, color: '#14F1D9' },
];

const RESPONDER_WORKLOAD = [
  { team: 'Squad Alpha (Fire)', deployedHours: 142, capacity: 180, efficiency: 96 },
  { team: 'Security Wing B', deployedHours: 168, capacity: 200, efficiency: 92 },
  { team: 'Medical ALS Unit', deployedHours: 118, capacity: 150, efficiency: 98 },
  { team: 'HAZMAT Division', deployedHours: 46, capacity: 120, efficiency: 94 },
  { team: 'Perimeter Patrol', deployedHours: 194, capacity: 220, efficiency: 91 },
];

const INCIDENT_TYPE_BREAKDOWN = [
  { type: 'Fire & Thermal', count: 48, percentage: 34, color: '#FF4D6D' },
  { type: 'Medical Emergency', count: 34, percentage: 24, color: '#FF8C42' },
  { type: 'Security / Intrusion', count: 26, percentage: 18, color: '#7C5CFF' },
  { type: 'Hazardous Gas / Chemical', count: 17, percentage: 12, color: '#FFB347' },
  { type: 'Violence / Distress', count: 11, percentage: 8, color: '#E056FD' },
  { type: 'Water Ingress / Flood', count: 6, percentage: 4, color: '#14F1D9' },
];

// Hourly Heatmap (Days of Week vs Hours)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_BLOCKS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

const HOURLY_HEATMAP_DATA = [
  [1, 0, 4, 8, 5, 2], // Mon
  [0, 1, 6, 9, 6, 3], // Tue
  [2, 0, 8, 14, 9, 4], // Wed (High Lab day)
  [1, 1, 5, 7, 6, 2], // Thu
  [3, 2, 7, 11, 10, 5], // Fri
  [2, 3, 3, 6, 8, 7], // Sat (Intrusion/Perimeter)
  [1, 2, 2, 5, 6, 4], // Sun
];

// ─── AI Insights Dataset ────────────────────────────────────────────────────

const AI_INSIGHTS = [
  {
    id: 'ins-1',
    category: 'Spatial Hazard Concentration',
    title: 'Science Block Accounts for 34% of Incidents',
    text: 'Thermal and smoke anomaly patterns are heavily concentrated in Floor 3 chemical synthesis laboratories between 2:00 PM – 4:30 PM.',
    badge: 'High Impact',
    trend: '+12% vs last month',
    color: '#FF4D6D',
  },
  {
    id: 'ins-2',
    category: 'Operational Efficiency',
    title: 'Average Response Time Improved by 21%',
    text: 'Dynamic responder pre-positioning near North Quad reduced average time-to-scene from 2m 50s down to 2m 14s (26s below SLA target).',
    badge: 'Positive SLA',
    trend: '-36s faster response',
    color: '#22D3A5',
  },
  {
    id: 'ins-3',
    category: 'Temporal Pattern Detection',
    title: 'Crowd Incidents Peak Between 1:00 PM – 3:00 PM',
    text: 'Turnover between major lecture halls and Central Auditorium generates recurring corridor bottlenecks on Wednesdays and Fridays.',
    badge: 'Predictive Alert',
    trend: 'Peak congestion',
    color: '#FFB347',
  },
  {
    id: 'ins-4',
    category: 'Sensor Health & Calibration',
    title: 'Drift Detected in Sensors SEN-018 & SEN-041',
    text: 'Predictive telemetry model suggests optical particulate baseline drift. Scheduled 90-day recalibration recommended within 7 days.',
    badge: 'Maintenance',
    trend: 'Recalibration due',
    color: '#14F1D9',
  },
];

export default function AnalyticsDashboardPage() {
  const { addToast } = useDashboardStore();

  // Filters State
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');
  const [selectedHeatBuilding, setSelectedHeatBuilding] = useState<string | null>('Science Block B');

  const handleExportPDF = () => {
    soundEffects.playClick();
    window.print();
    addToast({
      type: 'info',
      title: 'Executive Analytics Exported',
      message: 'Generated PDF executive briefing dossier ready.',
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-[1600px] mx-auto text-[#F0F4FF]">
      {/* ─── Top Executive Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9] shadow-[0_0_20px_rgba(20,241,217,0.3)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#F0F4FF] flex items-center gap-2.5">
                Executive AI Analytics Dashboard
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/40 uppercase">
                  Q3 INTELLIGENCE
                </span>
              </h1>
              <p className="text-xs text-[#8B9AB4]">
                Enterprise campus safety metrics, incident trends, responder SLAs & automated AI insights
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass border border-white/[0.08] bg-[#070B12]/80 text-xs font-mono">
            {(['today', 'week', 'month', 'year'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  soundEffects.playClick();
                  setTimeRange(r);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] shadow-md'
                    : 'text-[#8B9AB4] hover:text-white'
                }`}
              >
                {r === 'year' ? 'Custom' : r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold font-mono text-[#F0F4FF] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#14F1D9]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ─── 6 High-Impact Executive KPI Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Incidents', val: '142', sub: '+8% YoY', isGood: false, icon: AlertTriangle, color: '#FF4D6D' },
          { label: 'Critical Incidents', val: '8', sub: '100% Contained', isGood: true, icon: Flame, color: '#FF8C42' },
          { label: 'Avg. Response Time', val: '2m 14s', sub: '-21% (36s faster)', isGood: true, icon: Clock, color: '#22D3A5' },
          { label: 'People Protected', val: '4,820', sub: 'Active Campus Total', isGood: true, icon: Users, color: '#14F1D9' },
          { label: 'AI Accuracy', val: '97.4%', sub: 'YOLOv11x + Gemini', isGood: true, icon: Cpu, color: '#7C5CFF' },
          { label: 'Responder Efficiency', val: '94.2%', sub: 'Within 3m SLA', isGood: true, icon: Shield, color: '#E056FD' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 backdrop-blur-md flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-[#14F1D9]/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4] truncate">
                  {kpi.label}
                </span>
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs"
                  style={{ backgroundColor: `${kpi.color}20`, color: kpi.color, border: `1px solid ${kpi.color}40` }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black font-mono tracking-tight text-[#F0F4FF]">
                  {kpi.val}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
                  {kpi.isGood ? (
                    <span className="text-[#22D3A5] font-bold flex items-center">
                      <ArrowUpRight className="w-3 h-3" /> {kpi.sub}
                    </span>
                  ) : (
                    <span className="text-[#FF4D6D] font-bold flex items-center">
                      <ArrowDownRight className="w-3 h-3" /> {kpi.sub}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── AI Insights Panel ─────────────────────────────────────────── */}
      <div className="rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-gradient-to-br from-[#14F1D9]/[0.06] via-[#070B12] to-transparent p-5 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
                Autonomous AI Insights & Executive Recommendations
              </h2>
              <p className="text-[10px] text-[#8B9AB4]">
                Neural Pattern Recognition across 142 incidents and 12,000+ IoT sensor readings
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#14F1D9] bg-[#14F1D9]/15 px-2.5 py-1 rounded-full border border-[#14F1D9]/30 font-bold">
            REALTIME SYNTHESIS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {AI_INSIGHTS.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-2xl glass border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between hover:border-[#14F1D9]/40 transition-all space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8B9AB4]">
                    {ins.category}
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${ins.color}20`, color: ins.color, border: `1px solid ${ins.color}40` }}
                  >
                    {ins.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#F0F4FF] group-hover:text-[#14F1D9] transition-colors leading-snug">
                  {ins.title}
                </h3>
                <p className="text-[11px] text-[#8B9AB4] leading-relaxed mt-1">
                  {ins.text}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#14F1D9]">{ins.trend}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#4A5568] group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CHARTS ROW 1: Monthly Incidents & Realtime Response Time ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Monthly Incidents Multi-Bar */}
        <div className="lg:col-span-7 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
                <BarChart className="w-4 h-4 text-[#14F1D9]" />
                Monthly Incident Trajectory & Category Breakdown
              </h3>
              <p className="text-[10px] text-[#8B9AB4]">Year-to-date monthly volume across core hazard types</p>
            </div>
            <span className="text-[10px] font-mono text-[#8B9AB4]">JAN – AUG 2026</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_INCIDENTS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#8B9AB4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B9AB4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070B12', borderColor: 'rgba(20,241,217,0.3)', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="fire" name="Fire / Thermal" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medical" name="Medical Emergency" fill="#FF8C42" radius={[4, 4, 0, 0]} />
                <Bar dataKey="intrusion" name="Security Breach" fill="#7C5CFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hazard" name="HazMat / Gas" fill="#14F1D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Realtime Response Time Curve with SLA Benchmark */}
        <div className="lg:col-span-5 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#22D3A5]" />
                Hourly Response Time Trend vs 180s SLA
              </h3>
              <p className="text-[10px] text-[#8B9AB4]">Target benchmark: &le; 180s time-to-scene</p>
            </div>
            <span className="text-[10px] font-mono text-[#22D3A5] font-bold">PASSING SLA</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RESPONSE_TIME_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="respGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3A5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3A5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#8B9AB4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B9AB4" fontSize={11} tickLine={false} unit="s" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070B12', borderColor: 'rgba(34,211,165,0.4)', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="avgSec" name="Avg Response Time" stroke="#22D3A5" strokeWidth={3} fillOpacity={1} fill="url(#respGlow)" />
                <Line type="monotone" dataKey="slaTarget" name="SLA Benchmark (180s)" stroke="#FF4D6D" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 2: Severity Distribution, Building Risk & Workload ─ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Severity Donut Chart */}
        <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#F0F4FF]">Severity Distribution</h3>
            <span className="text-[10px] font-mono text-[#8B9AB4]">142 Total</span>
          </div>

          <div className="w-full h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEVERITY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SEVERITY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#070B12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-mono text-[#8B9AB4]">Critical</span>
              <span className="text-xl font-black font-mono text-[#FF4D6D]">5.6%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/[0.06]">
            {SEVERITY_DISTRIBUTION.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#8B9AB4]">{s.name}:</span>
                <strong className="text-white ml-auto">{s.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Building Risk Ranking Horizontal Bars */}
        <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F0F4FF]">Building Risk Ranking</h3>
            <span className="text-[10px] font-mono text-[#FF4D6D]">TOP HAZARD ZONES</span>
          </div>

          <div className="space-y-3 my-auto">
            {BUILDING_RISK_RANKING.map((b, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F0F4FF]">{b.building}</span>
                  <span className="font-mono text-[11px] font-bold" style={{ color: b.color }}>
                    Score: {b.risk}/100 · {b.incidents} inc
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${b.risk}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responder Squad Workload Breakdown */}
        <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F0F4FF]">Responder Workload & Capacity</h3>
            <span className="text-[10px] font-mono text-[#22D3A5]">94.2% ON-TIME</span>
          </div>

          <div className="space-y-2.5 my-auto">
            {RESPONDER_WORKLOAD.map((r, i) => (
              <div key={i} className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#F0F4FF]">{r.team}</p>
                  <p className="text-[10px] font-mono text-[#8B9AB4]">
                    {r.deployedHours}h deployed / {r.capacity}h capacity
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#14F1D9]">
                  {r.efficiency}% SLA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 3: Interactive Heatmap & Incident Type Breakdown ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive 24-Hour Intensity Heatmap Grid */}
        <div className="lg:col-span-8 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF4D6D]" />
                24-Hour Campus Incident Temporal Intensity Grid
              </h3>
              <p className="text-[10px] text-[#8B9AB4]">
                Hour of Day vs Day of Week heatmap (Red = High Frequency, Teal = Nominal Safe)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#0C1B2A]" /> Low (0)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#FFB347]" /> Med (5-8)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#FF4D6D]" /> Peak (&gt;10)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[500px] space-y-1.5">
              {/* Header hours */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-[#8B9AB4] pb-1">
                <div>Day</div>
                {TIME_BLOCKS.map((tb) => (
                  <div key={tb}>{tb}</div>
                ))}
              </div>

              {/* Day rows */}
              {DAYS.map((day, dIdx) => (
                <div key={day} className="grid grid-cols-7 gap-1.5 items-center">
                  <span className="text-xs font-mono font-bold text-[#8B9AB4]">{day}</span>
                  {HOURLY_HEATMAP_DATA[dIdx].map((val, hIdx) => {
                    const color =
                      val > 10 ? '#FF4D6D' :
                      val > 6 ? '#FF8C42' :
                      val > 3 ? '#FFB347' :
                      val > 0 ? '#14F1D9' : '#0C1B2A';

                    return (
                      <div
                        key={hIdx}
                        className="h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: `${color}25`,
                          border: `1px solid ${color}50`,
                          color: val > 0 ? '#F0F4FF' : '#4A5568',
                        }}
                        title={`${day} @ ${TIME_BLOCKS[hIdx]}: ${val} incidents`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Type Composition Breakdown */}
        <div className="lg:col-span-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#F0F4FF]">Incident Type Composition</h3>
            <span className="text-[10px] font-mono text-[#14F1D9]">100% COVERAGE</span>
          </div>

          <div className="space-y-2.5 my-auto">
            {INCIDENT_TYPE_BREAKDOWN.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F0F4FF] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.type}
                  </span>
                  <span className="font-mono text-[10px] text-[#8B9AB4]">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
