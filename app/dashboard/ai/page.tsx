'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  Sliders,
  Cpu,
  Layers,
  Bot,
  Scan,
  Image as ImageIcon,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import {
  DETECTION_SCENARIOS,
  STUDENT_SOS_PRESET,
  VOICE_TRANSCRIPT_PRESET,
  OFFICER_REPORT_PRESET,
  CCTV_CAMERAS,
  DetectionScenario,
  DetectionSource,
} from '@/components/ai/detection-scenarios';
import { PipelineStepper, PipelineStage } from '@/components/ai/pipeline-stepper';
import { ConfidenceGauge } from '@/components/ai/confidence-gauge';
import { RiskScoringCard } from '@/components/ai/risk-scoring-card';
import { AIRecommendationCard } from '@/components/ai/ai-recommendation-card';
import { CCTVScannerCanvas } from '@/components/ai/cctv-scanner-canvas';
import { VerificationPanel } from '@/components/ai/verification-panel';
import { SourceSelectorPanel } from '@/components/ai/source-selector-panel';
import { AICopilotStudio } from '@/components/ai/AICopilotStudio';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';

export default function AIPage() {
  const { verifyIncident, logFalseAlarm, addToast } = useDashboardStore();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'copilot' | 'detection'>('copilot');

  // Active Detection State
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('scen-fire');
  const [currentSource, setCurrentSource] = useState<DetectionSource>('cctv');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-B3-01');
  const [activeScenario, setActiveScenario] = useState<DetectionScenario>(DETECTION_SCENARIOS['scen-fire']);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Pipeline & Simulation State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('verification');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [lastDispatchedId, setLastDispatchedId] = useState<string>('');

  // Recent Uploads & Feed history
  const [recentFeeds, setRecentFeeds] = useState([
    { id: 'RU-1', type: 'CAM-B3-01 (Science Lab)', location: 'Science Block B – Fl. 3', time: new Date(Date.now() - 3 * 60000).toISOString(), status: 'flagged' as const, scenarioKey: 'scen-fire' },
    { id: 'RU-2', type: 'Student Mobile SOS', location: 'Dormitory Quad A', time: new Date(Date.now() - 8 * 60000).toISOString(), status: 'flagged' as const, scenarioKey: 'scen-sos-1' },
    { id: 'RU-3', type: 'CAM-IT-02 (Substation)', location: 'IT Basement B1', time: new Date(Date.now() - 14 * 60000).toISOString(), status: 'flagged' as const, scenarioKey: 'scen-electrical' },
    { id: 'RU-4', type: 'CAM-ATH-03 (Arena)', location: 'Athletic Pavilion', time: new Date(Date.now() - 25 * 60000).toISOString(), status: 'flagged' as const, scenarioKey: 'scen-medical' },
  ]);

  // Run simulated step-by-step pipeline when a new feed is selected
  const runPipelineAnalysis = (scenario: DetectionScenario) => {
    setIsAnalyzing(true);
    setPipelineStage('input');
    soundEffects.playScan();

    setTimeout(() => {
      setPipelineStage('preprocessing');
    }, 400);

    setTimeout(() => {
      setPipelineStage('yolo');
    }, 900);

    setTimeout(() => {
      setPipelineStage('gemini');
    }, 1500);

    setTimeout(() => {
      setPipelineStage('risk');
    }, 2100);

    setTimeout(() => {
      setPipelineStage('verification');
      setIsAnalyzing(false);
      setActiveScenario(scenario);
      soundEffects.playAlert();
    }, 2600);
  };

  // Switch scenario preset
  const handleSelectPreset = (key: string) => {
    setActiveScenarioKey(key);
    let scenario: DetectionScenario;
    if (key === 'scen-sos-1') {
      scenario = STUDENT_SOS_PRESET;
      setCurrentSource('student_sos');
    } else if (key === 'scen-voice-1') {
      scenario = VOICE_TRANSCRIPT_PRESET;
      setCurrentSource('voice_transcript');
    } else if (key === 'scen-officer-1') {
      scenario = OFFICER_REPORT_PRESET;
      setCurrentSource('officer_report');
    } else {
      scenario = DETECTION_SCENARIOS[key] || DETECTION_SCENARIOS['scen-fire'];
      setCurrentSource('cctv');
      if (scenario.cameraId) setSelectedCameraId(scenario.cameraId);
    }
    runPipelineAnalysis(scenario);
  };

  // Switch camera
  const handleSelectCamera = (camId: string) => {
    setSelectedCameraId(camId);
    const cam = CCTV_CAMERAS.find((c) => c.id === camId);
    if (cam && cam.defaultIncident) {
      handleSelectPreset(cam.defaultIncident);
    }
  };

  // Switch source tab
  const handleSourceChange = (src: DetectionSource) => {
    setCurrentSource(src);
    if (src === 'student_sos') {
      handleSelectPreset('scen-sos-1');
    } else if (src === 'voice_transcript') {
      handleSelectPreset('scen-voice-1');
    } else if (src === 'officer_report') {
      handleSelectPreset('scen-officer-1');
    } else if (src === 'cctv') {
      handleSelectPreset('scen-fire');
    }
  };

  // Handle uploaded file or image
  const handleFileUpload = (fileOrUrl: string | File) => {
    const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    const customScenario: DetectionScenario = {
      ...DETECTION_SCENARIOS['scen-fire'],
      id: `upload-${Date.now()}`,
      title: 'Uploaded Media Analysis',
      source: 'upload',
      imageUrl: url,
      evidence: {
        ...DETECTION_SCENARIOS['scen-fire'].evidence,
        sourceType: 'Uploaded Media File (Local Ingestion)',
        sourceId: 'UPLOAD-STREAM-01',
        timestamp: new Date().toLocaleTimeString(),
      },
    };
    setActiveScenario(customScenario);
    runPipelineAnalysis(customScenario);

    setRecentFeeds((prev) => [
      {
        id: `RU-${Date.now()}`,
        type: 'User Uploaded Media',
        location: 'Uploaded Stream',
        time: new Date().toISOString(),
        status: 'flagged',
        scenarioKey: 'scen-fire',
      },
      ...prev.slice(0, 4),
    ]);
  };

  // Verification actions
  const handleConfirmIncident = async () => {
    setIsConfirming(true);
    setPipelineStage('dispatched');

    const assignedId = `INC-00${Math.floor(Math.random() * 80 + 92)}`;
    setLastDispatchedId(assignedId);

    try {
      await verifyIncident(activeScenario);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirming(false);
      setShowDispatchModal(true);
    }
  };

  const handleFalseAlarm = () => {
    logFalseAlarm(activeScenario, 'Verified as non-emergency false alarm by duty controller');
    handleSelectPreset('scen-smoke');
  };

  const handleRequestHuman = () => {
    addToast({
      type: 'warning',
      title: 'Human Verification Escalated',
      message: `Duty Commander assigned to inspect ${activeScenario.location}.`,
    });
  };

  const handleActionTrigger = (actionId: string, label: string) => {
    addToast({
      type: 'info',
      title: 'Automated Protocol Engaged',
      message: `Executing: ${label}`,
    });
  };

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col gap-4 overflow-y-auto">
      {/* ─── Top Flagship Workspace Selector ─────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] flex items-center justify-center shadow-[0_0_15px_rgba(20,241,217,0.3)]">
              <Sparkles className="w-5 h-5 text-[#14F1D9]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#F0F4FF] flex items-center gap-2">
                CampusShield Intelligence Layer
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/40 uppercase">
                  v4.2 PRO
                </span>
              </h1>
              <p className="text-xs text-[#8B9AB4] font-medium">
                Autonomous Visual Synthesis, Multi-Modal Copilot & Neural Incident Verification
              </p>
            </div>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass border border-white/[0.08] bg-[#070B12]/80">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('copilot');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] shadow-[0_0_15px_rgba(20,241,217,0.4)]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot & Visual Studio</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('detection');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'detection'
                ? 'bg-gradient-to-r from-[#7C5CFF] to-[#14F1D9] text-white shadow-[0_0_15px_rgba(124,92,255,0.4)]'
                : 'text-[#8B9AB4] hover:text-white'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>AI Detection & Verification Center</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: AI Copilot & Visual Studio ────────────────────────── */}
      {activeTab === 'copilot' ? (
        <div className="flex-1 min-h-0">
          <AICopilotStudio />
        </div>
      ) : (
        /* ─── TAB 2: AI Detection & Verification Engine ───────────────── */
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Neural Pipeline Stepper Banner */}
          <PipelineStepper
            currentStage={pipelineStage}
            stageLatencies={{
              input: 8,
              preprocessing: 14,
              yolo: 18,
              gemini: 42,
              risk: 12,
              verification: 0,
              dispatched: 10,
            }}
          />

          {/* 3-Column Detection Studio */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
            {/* Left: Sources */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-0.5">
              <SourceSelectorPanel
                currentSource={currentSource}
                onSourceChange={handleSourceChange}
                selectedCameraId={selectedCameraId}
                onCameraSelect={handleSelectCamera}
                onPresetSelect={handleSelectPreset}
                onFileUpload={handleFileUpload}
                recentFeeds={recentFeeds}
              />
            </div>

            {/* Center: CCTV Vision Scanner & AI Recommendation */}
            <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex-1 min-h-[420px] flex flex-col">
                <CCTVScannerCanvas
                  imageUrl={activeScenario.imageUrl}
                  cameraId={activeScenario.cameraId}
                  cameraName={activeScenario.cameraName}
                  objects={activeScenario.objects}
                  analyzing={isAnalyzing}
                  selectedObjectId={selectedObjectId}
                  onObjectClick={(obj) => setSelectedObjectId(obj.id)}
                />
              </div>

              <AIRecommendationCard
                recommendation={activeScenario.recommendation}
                suggestedActions={activeScenario.suggestedActions}
                onActionTrigger={handleActionTrigger}
              />
            </div>

            {/* Right: Confidence Gauge, Risk Engine & Verification */}
            <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pl-0.5">
              <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-4 backdrop-blur-md flex flex-col items-center shadow-lg">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold">
                    Verification Metrics
                  </span>
                  <span className="text-[10px] font-mono text-[#14F1D9] font-bold">
                    {activeScenario.title}
                  </span>
                </div>

                <ConfidenceGauge
                  confidence={activeScenario.confidence}
                  severity={activeScenario.severity}
                  size={155}
                  yoloScore={97.4}
                  nlpScore={95.8}
                  sensorScore={98.2}
                />
              </div>

              <RiskScoringCard
                riskScore={activeScenario.riskScore}
                occupancy={activeScenario.occupancy}
                location={activeScenario.location}
                riskFactors={activeScenario.riskFactors}
                incidentType={activeScenario.type}
              />

              <VerificationPanel
                scenario={activeScenario}
                onConfirm={handleConfirmIncident}
                onFalseAlarm={handleFalseAlarm}
                onRequestHuman={handleRequestHuman}
                isConfirming={isConfirming}
              />
            </div>
          </div>
        </div>
      )}

      {/* Realtime Dispatch Confirmation Modal */}
      <AnimatePresence>
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg rounded-2xl glass border border-[rgba(20,241,217,0.4)] bg-[#070B12] p-6 shadow-[0_0_50px_rgba(20,241,217,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#14F1D9] via-[#22D3A5] to-[#7C5CFF]" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#22D3A5]/20 border border-[#22D3A5]/40 flex items-center justify-center text-[#22D3A5] shadow-[0_0_20px_rgba(34,211,165,0.4)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#F0F4FF]">
                    Incident Verified & Dispatched
                  </h3>
                  <p className="text-xs text-[#22D3A5] font-mono font-semibold">
                    BROADCAST LIVE TO RESPONDERS & SUPABASE
                  </p>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl p-4 border border-white/[0.08] space-y-2.5 mb-5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8B9AB4]">Incident ID:</span>
                  <span className="text-[#14F1D9] font-bold">{lastDispatchedId || 'INC-0092'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9AB4]">Type & Severity:</span>
                  <span className="text-[#FF4D6D] font-bold uppercase">{activeScenario.type} · {activeScenario.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9AB4]">Location:</span>
                  <span className="text-[#F0F4FF] truncate max-w-[240px]">{activeScenario.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9AB4]">Assigned Unit:</span>
                  <span className="text-[#22D3A5] font-bold">Squad Alpha (Cpt. Alex Rivera)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9AB4]">Estimated Response ETA:</span>
                  <span className="text-[#FFB347] font-bold">1m 45s</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/dashboard/map"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
                >
                  <span>Track on Campus Map</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 font-bold text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
