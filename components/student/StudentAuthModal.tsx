'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  X,
  Smartphone,
} from 'lucide-react';
import { useStudentStore, StudentProfile } from '@/store/student';
import { soundEffects } from '@/lib/audio-effects';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_STUDENTS: StudentProfile[] = [
  {
    studentId: 'STU-2024-8841',
    name: 'Hari Balaji',
    email: 'hari.balaji@campus.edu',
    department: 'Computer Science & Engineering',
    bloodGroup: 'O+',
    emergencyContact: {
      name: 'Elena Balaji',
      relation: 'Parent / Guardian',
      phone: '+1 (555) 392-8812',
    },
    accessibility: 'Requires ground-floor ramp egress in non-fire events',
    medicalNotes: 'Mild asthma (Inhaler in backpack side pocket)',
    hostel: 'Dormitory Quad Alpha – Room 214',
    status: 'safe',
    currentAssemblyPoint: null,
  },
  {
    studentId: 'STU-2024-4190',
    name: 'Maya Lin',
    email: 'maya.lin@campus.edu',
    department: 'B.S. Bioengineering (Pre-Med)',
    bloodGroup: 'A+',
    emergencyContact: {
      name: 'David Lin',
      relation: 'Father',
      phone: '+1 (555) 891-2041',
    },
    accessibility: 'Standard egress protocol',
    medicalNotes: 'Penicillin allergy (EpiPen in backpack)',
    hostel: 'Science Block Dorm B – Room 302',
    status: 'safe',
    currentAssemblyPoint: null,
  },
  {
    studentId: 'STU-2024-9023',
    name: 'Aarav Patel',
    email: 'aarav.patel@campus.edu',
    department: 'Electrical & Robotics Engineering',
    bloodGroup: 'B+',
    emergencyContact: {
      name: 'Sita Patel',
      relation: 'Mother',
      phone: '+1 (555) 442-9901',
    },
    accessibility: 'Requires elevator assist if uninjured',
    medicalNotes: 'No known chronic conditions',
    hostel: 'Day Scholar (Commuter)',
    status: 'safe',
    currentAssemblyPoint: null,
  },
];

export function StudentAuthModal({ isOpen, onClose }: StudentAuthModalProps) {
  const { loginAsStudent, profile } = useStudentStore();
  const [studentId, setStudentId] = useState(profile.studentId || 'STU-2024-8841');
  const [email, setEmail] = useState(profile.email || 'hari.balaji@campus.edu');
  const [password, setPassword] = useState('••••••••••••');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSuccess();
    loginAsStudent({
      ...profile,
      studentId: studentId.trim() || 'STU-2024-8841',
      email: email.trim() || 'student@campus.edu',
    });
    onClose();
  };

  const handleSelectPreset = (p: StudentProfile) => {
    soundEffects.playSuccess();
    loginAsStudent(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md rounded-3xl glass border border-[rgba(20,241,217,0.3)] bg-[#070B12] p-6 shadow-[0_0_60px_rgba(20,241,217,0.2)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#14F1D9] via-[#22D3A5] to-[#7C5CFF]" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14F1D9]/20 border border-[#14F1D9]/40 flex items-center justify-center text-[#14F1D9] shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#F0F4FF]">Student Authentication</h3>
              <p className="text-[10px] font-mono text-[#14F1D9]">CAMPUSSHIELD SECURE SSO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B9AB4] hover:text-white p-1 rounded-xl bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick 1-Click Demo Profiles */}
        <div className="mb-5">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block mb-2">
            Quick 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_STUDENTS.map((p) => {
              const isCurrent = profile.studentId === p.studentId;
              return (
                <button
                  key={p.studentId}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#14F1D9]/15 border-[#14F1D9] text-white shadow-[0_0_15px_rgba(20,241,217,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#8B9AB4] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-[#14F1D9]">
                      {p.name.split(' ')[0][0]}
                      {p.name.split(' ')[1]?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F0F4FF]">{p.name}</p>
                      <p className="text-[10px] text-[#8B9AB4] font-mono">{p.studentId} · {p.department.split(' ')[0]}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-[#14F1D9] font-bold bg-[#14F1D9]/20 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3 pt-3 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase text-[#8B9AB4] font-bold block">
            Or Login with Student ID
          </span>

          <div className="space-y-2">
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-[#8B9AB4] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Student ID (e.g. STU-2024-8841)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#F0F4FF] placeholder:text-[#4A5568] outline-none font-mono focus:border-[#14F1D9]/60"
              />
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B9AB4] absolute left-3 top-3" />
              <input
                type="email"
                placeholder="Campus Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#F0F4FF] placeholder:text-[#4A5568] outline-none font-mono focus:border-[#14F1D9]/60"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B9AB4] absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#F0F4FF] placeholder:text-[#4A5568] outline-none font-mono focus:border-[#14F1D9]/60"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#14F1D9] to-[#22D3A5] text-[#070B12] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(20,241,217,0.3)] transition-all cursor-pointer mt-2"
          >
            <span>Sign In to Student Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
