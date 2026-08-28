'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Users,
  BarChart3,
  Bot,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  Smartphone,
  Cpu,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboard';

const navItems = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Command Center', shortLabel: 'Command' },
  { href: '/dashboard/digital-twin',icon: Layers,          label: '3D Digital Twin', shortLabel: '3D Twin' },
  { href: '/dashboard/incidents',  icon: AlertTriangle,    label: 'Incidents & 12 States', shortLabel: 'Incidents' },
  { href: '/dashboard/map',        icon: Map,              label: 'Campus Map',     shortLabel: 'Map' },
  { href: '/dashboard/responders', icon: Users,            label: 'Responders',     shortLabel: 'Units' },
  { href: '/dashboard/ai',         icon: Sparkles,         label: 'AI Studio',      shortLabel: 'AI' },
  { href: '/dashboard/predictions',icon: Cpu,              label: 'ML Risk Predictor', shortLabel: 'ML Risk' },
  { href: '/dashboard/analytics',  icon: BarChart3,        label: 'Analytics',      shortLabel: 'Metrics' },
  { href: '/student',              icon: Smartphone,      label: 'Student App',    shortLabel: 'Student' },
  { href: '/dashboard/settings',   icon: Settings,         label: 'Settings',       shortLabel: 'Settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, metrics } = useDashboardStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 220 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-shrink-0 h-full glass border-r border-[rgba(20,241,217,0.15)] bg-[#070B12]/95 flex flex-col justify-between overflow-hidden z-30 select-none"
    >
      {/* ─── Top: Logo ─────────────────────────────────────────────────── */}
      <div>
        <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.08] cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(20,241,217,0.3)] group-hover:scale-105 transition-all">
            <Shield className="w-5 h-5 text-[#14F1D9]" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold text-[#F0F4FF] leading-tight">CampusShield</p>
                <p className="text-[10px] text-[#14F1D9] font-mono font-semibold uppercase tracking-wider">COMMAND OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* ─── Navigation Items ────────────────────────────────────────── */}
        <nav className="py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative',
                    isActive
                      ? 'bg-[rgba(20,241,217,0.12)] text-[#14F1D9] border border-[rgba(20,241,217,0.3)] shadow-[0_0_15px_rgba(20,241,217,0.15)]'
                      : 'text-[#8B9AB4] hover:text-[#F0F4FF] hover:bg-white/[0.05]',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#14F1D9] rounded-r-full shadow-[0_0_8px_#14F1D9]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-[#14F1D9] drop-shadow-[0_0_6px_rgba(20,241,217,0.8)]' : 'text-[#8B9AB4]',
                    )}
                  />

                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-semibold whitespace-nowrap truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip when collapsed (72px Mode) */}
                  {sidebarCollapsed && (
                    <div className="absolute left-16 bg-[#0D1219] border border-[rgba(20,241,217,0.3)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#F0F4FF] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-2xl">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ─── Bottom Actions ────────────────────────────────────────────── */}
      <div className="p-2 border-t border-white/[0.08] space-y-1">
        {/* Active Emergency Alert Badge */}
        {!sidebarCollapsed && metrics.activeIncidents > 0 && (
          <div className="mx-1 mb-2 px-3 py-2 rounded-xl bg-[rgba(255,77,109,0.12)] border border-[rgba(255,77,109,0.3)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-ping" />
              <span className="text-[11px] font-mono text-[#FF4D6D] font-bold">
                {metrics.activeIncidents} Active
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#8B9AB4]">LIVE</span>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#8B9AB4] hover:text-[#14F1D9] hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">Collapse (72px)</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
