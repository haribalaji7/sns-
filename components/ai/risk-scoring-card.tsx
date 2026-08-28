'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gauge,
  Flame,
  Users,
  Clock,
  MapPin,
  Building,
  History,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
} from 'lucide-react';
import { RiskFactorBreakdown } from './detection-scenarios';

interface RiskScoringCardProps {
  riskScore: number; // 0-100
  occupancy: number;
  location: string;
  riskFactors?: RiskFactorBreakdown;
  incidentType: string;
  onFactorsChange?: (newScore: number) => void;
}

export function RiskScoringCard({
  riskScore,
  occupancy,
  location,
  riskFactors,
  incidentType,
}: RiskScoringCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const defaultFactors: RiskFactorBreakdown = riskFactors || {
    incidentTypeScore: 35,
    occupancyScore: Math.min(25, Math.round(occupancy * 0.5)),
    timeScore: 12,
    locationScore: 14,
    nearbyBuildingsScore: 5,
    previousIncidentsScore: 5,
    totalScore: riskScore,
  };

  const scoreColor =
    riskScore >= 80 ? '#FF4D6D' : riskScore >= 50 ? '#FFB347' : '#22D3A5';

  const factorItems = [
    {
      label: 'Incident Type',
      icon: Flame,
      score: defaultFactors.incidentTypeScore,
      max: 35,
      desc: `${incidentType.toUpperCase()} baseline hazard weight`,
      color: '#FF4D6D',
    },
    {
      label: 'Occupancy Multiplier',
      icon: Users,
      score: defaultFactors.occupancyScore,
      max: 25,
      desc: `${occupancy} persons in immediate zone`,
      color: '#FFB347',
    },
    {
      label: 'Time of Day',
      icon: Clock,
      score: defaultFactors.timeScore,
      max: 15,
      desc: 'Active lab class hours (High vulnerability)',
      color: '#14F1D9',
    },
    {
      label: 'Location Criticality',
      icon: MapPin,
      score: defaultFactors.locationScore,
      max: 15,
      desc: `${location} (Chemical & Solvent hazard)`,
      color: '#7C5CFF',
    },
    {
      label: 'Nearby Buildings',
      icon: Building,
      score: defaultFactors.nearbyBuildingsScore,
      max: 5,
      desc: 'Central Quad & Dorm Block within 120m',
      color: '#38BDF8',
    },
    {
      label: 'Previous Incidents',
      icon: History,
      score: defaultFactors.previousIncidentsScore,
      max: 5,
      desc: '2 historical thermal alerts logged this semester',
      color: '#A78BFA',
    },
  ];

  return (
    <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[rgba(255,77,109,0.15)] border border-[#FF4D6D]/30 flex items-center justify-center">
            <Gauge className="w-3.5 h-3.5 text-[#FF4D6D]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F0F4FF]">Dynamic Risk Score</h4>
            <p className="text-[9px] font-mono text-[#8B9AB4]">Multi-variable algorithm engine</p>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="text-right flex items-baseline gap-1">
          <span
            className="text-2xl font-black tabular-nums font-mono drop-shadow-[0_0_10px_currentColor]"
            style={{ color: scoreColor }}
          >
            {riskScore}
          </span>
          <span className="text-[10px] font-mono text-[#8B9AB4]">/100</span>
        </div>
      </div>

      {/* Main Composite Progress Bar */}
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden flex mb-3 p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${riskScore}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #14F1D9 0%, #FFB347 50%, ${scoreColor} 100%)`,
            boxShadow: `0 0 10px ${scoreColor}80`,
          }}
        />
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#8B9AB4]">Occupancy:</span>
          <span className="text-[#FFB347] font-bold">{occupancy} Pax</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#8B9AB4]">Threat Level:</span>
          <span className="text-[#FF4D6D] font-bold uppercase">{riskScore > 80 ? 'Tier 1 Critical' : 'Tier 2 High'}</span>
        </div>
      </div>

      {/* Toggle Factor Breakdown */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#14F1D9] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <Sliders className="w-3 h-3" />
          {showDetails ? 'Hide Calculation Breakdown' : 'View Risk Formula Factors (6 Variables)'}
        </span>
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Factor Breakdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {factorItems.map((factor, idx) => {
              const Icon = factor.icon;
              const pct = (factor.score / factor.max) * 100;

              return (
                <div key={idx} className="bg-black/40 border border-white/[0.05] rounded-lg p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color: factor.color }} />
                      <span className="text-[11px] font-semibold text-[#F0F4FF]">{factor.label}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold" style={{ color: factor.color }}>
                      +{factor.score} <span className="text-[#8B9AB4]">/{factor.max}</span>
                    </span>
                  </div>

                  <p className="text-[9px] text-[#8B9AB4] mb-1.5">{factor.desc}</p>

                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: factor.color }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="p-2 rounded-lg bg-[rgba(20,241,217,0.05)] border border-[rgba(20,241,217,0.2)] text-[9px] font-mono text-[#8B9AB4]">
              <span className="text-[#14F1D9] font-bold">Formula: </span>
              RiskScore = TypeBase(35) + Occupancy(25) + Time(15) + Location(15) + Nearby(5) + History(5)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
