'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ShieldAlert, Crosshair } from 'lucide-react';

export default function StudentMapPage() {
  return (
    <div className="h-screen bg-[#070B12] relative overflow-hidden flex flex-col">
      {/* Search Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pt-10 pointer-events-none">
        <div className="bg-[#0D121F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14F1D9]/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#14F1D9]" />
            </div>
            <div>
              <div className="text-white font-semibold">Campus Live Map</div>
              <div className="text-[#8B9AB4] text-xs">Safe Zones & Evacuation Routes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Map Background (Glassmorphic Placeholder) */}
      <div className="flex-1 w-full bg-[#0A0F1A] relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#14F1D9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Mock Live Map Markers */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-1/3 left-1/4 flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-[#FF4D6D]/20 rounded-full flex items-center justify-center border border-[#FF4D6D]/50 relative">
            <div className="absolute inset-0 bg-[#FF4D6D]/30 rounded-full animate-ping" />
            <ShieldAlert className="w-6 h-6 text-[#FF4D6D]" />
          </div>
          <span className="text-[#FF4D6D] text-xs font-bold mt-2 bg-[#070B12]/80 px-2 py-1 rounded-md">Incident: Fire</span>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        >
          <div className="w-10 h-10 bg-[#14F1D9] rounded-full flex items-center justify-center border-4 border-[#070B12] shadow-[0_0_20px_#14F1D9]">
            <Navigation className="w-5 h-5 text-[#070B12]" />
          </div>
          <span className="text-[#14F1D9] text-xs font-bold mt-2 bg-[#070B12]/80 px-2 py-1 rounded-md">You are here</span>
        </motion.div>
      </div>
      
      {/* Legend Footer */}
      <div className="absolute bottom-28 left-0 right-0 z-10 px-6">
        <div className="bg-[#0D121F]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#14F1D9]" />
            <span className="text-xs text-[#8B9AB4]">My Location</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#00E59B]" />
            <span className="text-xs text-[#8B9AB4]">Safe Zone</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#FF4D6D]" />
            <span className="text-xs text-[#8B9AB4]">Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
