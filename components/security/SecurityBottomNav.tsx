'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Navigation2,
  AlertOctagon,
  Users,
  History,
  Shield,
  Radio
} from 'lucide-react';
import { soundEffects } from '@/lib/audio-effects';
import { useSecurityStore } from '@/store/security';

const NAV_ITEMS = [
  { href: '/security/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/security/navigation', label: 'Tactical Nav', icon: Navigation2, highlight: true },
  { href: '/security/incidents', label: 'Incidents', icon: AlertOctagon },
  { href: '/security/team', label: 'Team QRF', icon: Users },
  { href: '/security/history', label: 'Debrief Logs', icon: History },
  { href: '/security/profile', label: 'Profile', icon: Shield },
];

export function SecurityBottomNav() {
  const pathname = usePathname();
  const { activeIncidentId } = useSecurityStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B12]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] select-none">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/security/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundEffects.playClick()}
              className={`relative py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-[#14F1D9] bg-[rgba(20,241,217,0.12)] border border-[rgba(20,241,217,0.3)] shadow-[0_0_15px_rgba(20,241,217,0.2)]'
                  : 'text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.04]'
              }`}
            >
              {item.highlight && activeIncidentId && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FF4D6D] animate-ping" />
              )}
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-semibold truncate leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
