'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  X,
  Send,
  Mic,
  Volume2,
  Shield,
  Flame,
  Heart,
  Users,
  AlertTriangle,
  MapPin,
  Sparkles,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useSecurityStore, RadioChannel, RadioMessage } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';

const CHANNELS: { id: RadioChannel; label: string; icon: any; color: string }[] = [
  { id: 'security', label: 'Security QRF', icon: Shield, color: '#14F1D9' },
  { id: 'fire', label: 'Fire Tactical', icon: Flame, color: '#FF4D6D' },
  { id: 'medical', label: 'Medical Triage', icon: Heart, color: '#FF4D6D' },
  { id: 'general', label: 'Campus Ops', icon: Users, color: '#7C5CFF' },
  { id: 'admin', label: 'Command Broadcast', icon: Zap, color: '#FFB347' },
];

const QUICK_TEMPLATES = [
  '🚨 PRIORITY BACKUP: Immediate assistance needed at active scene.',
  '✅ AREA CLEAR: Floor checked, evacuated, and secured.',
  '🚑 MEDICAL NEEDED: Paramedics and stretcher required immediately.',
  '⚠️ CORRIDOR BLOCKED: Smoke accumulation, redirecting via East Exit.',
  '🔒 THREAT CONTAINED: Subject detained, awaiting supervisor.',
];

export function SecurityRadioDrawer() {
  const { radioOpen, setRadioOpen, officer, radioMessages, sendRadioMessage } = useSecurityStore();
  const [selectedChannel, setSelectedChannel] = useState<RadioChannel>(officer.radioChannel || 'security');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  if (!radioOpen) return null;

  const filteredMessages = radioMessages.filter((m) => m.channel === selectedChannel);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendRadioMessage(selectedChannel, inputText.trim(), false, officer.team);
    setInputText('');
  };

  const handleQuickTemplate = (tpl: string) => {
    sendRadioMessage(selectedChannel, tpl, false, officer.team);
  };

  const handlePTT = () => {
    setIsRecording(true);
    soundEffects.playRadioPing();
    setTimeout(() => {
      setIsRecording(false);
      sendRadioMessage(
        selectedChannel,
        `[VOICE TRANSMISSION: 4.2s] "${officer.name} reporting position on ${selectedChannel.toUpperCase()} channel."`,
        true,
        officer.team
      );
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="w-full sm:max-w-md h-full sm:h-[92vh] rounded-none sm:rounded-2xl glass border border-[rgba(124,92,255,0.4)] bg-[#070B12] flex flex-col shadow-[0_0_50px_rgba(124,92,255,0.3)] overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="p-4 bg-[#070B12]/95 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14F1D9]/15 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9] shadow-[0_0_10px_#14F1D9]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F0F4FF] flex items-center gap-2">
                Tactical Radio Dispatch
                <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/10 px-1.5 py-0.2 rounded border border-[#22D3A5]/30">
                  ENCRYPTED AES-256
                </span>
              </h3>
              <p className="text-[10px] text-[#8B9AB4] font-mono">
                Active Node: {officer.badgeNumber} ({officer.team})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setRadioOpen(false);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="p-2.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedChannel(ch.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white border border-white/20 shadow-md'
                    : 'text-[#8B9AB4] hover:text-white hover:bg-white/[0.03]'
                }`}
                style={{ borderColor: isSelected ? ch.color : undefined }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: ch.color }} />
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Log Feed */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#030407]/60">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-[#8B9AB4] text-xs font-mono">
              Channel {selectedChannel.toUpperCase()} is quiet. No radio transmissions recorded.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                  msg.isCritical
                    ? 'bg-[rgba(255,77,109,0.12)] border-[#FF4D6D]/40 text-[#F0F4FF] shadow-[0_0_12px_rgba(255,77,109,0.2)]'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#D0D6E0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[#14F1D9]">{msg.senderName}</span>
                    <span className="text-[#8B9AB4]">({msg.senderBadge})</span>
                  </div>
                  <span className="text-[#8B9AB4]">{msg.timestamp}</span>
                </div>

                <p className="text-xs text-[#F0F4FF]">{msg.content}</p>

                {msg.location && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] font-mono text-[#8B9AB4]">
                    <MapPin className="w-3 h-3 text-[#14F1D9]" />
                    <span>{msg.location}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Tactical Phrases */}
        <div className="p-2.5 bg-black/60 border-t border-white/[0.06] overflow-x-auto flex gap-1.5">
          {QUICK_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => handleQuickTemplate(tpl)}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-[#14F1D9] border border-white/10 whitespace-nowrap transition-all cursor-pointer truncate max-w-[220px]"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Transmission Input Area */}
        <div className="p-3 bg-[#070B12] border-t border-white/[0.08] flex items-center gap-2">
          {/* Push-to-Talk (PTT) Button */}
          <button
            onClick={handlePTT}
            disabled={isRecording}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#FF4D6D] text-white border-[#FF4D6D] animate-pulse shadow-[0_0_20px_#FF4D6D]'
                : 'bg-white/5 hover:bg-white/10 text-[#14F1D9] border-white/10'
            }`}
            title="Push to Talk (Broadcast Voice Note)"
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
          </button>

          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Broadcast on ${selectedChannel.toUpperCase()}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#14F1D9]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#14F1D9] text-[#070B12] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
