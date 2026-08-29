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
  Save,
  Home,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { useStudentStore } from '@/store/student';
import { useDashboardStore } from '@/store/dashboard';
import { soundEffects } from '@/lib/audio-effects';
import { logoutStudent } from '@/app/student/login/actions';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { PushNotificationManager } from '@/components/pwa/PushNotificationManager';

export function StudentProfileTab() {
  const { profile, setProfile } = useStudentStore();
  const { addToast } = useDashboardStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [allergies, setAllergies] = useState('Penicillin, Peanuts (Severe Anaphylaxis)');
  const [medicalNotes, setMedicalNotes] = useState(profile.medicalNotes);
  const [accessibility, setAccessibility] = useState(profile.accessibility);
  const [hostel, setHostel] = useState(profile.hostel);

  const handleSave = () => {
    soundEffects.playSuccess();
    setProfile({
      name,
      bloodGroup,
      medicalNotes,
      accessibility,
      hostel,
    });
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Medical vitals and accessibility preferences synced to Supabase.',
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
      {/* ─── Digital Student ID Hologram Card ─────────────────────────── */}
      <div className="relative rounded-3xl glass border border-[rgba(20,241,217,0.4)] bg-gradient-to-br from-[#14F1D9]/15 via-[#070B12] to-[#7C5CFF]/15 p-5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#14F1D9]/20 via-[#7C5CFF]/10 to-transparent pointer-events-none rounded-full blur-2xl" />

        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14F1D9] animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#14F1D9] uppercase">
              CAMPUSSHIELD DIGITAL ID
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#22D3A5] bg-[#22D3A5]/20 px-2.5 py-0.5 rounded-full font-bold">
            ACTIVE ENROLLED
          </span>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#14F1D9]/50 shadow-md bg-gradient-to-br from-[#14F1D9]/30 to-[#7C5CFF]/30 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {profile.name.split(' ')[0][0]}{profile.name.split(' ')[1]?.[0] || 'S'}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-[#F0F4FF] tracking-tight truncate">
              {profile.name}
            </h2>
            <p className="text-xs text-[#8B9AB4] truncate">
              {profile.department}
            </p>
            <p className="text-[11px] font-mono text-[#14F1D9] font-bold mt-0.5">
              ID: {profile.studentId}
            </p>
          </div>

          {/* QR Code Identification */}
          <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-lg">
            <QrCode className="w-12 h-12 text-black" />
          </div>
        </div>
      </div>

      {/* ─── Edit Mode Action Toggle ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold">
          Emergency Vitals & Directives
        </span>
        <button
          onClick={() => {
            soundEffects.playClick();
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isEditing
              ? 'bg-[#22D3A5] text-[#070B12] shadow-[0_0_12px_rgba(34,211,165,0.4)]'
              : 'bg-white/5 hover:bg-white/10 text-[#14F1D9] border border-white/10'
          }`}
        >
          {isEditing ? (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Vitals</span>
            </>
          )}
        </button>
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

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[#8B9AB4] font-mono">Blood Group:</span>
            {isEditing ? (
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg bg-black/50 border border-white/20 text-center font-mono font-black text-[#FF4D6D] outline-none"
              />
            ) : (
              <span className="text-base font-mono font-black text-[#FF4D6D]">{profile.bloodGroup}</span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase block">Allergies & Reactions:</span>
            {isEditing ? (
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-2 py-1 rounded-lg bg-black/50 border border-white/20 text-xs text-[#F0F4FF] outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-[#F0F4FF]">{allergies}</p>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-[#8B9AB4] uppercase block">Medical Notes & Equipment:</span>
            {isEditing ? (
              <input
                type="text"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-2 py-1 rounded-lg bg-black/50 border border-white/20 text-xs text-[#14F1D9] outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-[#14F1D9]">{profile.medicalNotes}</p>
            )}
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
          {isEditing ? (
            <textarea
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              rows={2}
              className="w-full p-2 rounded-lg bg-black/50 border border-white/20 text-xs text-[#D0D6E0] outline-none resize-none"
            />
          ) : (
            <p className="text-xs text-[#D0D6E0] leading-relaxed">{profile.accessibility}</p>
          )}
        </div>
      </div>

      {/* ─── Web Push Notification Manager ───────────────────────────── */}
      <PushNotificationManager />

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
            {
              name: profile.emergencyContact?.name || 'Sunita Sharma',
              relation: profile.emergencyContact?.relation || 'Parent / Mother',
              phone: profile.emergencyContact?.phone || '+1 (555) 019-2831'
            },
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

      {/* ─── App Appearance & Theme Selection ─────────────────────────── */}
      <div className="rounded-2xl glass border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-1.5">
            Appearance &amp; Theme
          </h3>
          <span className="text-[9px] font-mono text-primary">REAL-TIME ADAPTIVE</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground font-medium">Interface Color Theme</p>
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* ─── Logout Button ───────────────────────────────────────────── */}
      <div className="pt-2">
        <button
          onClick={async () => {
            soundEffects.playClick();
            await logoutStudent();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#FF1E46] hover:brightness-110 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(255,77,109,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Portal</span>
        </button>
      </div>
    </div>
  );
}
