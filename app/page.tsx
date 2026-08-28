import React from 'react';
import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { CampusCanvasBackground } from '@/components/landing/campus-canvas-background';
import { HeroSection } from '@/components/landing/hero-section';
import { AIShieldSection } from '@/components/landing/ai-shield-section';
import { FeaturesGridSection } from '@/components/landing/features-grid-section';
import { LiveStatsSection } from '@/components/landing/live-stats-section';
import { DemoWorkflowSection } from '@/components/landing/demo-workflow-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata: Metadata = {
  title: 'CampusShield AI — Smart Campus Emergency Response & Safety Management',
  description:
    'Autonomous next-generation campus emergency response platform unifying multimodal AI vision, IoT telemetry, predictive hazard blast radius modeling, and real-time tactical dispatch.',
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#070B12] text-[#F0F4FF] overflow-x-hidden selection:bg-[#14F1D9]/30 selection:text-[#14F1D9]">
      {/* 1 & 2. Animated Campus Background (Canvas + Particle Mesh + Radar Nodes) */}
      <CampusCanvasBackground />

      {/* Fixed Futuristic Header Navigation */}
      <LandingNavbar />

      {/* 1. Fullscreen Hero Section */}
      <HeroSection />

      {/* 3. AI Emergency Shield Section */}
      <AIShieldSection />

      {/* 4. Features Grid Section */}
      <FeaturesGridSection />

      {/* 5. Live Statistics Section */}
      <LiveStatsSection />

      {/* 6. Demo Workflow Section */}
      <DemoWorkflowSection />

      {/* 7. Command Center Footer */}
      <LandingFooter />
    </main>
  );
}
