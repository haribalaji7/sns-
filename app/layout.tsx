import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CampusShield AI — Smart Campus Security Command Center',
  description: 'AI-powered real-time campus safety monitoring, incident response, and threat intelligence platform.',
  keywords: ['campus security', 'AI monitoring', 'emergency response', 'threat detection'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070B12',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[#070B12] text-[#F0F4FF] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
