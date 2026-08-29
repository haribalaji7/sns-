'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  AlertTriangle,
  Heart,
  Zap,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation2,
  ChevronRight,
  User,
  Users,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { Incident, IncidentSeverity, IncidentType } from '@/types';
import { useSecurityStore } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';

interface IncidentCardProps {
  incident: Incident;
  distanceMeters?: number;
  onSelect?: (inc: Incident) => void;
  onAccept?: (inc: Incident) => void;
  isAssignedToMe?: boolean;
}

export function IncidentCard({
  incident,
  distanceMeters = 185,
  onSelect,
  onAccept,
  isAssignedToMe = false,
}: IncidentCardProps) {
  const { activeIncidentId, acceptIncident } = useSecurityStore();
  const isAccepted = activeIncidentId === incident.id;

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'fire':
      case 'smoke':
        return <Flame className="w-4 h-4 text-[#FF4D6D]" />;
      case 'medical':
      case 'person_fallen':
        return <Heart className="w-4 h-4 text-[#38BDF8]" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-[#FACC15]" />;
      case 'violence':
      case 'intrusion':
        return <AlertOctagon className="w-4 h-4 text-[#FF4D6D]" />;
      case 'crowd':
        return <Users className="w-4 h-4 text-[#7C5CFF]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[#FFB347]" />;
    }
  };

  const getSeverityStyle = (severity: IncidentSeverity, status: Incident['status']) => {
    if (status === 'resolved') {
      return {
        badge: 'bg-[#22D3A5]/15 text-[#22D3A5] border-[#22D3A5]/40',
        cardBorder: 'border-[#22D3A5]/30 hover:border-[#22D3A5]/60',
        glow: 'shadow-[0_0_15px_rgba(34,211,165,0.15)]',
      };
    }
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-[#FF4D6D] text-black font-black font-mono',
          cardBorder: 'border-[#FF4D6D]/40 hover:border-[#FF4D6D]',
          glow: 'shadow-[0_0_20px_rgba(255,77,109,0.25)]',
        };
      case 'high':
        return {
          badge: 'bg-[#FFB347]/20 text-[#FFB347] border-[#FFB347]/40',
          cardBorder: 'border-[#FFB347]/40 hover:border-[#FFB347]',
          glow: 'shadow-[0_0_15px_rgba(255,179,71,0.2)]',
        };
      case 'medium':
        return {
          badge: 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40',
          cardBorder: 'border-[#38BDF8]/30 hover:border-[#38BDF8]',
          glow: '',
        };
      case 'low':
      default:
        return {
          badge: 'bg-white/10 text-[#8B9AB4] border-white/20',
          cardBorder: 'border-white/10 hover:border-white/20',
          glow: '',
        };
    }
  };

  const style = getSeverityStyle(incident.severity, incident.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 sm:p-4 rounded-2xl glass bg-[#070B12]/85 backdrop-blur-md border ${style.cardBorder} ${style.glow} transition-all duration-200 flex flex-col gap-3 relative overflow-hidden`}
    >
      {/* Top Banner & Severity Indicator */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
            {getTypeIcon(incident.type)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#14F1D9]">
                {incident.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${style.badge}`}>
                {incident.severity}
              </span>
              {isAccepted && (
                <span className="px-2 py-0.5 rounded-full bg-[#22D3A5]/20 border border-[#22D3A5]/40 text-[#22D3A5] text-[9px] font-mono font-bold">
                  ASSIGNED TO YOU
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#F0F4FF] leading-snug mt-0.5">
              {incident.title}
            </h4>
          </div>
        </div>

        {/* AI Threat Risk Score Badge */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#8B9AB4]">
            <Sparkles className="w-3 h-3 text-[#14F1D9]" />
            <span>Risk Score</span>
          </div>
          <span className="text-sm font-mono font-black text-[#FF4D6D]">
            {incident.severity === 'critical' ? '94/100' : incident.severity === 'high' ? '78/100' : '52/100'}
          </span>
        </div>
      </div>

      {/* Incident Location & Distance Telemetry */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-[#D0D6E0] truncate">
          <MapPin className="w-3.5 h-3.5 text-[#14F1D9] flex-shrink-0" />
          <span className="truncate">{incident.location}</span>
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[#14F1D9] font-bold">
          <Navigation2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{distanceMeters}m away (~{Math.round(distanceMeters / 3.5)}s)</span>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-[11px] text-[#8B9AB4] line-clamp-2 leading-relaxed">
        {incident.description}
      </p>

      {/* Quick Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#8B9AB4]">
          <Clock className="w-3 h-3" />
          <span>{new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {incident.peopleAtRisk > 0 && (
            <span className="text-[#FF4D6D] ml-1 font-bold">({incident.peopleAtRisk} at risk)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAccepted ? (
            <button
              onClick={() => {
                soundEffects.playAlert();
                if (onAccept) onAccept(incident);
                else acceptIncident(incident.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4D6D] to-[#FFB347] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,77,109,0.3)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept Case</span>
            </button>
          ) : (
            <Link
              href="/security/navigation"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(20,241,217,0.4)] transition-all"
            >
              <Navigation2 className="w-3.5 h-3.5" />
              <span>Navigate</span>
            </Link>
          )}

          <button
            onClick={() => {
              soundEffects.playClick();
              if (onSelect) onSelect(incident);
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 cursor-pointer"
            title="View Full Incident Details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
