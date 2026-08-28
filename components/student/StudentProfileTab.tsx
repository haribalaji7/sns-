'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Heart,
  Phone,
  QrCode,
  ShieldCheck,
  Activity,
  Accessibility,
  AlertCircle,
  Edit2,
  Check,
  Share2,
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';

export function StudentProfileTab() {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts (Severe Anaphylaxis)');
  const [medications, setMedications] = useState('Epi-Pen (Auto-injector #2 in backpack)');
  const [accessibility, setAccessibility] = useState('Requires elevator/ramp egress in non-fire events');

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
      {/* ─── Digital Student ID Hologram Card ─────────────────────────── */}
      <div className="relative rounded-3xl glass border border-[rgba(20,241,217,0.4)] bg-gradient-to-br from-[#14F1D9]/15 via-[#070B12] to-[#7C5CFF]/15 p-5 shadow-2xl overflow-hidden">
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14F1D9] animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#14F1D9] uppercase">
              CAMPUSSHIELD DIGITAL ID
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/20 px-2 py-0.5 rounded-full font-bold">
            ACTIVE ENROLLED
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#14F1D9]/50 shadow-md bg-gradient-to-br from-[#14F1D9]/30 to-[#7C5CFF]/30 flex items-center justify-center text-lg font-bold text-white">
            ML
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-[#F0F4FF] tracking-tight truncate">
              Maya Lin
            </h2>
            <p className="text-xs text-[#8B9AB4] truncate">
              B.S. Bioengineering (Sophomore)
            </p>
            <p className="text-[11px] font-mono text-[#14F1D9] font-bold mt-0.5">
              ID: STU-2024-8841
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-lg">
            <QrCode className="w-12 h-12 text-black" />
          </div>
        </div>
      </div>

      {/* ─── Medical Profile & Emergency Vitals ───────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#FF4D6D]" />
            Medical & Emergency Vitals
          </h3>
          <span className="text-[9px] font-mono text-[#FF4D6D] bg-[#FF4D6D]/15 px-2 py-0.5 rounded-full font-bold">
            CRITICAL INFO
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[#8B9AB4] font-mono">Blood Group:</span>
            <span className="text-base font-mono font-black text-[#FF4D6D]">{bloodGroup}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase block">Allergies:</span>
            <p className="text-xs font-semibold text-[#F0F4FF]">{allergies}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase block">Medications:</span>
            <p className="text-xs font-semibold text-[#14F1D9]">{medications}</p>
          </div>
        </div>
      </div>

      {/* ─── Accessibility & Safety Directives ────────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-[#7C5CFF]" />
            Accessibility & Special Directives
          </h3>
          <span className="text-[9px] font-mono text-[#7C5CFF]">EGRESS</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-xs text-[#D0D6E0] leading-relaxed">{accessibility}</p>
        </div>
      </div>

      {/* ─── Emergency Guardians / Contacts ───────────────────────────── */}
      <div className="rounded-3xl glass border border-white/[0.08] bg-[#070B12]/80 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold text-[#F0F4FF] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#FFB347]" />
            Primary Emergency Contacts
          </h3>
          <span className="text-[9px] font-mono text-[#8B9AB4]">NOTIFIED ON SOS</span>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Elena Lin', relation: 'Parent / Guardian', phone: '+1 (555) 392-8812' },
            { name: 'Jordan Hayes', relation: 'Roommate (Dorm A-214)', phone: '+1 (555) 891-2041' },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-xs font-bold text-[#F0F4FF]">{c.name}</p>
                <p className="text-[10px] text-[#8B9AB4]">{c.relation}</p>
              </div>
              <a
                href={`tel:${c.phone}`}
                onClick={() => soundEffects.playClick()}
                className="px-2.5 py-1 rounded-lg bg-[#22D3A5]/20 hover:bg-[#22D3A5]/30 text-[#22D3A5] border border-[#22D3A5]/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
