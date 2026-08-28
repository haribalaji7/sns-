'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  UploadCloud,
  Smartphone,
  Mic,
  Shield,
  Flame,
  Wind,
  UserX,
  Heart,
  Zap,
  Droplets,
  Users,
  AlertOctagon,
  FileCheck,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DetectionSource, CCTV_CAMERAS, DETECTION_SCENARIOS } from './detection-scenarios';
import { Dropzone } from '@/components/ui';
import { soundEffects } from '@/lib/audio-effects';
import { timeAgo } from '@/lib/utils';

interface SourceSelectorPanelProps {
  currentSource: DetectionSource;
  onSourceChange: (src: DetectionSource) => void;
  selectedCameraId?: string;
  onCameraSelect: (camId: string) => void;
  onPresetSelect: (presetId: string) => void;
  onFileUpload: (fileOrUrl: string | File) => void;
  recentFeeds: {
    id: string;
    type: string;
    location: string;
    time: string;
    status: 'flagged' | 'clean';
    scenarioKey: string;
  }[];
}

const SOURCE_TABS = [
  { id: 'cctv', label: 'CCTV Live', icon: Camera },
  { id: 'upload', label: 'Upload Media', icon: UploadCloud },
  { id: 'student_sos', label: 'Student SOS', icon: Smartphone },
  { id: 'voice_transcript', label: 'Voice Audio', icon: Mic },
  { id: 'officer_report', label: 'Officer Field', icon: Shield },
];

const PRESETS = [
  { key: 'scen-fire', label: 'Fire in Lab 302', icon: Flame, color: '#FF4D6D' },
  { key: 'scen-smoke', label: 'Smoke at Library B1', icon: Wind, color: '#FFB347' },
  { key: 'scen-person-fallen', label: 'Person Fallen Quad', icon: UserX, color: '#14F1D9' },
  { key: 'scen-medical', label: 'Cardiac on Track', icon: Heart, color: '#FF4D6D' },
  { key: 'scen-violence', label: 'Violence Gate 1', icon: AlertOctagon, color: '#FF4D6D' },
  { key: 'scen-crowd', label: 'Crowd Bottleneck', icon: Users, color: '#38BDF8' },
  { key: 'scen-flood', label: 'Pipe Burst Flood', icon: Droplets, color: '#22D3A5' },
  { key: 'scen-electrical', label: 'Substation Arc Flash', icon: Zap, color: '#7C5CFF' },
  { key: 'scen-gas', label: 'Hazardous Gas Leak', icon: Wind, color: '#22D3A5' },
];

export function SourceSelectorPanel({
  currentSource,
  onSourceChange,
  selectedCameraId,
  onCameraSelect,
  onPresetSelect,
  onFileUpload,
  recentFeeds,
}: SourceSelectorPanelProps) {
  const handleTabClick = (src: DetectionSource) => {
    soundEffects.playClick();
    onSourceChange(src);
  };

  const handlePresetClick = (key: string) => {
    soundEffects.playScan();
    onPresetSelect(key);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ─── Source Mode Selector Tabs ────────────────────────────────── */}
      <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-mono font-bold text-[#14F1D9] uppercase tracking-wider">
            Input Ingestion Source
          </span>
          <span className="text-[9px] font-mono text-[#8B9AB4]">5 Active Feeds</span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {SOURCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSource === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as DetectionSource)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[rgba(20,241,217,0.15)] text-[#14F1D9] border border-[rgba(20,241,217,0.4)] shadow-[0_0_12px_rgba(20,241,217,0.25)]'
                    : 'text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-semibold truncate leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Source-Specific Interactive Controls ─────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* CCTV Camera Switcher */}
        {currentSource === 'cctv' && (
          <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-3 backdrop-blur-md flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold">
              Select Camera Stream (6 Nodes)
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {CCTV_CAMERAS.map((cam) => {
                const isSelected = selectedCameraId === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      soundEffects.playClick();
                      onCameraSelect(cam.id);
                    }}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[rgba(20,241,217,0.12)] border-[#14F1D9] text-[#F0F4FF] shadow-[0_0_10px_rgba(20,241,217,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.05] text-[#8B9AB4] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#14F1D9]">
                        {cam.id}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cam.status === 'alert'
                            ? 'bg-[#FF4D6D] animate-ping'
                            : cam.status === 'warning'
                            ? 'bg-[#FFB347]'
                            : 'bg-[#22D3A5]'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-[#F0F4FF] truncate">
                      {cam.name}
                    </p>
                    <p className="text-[9px] font-mono text-[#8B9AB4] truncate">
                      {cam.resolution}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Media Dropzone */}
        {currentSource === 'upload' && (
          <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-3 backdrop-blur-md">
            <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-2">
              Neural Media Dropzone
            </span>
            <Dropzone
              onFileSelect={(file) => {
                soundEffects.playScan();
                onFileUpload(file);
              }}
              className="h-36"
            />
          </div>
        )}

        {/* Student SOS Trigger preview */}
        {currentSource === 'student_sos' && (
          <div className="bg-[#070B12]/80 border border-[rgba(255,77,109,0.3)] rounded-xl p-3.5 backdrop-blur-md bg-gradient-to-br from-[rgba(255,77,109,0.08)] to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#FF4D6D] uppercase flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Mobile SOS Beacon Receiver
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-ping" />
            </div>
            <p className="text-[11px] text-[#F0F4FF] leading-relaxed mb-3">
              Receiving live encrypted distress beacons from registered student mobile devices via BLE and Wi-Fi triangulation.
            </p>
            <button
              onClick={() => handlePresetClick('scen-sos-1')}
              className="w-full py-2 px-3 rounded-lg bg-[rgba(255,77,109,0.2)] hover:bg-[#FF4D6D] text-[#FF4D6D] hover:text-white border border-[#FF4D6D]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Load Active Student Distress SOS (Dorm A)</span>
            </button>
          </div>
        )}

        {/* Voice Transcript Trigger preview */}
        {currentSource === 'voice_transcript' && (
          <div className="bg-[#070B12]/80 border border-[rgba(124,92,255,0.3)] rounded-xl p-3.5 backdrop-blur-md bg-gradient-to-br from-[rgba(124,92,255,0.08)] to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#7C5CFF] uppercase flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> 911 Audio Dispatch Ingestion
              </span>
              <span className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#F0F4FF] leading-relaxed mb-3">
              Continuous Whisper speech-to-text diarization stream running on emergency dispatch frequencies.
            </p>
            <button
              onClick={() => handlePresetClick('scen-voice-1')}
              className="w-full py-2 px-3 rounded-lg bg-[rgba(124,92,255,0.2)] hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Load 911 Call Audio Transcript</span>
            </button>
          </div>
        )}

        {/* Security Officer Report Trigger preview */}
        {currentSource === 'officer_report' && (
          <div className="bg-[#070B12]/80 border border-[rgba(20,241,217,0.3)] rounded-xl p-3.5 backdrop-blur-md bg-gradient-to-br from-[rgba(20,241,217,0.08)] to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#14F1D9] uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Field Officer Radio Triage
              </span>
              <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#F0F4FF] leading-relaxed mb-3">
              Bodycam snapshots and quick digital triage reports submitted by on-duty patrol officers.
            </p>
            <button
              onClick={() => handlePresetClick('scen-officer-1')}
              className="w-full py-2 px-3 rounded-lg bg-[rgba(20,241,217,0.2)] hover:bg-[#14F1D9] text-[#14F1D9] hover:text-[#070B12] border border-[#14F1D9]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Load Officer #105 Field Triage</span>
            </button>
          </div>
        )}

        {/* ─── 9 Detection Scenarios Quick Simulator Matrix ───────────── */}
        <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-3 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#14F1D9]" /> 9 Detection Scenarios
            </span>
            <span className="text-[9px] font-mono text-[#14F1D9]">YOLO + Gemini</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  onClick={() => handlePresetClick(p.key)}
                  className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#14F1D9]/40 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5 group-hover:scale-110 transition-transform" style={{ color: p.color }} />
                  <span className="text-[9px] font-medium text-[#D0D6E0] group-hover:text-white leading-tight truncate w-full">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Recent Ingestion Feed History ──────────────────────────── */}
        <div className="bg-[#070B12]/80 border border-white/[0.08] rounded-xl p-3 backdrop-blur-md flex-1 min-h-[140px] flex flex-col overflow-hidden">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-2">
            Recent Analysis Logs
          </span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {recentFeeds.map((feed) => (
              <div
                key={feed.id}
                onClick={() => handlePresetClick(feed.scenarioKey)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      feed.status === 'flagged'
                        ? 'bg-[rgba(255,77,109,0.2)] text-[#FF4D6D]'
                        : 'bg-[rgba(34,211,165,0.2)] text-[#22D3A5]'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#F0F4FF] truncate">
                      {feed.type}
                    </p>
                    <p className="text-[9px] text-[#8B9AB4] truncate">{feed.location}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[#8B9AB4] flex-shrink-0">
                  {timeAgo(feed.time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
