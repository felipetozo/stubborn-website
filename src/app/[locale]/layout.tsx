import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Stubborn',
    title: 'Stubborn — Pare de gerenciar sua empresa no WhatsApp e na planilha',
    description:
      'A Stubborn organiza o comercial, coloca o site no ar e acompanha a operação da sua empresa todo mês. Painel com CRM e IA + agência em uma única assinatura.',
    images: [{ url: '/img/stubborn-logotipo.png', width: 1200, height: 630, alt: 'Stubborn' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stubborn — Pare de gerenciar sua empresa no WhatsApp e na planilha',
    description:
      'Painel com CRM e IA + agência de marketing em uma única assinatura. Organiza o comercial, coloca o site no ar e acompanha sua operação todo mês.',
    images: ['/img/stubborn-logotipo.png'],
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
  offers: { '@type': 'AggregateOffer', priceCurrency: 'BRL', lowPrice: '500', highPrice: '2600', offerCount: '3' },
  sameAs: ['https://admin.stubborn.com.br', 'https://www.linkedin.com/company/stubborn'],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
