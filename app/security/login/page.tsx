'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  UserCheck
} from 'lucide-react';
import { useSecurityStore, DEMO_OFFICERS } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';
import Link from 'next/link';

export default function SecurityLoginPage() {
  const router = useRouter();
  const { loginOfficer } = useSecurityStore();

  const [email, setEmail] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [usePinMode, setUsePinMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      loginOfficer({
        name: email ? email.split('@')[0].toUpperCase() : 'Officer Marcus Vance',
        badgeNumber: badgeNumber || 'SEC-7749',
        email: email || 'm.vance@campusshield.edu',
      });
      setIsLoading(false);
      router.push('/security/dashboard');
    }, 600);
  };

  const handleDemoLogin = (officerData: any) => {
    setIsLoading(true);
    soundEffects.playScan();
    setTimeout(() => {
      loginOfficer(officerData);
      setIsLoading(false);
      router.push('/security/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#030407] text-[#F0F4FF] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Tactical Glow Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14F1D9]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7C5CFF]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Left Floating Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-[#8B9AB4] hover:text-[#14F1D9] transition-all group backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(20,241,217,0.15)] relative z-10 flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 via-[#7C5CFF]/20 to-[#FF4D6D]/20 border border-[rgba(20,241,217,0.4)] flex items-center justify-center shadow-[0_0_25px_rgba(20,241,217,0.3)] mb-1">
            <Shield className="w-7 h-7 text-[#14F1D9]" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#F0F4FF]">
              CampusShield Security
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/30 font-mono text-[9px] font-bold uppercase">
              TACTICAL OS
            </span>
          </div>

          <p className="text-xs text-[#8B9AB4] font-medium max-w-xs">
            Operational Field Dispatch & Tactical Responder Portal
          </p>
        </div>

        {/* 1-Click Fast Tactical Demo Login Profiles */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block text-center">
            Quick 1-Click Officer Deployment
          </span>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_OFFICERS.map((off) => (
              <button
                key={off.id}
                onClick={() => handleDemoLogin(off)}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#14F1D9]/50 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={off.avatarUrl}
                    alt={off.name}
                    className="w-8 h-8 rounded-lg object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#F0F4FF] group-hover:text-[#14F1D9] transition-colors">
                      {off.name}
                    </p>
                    <p className="text-[9px] font-mono text-[#8B9AB4]">
                      {off.badgeNumber} · {off.team}
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-lg bg-white/5 group-hover:bg-[#14F1D9] group-hover:text-black text-[#8B9AB4] transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[10px] font-mono text-[#8B9AB4] uppercase">or officer credentials</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleStandardLogin} className="space-y-3.5">
          {!usePinMode ? (
            <>
              <div>
                <label className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold block mb-1">
                  Security Badge Number / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B9AB4]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="SEC-7749"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#14F1D9]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold block mb-1">
                  Tactical Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B9AB4]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-white placeholder:text-[#8B9AB4] focus:outline-none focus:border-[#14F1D9]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="text-[10px] font-mono text-[#8B9AB4] uppercase font-bold block mb-1">
                4-Digit Tactical Field PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B9AB4]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="9482"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm font-mono text-white tracking-widest text-center focus:outline-none focus:border-[#14F1D9]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono pt-1">
            <button
              type="button"
              onClick={() => setUsePinMode(!usePinMode)}
              className="text-[#14F1D9] hover:underline cursor-pointer"
            >
              {usePinMode ? 'Use Badge ID & Password' : 'Use Quick Field PIN'}
            </button>
            <span className="text-[#8B9AB4]">Shift: Delta Night</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(20,241,217,0.4)] cursor-pointer disabled:opacity-50 transition-all mt-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Deploying Session...' : 'Authenticate & Enter Field OS'}</span>
          </button>
        </form>

        {/* Back Link to Landing */}
        <div className="text-center pt-3 border-t border-white/[0.06] flex flex-col items-center gap-3 text-xs font-mono text-[#8B9AB4]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8B9AB4] hover:text-[#14F1D9] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center justify-center gap-3 text-[11px]">
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
            <span>·</span>
            <Link href="/student/login" className="hover:text-white transition-colors">
              Student Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
