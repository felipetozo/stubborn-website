import React from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import TrackingScripts from '@/integrations/TrackingScripts';
import ChatbotWidget from '@/integrations/ChatbotWidget';
import AnalyticsTracker from '@/integrations/AnalyticsTracker';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-spaceGrotesk',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
        <TrackingScripts />
        <AnalyticsTracker />
        {children}
        <Analytics />
        <ChatbotWidget />
      </body>
    </html>
  );
}
