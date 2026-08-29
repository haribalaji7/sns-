import React from 'react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070B12] text-white font-sans selection:bg-[#14F1D9]/30">
      {children}
    </div>
  );
}
