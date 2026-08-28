'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Sparkles,
  Cpu,
  Shield,
  AlertTriangle,
  Flame,
  Activity,
  Sliders,
  CheckCircle2,
  Clock,
  Users,
  Sun,
  CloudLightning,
  DoorOpen,
  Send,
  Zap,
  RotateCcw,
  Check,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  predictCampusRisk,
  MLPredictionInputs,
  MLRiskPredictionResult,
} from '@/lib/ml/risk-prediction-engine';
import { CAMPUS_BUILDINGS, WEATHER_CONDITIONS, EVENT_SCHEDULES } from '@/lib/ml/campus-risk-dataset';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

export function RiskPredictorStudio() {
  const { addToast } = useDashboardStore();

  // Interactive ML Feature State
  const [inputs, setInputs] = useState<MLPredictionInputs>({
    building: 'Science Block B',
    hour: 14,
    occupancy: 380,
    weather: 'Heatwave',
    event: 'Lab Practicals',
    isExamDay: false,
    previousIncidents: 3,
  });

  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Live IoT Simulation Effect
  React.useEffect(() => {
    if (!isLiveMode) return;
    
    const interval = setInterval(() => {
      setInputs((prev) => {
        // Simulate live crowd movement via IoT counters
        const occDelta = Math.floor(Math.random() * 25) - 10;
        const nextOcc = Math.max(0, Math.min(600, prev.occupancy + occDelta));
        
        return {
          ...prev,
          occupancy: nextOcc,
        };
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Compute live inference
  const prediction: MLRiskPredictionResult = useMemo(() => {
    return predictCampusRisk(inputs);
  }, [inputs]);

  const handleActionExecute = (actionId: string, title: string) => {
    soundEffects.playSuccess();
    setExecutedActions((prev) => ({ ...prev, [actionId]: true }));
    addToast({
      type: 'success',
      title: 'Preventive Action Executed',
      message: `${title} initiated across campus operations.`,
    });
  };

  const getGaugeColor = (score: number) => {
    if (score >= 75) return '#FF4D6D';
    if (score >= 50) return '#FF8C42';
    if (score >= 25) return '#FFB347';
    return '#22D3A5';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-y-auto pr-0.5 text-[#F0F4FF]">
      {/* ─── LEFT: Interactive ML Inputs & Model Telemetry (4 Cols) ───── */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Model Spec Card */}
        <div className="p-4 rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F0F4FF]">Gradient Forest ML Engine</h3>
                <p className="text-[9px] font-mono text-[#22D3A5]">5,000 Trained Samples · 97.4% Precision</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsLiveMode(!isLiveMode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-all border ${
                  isLiveMode 
                    ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#FF4D6D]/50 shadow-[0_0_15px_rgba(255,77,109,0.3)] animate-pulse'
                    : 'bg-white/[0.05] text-[#8B9AB4] border-white/[0.1] hover:bg-white/[0.1]'
                }`}
              >
                <Activity className="w-3 h-3" />
                {isLiveMode ? 'LIVE IOT SYNC' : 'MANUAL'}
              </button>
              <span className="text-[9px] font-mono text-[#14F1D9] bg-[#14F1D9]/15 px-2 py-0.5 rounded border border-[#14F1D9]/30">
                4ms Latency
              </span>
            </div>
          </div>

          {/* Interactive Sliders & Pickers */}
          <div className="space-y-3 text-xs">
            {/* Building Picker */}
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4] block mb-1">
                Target Building
              </label>
              <select
                value={inputs.building}
                onChange={(e) => {
                  soundEffects.playClick();
                  setInputs({ ...inputs, building: e.target.value });
                }}
                className="w-full p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F0F4FF] outline-none font-sans focus:border-[#14F1D9]/50 cursor-pointer"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b.name} value={b.name} className="bg-[#070B12] text-white">
                    {b.name} (Max: {b.maxCap})
                  </option>
                ))}
              </select>
            </div>

            {/* Hour Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8B9AB4] uppercase font-bold">Time of Day</span>
                <span className="text-[#14F1D9] font-bold">{inputs.hour.toString().padStart(2, '0')}:00 hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                value={inputs.hour}
                onChange={(e) => setInputs({ ...inputs, hour: Number(e.target.value) })}
                className="w-full accent-[#14F1D9] cursor-pointer"
              />
            </div>

            {/* Occupancy Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8B9AB4] uppercase font-bold">Building Occupancy</span>
                <span className="text-[#FFB347] font-bold">{inputs.occupancy} Pax</span>
              </div>
              <input
                type="range"
                min={0}
                max={600}
                value={inputs.occupancy}
                disabled={isLiveMode}
                onChange={(e) => setInputs({ ...inputs, occupancy: Number(e.target.value) })}
                className={`w-full accent-[#FFB347] ${isLiveMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              />
            </div>

            {/* Weather Picker */}
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4] block mb-1">
                Atmospheric Weather
              </label>
              <select
                value={inputs.weather}
                onChange={(e) => {
                  soundEffects.playClick();
                  setInputs({ ...inputs, weather: e.target.value as MLPredictionInputs['weather'] });
                }}
                className="w-full p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F0F4FF] outline-none font-sans focus:border-[#14F1D9]/50 cursor-pointer"
              >
                {WEATHER_CONDITIONS.map((w) => (
                  <option key={w} value={w} className="bg-[#070B12] text-white">
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Schedule Picker */}
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4] block mb-1">
                Campus Activity / Schedule
              </label>
              <select
                value={inputs.event}
                onChange={(e) => {
                  soundEffects.playClick();
                  setInputs({ ...inputs, event: e.target.value as MLPredictionInputs['event'] });
                }}
                className="w-full p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F0F4FF] outline-none font-sans focus:border-[#14F1D9]/50 cursor-pointer"
              >
                {EVENT_SCHEDULES.map((ev) => (
                  <option key={ev} value={ev} className="bg-[#070B12] text-white">
                    {ev}
                  </option>
                ))}
              </select>
            </div>

            {/* Previous Incidents Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8B9AB4] uppercase font-bold">Past 30-Day Incidents</span>
                <span className="text-[#FF4D6D] font-bold">{inputs.previousIncidents} logged</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={inputs.previousIncidents}
                onChange={(e) => setInputs({ ...inputs, previousIncidents: Number(e.target.value) })}
                className="w-full accent-[#FF4D6D] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── CENTER: Risk Score Gauge, AI Explanation & 24h Trend (5 Cols) ─ */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Main Animated Risk Score Gauge */}
        <div className="p-5 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 backdrop-blur-md flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold">
              Predicted Risk Index
            </span>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
              style={{
                backgroundColor: `${getGaugeColor(prediction.riskScore)}20`,
                color: getGaugeColor(prediction.riskScore),
                border: `1px solid ${getGaugeColor(prediction.riskScore)}40`,
              }}
            >
              {prediction.dominantCategory} RISK
            </span>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative w-48 h-48 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={getGaugeColor(prediction.riskScore)}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * prediction.riskScore) / 100}
                strokeLinecap="round"
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="text-4xl font-black font-mono tracking-tight"
                style={{ color: getGaugeColor(prediction.riskScore) }}
              >
                {prediction.riskScore}
              </span>
              <span className="text-[10px] font-mono text-[#8B9AB4]">/ 100 Index</span>
            </div>
          </div>

          {/* Probability Distribution 4-Class Bars */}
          <div className="w-full grid grid-cols-4 gap-1.5 pt-2 border-t border-white/[0.06]">
            {[
              { label: 'Low', val: prediction.probabilities.low, color: '#22D3A5' },
              { label: 'Medium', val: prediction.probabilities.medium, color: '#FFB347' },
              { label: 'High', val: prediction.probabilities.high, color: '#FF8C42' },
              { label: 'Critical', val: prediction.probabilities.critical, color: '#FF4D6D' },
            ].map((p, i) => (
              <div key={i} className="flex flex-col items-center p-1.5 rounded-xl bg-white/[0.02]">
                <span className="text-[9px] font-mono text-[#8B9AB4]">{p.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: p.color }}>
                  {p.val}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Natural Language AI Explanation Card */}
        <div className="p-4 rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-gradient-to-br from-[#14F1D9]/[0.06] via-[#070B12] to-transparent backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#14F1D9]" />
            <h3 className="text-xs font-bold text-[#F0F4FF]">AI Multi-Factor Explanation</h3>
          </div>
          <p className="text-xs text-[#C5CDE8] leading-relaxed italic">
            &ldquo;{prediction.naturalLanguageExplanation}&rdquo;
          </p>
        </div>

        {/* 24-Hour Forecast Predictive Risk Trajectory Area Chart */}
        <div className="p-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 backdrop-blur-md flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#14F1D9]" />
              24-Hour Predictive Risk Forecast Trajectory
            </h3>
            <span className="text-[9px] font-mono text-[#8B9AB4]">HOURLY PROJECTION</span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prediction.forecast24h} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="predGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getGaugeColor(prediction.riskScore)} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={getGaugeColor(prediction.riskScore)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#8B9AB4" fontSize={10} tickLine={false} interval={3} />
                <YAxis stroke="#8B9AB4" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070B12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="predictedRisk"
                  name="Predicted Risk"
                  stroke={getGaugeColor(prediction.riskScore)}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#predGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Contributing Factors & Preventive Actions (3 Cols) ─ */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* SHAP-Style Contributing Factors */}
        <div className="p-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 backdrop-blur-md flex-1">
          <h3 className="text-xs font-bold text-[#F0F4FF] mb-3 flex items-center justify-between">
            <span>Contributing Factor Weights</span>
            <span className="text-[9px] font-mono text-[#8B9AB4]">SHAP IMPACT</span>
          </h3>

          <div className="space-y-2.5">
            {prediction.factorImpacts.slice(0, 5).map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#D0D6E0] font-medium truncate max-w-[150px]">{f.factor}</span>
                  <span
                    className="font-mono font-bold text-[10px]"
                    style={{ color: f.direction === 'increase' ? '#FF4D6D' : '#22D3A5' }}
                  >
                    {f.direction === 'increase' ? '+' : '-'}{Math.abs(f.weight)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.abs(f.weight) * 3)}%`,
                      backgroundColor: f.direction === 'increase' ? '#FF4D6D' : '#22D3A5',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Targeted Preventive Action Recommendations */}
        <div className="p-4 rounded-3xl glass border border-white/[0.08] bg-[#070B12]/85 backdrop-blur-md space-y-2.5">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center justify-between">
            <span>Recommended Preventive SOPs</span>
            <span className="text-[9px] font-mono text-[#22D3A5]">ACTIONABLE</span>
          </h3>

          <div className="space-y-2">
            {prediction.preventiveActions.map((act) => {
              const isDone = executedActions[act.id];
              return (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-[#F0F4FF]">{act.title}</span>
                    <span className="text-[9px] font-mono text-[#22D3A5] font-bold bg-[#22D3A5]/10 px-1.5 py-0.5 rounded">
                      {act.impactReduction}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8B9AB4] leading-snug">{act.directive}</p>
                  <button
                    onClick={() => handleActionExecute(act.id, act.title)}
                    className={`mt-1 py-1.5 px-2.5 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40'
                        : 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] hover:brightness-110 shadow-md'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    <span>{isDone ? 'Executed' : 'Execute Action'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
