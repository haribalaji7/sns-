'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  Radio,
  MapPin,
  BatteryCharging,
  Phone,
  ArrowRightLeft,
  Navigation2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  Flame
} from 'lucide-react';
import { useSecurityStore, DEMO_OFFICERS } from '@/store/security';
import { soundEffects } from '@/lib/audio-effects';

export default function SecurityTeamPage() {
  const { officer, teamOfficers, requestBackup, transferIncident, toggleRadio } = useSecurityStore();
  const [selectedTargetOfficer, setSelectedTargetOfficer] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleRequestBackupToAll = () => {
    requestBackup('General team backup requested at active incident post.');
    soundEffects.playAlert();
  };

  const handleTransfer = (targetId: string) => {
    transferIncident(targetId);
    setTransferSuccess(true);
    soundEffects.playSuccess();
    setTimeout(() => setTransferSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ─── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12]/80 border border-white/[0.08] p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#F0F4FF] flex items-center gap-2">
            Campus Quick Reaction Force (QRF) &amp; Officer Roster
            <span className="px-2 py-0.5 rounded-full bg-[#22D3A5]/15 text-[#22D3A5] font-mono text-[10px] font-bold uppercase">
              {teamOfficers.length} UNITS DEPLOYED
            </span>
          </h1>
          <p className="text-xs text-[#8B9AB4] font-medium">
            Realtime Peer Telemetry, Location Pings, Radio Intercom &amp; Case Transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestBackupToAll}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#FF4D6D] to-[#FFB347] text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,77,109,0.3)] hover:brightness-110 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Broadcast Backup Request</span>
          </button>
        </div>
      </div>

      {transferSuccess && (
        <div className="p-3 rounded-xl bg-[#22D3A5]/20 border border-[#22D3A5]/50 text-[#22D3A5] text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Incident case transfer successfully dispatched to peer unit.</span>
        </div>
      )}

      {/* ─── Team Officer Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {teamOfficers.map((off) => {
          const isMe = off.id === officer.id;

          return (
            <motion.div
              key={off.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl glass border bg-[#070B12]/85 backdrop-blur-md shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden ${
                isMe
                  ? 'border-[#14F1D9]/50 ring-2 ring-[#14F1D9]/30 shadow-[0_0_25px_rgba(20,241,217,0.15)]'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div>
                {/* Officer Avatar & Identity Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={off.avatarUrl}
                      alt={off.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#14F1D9]/40 shadow-md flex-shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-[#F0F4FF]">
                          {off.name}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-[#14F1D9] text-[#070B12] font-mono text-[9px] font-black uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#14F1D9] font-bold">
                        {off.badgeNumber} · {off.team}
                      </p>
                      <p className="text-[10px] text-[#8B9AB4] truncate max-w-[180px]">
                        {off.vehicle}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      off.status === 'Available'
                        ? 'bg-[#22D3A5]/20 text-[#22D3A5] border border-[#22D3A5]/40'
                        : off.status === 'Responding'
                        ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40 animate-pulse'
                        : 'bg-[#14F1D9]/20 text-[#14F1D9] border border-[#14F1D9]/40'
                    }`}
                  >
                    {off.status}
                  </span>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-white/[0.04] mb-3">
                  <div className="flex items-center gap-1.5 text-[#D0D6E0]">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#22D3A5]" />
                    <span>Battery: {off.batteryLevel}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#D0D6E0]">
                    <Radio className="w-3.5 h-3.5 text-[#14F1D9]" />
                    <span>Ch: {off.radioChannel.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#8B9AB4] col-span-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FFB347]" />
                    <span className="truncate">GPS: Sector Central Promenade</span>
                  </div>
                </div>

                {/* Specialization & Experience */}
                <div className="space-y-1 text-xs">
                  <span className="text-[9px] font-mono text-[#8B9AB4] uppercase block">
                    Specialization &amp; Certifications:
                  </span>
                  <p className="text-[11px] text-[#F0F4FF] font-semibold">
                    {off.specialization}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {off.certifications.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-[#8B9AB4]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                {!isMe ? (
                  <>
                    <button
                      onClick={() => handleTransfer(off.id)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-[#14F1D9]/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Transfer Case</span>
                    </button>

                    <button
                      onClick={toggleRadio}
                      className="p-2 rounded-xl bg-[rgba(124,92,255,0.2)] hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white border border-[#7C5CFF]/40 font-bold text-xs flex items-center justify-center cursor-pointer"
                      title="Radio Direct Ping"
                    >
                      <Radio className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full py-1.5 text-center text-[10px] font-mono text-[#22D3A5] font-bold">
                    ACTIVE LOCAL UNIT SESSION
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
