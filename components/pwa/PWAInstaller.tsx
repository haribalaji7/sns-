'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Shield, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('CampusShield ServiceWorker registered cleanly:', reg.scope);
        })
        .catch((err) => {
          console.warn('CampusShield ServiceWorker registration failed:', err);
        });
    }

    // 2. Detect if already installed (standalone mode)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl glass border border-[rgba(20,241,217,0.4)] bg-[#070B12]/95 backdrop-blur-2xl shadow-[0_0_30px_rgba(20,241,217,0.25)] text-white select-none"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[#14F1D9]/50 flex items-center justify-center flex-shrink-0 shadow">
              <Shield className="w-5 h-5 text-[#14F1D9]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                Install CampusShield App
                <Sparkles className="w-3.5 h-3.5 text-[#14F1D9]" />
              </h4>
              <p className="text-[11px] text-[#8B9AB4] leading-tight">
                Add to your home screen for offline maps & instant emergency push alerts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="text-[#8B9AB4] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,241,217,0.3)] hover:brightness-110 transition-all cursor-pointer border-none"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B9AB4] text-xs font-mono transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
