'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  UserX,
  Heart,
  Wind,
  Shield,
  Radio,
  Send,
  Navigation,
  Eye,
  Clock,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import type { Incident, Responder, CampusZone } from '@/types';

interface MapBottomSheetProps {
  selectedIncident: Incident | null;
  selectedResponder: Responder | null;
  selectedZone: CampusZone | null;
  onClose: () => void;
  onOpenStreetView?: (lat: number, lng: number, title: string) => void;
  onDispatch?: (incidentId: string) => void;
  onEvacuate?: (incidentId: string) => void;
}

export function MapBottomSheet({
  selectedIncident,
  selectedResponder,
  selectedZone,
  onClose,
  onOpenStreetView,
  onDispatch,
  onEvacuate,
}: MapBottomSheetProps) {
  if (!selectedIncident && !selectedResponder && !selectedZone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 glass rounded-2xl p-4 border border-[rgba(20,241,217,0.3)] bg-[#070B12]/95 backdrop-blur-2xl shadow-2xl z-30 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-[10px] font-mono font-bold text-[#14F1D9] uppercase tracking-wider">
            {selectedIncident
              ? 'INCIDENT INSPECTOR'
              : selectedResponder
              ? 'TACTICAL SQUAD INSPECTOR'
              : 'BUILDING SAFETY CARD'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8B9AB4] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Incident View */}
        {selectedIncident && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      selectedIncident.severity === 'critical'
                        ? 'rgba(255,77,109,0.2)'
                        : 'rgba(245,158,11,0.2)',
                    color:
                      selectedIncident.severity === 'critical' ? '#FF4D6D' : '#F59E0B',
                  }}
                >
                  {selectedIncident.severity.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-[#8B9AB4]">
                  {selectedIncident.id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#F0F4FF]">
                {selectedIncident.title}
              </h3>
              <p className="text-xs text-[#8B9AB4] mt-0.5">{selectedIncident.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono text-[#8B9AB4] block">PEOPLE AT RISK</span>
                <span className="text-xs font-bold text-[#FF4D6D]">
                  {selectedIncident.peopleAtRisk} Occupants
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono text-[#8B9AB4] block">AI CONFIDENCE</span>
                <span className="text-xs font-bold text-[#14F1D9]">
                  {selectedIncident.aiConfidence}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <GradientButton
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => onDispatch?.(selectedIncident.id)}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Dispatch Squad
              </GradientButton>

              {onOpenStreetView && (
                <button
                  onClick={() =>
                    onOpenStreetView(
                      selectedIncident.coordinates.lat,
                      selectedIncident.coordinates.lng,
                      selectedIncident.title,
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F0F4FF] border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5 text-[#14F1D9]" />
                  Street View
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Responder View */}
        {selectedResponder && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#F0F4FF]">
                  {selectedResponder.name}
                </span>
                <span className="text-[10px] font-mono text-[#00E59B] font-semibold">
                  {selectedResponder.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#8B9AB4]">
                {selectedResponder.role} · {selectedResponder.team}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-[#8B9AB4]">Radio Channel:</span>
              <span className="text-[#14F1D9] font-bold">{selectedResponder.radioChannel}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#8B9AB4]">Certifications:</span>
              <div className="flex gap-1 flex-wrap">
                {selectedResponder.certifications.map((c, i) => (
                  <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#8B9AB4]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Building Safety Card View */}
        {selectedZone && (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-[#8B9AB4]">{selectedZone.id}</span>
              <h3 className="text-sm font-bold text-[#F0F4FF]">{selectedZone.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono text-[#8B9AB4] block">OCCUPANCY</span>
                <span className="text-xs font-bold text-[#14F1D9]">
                  {selectedZone.occupancy} / {selectedZone.capacity}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono text-[#8B9AB4] block">ZONE RISK</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: selectedZone.riskScore > 70 ? '#FF4D6D' : '#00E59B' }}
                >
                  {selectedZone.riskScore}%
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
