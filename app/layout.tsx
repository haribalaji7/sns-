import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
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
  manifest: '/manifest.json',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CampusShield AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="bg-[#070B12] text-[#F5F7FA] antialiased min-h-screen">
        <ThemeProvider>
          {children}
          <PWAInstaller />
        </ThemeProvider>
      </body>
    </html>
  );
}
