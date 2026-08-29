'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, CheckCircle2, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  const requestPermission = async () => {
    soundEffects.playClick();
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        soundEffects.playSuccess();
        sendTestNotification();
      }
    } catch (err) {
      console.warn('Error requesting Notification permission:', err);
    }
  };

  const sendTestNotification = () => {
    soundEffects.playAlert();

    // 1. Try Service Worker push display
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification('🚨 CAMPUSSHIELD EMERGENCY ALERT', {
          body: 'CRITICAL: Thermal combustion spike detected in Science Block B (Lab 302). Evacuate immediately via East Stairwell.',
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>',
          data: { url: '/student/dashboard' },
          vibrate: [200, 100, 200],
        } as any);
      });
      return;
    }

    // 2. Direct Browser Notification fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 CAMPUSSHIELD EMERGENCY ALERT', {
        body: 'CRITICAL: Thermal combustion spike detected in Science Block B (Lab 302). Evacuate immediately via East Stairwell.',
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
      });
    }
  };

  if (!isSupported) return null;

  return (
    <div className="rounded-2xl glass border border-white/[0.08] bg-[#070B12]/80 p-4 space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#14F1D9]" />
          <span className="text-xs font-bold text-[#F0F4FF]">Web Push Notifications</span>
        </div>
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
            permission === 'granted'
              ? 'bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40'
              : permission === 'denied'
              ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40'
              : 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/40'
          }`}
        >
          {permission === 'granted' ? 'ENABLED' : permission === 'denied' ? 'BLOCKED' : 'PROMPT NEEDED'}
        </span>
      </div>

      <p className="text-[11px] text-[#8B9AB4] font-sans leading-relaxed">
        Receive instant OS-level push notifications for emergency evacuations, thermal anomalies, and lockdown alerts on your phone or desktop even when the browser is closed.
      </p>

      <div className="flex items-center gap-2 pt-1">
        {permission !== 'granted' ? (
          <button
            onClick={requestPermission}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,241,217,0.3)] hover:brightness-110 transition-all cursor-pointer border-none"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Push Notifications</span>
          </button>
        ) : (
          <button
            onClick={sendTestNotification}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-[#14F1D9]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Emergency Banner</span>
          </button>
        )}
      </div>
    </div>
  );
}
