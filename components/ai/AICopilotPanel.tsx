'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Mic, Paperclip, Sparkles, RefreshCw, Copy,
  StopCircle, ChevronDown, Shield, Bot, User, Zap,
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw,
  Image as ImageIcon, Map as MapIcon, FileText, Activity,
  Maximize2, Radio, Check,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import {
  generateAIResponse, streamResponse,
  type CopilotMessage,
} from '@/lib/ai/copilot-engine';
import { VisualCardData, ConversationContext } from '@/lib/ai/intelligent-prompt-builder';
import { ResponseCards } from './ResponseCards';
import { VisualCard } from './VisualCard';
import { ImageLightboxModal } from './ImageLightboxModal';
import { soundEffects } from '@/lib/audio-effects';

// ─── Simple inline markdown renderer ─────────────────────────────────────────

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
          ? <strong key={i} className="text-foreground font-semibold">{p}</strong>
          : p,
      );
    };

    if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} className="text-sm font-bold text-primary mb-1">{parseLine(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} className="text-xs font-bold text-foreground mb-1 mt-2">{parseLine(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} className="text-[11px] font-bold text-warning mb-0.5 mt-1.5">{parseLine(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-1.5 text-[11px] text-foreground/90 my-0.5">
          <span className="text-primary mt-0.5">•</span>
          <span>{parseLine(line.slice(2))}</span>
        </div>,
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

const PROMPT_STARTERS = [
  { label: 'Show me how the fire may spread', icon: ImageIcon },
  { label: 'Generate an evacuation map for Science Block', icon: MapIcon },
  { label: 'Create a visual of the accident scene', icon: ImageIcon },
  { label: 'Generate an emergency awareness poster', icon: FileText },
  { label: 'Show the safest evacuation route', icon: MapIcon },
  { label: 'Create a crowd density heatmap', icon: Activity },
];

function MessageBubble({
  message,
  onRegenerate,
  onSuggestion,
  onExpandVisual,
}: {
  message: CopilotMessage;
  onRegenerate: () => void;
  onSuggestion: (s: string) => void;
  onExpandVisual: (visual: VisualCardData) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isAssistant
          ? 'bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/40 shadow-[0_0_12px_rgba(20,241,217,0.2)]'
          : 'bg-gradient-to-br from-[#7C5CFF]/20 to-[#FF4D6D]/20 border border-[#7C5CFF]/30'
      }`}>
        {isAssistant ? <Bot className="w-4 h-4 text-[#14F1D9]" /> : <User className="w-4 h-4 text-[#7C5CFF]" />}
      </div>

      <div className={`flex-1 max-w-[90%] ${isAssistant ? '' : 'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-lg ${
          isAssistant
            ? 'bg-card/90 dark:bg-[rgba(255,255,255,0.03)] border border-border rounded-tl-sm backdrop-blur-md'
            : 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-tr-sm text-foreground'
        }`}>
          {isAssistant ? (
            <div className="space-y-1">
              {renderMarkdown(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-primary rounded-sm animate-pulse ml-0.5" />
              )}
            </div>
          ) : (
            <p className="text-[12px] text-foreground leading-relaxed">{message.content}</p>
          )}
        </div>

        {isAssistant && !message.isStreaming && message.visuals && message.visuals.length > 0 && (
          <div className="mt-2 space-y-3 w-full">
            {message.visuals.map((vis) => (
              <VisualCard
                key={vis.id}
                visual={vis}
                onExpand={onExpandVisual}
                onRegenerate={onRegenerate}
              />
            ))}
          </div>
        )}

        {isAssistant && !message.isStreaming && message.cards && message.cards.length > 0 && (
          <div className="mt-2 w-full">
            <ResponseCards cards={message.cards} />
          </div>
        )}

        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-[9px] text-[#4A5568] font-mono">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isAssistant && !message.isStreaming && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-[#4A5568] hover:text-[#8B9AB4] hover:bg-white/[0.05] transition-all cursor-pointer"
                title="Copy text"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-[#22D3A5]" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
              <button
                onClick={onRegenerate}
                className="p-1 rounded-md text-[#4A5568] hover:text-[#14F1D9] hover:bg-white/[0.05] transition-all cursor-pointer"
                title="Regenerate"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setLiked(true)}
                className={`p-1 rounded-md transition-all cursor-pointer ${liked === true ? 'text-[#22D3A5]' : 'text-[#4A5568] hover:text-[#22D3A5] hover:bg-white/[0.05]'}`}
              >
                <ThumbsUp className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setLiked(false)}
                className={`p-1 rounded-md transition-all cursor-pointer ${liked === false ? 'text-[#FF4D6D]' : 'text-[#4A5568] hover:text-[#FF4D6D] hover:bg-white/[0.05]'}`}
              >
                <ThumbsDown className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {isAssistant && !message.isStreaming && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s)}
                className="text-[10px] px-2.5 py-1 rounded-full border border-[#14F1D9]/25 bg-[#14F1D9]/[0.06] text-[#14F1D9] hover:bg-[#14F1D9]/15 hover:border-[#14F1D9]/50 transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface AICopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AICopilotPanel({ isOpen, onClose }: AICopilotPanelProps) {
  const { incidents, responders, zones, metrics } = useDashboardStore();

  const [sessionContext, setSessionContext] = useState<ConversationContext>({
    activeIncidentId: 'INC-0091',
    activeBuilding: 'Science Block B – Floor 3, Lab 302',
    incidentType: 'fire',
    severity: 'critical',
    occupancy: 42,
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **CampusShield AI Copilot** — your Emergency Operations AI Assistant with natural language intelligence and visual generation capabilities.\n\nI can assist you with:\n- **Text Intelligence:** Strategic dispatch advice & threat analysis\n- **Image Generation:** Realistic emergency simulations & scene visuals\n- **Evacuation Maps:** Vector routing diagrams & risk heatmaps\n- **Emergency Documents:** Safety awareness posters & executive PDF briefs",
      timestamp: new Date(),
      cards: [],
      visuals: [],
      suggestions: [
        'Show me how the fire may spread',
        'Generate an evacuation map for Science Block',
        'Create a crowd density heatmap',
        'Generate an emergency awareness poster',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedVisual, setExpandedVisual] = useState<VisualCardData | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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
    setGeneratingProgress('Synthesizing emergency intelligence & visual context...');

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
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: "Conversation session cleared. How can I assist with campus emergency visual generation?",
      timestamp: new Date(),
      cards: [],
      visuals: [],
      suggestions: [
        'Show me how the fire may spread',
        'Generate an evacuation map for Science Block',
        'Create a crowd density heatmap',
      ],
    }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full sm:w-[540px] md:w-[600px]"
          >
            <div className="flex flex-col h-full bg-card/95 dark:bg-[#070B12]/95 border-l border-border backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.5)] overflow-hidden transition-colors duration-300">
              <div className="flex-shrink-0 px-5 py-4 border-b border-border bg-gradient-to-r from-primary/[0.08] via-secondary/[0.05] to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(20,241,217,0.25)]">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card dark:border-[#070B12]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">Emergency AI Copilot</h2>
                        <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40 font-bold uppercase">
                          VISUAL ENGINE
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Multimodal Image, Map &amp; Document Generator
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={clearHistory}
                      className="p-2 rounded-xl text-[#4A5568] hover:text-[#8B9AB4] hover:bg-white/[0.06] transition-all cursor-pointer"
                      title="Clear conversation"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl text-[#4A5568] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap text-[9px] font-mono">
                  <span className="text-[#8B9AB4]">ACTIVE CONTEXT:</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/30 font-bold">
                    📍 {sessionContext.activeBuilding?.split('–')[0]?.trim() || 'Science Block B'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFB347]/15 text-[#FFB347] border border-[#FFB347]/30 font-bold">
                    🔥 {sessionContext.incidentType?.toUpperCase() || 'FIRE'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/30 font-bold">
                    👥 {sessionContext.occupancy || 42} AT RISK
                  </span>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onRegenerate={handleRegenerate}
                    onSuggestion={(s) => sendMessage(s)}
                    onExpandVisual={(vis) => setExpandedVisual(vis)}
                  />
                ))}

                {generatingProgress && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#14F1D9]/[0.06] border border-[#14F1D9]/30 text-[#14F1D9] text-xs font-mono"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-t-[#14F1D9] border-r-transparent border-b-[#7C5CFF] border-l-transparent animate-spin" />
                    <span>{generatingProgress}</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-28 right-5 w-8 h-8 rounded-full bg-[#14F1D9]/20 border border-[#14F1D9]/40 text-[#14F1D9] flex items-center justify-center shadow-lg hover:bg-[#14F1D9]/30 transition-all z-10 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {messages.length <= 2 && (
                <div className="flex-shrink-0 px-4 pb-2">
                  <p className="text-[9px] text-[#4A5568] uppercase font-mono tracking-wider mb-2 font-bold">
                    Flagship Visual Generators
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {PROMPT_STARTERS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage(item.label)}
                          className="text-left text-[11px] p-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] text-[#8B9AB4] hover:text-[#F0F4FF] hover:border-[#14F1D9]/40 hover:bg-[#14F1D9]/[0.06] transition-all flex items-center gap-2 cursor-pointer group"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#14F1D9] flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-border bg-card/90 dark:bg-[rgba(7,11,18,0.7)]">
                <div className={`flex items-end gap-2 rounded-2xl border p-2.5 transition-all duration-200 ${
                  input
                    ? 'border-primary/50 bg-primary/5 shadow-[0_0_25px_rgba(20,241,217,0.12)]'
                    : 'border-border bg-card/50 dark:bg-white/[0.03]'
                }`}>
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all flex-shrink-0 cursor-pointer">
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI, generate evacuation maps, visuals, heatmaps, posters…"
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none leading-relaxed py-1 max-h-28 overflow-y-auto font-sans"
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
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  {isStreaming ? (
                    <button
                      onClick={handleStop}
                      className="p-2 rounded-xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 text-[#FF4D6D] hover:bg-[#FF4D6D]/30 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim()}
                      className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                        input.trim()
                          ? 'bg-[#14F1D9] text-[#070B12] font-bold shadow-[0_0_15px_rgba(20,241,217,0.4)] hover:brightness-110 cursor-pointer'
                          : 'text-[#4A5568] bg-white/[0.04] border border-transparent cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[9px] text-[#4A5568] text-center mt-2 font-mono">
                  Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[#8B9AB4] font-mono text-[8px]">Enter</kbd> to generate · <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[#8B9AB4] font-mono text-[8px]">Shift+Enter</kbd> for new line
                </p>
              </div>
            </div>
          </motion.div>

          <ImageLightboxModal
            visual={expandedVisual}
            onClose={() => setExpandedVisual(null)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
