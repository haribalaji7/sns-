'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Radio,
  Activity,
  Server,
  Lock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Flame,
  Users,
  Cpu,
} from 'lucide-react';

export function LandingFooter() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative border-t border-[rgba(20,241,217,0.15)] bg-[#070B12] pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#14F1D9]/5 via-[#7C5CFF]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] shadow-[0_0_15px_rgba(20,241,217,0.3)]">
                <Shield className="w-5 h-5 text-[#14F1D9]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#F0F4FF]">
                    CampusShield AI
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[rgba(20,241,217,0.15)] text-[#14F1D9] border border-[rgba(20,241,217,0.3)]">
                    DEFENSE OS
                  </span>
                </div>
                <p className="text-[10px] text-[#8B9AB4] font-mono">AUTONOMOUS EMERGENCY INTELLIGENCE</p>
              </div>
            </Link>

            <p className="text-xs text-[#8B9AB4] leading-relaxed max-w-sm">
              Next-generation autonomous campus emergency response, unifying multimodal computer vision, distributed IoT sensor meshes, and real-time responder tactical coordination.
            </p>

            {/* Live Telemetry Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-[rgba(20,241,217,0.2)] text-xs font-mono text-[#14F1D9] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#14F1D9] animate-pulse" />
              <span>NODES: 224 ONLINE · {time || 'STREAMING'}</span>
            </div>
          </div>

          {/* Col 3: Command Center Views */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase tracking-wider mb-4">
              Command Consoles
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8B9AB4]">
              <li>
                <Link href="/dashboard" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#14F1D9]" />
                  Main Command Center
                </Link>
              </li>
              <li>
                <Link href="/dashboard/map" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  3D Campus Tactical Map
                </Link>
              </li>
              <li>
                <Link href="/dashboard/incidents" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  Live Incident Queue
                </Link>
              </li>
              <li>
                <Link href="/dashboard/responders" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#22D3A5]" />
                  Responder GPS Fleet
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Intelligence & Telemetry */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase tracking-wider mb-4">
              AI &amp; Sensors
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8B9AB4]">
              <li>
                <Link href="/dashboard/sensors" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
                  IoT Sensor Network
                </Link>
              </li>
              <li>
                <Link href="/dashboard/ai" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  Neural Inference Logs
                </Link>
              </li>
              <li>
                <Link href="/dashboard/analytics" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FFB347]" />
                  Response Analytics
                </Link>
              </li>
              <li>
                <a href="#ai-shield" className="hover:text-[#14F1D9] transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#14F1D9]" />
                  AI Defense Shield
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#F0F4FF] uppercase tracking-wider mb-4">
              Security &amp; Protocols
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8B9AB4]">
              <li className="flex items-center gap-1.5 text-[#F0F4FF]">
                <Lock className="w-3.5 h-3.5 text-[#14F1D9]" />
                Supabase RLS Enforced
              </li>
              <li className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#7C5CFF]" />
                Sub-10ms WebSockets
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3A5]" />
                PostGIS Spatial Indexing
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FF4D6D]" />
                Automated Audit Triggers
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8B9AB4]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} CampusShield AI</span>
            <span>·</span>
            <span>All Systems Nominal</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#14F1D9]">SYSTEM STATUS: 100% OPERATIONAL</span>
            <span>·</span>
            <Link href="/dashboard" className="text-[#F0F4FF] hover:text-[#14F1D9] transition-colors flex items-center gap-1">
              Launch Console <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
