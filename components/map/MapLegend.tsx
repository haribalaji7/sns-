'use client';

import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const legendItems = [
    { label: 'Critical Incident (Fire/Smoke)', color: '#FF4D6D', type: 'circle' },
    { label: 'High Priority (Intrusion/Medical)', color: '#F59E0B', type: 'circle' },
    { label: 'Safe Assembly Point', color: '#00E59B', type: 'point' },
    { label: 'A* Evacuation Route', color: '#14F1D9', type: 'line' },
    { label: 'Danger Blast Radius', color: 'rgba(255, 77, 109, 0.4)', type: 'ring' },
    { label: 'Active Tactical Squad', color: '#7C5CFF', type: 'circle' },
  ];

  return (
    <div
      className={cn(
        'glass rounded-2xl p-3 border border-[rgba(20,241,217,0.25)] bg-[#070B12]/95 backdrop-blur-xl shadow-2xl z-20 select-none text-xs font-mono transition-all',
        className,
      )}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-3 cursor-pointer text-[11px] font-bold text-[#F0F4FF]"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#14F1D9]" />
          <span>MAP OVERLAY LEGEND</span>
        </div>
        <button className="text-[#8B9AB4] hover:text-white">
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-1 gap-1.5 text-[10px] text-[#8B9AB4]">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.type === 'circle' && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
              )}
              {item.type === 'point' && (
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-[#00E59B]"
                  style={{ boxShadow: '0 0 6px #00E59B' }}
                />
              )}
              {item.type === 'line' && (
                <span className="w-3.5 h-1 rounded-full flex-shrink-0 bg-[#14F1D9] shadow-[0_0_6px_#14F1D9]" />
              )}
              {item.type === 'ring' && (
                <span className="w-2.5 h-2.5 rounded-full border border-[#FF4D6D] bg-[#FF4D6D]/20 flex-shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
