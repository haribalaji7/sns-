'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, ShieldAlert, CloudRain, ShieldCheck } from 'lucide-react';

const MOCK_ALERTS = [
  { id: 1, type: 'CRITICAL', title: 'Fire Detected', location: 'Science Block B', time: 'Just now', icon: ShieldAlert, color: '#FF4D6D' },
  { id: 2, type: 'WARNING', title: 'Heavy Rain Alert', location: 'Campus Wide', time: '10 mins ago', icon: CloudRain, color: '#FFB347' },
  { id: 3, type: 'INFO', title: 'Evacuation Drill', location: 'Hostel A', time: '2 hours ago', icon: ShieldCheck, color: '#14F1D9' },
];

export default function StudentAlertsPage() {
  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <div className="w-12 h-12 bg-[#FFB347]/20 rounded-2xl flex items-center justify-center">
          <BellRing className="w-6 h-6 text-[#FFB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Emergency Alerts</h1>
          <p className="text-[#8B9AB4] text-sm">Realtime campus notifications</p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_ALERTS.map((alert, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={alert.id}
            className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-start gap-4 backdrop-blur-md relative overflow-hidden"
          >
            {alert.type === 'CRITICAL' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4D6D] shadow-[0_0_10px_#FF4D6D]" />
            )}
            <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center`} style={{ backgroundColor: `${alert.color}20` }}>
              <alert.icon className="w-6 h-6" style={{ color: alert.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold">{alert.title}</h3>
                <span className="text-[#8B9AB4] text-xs">{alert.time}</span>
              </div>
              <p className="text-[#8B9AB4] text-sm">{alert.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
