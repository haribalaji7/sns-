'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Radio, ArrowRight, Activity, BellRing, Sparkles, Layers } from 'lucide-react';
import { GradientButton } from '@/components/ui';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B12]/80 backdrop-blur-xl border-b border-[rgba(20,241,217,0.15)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] shadow-[0_0_15px_rgba(20,241,217,0.3)] group-hover:shadow-[0_0_25px_rgba(20,241,217,0.6)] transition-all duration-300">
            <Shield className="w-5 h-5 text-[#14F1D9] group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F1D9] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#14F1D9]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#F0F4FF] group-hover:text-[#14F1D9] transition-colors">
                CampusShield
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-gradient-to-r from-[#14F1D9]/20 to-[#7C5CFF]/20 text-[#14F1D9] border border-[rgba(20,241,217,0.3)]">
                AI CORE
              </span>
            </div>
            <p className="text-[10px] text-[#8B9AB4] font-mono tracking-wider">DEFENSE & RESPONSE OS</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#8B9AB4]">
          <a href="#ai-shield" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#14F1D9]" />
            AI Shield
          </a>
          <Link href="/dashboard/digital-twin" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5 font-bold text-[#F0F4FF]">
            <Layers className="w-3.5 h-3.5 text-[#14F1D9]" />
            3D Digital Twin
          </Link>
          <a href="#features" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
            Features
          </a>
          <a href="#live-stats" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#22D3A5]" />
            Live Intelligence
          </a>
          <a href="#workflow" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#FFB347]" />
            Tactical Workflow
          </a>
        </nav>

        {/* Live Status & CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(20,241,217,0.06)] border border-[rgba(20,241,217,0.2)] text-[11px] font-mono text-[#14F1D9]">
            <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-pulse" />
            <span>SYSTEM ACTIVE · 224 SENSORS</span>
          </div>

          <Link href="/dashboard">
            <GradientButton
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="text-xs font-semibold shadow-[0_0_20px_rgba(20,241,217,0.35)] hover:shadow-[0_0_30px_rgba(20,241,217,0.6)]"
            >
              Launch Command Center
            </GradientButton>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
