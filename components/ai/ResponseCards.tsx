'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Users, MapPin, Clock, Radio, Phone,
  CheckCircle2, Copy, Send, Shield, Flame, Zap, Sparkles,
} from 'lucide-react';
import type { ResponseCard } from '@/lib/ai/copilot-engine';

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: '#22D3A5', on_scene: '#14F1D9', dispatched: '#FFB347', off_duty: '#4A5568',
    danger: '#FF4D6D', caution: '#FF8C42', warning: '#FFB347', safe: '#22D3A5',
    active: '#FF4D6D', responding: '#FF8C42', contained: '#FFB347', resolved: '#22D3A5',
  };
  const c = colors[status] ?? '#8B9AB4';
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: c, boxShadow: `0 0 5px ${c}60` }}
    />
  );
}

// ─── Metric Stats ─────────────────────────────────────────────────────────────

interface StatItem { label: string; value: string | number; trend?: string; color: string }

function MetricStatsCard({ data }: { data: { stats: StatItem[] } }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {data.stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-xl p-3 border border-white/[0.08]"
          style={{ background: `${stat.color}0D` }}
        >
          <p className="text-[10px] text-[#8B9AB4] mb-1">{stat.label}</p>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</span>
            {stat.trend && <span className="text-[10px] text-[#22D3A5] mb-0.5">{stat.trend}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Incident Summary ─────────────────────────────────────────────────────────

interface IncidentItem {
  id: string; title: string; severity: string; location: string;
  timeAgo: string; color: string; peopleAtRisk: number; status?: string;
}

function IncidentSummaryCard({ data }: { data: { incidents: IncidentItem[] } }) {
  return (
    <div className="space-y-2 mt-2">
      {data.incidents.map((inc, i) => (
        <motion.div
          key={inc.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 rounded-xl p-3 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-default"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${inc.color}20`, border: `1px solid ${inc.color}40` }}
          >
            <AlertTriangle className="w-4 h-4" style={{ color: inc.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold text-[#F0F4FF] truncate">{inc.title}</span>
              {inc.status && <StatusDot status={inc.status} />}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#8B9AB4]">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{inc.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[9px] font-mono" style={{ color: inc.color }}>{inc.severity.toUpperCase()}</span>
            <span className="text-[9px] text-[#4A5568]">{inc.timeAgo}</span>
            {inc.peopleAtRisk > 0 && (
              <span className="text-[9px] text-[#FF8C42] flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />{inc.peopleAtRisk} at risk
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Risk Analysis ────────────────────────────────────────────────────────────

interface ZoneItem {
  id: string; name: string; riskScore: number; status: string;
  occupancy: number; capacity: number; color: string;
}

function RiskAnalysisCard({ data }: {
  data: { zones: ZoneItem[]; summary: null | { critical: number; high: number; moderate: number; safe: number } }
}) {
  const summaryColors: Record<string, string> = { critical: '#FF4D6D', high: '#FF8C42', moderate: '#FFB347', safe: '#22D3A5' };
  return (
    <div className="mt-2 space-y-2">
      {data.summary && (
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {Object.entries(data.summary).map(([label, val]) => (
            <div key={label} className="rounded-lg p-2 text-center border border-white/[0.06] bg-white/[0.03]">
              <p className="text-[14px] font-bold" style={{ color: summaryColors[label] }}>{val}</p>
              <p className="text-[9px] text-[#4A5568] capitalize">{label}</p>
            </div>
          ))}
        </div>
      )}
      {data.zones.map((zone, i) => (
        <motion.div key={zone.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <StatusDot status={zone.status} />
              <span className="text-[11px] text-[#F0F4FF] font-medium">{zone.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8B9AB4]">{zone.occupancy}/{zone.capacity}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: zone.color }}>{zone.riskScore}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: zone.color }}
              initial={{ width: 0 }}
              animate={{ width: `${zone.riskScore}%` }}
              transition={{ delay: i * 0.07 + 0.2, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Responder Recommendation ─────────────────────────────────────────────────

interface ResponderItem {
  id: string; name: string; role: string; team: string; status: string;
  etaMin: number; distanceM: number; certifications?: string[]; phone?: string; isRecommended: boolean;
}

function ResponderRecommendationCard({ data }: { data: { ranked: ResponderItem[] } }) {
  return (
    <div className="mt-2 space-y-2">
      {data.ranked.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-xl p-3 border transition-all ${
            r.isRecommended
              ? 'border-[#14F1D9]/40 bg-[#14F1D9]/[0.06] shadow-[0_0_12px_rgba(20,241,217,0.1)]'
              : 'border-white/[0.07] bg-white/[0.03]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
              r.isRecommended
                ? 'bg-[#14F1D9]/20 text-[#14F1D9] border border-[#14F1D9]/40'
                : 'bg-white/[0.06] text-[#8B9AB4] border border-white/[0.08]'
            }`}>
              {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              {r.isRecommended && (
                <span className="inline-block text-[8px] font-bold bg-[#14F1D9]/20 text-[#14F1D9] px-1.5 py-0.5 rounded-full border border-[#14F1D9]/30 mb-0.5">
                  ✓ RECOMMENDED
                </span>
              )}
              <p className="text-[11px] font-bold text-[#F0F4FF] truncate">{r.name}</p>
              <p className="text-[9px] text-[#8B9AB4]">{r.role} · {r.team}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <StatusDot status={r.status} />
              <span className="text-[10px] font-mono text-[#FFB347]">~{r.etaMin}m</span>
              <span className="text-[9px] text-[#4A5568]">{r.distanceM}m</span>
            </div>
          </div>
          {r.certifications && r.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {r.certifications.slice(0, 3).map((c) => (
                <span key={c} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/25">{c}</span>
              ))}
            </div>
          )}
          {r.isRecommended && r.phone && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.06]">
              <button className="flex items-center gap-1.5 text-[10px] text-[#14F1D9] hover:text-white transition-colors">
                <Radio className="w-3 h-3" />Dispatch Now
              </button>
              <span className="text-[#4A5568]">·</span>
              <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-[10px] text-[#8B9AB4] hover:text-[#F0F4FF] transition-colors">
                <Phone className="w-3 h-3" />{r.phone}
              </a>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Evacuation Route ─────────────────────────────────────────────────────────

interface RouteStep { step: number; label: string; detail: string }

function EvacuationRouteCard({ data }: {
  data: {
    incidentTitle: string; incidentLocation: string; severity: string; peopleAtRisk: number;
    eta: string; primaryRoute: RouteStep[]; alternativeRoute: RouteStep[]; assemblyPoints: string[];
  }
}) {
  const [activeTab, setActiveTab] = useState<'primary' | 'alternative'>('primary');
  const route = activeTab === 'primary' ? data.primaryRoute : data.alternativeRoute;
  const routeColor = activeTab === 'primary' ? '#14F1D9' : '#7C5CFF';

  return (
    <div className="mt-2 rounded-xl border border-white/[0.08] overflow-hidden">
      <div className="p-3 bg-[#FF4D6D]/10 border-b border-[#FF4D6D]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FF4D6D]" />
          <span className="text-[11px] font-bold text-[#FF4D6D]">{data.severity.toUpperCase()} — EVACUATE</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8B9AB4]">
          <Clock className="w-3 h-3" />{data.eta}
        </div>
      </div>
      <div className="flex border-b border-white/[0.06]">
        {(['primary', 'alternative'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-semibold transition-colors ${
              activeTab === tab ? 'text-[#F0F4FF] border-b-2 border-[#14F1D9]' : 'text-[#4A5568] hover:text-[#8B9AB4]'
            }`}
          >
            {tab === 'primary' ? '🟢 Primary Route' : '🟣 Alternative Route'}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-2">
        {route.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: `${routeColor}20`, color: routeColor, border: `1px solid ${routeColor}40` }}
              >
                {step.step}
              </div>
              {i < route.length - 1 && (
                <div className="w-px h-5 mt-1" style={{ background: `${routeColor}30` }} />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#F0F4FF]">{step.label}</p>
              <p className="text-[10px] text-[#8B9AB4]">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-3 pt-0">
        <p className="text-[9px] text-[#4A5568] mb-1.5 uppercase tracking-wider">Assembly Points</p>
        {data.assemblyPoints.map((ap, j) => (
          <div key={j} className="flex items-center gap-1.5 text-[10px] text-[#22D3A5] mb-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />{ap}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-[#FF8C42]">
          <Users className="w-3 h-3" /><span>{data.peopleAtRisk} people to evacuate</span>
        </div>
        <button className="text-[10px] text-[#14F1D9] flex items-center gap-1 hover:text-white transition-colors">
          <Zap className="w-3 h-3" />Trigger Alarm
        </button>
      </div>
    </div>
  );
}

// ─── Alert Draft ──────────────────────────────────────────────────────────────

function AlertDraftCard({ data }: {
  data: { alertText: string; audience: string; channels: string[]; severity: string; incidentId?: string }
}) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.alertText);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const handleSend = () => { setSent(true); setTimeout(() => setSent(false), 3000); };

  const severityBg: Record<string, string> = { critical: '#FF4D6D', high: '#FF8C42', medium: '#FFB347', low: '#22D3A5' };
  const bg = severityBg[data.severity] ?? '#8B9AB4';

  return (
    <div className="mt-2 rounded-xl border border-white/[0.08] overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.07] flex items-center justify-between"
        style={{ background: `${bg}15` }}>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" style={{ color: bg }} />
          <span className="text-[10px] font-bold" style={{ color: bg }}>{data.severity.toUpperCase()} ALERT DRAFT</span>
        </div>
        <span className="text-[9px] text-[#8B9AB4]">To: {data.audience}</span>
      </div>
      <div className="p-3">
        <pre className="text-[10px] text-[#C5CDE8] leading-relaxed whitespace-pre-wrap font-sans">{data.alertText}</pre>
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {data.channels.map((ch) => (
          <span key={ch} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8B9AB4] border border-white/[0.08]">{ch}</span>
        ))}
      </div>
      <div className="flex border-t border-white/[0.06]">
        <button onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.04] transition-all">
          {copied ? <CheckCircle2 className="w-3 h-3 text-[#22D3A5]" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <div className="w-px bg-white/[0.06]" />
        <button onClick={handleSend} disabled={sent}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold transition-all ${
            sent ? 'text-[#22D3A5] bg-[#22D3A5]/10' : 'text-[#14F1D9] hover:bg-[#14F1D9]/10'
          }`}>
          {sent ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
          {sent ? 'Broadcast Sent!' : 'Broadcast Now'}
        </button>
      </div>
    </div>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

interface TrendPoint { day: string; fire: number; intrusion: number; medical: number }

function TrendChartCard({ data }: { data: { title: string; data: TrendPoint[] } }) {
  const maxVal = Math.max(...data.data.flatMap((d) => [d.fire, d.intrusion, d.medical]));
  const series = [
    { key: 'fire' as const, color: '#FF4D6D', label: 'Fire' },
    { key: 'intrusion' as const, color: '#7C5CFF', label: 'Intrusion' },
    { key: 'medical' as const, color: '#14F1D9', label: 'Medical' },
  ];

  return (
    <div className="mt-2 rounded-xl border border-white/[0.08] p-3 bg-white/[0.02]">
      <p className="text-[10px] font-semibold text-[#8B9AB4] mb-3">{data.title}</p>
      <div className="flex gap-3 mb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[9px] text-[#8B9AB4]">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {data.data.map((point, i) => (
          <div key={point.day} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex flex-col-reverse gap-0.5 h-20">
              {series.map((s) => {
                const val = point[s.key];
                const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <motion.div
                    key={s.key}
                    className="w-full rounded-sm"
                    style={{ background: `${s.color}90` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    title={`${s.label}: ${val}`}
                  />
                );
              })}
            </div>
            <span className="text-[8px] text-[#4A5568]">{point.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Visual Card Stubs (rendered by VisualCard in the message bubble) ────────

function ImageGenerationCard({ data }: { data: { prompt: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#14F1D9]/30 bg-[#14F1D9]/[0.04] p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#14F1D9]" />
        <span className="text-[10px] font-bold text-[#14F1D9] uppercase tracking-wider">AI Image Synthesis</span>
      </div>
      <p className="text-[11px] text-[#8B9AB4] leading-relaxed italic">
        &quot;{data.prompt?.slice(0, 120)}…&quot;
      </p>
    </motion.div>
  );
}

function EvacuationDiagramStubCard({ data }: { data: Record<string, unknown> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#22D3A5]/30 bg-[#22D3A5]/[0.04] p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-3.5 h-3.5 text-[#22D3A5]" />
        <span className="text-[10px] font-bold text-[#22D3A5] uppercase tracking-wider">
          Evacuation Blueprint — {(data.incidentLocation as string) || 'Unknown'}
        </span>
      </div>
      <p className="text-[11px] text-[#8B9AB4]">
        ETA: {(data.eta as string) || '6–9 min'} · {(data.peopleAtRisk as number) || 0} occupants routing
      </p>
    </motion.div>
  );
}

function RiskHeatmapStubCard({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as { critical: number; high: number; moderate: number; safe: number } | undefined;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#FF4D6D]/30 bg-[#FF4D6D]/[0.04] p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D6D]" />
        <span className="text-[10px] font-bold text-[#FF4D6D] uppercase tracking-wider">Risk Heatmap Overlay</span>
      </div>
      {summary && (
        <div className="flex items-center gap-3 text-[10px] font-mono mt-1">
          <span className="text-[#FF4D6D]">🔴 {summary.critical} Critical</span>
          <span className="text-[#FFB347]">🟠 {summary.high} High</span>
          <span className="text-[#22D3A5]">🟢 {summary.safe} Safe</span>
        </div>
      )}
    </motion.div>
  );
}

function EmergencyPosterStubCard({ data }: { data: Record<string, unknown> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/[0.04] p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-3.5 h-3.5 text-[#7C5CFF]" />
        <span className="text-[10px] font-bold text-[#7C5CFF] uppercase tracking-wider">Emergency Poster Generated</span>
      </div>
      <p className="text-[11px] text-[#8B9AB4]">
        Building: {(data.building as string) || 'Campus'} · Print-Ready A3/Tabloid
      </p>
    </motion.div>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

export function ResponseCards({ cards }: { cards: ResponseCard[] }) {
  return (
    <div className="space-y-2">
      {cards.map((card, i) => {
        switch (card.type) {
          case 'metric_stats':
            return <MetricStatsCard key={i} data={card.data as { stats: StatItem[] }} />;
          case 'incident_summary':
            return <IncidentSummaryCard key={i} data={card.data as { incidents: IncidentItem[] }} />;
          case 'risk_analysis':
            return <RiskAnalysisCard key={i} data={card.data as {
              zones: ZoneItem[];
              summary: null | { critical: number; high: number; moderate: number; safe: number }
            }} />;
          case 'responder_recommendation':
            return <ResponderRecommendationCard key={i} data={card.data as { ranked: ResponderItem[] }} />;
          case 'evacuation_route':
            return <EvacuationRouteCard key={i} data={card.data as {
              incidentTitle: string; incidentLocation: string; severity: string; peopleAtRisk: number;
              eta: string; primaryRoute: RouteStep[]; alternativeRoute: RouteStep[]; assemblyPoints: string[];
            }} />;
          case 'alert_draft':
            return <AlertDraftCard key={i} data={card.data as {
              alertText: string; audience: string; channels: string[]; severity: string; incidentId?: string
            }} />;
          case 'trend_chart':
            return <TrendChartCard key={i} data={card.data as { title: string; data: TrendPoint[] }} />;
          case 'image_generation':
            return <ImageGenerationCard key={i} data={card.data as { prompt: string }} />;
          case 'evacuation_diagram':
            return <EvacuationDiagramStubCard key={i} data={card.data} />;
          case 'risk_heatmap':
            return <RiskHeatmapStubCard key={i} data={card.data} />;
          case 'emergency_poster':
            return <EmergencyPosterStubCard key={i} data={card.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
