'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  UserX,
  Heart,
  Wind,
  Radio,
  Cpu,
  Send,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { GradientButton } from '@/components/ui';
import Link from 'next/link';

const scenarios = [
  {
    id: 'fire',
    label: 'Lab 302 Chemical Fire',
    icon: Flame,
    color: '#FF4D6D',
    location: 'Science Block B – Floor 3',
    steps: [
      {
        number: '01',
        title: 'Sensor Spike Trigger',
        icon: Radio,
        detail: 'Smoke sensors SEN-001 (87 ppm) and thermal camera CAM-B3-01 detect 340°C anomaly near fume hood.',
        metric: 'Delta: +260°C in 4.2s',
        badge: 'IoT Trigger',
      },
      {
        number: '02',
        title: 'AI Multimodal Triage',
        icon: Cpu,
        detail: 'YOLOv8-Flame classifies Class 1 Chemical Fire with 98.4% confidence and assigns a 95/100 risk score.',
        metric: 'Inference Latency: 42ms',
        badge: 'Neural Scoring',
      },
      {
        number: '03',
        title: 'Dynamic Evacuation',
        icon: Navigation,
        detail: 'A* routing calculates safe corridor: East Stairwell → North Quad. 42 occupants alerted on mobile.',
        metric: 'ETA Clearance: 2m 30s',
        badge: 'Egress Active',
      },
      {
        number: '04',
        title: 'Squad Dispatch & Radio',
        icon: Send,
        detail: 'Dispatches Fire Lead Cpt. Alex Rivera (R-101) and Tactical Fire Unit Lt. Chen (R-103) on CH-4.',
        metric: 'Responder ETA: 45s',
        badge: 'Tactical Unit',
      },
      {
        number: '05',
        title: 'Hazard Containment',
        icon: CheckCircle2,
        detail: 'SCBA fire suppression applied, ventilation purged, telemetry restored, and incident archived.',
        metric: 'Total Time: 4m 12s',
        badge: 'Incident Resolved',
      },
    ],
  },
  {
    id: 'intrusion',
    label: 'Server Room Forced Entry',
    icon: UserX,
    color: '#7C5CFF',
    location: 'IT Building – Basement B1',
    steps: [
      {
        number: '01',
        title: 'Access Control Breach',
        icon: Radio,
        detail: 'RFID access sensor SEN-004 registers 3 consecutive badge failures followed by door forced open.',
        metric: 'Sensor SEN-004 Alert',
        badge: 'Badge Breach',
      },
      {
        number: '02',
        title: 'AI Facial & Pose Triage',
        icon: Cpu,
        detail: 'Security camera CAM-IT-B01 detects unauthorized masked individual in restricted server vault.',
        metric: 'Threat Score: 93.1%',
        badge: 'Ensemble Neural',
      },
      {
        number: '03',
        title: 'Automated Lockdown',
        icon: Navigation,
        detail: 'Sub-level electronic magnetic doors engage. Zone Z-ITB shifted to caution state.',
        metric: 'Lockdown Latency: 120ms',
        badge: 'Auto Containment',
      },
      {
        number: '04',
        title: 'Armed Security Dispatch',
        icon: Send,
        detail: 'Sgt. Priya Sharma (R-102) dispatched with live GPS tracking on CH-2 Tactical frequency.',
        metric: 'Arrival ETA: 75s',
        badge: 'Security Dispatched',
      },
      {
        number: '05',
        title: 'Perimeter Secured',
        icon: CheckCircle2,
        detail: 'Intruder intercepted at Service Tunnel B1. Server integrity verified with zero data loss.',
        metric: 'Contained in 2m 10s',
        badge: 'Area Secured',
      },
    ],
  },
  {
    id: 'medical',
    label: 'Athletic Track Cardiac Event',
    icon: Heart,
    color: '#FFB347',
    location: 'Athletic Center – Indoor Track',
    steps: [
      {
        number: '01',
        title: 'Sudden Fall Detected',
        icon: Radio,
        detail: 'Pose detection camera CAM-ATH-03 identifies student collapse and prolonged inactivity on track.',
        metric: 'Inactivity: > 30s',
        badge: 'Pose Anomaly',
      },
      {
        number: '02',
        title: 'Cardiac Triage Scoring',
        icon: Cpu,
        detail: 'BioGuard Vision model flags suspected cardiac event with 99.1% confidence. Automated AED beacon engaged.',
        metric: 'Confidence: 99.1%',
        badge: 'Medical AI',
      },
      {
        number: '03',
        title: 'AED Beacon Broadcast',
        icon: Navigation,
        detail: 'Nearest bystander alert triggered with guidance to Wall Station AED-4 located 18 meters away.',
        metric: 'Distance: 18m',
        badge: 'Beacon Active',
      },
      {
        number: '04',
        title: 'Paramedic Fast-Track',
        icon: Send,
        detail: 'Dr. Sarah Mills (R-104 ALS Paramedic) dispatched directly with automated elevator priority call.',
        metric: 'Arrival ETA: 60s',
        badge: 'ALS Paramedic',
      },
      {
        number: '05',
        title: 'Vitals Stabilized',
        icon: CheckCircle2,
        detail: 'Defibrillator applied, sinus rhythm restored, patient safely transferred to campus ambulance.',
        metric: 'Response Time: 1m 45s',
        badge: 'Patient Stable',
      },
    ],
  },
  {
    id: 'gas',
    label: 'Library Chemical Gas Leak',
    icon: Wind,
    color: '#22D3A5',
    location: 'Main Library – Basement Archives',
    steps: [
      {
        number: '01',
        title: 'VOC & CO2 Sensor Spike',
        icon: Radio,
        detail: 'Chemical sensor SEN-006 flags CO2 spike above 1000 ppm and elevated toxic solvent vapors.',
        metric: 'CO2: 1,420 ppm',
        badge: 'Chemical Spike',
      },
      {
        number: '02',
        title: 'Plume Dispersion AI',
        icon: Cpu,
        detail: 'Fluid dispersion model forecasts vapor migration toward Ground Floor East Wing in 6 minutes.',
        metric: 'Spread Vector: North-East',
        badge: 'Plume Physics',
      },
      {
        number: '03',
        title: 'HVAC Purge & Rerouting',
        icon: Navigation,
        detail: 'Automated BACnet signal activates emergency roof extraction fans and closes dampers to Floor 1.',
        metric: 'Extraction: 100% CFM',
        badge: 'HVAC Triggered',
      },
      {
        number: '04',
        title: 'HAZMAT Team Deployment',
        icon: Send,
        detail: 'HAZMAT squad deployed to seal basement archive pipeline. 18 occupants evacuated.',
        metric: 'Responder ETA: 90s',
        badge: 'HAZMAT Unit',
      },
      {
        number: '05',
        title: 'Air Quality Normalized',
        icon: CheckCircle2,
        detail: 'Sensors report normal PPM levels. Clearance certificate issued for library reopening.',
        metric: 'Clearance: 18 min',
        badge: 'Air Safe',
      },
    ],
  },
];

export function DemoWorkflowSection() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const scenario = scenarios[selectedScenario];

  return (
    <section id="workflow" className="relative py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFB347]/10 border border-[rgba(255,179,71,0.3)] text-[#FFB347] text-xs font-mono mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE RESPONSE SIMULATION</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-[#F0F4FF] tracking-tight uppercase"
          >
            Automated Emergency{' '}
            <span className="bg-gradient-to-r from-[#FFB347] via-[#FF4D6D] to-[#14F1D9] bg-clip-text text-fill-transparent">
              Lifecycle
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#8B9AB4] mt-4"
          >
            Select an incident scenario to trace how CampusShield AI autonomously triages, calculates evacuation paths, and coordinates responders.
          </motion.p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {scenarios.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = selectedScenario === idx;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedScenario(idx);
                  setActiveStep(0);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'glass border-[rgba(20,241,217,0.5)] text-white shadow-[0_0_20px_rgba(20,241,217,0.25)]'
                    : 'glass-subtle text-[#8B9AB4] hover:text-[#F0F4FF] hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5-Step Workflow Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {scenario.steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            const isPast = activeStep > idx;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                  isCurrent
                    ? 'glass border-[rgba(20,241,217,0.6)] bg-white/[0.08] shadow-[0_0_25px_rgba(20,241,217,0.25)] scale-[1.02]'
                    : isPast
                    ? 'glass-subtle border-[rgba(34,211,165,0.3)] bg-white/[0.03]'
                    : 'glass-subtle border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isCurrent ? `${scenario.color}25` : 'rgba(255,255,255,0.05)',
                        color: isCurrent ? scenario.color : '#8B9AB4',
                      }}
                    >
                      STEP {step.number}
                    </span>
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isCurrent ? scenario.color : '#8B9AB4' }}
                    />
                  </div>

                  <h4 className="text-sm font-bold text-[#F0F4FF] mb-1.5">{step.title}</h4>
                  <p className="text-xs text-[#8B9AB4] leading-relaxed mb-3">{step.detail}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#14F1D9]">{step.metric}</span>
                  <span className="text-[#8B9AB4]">{step.badge}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tactical Summary Box & Command Center Link */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-[rgba(20,241,217,0.2)] bg-gradient-to-r from-white/[0.03] to-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-ping" />
              <span className="text-xs font-mono text-[#14F1D9] font-semibold uppercase">
                Active Scenario: {scenario.location}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#F0F4FF]">
              Experience Full Autonomous Dispatch in Real-Time
            </h3>
            <p className="text-xs sm:text-sm text-[#8B9AB4] mt-1 max-w-2xl">
              Inspect active sensor feeds, responder telemetry channels, and dynamic GeoJSON evacuation routes in the live Command Center console.
            </p>
          </div>

          <Link href="/dashboard" className="flex-shrink-0">
            <GradientButton
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-sm font-bold shadow-[0_0_25px_rgba(20,241,217,0.35)]"
            >
              Launch Command Center
            </GradientButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
