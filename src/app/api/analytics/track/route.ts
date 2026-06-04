/**
 * Endpoint público para receber eventos do analytics próprio.
 * Recebe POST (fetch / navigator.sendBeacon) do tracker do site.
 * Não autenticado — grava visitas, tempo de permanência e ações.
 * Porte do módulo do isoart (MySQL) para Prisma/PostgreSQL.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function trunc(value: unknown, len: number): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, len);
}

/** path pode chegar como /pt-BR/admin, /en/admin, /admin... */
function isAdminPath(path: string): boolean {
  return /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?\/)?admin(?:\/|$)/.test(path);
}

/**
 * Classifica a origem da visita: 'google_ads', 'google_search',
 * 'instagram_ads', 'facebook', 'direct', ou o domínio do referrer.
 */
function classifySource(
  ref: string,
  refDomain: string,
  utmSource: string,
  utmMedium: string,
  siteHost: string,
): string {
  const src = utmSource.toLowerCase();
  const medium = utmMedium.toLowerCase();
  const domain = refDomain.toLowerCase();

  const paidMedia = ['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'cpm', 'cpv', 'display'];
  const isPaid = paidMedia.includes(medium);

  if (isPaid) {
    if (src === 'google') return 'google_ads';
    if (src === 'facebook' || src === 'fb') return 'facebook_ads';
    if (src === 'instagram') return 'instagram_ads';
    if (src === 'youtube') return 'youtube_ads';
    if (src === 'bing') return 'bing_ads';
    if (src !== '') return `${src}_ads`;
    return 'paid';
  }

  if (ref === '' && src === '') return 'direct';

  if (src !== '' && ref === '') {
    if (src === 'google') return 'google_search';
    return src;
  }

  if (domain !== '') {
    if (/google/.test(domain)) return 'google_search';
    if (/bing/.test(domain)) return 'bing';
    if (/yahoo/.test(domain)) return 'yahoo';
    if (/facebook|fb\.com/.test(domain)) return 'facebook';
    if (/instagram/.test(domain)) return 'instagram';
    if (/linkedin/.test(domain)) return 'linkedin';
    if (/youtube/.test(domain)) return 'youtube';
    if (/twitter|t\.co/.test(domain)) return 'twitter';
    if (/whatsapp/.test(domain)) return 'whatsapp';

    const host = siteHost.toLowerCase();
    if (host && (domain === host || domain.endsWith(`.${host}`))) return 'internal';

    return domain;
  }

  return 'direct';
}

type VisitorMeta = {
  ip?: string;
  ua?: string;
  language?: string;
  timezone?: string;
  screen?: string;
};

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for') ?? '';
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get('x-real-ip') ?? '';
  return real.trim().slice(0, 64);
}

/** Cria/atualiza o visitante; campos vazios não sobrescrevem valores existentes. */
async function upsertVisitor(id: string, meta: VisitorMeta = {}): Promise<void> {
  const ip = trunc(meta.ip, 64);
  const ua = trunc(meta.ua, 500);
  const language = trunc(meta.language, 20);
  const timezone = trunc(meta.timezone, 64);
  const screen = trunc(meta.screen, 20);

  const update: Prisma.AnalyticsVisitorUpdateInput = {
    lastSeen: new Date(),
    visitCount: { increment: 1 },
  };
  if (ip) update.lastIp = ip;
  if (ua) update.userAgent = ua;
  if (language) update.language = language;
  if (timezone) update.timezone = timezone;
  if (screen) update.screen = screen;

  await prisma.analyticsVisitor.upsert({
    where: { id },
    create: {
      id,
      visitCount: 1,
      lastIp: ip || null,
      userAgent: ua || null,
      language: language || null,
      timezone: timezone || null,
      screen: screen || null,
    },
    update,
  });
}

export async function POST(request: NextRequest) {
  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!data || typeof data !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const visitorId = trunc(data.visitor_id, 64);
  const sessionKey = trunc(data.session_key, 64);
  const type = trunc(data.type, 20);

  if (!UUID_V4.test(visitorId)) {
    return NextResponse.json({ ok: false, error: 'invalid visitor_id' }, { status: 400 });
  }
  if (!['pageview', 'time', 'event'].includes(type)) {
    return NextResponse.json({ ok: false, error: 'invalid type' }, { status: 400 });
  }

  const siteHost = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();

  try {
    if (type === 'pageview') {
      const path = trunc(data.path, 500);
      const title = trunc(data.title, 500);
      const referrer = trunc(data.referrer, 1000);
      const refDomain = trunc(data.referrer_domain, 200);
      const isMobile = Boolean(data.is_mobile);
      const utmSource = trunc(data.utm_source, 200);
      const utmMedium = trunc(data.utm_medium, 200);
      const utmCampaign = trunc(data.utm_campaign, 200);
      const utmContent = trunc(data.utm_content, 200);
      const utmTerm = trunc(data.utm_term, 200);

      if (isAdminPath(path)) return NextResponse.json({ ok: true });

      const refSrc = classifySource(referrer, refDomain, utmSource, utmMedium, siteHost);

      await upsertVisitor(visitorId, {
        ip: clientIp(request),
        ua: request.headers.get('user-agent') ?? '',
        language: trunc(data.language, 20),
        timezone: trunc(data.timezone, 64),
        screen: trunc(data.screen, 20),
      });

      await prisma.analyticsPageview.create({
        data: {
          visitorId,
          sessionKey: sessionKey || null,
          path,
          title: title || null,
          referrer: referrer || null,
          referrerDomain: refDomain || null,
          referrerSrc: refSrc,
          isMobile,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmContent: utmContent || null,
          utmTerm: utmTerm || null,
        },
      });
    } else if (type === 'time') {
      const path = trunc(data.path, 500);
      const seconds = Math.min(parseInt(String(data.seconds ?? 0), 10) || 0, 3600);

      if (seconds > 0) {
        const last = await prisma.analyticsPageview.findFirst({
          where: {
            sessionKey,
            path,
            visitorId,
            createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });
        if (last) {
          await prisma.analyticsPageview.update({
            where: { id: last.id },
            data: { timeOnPage: seconds },
          });
        }
      }
    } else if (type === 'event') {
      const eventType = trunc(data.event_type, 100);
      const eventLabel = trunc(data.event_label, 255);
      const path = trunc(data.path, 500);
      const eventData = (data.event_data ?? {}) as Prisma.InputJsonValue;

      if (eventType === '') return NextResponse.json({ ok: false });
      if (isAdminPath(path)) return NextResponse.json({ ok: true });

      await upsertVisitor(visitorId, {
        ip: clientIp(request),
        ua: request.headers.get('user-agent') ?? '',
      });

      await prisma.analyticsEvent.create({
        data: {
          visitorId,
          sessionKey: sessionKey || null,
          eventType,
          eventLabel: eventLabel || null,
          eventData,
          path: path || null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[analytics/track]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
