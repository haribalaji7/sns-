'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { History, ShieldAlert, CheckCircle2 } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, type: 'Medical Emergency', status: 'Resolved', date: 'Aug 24, 2026', duration: '12 mins' },
  { id: 2, type: 'Fire Alarm', status: 'False Alarm', date: 'Jul 15, 2026', duration: '5 mins' },
];

export default function StudentHistoryPage() {
  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <div className="w-12 h-12 bg-[#7C5CFF]/20 rounded-2xl flex items-center justify-center">
          <History className="w-6 h-6 text-[#7C5CFF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Incident History</h1>
          <p className="text-[#8B9AB4] text-sm">Past events and resolutions</p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map((incident, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={incident.id}
            className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#8B9AB4]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{incident.type}</h3>
                  <p className="text-[#8B9AB4] text-xs">{incident.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#00E59B]/10 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-[#00E59B]" />
                <span className="text-[#00E59B] text-xs font-semibold">{incident.status}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
              <span className="text-[#8B9AB4]">Resolution Time</span>
              <span className="text-white font-medium">{incident.duration}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
