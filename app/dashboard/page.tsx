'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  Activity,
  Zap,
  TrendingUp,
  Eye,
  Radio,
  Flame,
  UserX,
  Heart,
  Wind,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Send,
  Navigation,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { StatCard, GlassCard, NeonBadge, LiveIndicator, GradientButton } from '@/components/ui';
import { CampusMap } from '@/components/map/CampusMap';
import { DashboardRightPanel } from '@/components/dashboard/right-panel';
import { useDashboardStore } from '@/store/dashboard';
import { formatDuration, timeAgo, severityColor, statusColor } from '@/lib/utils';
import {
  INCIDENT_TREND_DATA,
  RESPONSE_TIME_DATA,
  ZONE_RISK_DATA,
} from '@/lib/mock-data';
import {
  subscribeToIncidents,
  subscribeToResponders,
  subscribeToAlerts,
} from '@/lib/supabase/realtime';

const incidentDistributionData = [
  { name: 'Fire / Thermal', value: 38, color: '#FF4D6D' },
  { name: 'Intrusion / Access', value: 24, color: '#7C5CFF' },
  { name: 'Medical Emergency', value: 18, color: '#FFB347' },
  { name: 'Gas / Chemical', value: 12, color: '#22D3A5' },
  { name: 'Crowd / Other', value: 8, color: '#38BDF8' },
];

const riskTrendData = [
  { time: '06:00', risk: 14, predicted: 18 },
  { time: '08:00', risk: 28, predicted: 32 },
  { time: '10:00', risk: 45, predicted: 40 },
  { time: '12:00', risk: 68, predicted: 62 },
  { time: '14:00', risk: 94, predicted: 88 },
  { time: '16:00', risk: 52, predicted: 58 },
  { time: '18:00', risk: 36, predicted: 30 },
];

const responseTimelineEvents = [
  {
    time: '14:02:18',
    type: 'alert',
    title: 'Lab 302 Thermal Spike (340°C)',
    detail: 'YOLOv8 classified Class 1 Chemical Fire with 98.4% confidence.',
    color: '#FF4D6D',
  },
  {
    time: '14:02:30',
    type: 'route',
    title: 'A* Evacuation Route Generated',
    detail: 'East Stairwell → North Quad designated primary egress corridor.',
    color: '#14F1D9',
  },
  {
    time: '14:02:45',
    type: 'dispatch',
    title: 'Squad Alpha (R-101 & R-103) Dispatched',
    detail: 'Live GPS tracked with 45s ETA on Channel CH-4 Tactical.',
    color: '#7C5CFF',
  },
  {
    time: '14:03:20',
    type: 'on_scene',
    title: 'Cpt. Alex Rivera On Scene',
    detail: 'SCBA chemical fire suppression initiated. Zone B evacuated.',
    color: '#22D3A5',
  },
];

export default function DashboardPage() {
  const { incidents, responders, metrics, aiAlerts, selectIncident, addToast } = useDashboardStore();

  // Supabase Realtime Listener Integration
  useEffect(() => {
    const unsubIncidents = subscribeToIncidents(
      (newInc) => {
        addToast({
          type: 'warning',
          title: `Realtime Incident: ${newInc.title}`,
          message: `New incident reported at ${newInc.location || 'Campus'}.`,
        });
      },
      (updatedInc) => {
        addToast({
          type: 'info',
          title: `Incident Updated: ${updatedInc.title}`,
          message: `Status changed to ${updatedInc.status}.`,
        });
      },
    );

    const unsubResponders = subscribeToResponders((resp) => {
      // GPS position live update
    });

    const unsubAlerts = subscribeToAlerts((alert) => {
      addToast({
        type: 'error',
        title: `CRITICAL ALERT: ${alert.title}`,
        message: alert.message,
      });
    });

    return () => {
      unsubIncidents?.();
      unsubResponders?.();
      unsubAlerts?.();
    };
  }, [addToast]);

  const activeIncidents = incidents.filter((i) => i.status === 'active' || i.status === 'responding');
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const availableCount = responders.filter((r) => r.status === 'available').length;
  const totalPeopleAtRisk = incidents.reduce((acc, i) => acc + (i.peopleAtRisk || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row h-full min-w-0 overflow-x-hidden">
      {/* ─── CENTER COMMAND WORKSPACE ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 gap-5 overflow-y-auto min-w-0">
        {/* ─── TOP ROW: 4 KPI STAT CARDS ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Incidents */}
          <div className="glass rounded-2xl p-4 border-[rgba(255,77,109,0.3)] bg-[#070B12]/80 hover:border-[#FF4D6D]/60 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4D6D]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">Active Incidents</span>
              <div className="p-2 rounded-xl bg-[#FF4D6D]/15 border border-[#FF4D6D]/30">
                <AlertTriangle className="w-4 h-4 text-[#FF4D6D]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#F0F4FF] tracking-tight">
              {activeIncidents.length}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#FF4D6D]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-ping" />
                {criticalCount} Critical Active
              </span>
              <span className="text-[10px] font-mono text-[#8B9AB4]">Zone B3 Priority</span>
            </div>
          </div>

          {/* Card 2: People At Risk */}
          <div className="glass rounded-2xl p-4 border-[rgba(255,179,71,0.3)] bg-[#070B12]/80 hover:border-[#FFB347]/60 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFB347]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">People At Risk</span>
              <div className="p-2 rounded-xl bg-[#FFB347]/15 border border-[#FFB347]/30">
                <Users className="w-4 h-4 text-[#FFB347]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#F0F4FF] tracking-tight">
              {totalPeopleAtRisk}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#FFB347]">
              <span>42 Evacuating Lab 302</span>
              <span className="text-[10px] font-mono text-[#22D3A5]">Route Active</span>
            </div>
          </div>

          {/* Card 3: Available Responders */}
          <div className="glass rounded-2xl p-4 border-[rgba(20,241,217,0.3)] bg-[#070B12]/80 hover:border-[#14F1D9]/60 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#14F1D9]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">Available Units</span>
              <div className="p-2 rounded-xl bg-[#14F1D9]/15 border border-[#14F1D9]/30">
                <Shield className="w-4 h-4 text-[#14F1D9]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#F0F4FF] tracking-tight">
              {availableCount} <span className="text-sm font-normal text-[#8B9AB4]">/ {responders.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#14F1D9]">
              <span>{responders.length - availableCount} Deployed On Scene</span>
              <span className="text-[10px] font-mono text-[#8B9AB4]">CH-4 Radio</span>
            </div>
          </div>

          {/* Card 4: Avg Response Time */}
          <div className="glass rounded-2xl p-4 border-[rgba(34,211,165,0.3)] bg-[#070B12]/80 hover:border-[#22D3A5]/60 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22D3A5]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#8B9AB4] uppercase tracking-wider">Avg Response</span>
              <div className="p-2 rounded-xl bg-[#22D3A5]/15 border border-[#22D3A5]/30">
                <Clock className="w-4 h-4 text-[#22D3A5]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#F0F4FF] tracking-tight">
              {formatDuration(metrics.avgResponseTime)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#22D3A5]">
              <span>-68% vs Standard SLA</span>
              <span className="text-[10px] font-mono text-[#14F1D9]">Target &lt; 3m</span>
            </div>
          </div>
        </div>

        {/* ─── MIDDLE: LIVE CAMPUS MAP (LARGEST CARD) ──────────────────── */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14F1D9] animate-pulse" />
              <h2 className="text-sm font-mono font-bold text-[#F0F4FF] uppercase tracking-wider">
                Live Google Maps Tactical Command Center &amp; A* Safe Pathfinding
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8B9AB4]">
              224 SENSORS · GOOGLE MAPS OVERWATCH
            </span>
          </div>

          <CampusMap height="560px" onSelectIncident={(id) => selectIncident(id)} />
        </div>

        {/* ─── BOTTOM ROW: 3 ANALYTICS & TIMELINE PANELS ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Panel 1: Response Timeline */}
          <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#14F1D9]" />
                  Response Timeline
                </h3>
                <span className="text-[10px] font-mono text-[#8B9AB4]">REALTIME LOG</span>
              </div>

              <div className="space-y-3">
                {responseTimelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: evt.color, boxShadow: `0 0 6px ${evt.color}` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#F0F4FF] truncate">{evt.title}</p>
                        <span className="text-[9px] font-mono text-[#8B9AB4]">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-[#8B9AB4] mt-0.5 line-clamp-1">{evt.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8B9AB4]">
              <span>Event Stream Active</span>
              <span className="text-[#14F1D9]">Latency 8ms</span>
            </div>
          </div>

          {/* Panel 2: Risk Trend Area Chart */}
          <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  Campus Risk Trend
                </h3>
                <span className="text-[10px] font-mono text-[#FF4D6D]">PEAK 94% AT 14:00</span>
              </div>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis dataKey="time" stroke="#4A5568" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4A5568" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#070B12',
                        borderColor: 'rgba(20,241,217,0.3)',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#FF4D6D"
                      strokeWidth={2}
                      fill="url(#riskGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#8B9AB4]">
              <span>Current Threat Level: High</span>
              <span className="text-[#FF4D6D] font-bold">Science B Spike</span>
            </div>
          </div>

          {/* Panel 3: Incident Distribution Donut Chart */}
          <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  Incident Distribution
                </h3>
                <span className="text-[10px] font-mono text-[#8B9AB4]">TYPE RATIO</span>
              </div>

              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {incidentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#070B12',
                        borderColor: 'rgba(20,241,217,0.3)',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-[#8B9AB4]">
              {incidentDistributionData.slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="truncate">{d.name.split(' ')[0]}: {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: EMERGENCY CARD, FEED & QUICK ACTIONS ─────────── */}
      <DashboardRightPanel />
    </div>
  );
}
