'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, HeartPulse, PhoneCall } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student/login');
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col items-center justify-center pt-8 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-[#14F1D9] to-[#7C5CFF] rounded-full p-[3px] mb-4 shadow-[0_0_30px_rgba(20,241,217,0.3)]">
          <div className="w-full h-full bg-[#070B12] rounded-full flex items-center justify-center overflow-hidden">
            <User className="w-10 h-10 text-[#14F1D9]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Student Profile</h1>
        <p className="text-[#8B9AB4] text-sm">Computer Science, Year 3</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
            <div className="w-10 h-10 bg-[#FF4D6D]/10 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-[#FF4D6D]" />
            </div>
            <div>
              <div className="text-[#8B9AB4] text-xs">Blood Group</div>
              <div className="text-white font-medium">O+ (Positive)</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#14F1D9]/10 rounded-xl flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-[#14F1D9]" />
            </div>
            <div>
              <div className="text-[#8B9AB4] text-xs">Emergency Contact</div>
              <div className="text-white font-medium">+1 (555) 019-2834</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[20px] p-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3 text-white">
            <Settings className="w-5 h-5 text-[#8B9AB4]" />
            <span>Account Settings</span>
          </div>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20 border border-[#FF4D6D]/20 rounded-[20px] p-4 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3 text-[#FF4D6D]">
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
