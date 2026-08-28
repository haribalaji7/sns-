'use client';

import dynamic from 'next/dynamic';
import { DigitalTwinProvider } from '@/context/DigitalTwinContext';

// Load Three.js canvas only on the client — never on the server
const DigitalTwinScene = dynamic(
  () => import('@/components/digital-twin/Scene'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex flex-col items-center justify-center w-full h-full gap-4"
        style={{ background: '#070B12' }}
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#14F1D9]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-[#14F1D9] border-r-transparent border-b-[#7C5CFF] border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-[#14F1D9]/10" />
        </div>
        <div className="text-[#14F1D9] text-sm font-mono tracking-widest animate-pulse uppercase">
          Initializing Digital Twin…
        </div>
        <div className="text-[#4A5568] text-xs font-mono">Loading 3D scene engine</div>
      </div>
    ),
  }
);

export default function DigitalTwinPage() {
  return (
    <DigitalTwinProvider>
      {/*
        Use position:fixed to escape the dashboard scroll container entirely.
        The sidebar is ~64px wide on mobile, ~240px on desktop.
        We use left:0 and let the scene handle its own layout so the
        canvas always gets the correct viewport dimensions.
      */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          background: '#070B12',
        }}
      >
        <DigitalTwinScene />
      </div>
    </DigitalTwinProvider>
  );
}
