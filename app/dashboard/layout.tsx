'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopBar } from '@/components/dashboard/topbar';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { AICopilotPanel } from '@/components/ai/AICopilotPanel';
import { useDashboardStore } from '@/store/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { copilotOpen, toggleCopilot } = useDashboardStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative transition-colors duration-300">
      {/* Ambient Cyber Lighting Layer */}
      <AmbientBackground />

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>

      {/* Global Slide-Over AI Copilot Panel */}
      <AICopilotPanel isOpen={copilotOpen} onClose={toggleCopilot} />
    </div>
  );
}
