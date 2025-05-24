import React from 'react';
import Head from 'next/head';
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import GoogleAds from '@/integrations/TrackingScripts';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-spaceGrotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "stubborn - crafting long - lasting experiences",
  description: "Criação e gestão de sites corporativos, eCommerce, lojas virtuais, landing pages e soluções digitais",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="PT-BR">
      <Head>
        <TrackingScripts />
      </Head>
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}