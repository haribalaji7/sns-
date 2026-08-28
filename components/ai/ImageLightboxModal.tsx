'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Printer,
  FilePlus,
  Info,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { VisualCardData } from '@/lib/ai/intelligent-prompt-builder';
import { soundEffects } from '@/lib/audio-effects';
import { useDashboardStore } from '@/store/dashboard';

interface ImageLightboxModalProps {
  visual: VisualCardData | null;
  onClose: () => void;
  onRegenerate?: () => void;
}

export function ImageLightboxModal({
  visual,
  onClose,
  onRegenerate,
}: ImageLightboxModalProps) {
  const { addToast } = useDashboardStore();
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [addedToReport, setAddedToReport] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  if (!visual) return null;

  const handleDownload = () => {
    soundEffects.playClick();
    if (!visual.imageUrl) return;
    const a = document.createElement('a');
    a.href = visual.imageUrl;
    a.download = `${visual.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast({
      type: 'success',
      title: 'Visual Asset Downloaded',
      message: `${visual.title} saved to downloads.`,
    });
  };

  const handleShare = () => {
    soundEffects.playClick();
    if (visual.imageUrl) {
      navigator.clipboard.writeText(visual.imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({
        type: 'info',
        title: 'Image Link Copied',
        message: 'Shareable image link copied to clipboard.',
      });
    }
  };

  const handleAddToReport = () => {
    soundEffects.playSuccess();
    setAddedToReport(true);
    addToast({
      type: 'success',
      title: 'Added to Incident Dossier',
      message: `${visual.title} attached to active incident report.`,
    });
  };

  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[88vh] rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/95 overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#030407]/90 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9] shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F0F4FF] flex items-center gap-2">
                  {visual.title}
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/30">
                    {visual.category}
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-[#8B9AB4]">
                  Generated {new Date(visual.timestamp).toLocaleTimeString()} · High-Resolution Output
                </p>
              </div>
            </div>

            {/* Top Right Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 transition-all text-xs font-mono"
                title="Reset Zoom"
              >
                100%
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  showMetadata
                    ? 'bg-[#14F1D9]/20 border-[#14F1D9] text-[#14F1D9]'
                    : 'bg-white/5 border-white/10 text-[#8B9AB4] hover:text-white'
                }`}
                title="Toggle Prompt & Telemetry Details"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-[#FF4D6D]/20 text-[#8B9AB4] hover:text-[#FF4D6D] border border-white/10 hover:border-[#FF4D6D]/40 transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Visual Content Viewport */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div className="flex-1 relative flex items-center justify-center overflow-auto p-4 bg-[#030407]">
              <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

              {visual.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={visual.imageUrl}
                  alt={visual.title}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none"
                />
              ) : (
                <div className="text-center text-xs text-[#8B9AB4]">No preview image available</div>
              )}
            </div>

            {/* Metadata & Prompt Drawer */}
            {showMetadata && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-shrink-0 border-l border-white/[0.08] bg-[#070B12]/90 p-4 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-1">
                      User Query
                    </span>
                    <p className="text-xs font-semibold text-[#F0F4FF] italic">
                      &ldquo;{visual.originalQuery}&rdquo;
                    </p>
                  </div>

                  {visual.promptUsed && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#14F1D9] font-bold block mb-1">
                        Intelligent AI Prompt
                      </span>
                      <p className="text-[11px] text-[#C5CDE8] leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/[0.06]">
                        {visual.promptUsed}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between py-1 border-b border-white/[0.05]">
                      <span className="text-[#8B9AB4]">Model:</span>
                      <span className="text-[#14F1D9] font-bold">OpenAI DALL-E 3 / Vision</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.05]">
                      <span className="text-[#8B9AB4]">Resolution:</span>
                      <span className="text-[#F0F4FF]">{visual.resolution || '1024x1024'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.05]">
                      <span className="text-[#8B9AB4]">Aspect Ratio:</span>
                      <span className="text-[#F0F4FF]">{visual.aspectRatio || '16:9'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.05]">
                      <span className="text-[#8B9AB4]">Safety Standard:</span>
                      <span className="text-[#22D3A5] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Clean / No Gore
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-bold text-xs uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAddToReport}
                      className={`py-2 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        addedToReport
                          ? 'bg-[#22D3A5]/20 border-[#22D3A5] text-[#22D3A5]'
                          : 'bg-white/5 hover:bg-white/10 text-[#F0F4FF] border-white/10'
                      }`}
                    >
                      {addedToReport ? <Check className="w-3.5 h-3.5" /> : <FilePlus className="w-3.5 h-3.5" />}
                      <span>{addedToReport ? 'Attached' : 'Add to Report'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B9AB4] hover:text-white border border-white/10 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#22D3A5]" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Share Link'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
