'use client';

import { GlassCard, NeonBadge, StatCard } from '@/components/ui';
import { useDashboardStore } from '@/store/dashboard';
import { formatDuration } from '@/lib/utils';
import { Users, Radio, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  available: '#22D3A5', dispatched: '#FFB347', on_scene: '#FF4D6D', offline: '#4A5568',
};

export default function RespondersPage() {
  const { responders, metrics } = useDashboardStore();
  return (
    <div className="p-5 space-y-5">
      <h1 className="text-xl font-bold text-[#F0F4FF]">Responders</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'Available', value: responders.filter(r=>r.status==='available').length, accent:'green' as const },
          { title: 'Dispatched', value: responders.filter(r=>r.status==='dispatched').length, accent:'amber' as const },
          { title: 'On Scene', value: responders.filter(r=>r.status==='on_scene').length, accent:'red' as const },
          { title: 'Offline', value: responders.filter(r=>r.status==='offline').length, accent:'primary' as const },
        ].map((s,i) => <StatCard key={s.title} {...s} delay={0.05*(i+1)} icon={<Users className="w-4 h-4"/>} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {responders.map((r, i) => (
          <motion.div key={r.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.07*i}}>
            <GlassCard padding="md" hover animate={false}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14F1D9]/30 to-[#7C5CFF]/30 border border-white/10 flex items-center justify-center text-sm font-bold text-[#F0F4FF]">
                    {r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#070B12]"
                    style={{background: STATUS_COLORS[r.status]}} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F0F4FF] truncate">{r.name}</p>
                  <p className="text-xs text-[#8B9AB4]">{r.role}</p>
                </div>
                <NeonBadge variant={r.status==='available'?'resolved':r.status==='on_scene'?'critical':'high'} dot size="xs">
                  {r.status.replace('_',' ')}
                </NeonBadge>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2 text-[#8B9AB4]">
                  <Radio className="w-3 h-3" /><span>{r.radioChannel}</span>
                </div>
                <div className="flex items-center gap-2 text-[#8B9AB4]">
                  <MapPin className="w-3 h-3" /><span>{r.team}</span>
                </div>
                {r.currentIncidentId && (
                  <div className="mt-2 px-2 py-1 rounded-lg bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] text-[#FF4D6D]">
                    Assigned: {r.currentIncidentId}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
