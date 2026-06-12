import React from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import TrackingScripts from '@/integrations/TrackingScripts'
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

const siteUrl = 'https://stubborn.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Stubborn — Pare de gerenciar sua empresa no WhatsApp e na planilha',
    template: '%s — Stubborn',
  },
  description:
    'A Stubborn organiza o comercial, coloca o site no ar e acompanha a operação da sua empresa todo mês. Painel com CRM e IA + agência de marketing em uma única assinatura. A partir de R$ 500/mês.',
  keywords: [
    'sistema de gestão para pequenas empresas',
    'CRM para empresa industrial',
    'site profissional para empresa',
    'substituir planilha Excel por sistema de gestão',
    'agência de marketing por assinatura',
    'painel all-in-one para PME',
    'software para distribuidora',
    'gestão comercial para empresa B2B',
    'Stubborn Admin',
    'digitalização de empresas',
  ],
  authors: [{ name: 'Stubborn', url: siteUrl }],
  creator: 'Stubborn',
  publisher: 'Stubborn',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Stubborn',
    title: 'Stubborn — Pare de gerenciar sua empresa no WhatsApp e na planilha',
    description:
      'A Stubborn organiza o comercial, coloca o site no ar e acompanha a operação da sua empresa todo mês. Painel com CRM e IA + agência em uma única assinatura.',
    images: [
      {
        // Substituir por imagem OG dedicada (1200×630px) quando disponível
        url: '/img/stubborn-logotipo.png',
        width: 1200,
        height: 630,
        alt: 'Stubborn — Painel de gestão + agência digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stubborn — Pare de gerenciar sua empresa no WhatsApp e na planilha',
    description:
      'Painel com CRM e IA + agência de marketing em uma única assinatura. Organiza o comercial, coloca o site no ar e acompanha sua operação todo mês.',
    images: ['/img/stubborn-logotipo.png'],
    creator: '@stubborn',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'SoftwareApplication'],
  name: 'Stubborn',
  url: siteUrl,
  logo: `${siteUrl}/img/stubborn-logotipo.png`,
  description:
    'A Stubborn é uma plataforma brasileira que combina painel de gestão all-in-one com serviços de agência de marketing digital, oferecida por assinatura mensal para pequenas e médias empresas.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'pt-BR',
  areaServed: 'BR',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'BRL',
    lowPrice: '500',
    highPrice: '2600',
    offerCount: '3',
  },
  sameAs: [
    'https://admin.stubborn.com.br',
    'https://www.linkedin.com/company/stubborn',
    'https://www.instagram.com/stubborn',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
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