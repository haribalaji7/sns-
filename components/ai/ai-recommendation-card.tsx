'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Shield,
  Radio,
} from 'lucide-react';
import { speakText, stopSpeech, soundEffects } from '@/lib/audio-effects';

interface AIRecommendationCardProps {
  recommendation: string;
  suggestedActions?: {
    id: string;
    label: string;
    actionType: string;
    primary?: boolean;
  }[];
  onActionTrigger?: (actionId: string, label: string) => void;
}

export function AIRecommendationCard({
  recommendation,
  suggestedActions = [],
  onActionTrigger,
}: AIRecommendationCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect on recommendation change
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < recommendation.length) {
        setDisplayedText(recommendation.slice(0, idx + 1));
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [recommendation]);

  const handleToggleSpeech = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const success = speakText(recommendation, () => {
        setIsPlayingAudio(false);
      });
      if (!success) {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl p-5 border border-[rgba(124,92,255,0.4)] bg-gradient-to-br from-[rgba(124,92,255,0.12)] via-[#070B12]/90 to-[rgba(20,241,217,0.06)] backdrop-blur-xl shadow-[0_0_30px_rgba(124,92,255,0.15)] overflow-hidden">
      {/* Top glowing ambient highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7C5CFF] to-transparent opacity-80" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFF]/30 to-[#14F1D9]/20 border border-[rgba(124,92,255,0.5)] flex items-center justify-center shadow-[0_0_15px_rgba(124,92,255,0.4)]">
            <Sparkles className="w-4 h-4 text-[#14F1D9] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#F0F4FF] tracking-wide">
                AI Dispatch Recommendation
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/40">
                Gemini 1.5 Pro
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8B9AB4]">
              Autonomous multimodal decision synthesis
            </p>
          </div>
        </div>

        {/* Audio & Copy Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#14F1D9] text-[#070B12] border-[#14F1D9] shadow-[0_0_15px_rgba(20,241,217,0.5)]'
                : 'bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-[#F0F4FF] border-white/10'
            }`}
            title="Read Recommendation Aloud (Text-to-Speech)"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">Mute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">Listen</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-[#F0F4FF] border border-white/10 transition-all cursor-pointer"
            title="Copy Recommendation Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22D3A5]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Audio Wave Visualizer when playing */}
      {isPlayingAudio && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-1 mb-3 px-3 py-1.5 rounded-lg bg-[#14F1D9]/10 border border-[#14F1D9]/30 text-[#14F1D9] text-[10px] font-mono"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-bold">TTS Audio Broadcasting</span>
          <div className="flex items-center gap-1 ml-auto">
            {[4, 12, 8, 16, 6, 14, 10].map((h, i) => (
              <motion.div
                key={i}
                className="w-1 bg-[#14F1D9] rounded-full"
                animate={{ height: [4, h, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Natural Language Recommendation Body */}
      <div className="bg-black/30 rounded-xl p-3.5 border border-white/[0.06] mb-4">
        <p className="text-xs sm:text-sm text-[#F0F4FF] leading-relaxed font-sans font-medium">
          &ldquo;{displayedText}&rdquo;
          {isTyping && <span className="inline-block w-1.5 h-4 bg-[#14F1D9] ml-1 animate-pulse" />}
        </p>
      </div>

      {/* Suggested Actions Action Bar */}
      {suggestedActions.length > 0 && (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B9AB4] font-bold block mb-2">
            Suggested Automated Protocols
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  soundEffects.playClick();
                  onActionTrigger?.(action.id, action.label);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  action.primary
                    ? 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-bold shadow-[0_0_15px_rgba(20,241,217,0.3)] hover:brightness-110'
                    : 'bg-white/5 hover:bg-white/10 text-[#D0D6E0] border border-white/10 hover:border-[#14F1D9]/40'
                }`}
              >
                <Zap className="w-3 h-3 text-current" />
                <span>{action.label}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
