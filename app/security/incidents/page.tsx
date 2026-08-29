'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  Heart,
  Zap,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation2,
  Phone,
  Radio,
  FileText,
  User,
  Users,
  Camera,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import { useSecurityStore } from '@/store/security';
import { ArrivalWorkflowStepper } from '@/components/security/ArrivalWorkflowStepper';
import { EvacuationProgressRing } from '@/components/security/EvacuationProgressRing';
import { AIRescueAssistantCard } from '@/components/security/AIRescueAssistantCard';
import { IncidentCard } from '@/components/security/IncidentCard';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';
import { Incident } from '@/types';

export default function SecurityIncidentsPage() {
  const { incidents, updateIncidentStatus } = useDashboardStore();
  const { officer, activeIncidentId, acceptIncident, requestBackup, resolveActiveIncident } = useSecurityStore();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(activeIncidentId || 'INC-0091');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const isAssignedToMe = activeIncidentId === selectedIncident.id;

  const handleResolve = () => {
    resolveActiveIncident(resolutionNotes || 'Scene secured, all occupants evacuated, dampers verified.');
    updateIncidentStatus(selectedIncident.id, 'resolved');
    setShowResolveModal(false);
    setResolutionNotes('');
    soundEffects.playSuccess();
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ─── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12]/80 border border-white/[0.08] p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#F0F4FF] flex items-center gap-2">
            Incident Command & Field Operations
            <span className="px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] font-mono text-[10px] font-bold uppercase">
              {incidents.filter((i) => i.status !== 'resolved').length} ACTIVE
            </span>
          </h1>
          <p className="text-xs text-[#8B9AB4] font-medium">
            Realtime Triage, Student SOS Intel & Multi-Agency Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/security/navigation"
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_#14F1D9] hover:brightness-110"
          >
            <Navigation2 className="w-4 h-4" />
            <span>Open Tactical GPS Nav</span>
          </Link>
        </div>
      </div>

      {/* ─── Main Content Split Layout ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left 4 Cols: Incidents Roster List */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold px-1">
            Active Incident Feed ({incidents.length})
          </span>

          <div className="space-y-3">
            {incidents.map((inc) => {
              const isSelected = selectedIncident.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedIncidentId(inc.id);
                  }}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-[#14F1D9] rounded-2xl' : ''
                  }`}
                >
                  <IncidentCard
                    incident={inc}
                    distanceMeters={inc.id === 'INC-0091' ? 185 : inc.id === 'INC-0090' ? 340 : 520}
                    onSelect={() => setSelectedIncidentId(inc.id)}
                    onAccept={() => acceptIncident(inc.id)}
                    isAssignedToMe={activeIncidentId === inc.id}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Detailed Inspection & Operational Controls */}
        <div className="lg:col-span-8 flex flex-col gap-5 overflow-y-auto pl-1">
          {/* Arrival Workflow Stepper */}
          {isAssignedToMe && <ArrivalWorkflowStepper />}

          {/* Incident Full Dossier Card */}
          <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#FF4D6D] text-black font-mono font-black text-[10px] uppercase">
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-mono text-[#14F1D9] font-bold">
                    {selectedIncident.id}
                  </span>
                  <span className="text-[10px] font-mono text-[#8B9AB4]">
                    Reported: {new Date(selectedIncident.reportedAt).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-lg font-black text-[#F0F4FF]">
                  {selectedIncident.title}
                </h2>
                <p className="text-xs font-mono text-[#D0D6E0] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#14F1D9]" />
                  {selectedIncident.location}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => requestBackup(`Assisting on ${selectedIncident.id} at ${selectedIncident.location}`)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#FFB347] border border-white/10 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Request Backup</span>
                </button>

                <button
                  onClick={() => setShowResolveModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[rgba(34,211,165,0.15)] hover:bg-[#22D3A5] text-[#22D3A5] hover:text-[#070B12] border border-[#22D3A5]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>

            {/* Description & CCTV Visual Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block">
                  Incident Description &amp; Sensor Telemetry
                </span>
                <p className="text-xs text-[#D0D6E0] leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                  {selectedIncident.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[9px] text-[#8B9AB4] block">AI Confidence:</span>
                    <span className="text-[#14F1D9] font-bold">{selectedIncident.aiConfidence}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[9px] text-[#8B9AB4] block">Occupants at Risk:</span>
                    <span className="text-[#FF4D6D] font-bold">{selectedIncident.peopleAtRisk} People</span>
                  </div>
                </div>
              </div>

              {/* CCTV Feed Snapshot with YOLOv8 Bounding Boxes */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center justify-between">
                  <span>CCTV Vision (CAM-B3-01)</span>
                  <span className="text-[#14F1D9]">YOLOv8 DETECTED</span>
                </span>
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=900&auto=format&fit=crop&q=80"
                    alt="CCTV stream"
                    className="w-full h-full object-cover select-none"
                  />

                  {/* Bounding Box 1 */}
                  <div className="absolute top-[26%] left-[36%] w-[26%] h-[36%] border-2 border-[#FF4D6D] bg-[#FF4D6D]/15">
                    <span className="absolute -top-4 left-0 px-1 text-[8px] font-mono font-bold bg-[#FF4D6D] text-white">
                      Flame 96%
                    </span>
                  </div>

                  {/* Bounding Box 2 */}
                  <div className="absolute top-[12%] left-[26%] w-[46%] h-[28%] border-2 border-[#FFB347] bg-[#FFB347]/15">
                    <span className="absolute -top-4 left-0 px-1 text-[8px] font-mono font-bold bg-[#FFB347] text-black">
                      Smoke 91%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student SOS & Voice Transcript (If Applicable) */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-mono text-[#14F1D9] font-bold uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Student SOS Beacon &amp; 911 Transcript
              </span>
              <p className="text-xs text-[#F0F4FF] leading-relaxed italic">
                &quot;Emergency in Lab 302! Solvents ignited near fume hood 4. Room filling with dense smoke, students evacuating to East Stairwell!&quot; — Rahul S. (ID: STU-8821)
              </p>
            </div>
          </div>

          {/* AI Rescue Assistant Intelligence Card */}
          <AIRescueAssistantCard
            title={selectedIncident.title}
            location={selectedIncident.location}
            occupancy={selectedIncident.peopleAtRisk || 42}
          />

          {/* Evacuation Progress Supervision Card */}
          <EvacuationProgressRing />
        </div>
      </div>

      {/* ─── Resolution Debrief Confirmation Modal ───────────────────── */}
      <AnimatePresence>
        {showResolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-2xl glass border border-[rgba(34,211,165,0.4)] bg-[#070B12] p-5 shadow-[0_0_40px_rgba(34,211,165,0.25)] flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22D3A5]/20 border border-[#22D3A5]/40 flex items-center justify-center text-[#22D3A5]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F0F4FF]">Finalize Case Resolution</h3>
                  <p className="text-[10px] text-[#8B9AB4] font-mono">Submit officer debrief log to Admin &amp; Supabase</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#8B9AB4] uppercase block mb-1 font-bold">
                  Officer Resolution Notes &amp; Actions Taken:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Fire extinguished via CO2 unit, 42 occupants safely evacuated, HVAC dampers locked."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#22D3A5]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResolve}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#22D3A5] to-[#14F1D9] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Resolution</span>
                </button>

                <button
                  onClick={() => setShowResolveModal(false)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
