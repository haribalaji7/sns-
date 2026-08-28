'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Paperclip,
  Sparkles,
  RefreshCw,
  Copy,
  StopCircle,
  ChevronDown,
  Shield,
  Bot,
  User,
  Zap,
  Image as ImageIcon,
  Map as MapIcon,
  FileText,
  Activity,
  Maximize2,
  Download,
  Share2,
  Trash2,
  Flame,
  Check,
  Layers,
  History,
  Info,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import {
  generateAIResponse,
  streamResponse,
  type CopilotMessage,
} from '@/lib/ai/copilot-engine';
import { VisualCardData, ConversationContext } from '@/lib/ai/intelligent-prompt-builder';
import { ResponseCards } from './ResponseCards';
import { VisualCard } from './VisualCard';
import { ImageLightboxModal } from './ImageLightboxModal';
import { soundEffects } from '@/lib/audio-effects';

// ─── Inline Markdown Renderer ───────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (!line.trim()) {
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    const parseLine = (raw: string): React.ReactNode => {
      const parts = raw.split(/\*\*(.*?)\*\*/g);
      return parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} className="text-[#F0F4FF] font-semibold">{p}</strong>
          : p,
      );
    };

    if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} className="text-sm font-bold text-[#14F1D9] mb-1">{parseLine(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} className="text-xs font-bold text-[#F0F4FF] mb-1 mt-2">{parseLine(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} className="text-[11px] font-bold text-[#FFB347] mb-0.5 mt-1.5">{parseLine(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-[#14F1D9] mt-0.5 flex-shrink-0 text-[10px]">•</span>
          <span className="text-[12px] text-[#C5CDE8] leading-relaxed">{parseLine(line.replace(/^[-•] /, ''))}</span>
        </div>
      );
    } else if (/^\d+\./.test(line)) {
      const match = line.match(/^(\d+)\. (.+)/);
      if (match) {
        nodes.push(
          <div key={key++} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-[#7C5CFF] font-mono text-[10px] mt-0.5 flex-shrink-0">{match[1]}.</span>
            <span className="text-[12px] text-[#C5CDE8] leading-relaxed">{parseLine(match[2])}</span>
          </div>
        );
      }
    } else {
      nodes.push(<p key={key++} className="text-[12px] text-[#C5CDE8] leading-relaxed my-0.5">{parseLine(line)}</p>);
    }
  }

  return <>{nodes}</>;
}

// ─── Prompt Library Categories ──────────────────────────────────────────────

const PROMPT_CATEGORIES = [
  {
    category: 'Visual & Scene Generation',
    icon: ImageIcon,
    color: '#FF4D6D',
    prompts: [
      'Show me how the fire may spread.',
      'Create a visual of the accident scene.',
      'Generate smoke detection scene in library.',
      'Visualize student collapse on campus quad.',
      'Generate flooded corridor scene.',
      'Show electrical arc flash in substation.',
    ],
  },
  {
    category: 'Evacuation & Maps',
    icon: MapIcon,
    color: '#14F1D9',
    prompts: [
      'Generate an evacuation map for Science Block.',
      'Show the safest evacuation route.',
      'Create a crowd density heatmap.',
      'Show campus risk heatmap.',
    ],
  },
  {
    category: 'Posters & Documents',
    icon: FileText,
    color: '#7C5CFF',
    prompts: [
      'Generate an emergency awareness poster.',
      'Create fire safety poster.',
      'Generate an incident report with diagrams.',
    ],
  },
];

export function AICopilotStudio() {
  const { incidents, responders, zones, metrics, addToast } = useDashboardStore();

  const [sessionContext, setSessionContext] = useState<ConversationContext>({
    activeIncidentId: 'INC-0091',
    activeBuilding: 'Science Block B – Floor 3, Lab 302',
    incidentType: 'fire',
    severity: 'critical',
    occupancy: 42,
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-studio',
      role: 'assistant',
      content: "Welcome to **CampusShield AI Copilot & Visual Studio**.\n\nI am your flagship Emergency Operations AI Assistant with multi-modal capabilities. I can analyze incidents and autonomously generate:\n\n1. **Text Intelligence:** Strategic dispatch advice, SOP lookup & threat assessments\n2. **Image Generation:** Realistic emergency simulations & scene visuals (DALL-E 3)\n3. **Map & Diagram Generation:** Vector evacuation blueprints & risk heatmaps\n4. **Emergency Documents:** Safety awareness posters & executive PDF dossiers\n\nSelect a prompt from the left studio library or type your emergency directive below.",
      timestamp: new Date(),
      cards: [],
      visuals: [],
      suggestions: [
        'Show me how the fire may spread.',
        'Generate an evacuation map for Science Block.',
        'Create a crowd density heatmap.',
        'Generate an emergency awareness poster.',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedVisual, setExpandedVisual] = useState<VisualCardData | null>(null);
  const [generatedGallery, setGeneratedGallery] = useState<VisualCardData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, generatingProgress]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 80);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    soundEffects.playClick();

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setGeneratingProgress('Synthesizing visual intelligence & building telemetry...');

    const ctx = { incidents, responders, zones, metrics, sessionContext };
    const generated = generateAIResponse(text.trim(), ctx);
    setSessionContext(generated.updatedContext);

    const assistantId = `ai-${Date.now()}`;
    const assistantMsg: CopilotMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      cards: [],
      visuals: [],
      suggestions: [],
      intent: generated.intent,
      mode: generated.mode,
    };

    setMessages((prev) => [...prev, assistantMsg]);

    abortRef.current = new AbortController();
    await streamResponse(
      generated.text,
      (partial) => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: partial } : m)
        );
      },
      () => {
        setIsStreaming(false);
        setGeneratingProgress(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  cards: generated.cards,
                  visuals: generated.visuals,
                  suggestions: generated.suggestions,
                }
              : m
          )
        );

        // Add to media gallery if visual generated
        if (generated.visuals && generated.visuals.length > 0) {
          setGeneratedGallery((prev) => [...generated.visuals, ...prev].slice(0, 8));
        }

        soundEffects.playAlert();
      },
      abortRef.current.signal,
    );
  }, [isStreaming, incidents, responders, zones, metrics, sessionContext]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setGeneratingProgress(null);
    setMessages((prev) =>
      prev.map((m) => m.isStreaming ? { ...m, isStreaming: false } : m)
    );
  };

  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      setTimeout(() => sendMessage(lastUserMsg.content), 100);
    }
  }, [messages, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleVoice = () => {
    soundEffects.playClick();
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput('Show me how the fire may spread.');
      }, 2000);
    }
  };

  const clearHistory = () => {
    soundEffects.playClick();
    setMessages([{
      id: 'welcome-studio-' + Date.now(),
      role: 'assistant',
      content: "Session memory cleared. What would you like to generate?",
      timestamp: new Date(),
      cards: [],
      visuals: [],
      suggestions: [
        'Show me how the fire may spread.',
        'Generate an evacuation map for Science Block.',
        'Create a crowd density heatmap.',
      ],
    }]);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
      {/* ─── LEFT STUDIO SIDEBAR: Prompt Library & Memory (4 Cols) ───── */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Active Context Memory Card */}
        <div className="rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9]">
                <History className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#F0F4FF]">Copilot Session Memory</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] font-mono text-[#8B9AB4] hover:text-[#FF4D6D] transition-colors cursor-pointer"
              title="Reset memory"
            >
              Clear Session
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Active Building:</span>
              <span className="text-[#F0F4FF] font-bold truncate max-w-[170px]">
                {sessionContext.activeBuilding?.split('–')[0]?.trim()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Incident Context:</span>
              <span className="text-[#FF4D6D] font-bold uppercase">
                {sessionContext.incidentType} ({sessionContext.severity})
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#8B9AB4]">Occupants at Risk:</span>
              <span className="text-[#FFB347] font-bold">
                {sessionContext.occupancy} Pax
              </span>
            </div>
          </div>
        </div>

        {/* Flagship Prompt Library */}
        <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 p-4 backdrop-blur-md flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold text-[#F0F4FF] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#14F1D9]" />
              Visual Prompt Library
            </span>
            <span className="text-[9px] font-mono text-[#14F1D9]">4 Modes</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {PROMPT_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8B9AB4] flex items-center gap-1.5">
                    <Icon className="w-3 h-3" style={{ color: cat.color }} />
                    {cat.category}
                  </span>
                  <div className="space-y-1">
                    {cat.prompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        className="w-full text-left p-2 rounded-xl bg-white/[0.02] hover:bg-[#14F1D9]/[0.08] border border-white/[0.05] hover:border-[#14F1D9]/40 text-[#C5CDE8] hover:text-[#F0F4FF] text-xs transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <span className="truncate pr-2 font-medium">&ldquo;{p}&rdquo;</span>
                        <Send className="w-3 h-3 text-[#14F1D9] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Dossier Gallery (Generated Assets) */}
        {generatedGallery.length > 0 && (
          <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/90 p-3 backdrop-blur-md">
            <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-2">
              Generated Assets Dossier ({generatedGallery.length})
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {generatedGallery.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setExpandedVisual(asset)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#14F1D9] transition-all cursor-pointer group"
                >
                  {asset.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] font-mono text-[#14F1D9]">
                      SVG
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── RIGHT MAIN STUDIO: Conversational Stream & Visual Feed (8 Cols) ─ */}
      <div className="lg:col-span-8 flex flex-col h-full rounded-2xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/95 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#030407]/90 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F0F4FF]">Emergency Operations Copilot</h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/40 font-bold uppercase">
                  DALL-E 3 + SVG
                </span>
              </div>
              <p className="text-[10px] text-[#8B9AB4]">
                Direct Natural Language Emergency Intelligence & Visual Synthesizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#14F1D9] border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Regenerate latest response"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Chat Stream Viewport */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              <div className={`flex gap-3.5 ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 shadow-[0_0_12px_rgba(20,241,217,0.2)]'
                    : 'bg-gradient-to-br from-[#7C5CFF]/20 to-[#FF4D6D]/20 border border-[#7C5CFF]/30'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-[#14F1D9]" /> : <User className="w-4 h-4 text-[#7C5CFF]" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[92%] ${msg.role === 'assistant' ? '' : 'items-end flex flex-col'}`}>
                  <div className={`rounded-2xl px-5 py-3.5 shadow-lg ${
                    msg.role === 'assistant'
                      ? 'bg-[rgba(255,255,255,0.03)] border border-white/[0.08] rounded-tl-sm backdrop-blur-md'
                      : 'bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/30 rounded-tr-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-1">
                        {renderMarkdown(msg.content)}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-[#14F1D9] rounded-sm animate-pulse ml-0.5" />
                        )}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#F0F4FF] leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Supporting Generated Visual Assets */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.visuals && msg.visuals.length > 0 && (
                    <div className="mt-2 space-y-3 w-full">
                      {msg.visuals.map((vis) => (
                        <VisualCard
                          key={vis.id}
                          visual={vis}
                          onExpand={(v) => setExpandedVisual(v)}
                          onRegenerate={handleRegenerate}
                        />
                      ))}
                    </div>
                  )}

                  {/* Supporting Data Cards */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 w-full">
                      <ResponseCards cards={msg.cards} />
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="text-[11px] px-3 py-1 rounded-full border border-[#14F1D9]/25 bg-[#14F1D9]/[0.06] text-[#14F1D9] hover:bg-[#14F1D9]/20 hover:border-[#14F1D9]/60 transition-all cursor-pointer font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Progress Indicator */}
          {generatingProgress && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#14F1D9]/[0.06] border border-[#14F1D9]/30 text-[#14F1D9] text-xs font-mono"
            >
              <div className="w-4 h-4 rounded-full border-2 border-t-[#14F1D9] border-r-transparent border-b-[#7C5CFF] border-l-transparent animate-spin" />
              <span>{generatingProgress}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/[0.08] bg-[rgba(7,11,18,0.85)] select-none">
          <div className={`flex items-end gap-2.5 rounded-2xl border p-2.5 transition-all duration-200 ${
            input
              ? 'border-[#14F1D9]/50 bg-[rgba(20,241,217,0.05)] shadow-[0_0_25px_rgba(20,241,217,0.15)]'
              : 'border-white/[0.08] bg-white/[0.03]'
          }`}>
            <button className="p-2 rounded-xl text-[#4A5568] hover:text-[#8B9AB4] hover:bg-white/[0.06] transition-all flex-shrink-0 cursor-pointer">
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot, generate evacuation maps, visuals, posters, heatmaps…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-[#F0F4FF] placeholder:text-[#4A5568] outline-none leading-relaxed py-1 max-h-28 overflow-y-auto font-sans"
              style={{ scrollbarWidth: 'none' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
              }}
            />

            <button
              onClick={handleVoice}
              className={`p-2 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                isListening
                  ? 'text-[#FF4D6D] bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 animate-pulse'
                  : 'text-[#4A5568] hover:text-[#8B9AB4] hover:bg-white/[0.06]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {isStreaming ? (
              <button
                onClick={handleStop}
                className="p-2.5 rounded-xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 text-[#FF4D6D] hover:bg-[#FF4D6D]/30 transition-all flex-shrink-0 cursor-pointer"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  input.trim()
                    ? 'bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black shadow-[0_0_20px_rgba(20,241,217,0.4)] hover:brightness-110 cursor-pointer'
                    : 'text-[#4A5568] bg-white/[0.04] border border-transparent cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-[#4A5568] text-center mt-2 font-mono">
            Direct Copilot Dispatch Engine · Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8B9AB4] font-mono text-[9px]">Enter</kbd> to generate visual
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        visual={expandedVisual}
        onClose={() => setExpandedVisual(null)}
      />
    </div>
  );
}
