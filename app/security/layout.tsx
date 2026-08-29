'use client';

import React from 'react';
import { SecurityHeader } from '@/components/security/SecurityHeader';
import { SecurityBottomNav } from '@/components/security/SecurityBottomNav';
import { SecurityRadioDrawer } from '@/components/security/SecurityRadioDrawer';
import { SecurityNotificationModal } from '@/components/security/SecurityNotificationModal';
import { usePathname } from 'next/navigation';

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/security/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#030407] text-[#F0F4FF] flex flex-col font-sans selection:bg-[#14F1D9]/30 selection:text-[#14F1D9] pb-20 sm:pb-16">
      {/* Top Tactical Status Header */}
      <SecurityHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col">
        {children}
      </main>

      {/* Floating Tactical Radio Drawer */}
      <SecurityRadioDrawer />

      {/* High-Priority Realtime Emergency Alert Modal */}
      <SecurityNotificationModal />

      {/* Mobile/Tablet Bottom Navigation Bar */}
      <SecurityBottomNav />
    </div>
  );
}
