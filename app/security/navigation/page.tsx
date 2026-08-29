'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Navigation2,
  Compass,
  Layers,
  Flame,
  Shield,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Radio,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { TacticalNavMap } from '@/components/security/TacticalNavMap';
import { ArrivalWorkflowStepper } from '@/components/security/ArrivalWorkflowStepper';
import { useSecurityStore } from '@/store/security';
import { useDashboardStore } from '@/store/dashboard';
import Link from 'next/link';

export default function SecurityNavigationPage() {
  const { officer, activeIncidentId, arrivalStage, setArrivalStage } = useSecurityStore();
  const { incidents } = useDashboardStore();

  const currentIncident = incidents.find((i) => i.id === activeIncidentId) || incidents[0];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Breadcrumb & Incident Quick Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12]/80 border border-white/[0.08] p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/security/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#FF4D6D] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-ping" />
                ACTIVE EMERGENCY NAVIGATION
              </span>
              <span className="text-xs font-mono font-bold text-[#14F1D9]">
                {currentIncident.id}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-[#F0F4FF] truncate">
              {currentIncident.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#22D3A5]/15 border border-[#22D3A5]/30 text-[#22D3A5] font-mono text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safest A* Corridor Active</span>
          </span>
        </div>
      </div>

      {/* Main Grid: 8 Cols Map + 4 Cols Tactical Arrival & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left 8 Cols: Flagship Tactical Nav Map */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          <TacticalNavMap
            targetCoordinates={currentIncident.coordinates}
            incidentTitle={currentIncident.title}
            incidentLocation={currentIncident.location}
            onArrival={() => {
              setArrivalStage('arrived');
            }}
          />
        </div>

        {/* Right 4 Cols: Arrival Workflow & Building Floor Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Arrival Workflow Stepper */}
          <ArrivalWorkflowStepper />

          {/* Floor & Access Infiltration Guidance */}
          <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 p-4 backdrop-blur-xl shadow-xl space-y-3 text-xs font-mono">
            <span className="text-[10px] uppercase text-[#8B9AB4] font-bold block">
              Building Access & Infiltration Telemetry
            </span>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-[#8B9AB4]">Destination Zone:</span>
                <span className="text-[#F0F4FF] font-bold">Science Block B (Fl. 3)</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-[#8B9AB4]">Optimal Access:</span>
                <span className="text-[#14F1D9] font-bold">East Access Door E-3</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-[#8B9AB4]">Avoid Corridor:</span>
                <span className="text-[#FF4D6D] font-bold">Corridor B (Heavy Smoke)</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-[#8B9AB4]">Occupancy Headcount:</span>
                <span className="text-[#FFB347] font-bold">42 People at Risk</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex gap-2">
              <Link
                href="/security/incidents"
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <span>View Full Incident Data</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
