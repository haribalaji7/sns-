'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Map, BellRing, History, User } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Map', href: '/student/map', icon: Map },
  { name: 'Alerts', href: '/student/alerts', icon: BellRing },
  { name: 'History', href: '/student/history', icon: History },
  { name: 'Profile', href: '/student/profile', icon: User },
];

export function StudentMobileNav() {
  const pathname = usePathname();

  // Hide on login screen
  if (pathname === '/student/login') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 pointer-events-none sm:hidden">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
        className="mx-auto max-w-md bg-[#0D121F]/80 backdrop-blur-xl border border-white/10 rounded-[28px] p-2 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="activeStudentNavTab"
                  className="absolute inset-0 bg-white/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon 
                className={`w-6 h-6 relative z-10 transition-colors duration-300 ${isActive ? 'text-[#14F1D9]' : 'text-[#8B9AB4]'}`} 
              />
              <span className={`text-[10px] mt-1 font-medium relative z-10 transition-colors duration-300 ${isActive ? 'text-[#14F1D9]' : 'text-[#8B9AB4]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
