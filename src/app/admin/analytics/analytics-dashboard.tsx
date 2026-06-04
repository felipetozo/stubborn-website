'use client';

/**
 * Painel de Analytics próprio — réplica do módulo do Metal Laran,
 * com o visual do Isoart. Consome /api/admin/analytics.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBarChartLine,
  RiCloseLine,
  RiComputerLine,
  RiCursorLine,
  RiEyeLine,
  RiFileList2Line,
  RiFileTextLine,
  RiFilterLine,
  RiGroupLine,
  RiHourglassLine,
  RiLoopLeftLine,
  RiRefreshLine,
  RiSignpostLine,
  RiSmartphoneLine,
  RiTimeLine,
  RiUserLine,
} from 'react-icons/ri';
import {
  BsBoxArrowInRight,
  BsEnvelope,
  BsEnvelopePaper,
  BsFacebook,
  BsGoogle,
  BsInstagram,
  BsLink45Deg,
  BsLinkedin,
  BsSearch,
  BsTwitterX,
  BsWhatsapp,
  BsYoutube,
  // Ficha "Informações do visitante"
  BsApple,
  BsWindows,
  BsAndroid2,
  BsUbuntu,
  BsBrowserChrome,
  BsBrowserFirefox,
  BsBrowserEdge,
  BsBrowserSafari,
  BsGlobe2,
  BsPhone,
  BsTablet,
  BsDisplay,
  BsLaptop,
  BsCpu,
  BsTranslate,
  BsClock,
  BsClockHistory,
  BsGeoAlt,
  BsHddNetwork,
  BsBuilding,
  BsPersonVcard,
  BsPersonCheck,
  BsPerson,
  BsHash,
  BsSignpost,
  BsAspectRatio,
  BsCalendarWeek,
  BsArrowRepeat,
} from 'react-icons/bs';
import type { IconType } from 'react-icons';
import s from './analytics.module.css';

const API = '/api/admin/analytics';
const PAGE_SIZE = 10;
const ACCENT = 'rgb(77, 91, 252)';

// ── Tipos ─────────────────────────────────────────────────────
type ChartRow = { day: string; visits: number | string };
type Overview = {
  ok: boolean;
  total_pageviews: number;
  unique_visitors: number;
  avg_time_sec: number;
  returning: number;
  mobile: number;
  desktop: number;
  chart: ChartRow[];
};
type ReferrerRow = {
  referrer_src: string;
  campaign: string | null;
  medium: string | null;
  visits: number | string;
  visitors: number | string;
};
type PageRow = {
  path: string;
  views: number | string;
  visitors: number | string;
  avg_time: number | string | null;
};
type EventRow = { event_type: string; event_label: string; total: number | string };
type VisitorRow = {
  id: string;
  visitor_num: number | string;
  display_name: string | null;
  lead_key: string | null;
  visit_count: number | string;
  first_seen: string;
  last_seen: string;
  pageviews: number | string;
  avg_time: number | string | null;
  last_path: string | null;
  device: string;
  first_referrer: string | null;
  first_campaign: string | null;
};
type VisitorInfo = {
  id: string;
  visitor_num: number | string;
  display_name: string | null;
  lead_key: string | null;
  visit_count: number | string;
  first_seen: string;
  last_seen: string;
  last_ip: string | null;
  user_agent: string | null;
  language: string | null;
  timezone: string | null;
  screen: string | null;
};
type Geo = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
} | null;
type DetailPv = {
  path: string;
  title: string;
  referrer: string;
  referrer_src: string;
  utm_campaign: string | null;
  time_on_page: number | null;
  is_mobile: number;
  created_at: string;
};
type DetailEv = {
  event_type: string;
  event_label: string;
  event_data: unknown;
  path: string;
  created_at: string;
};

// ── Utilitários ───────────────────────────────────────────────
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: unknown): string {
  return num(n).toLocaleString('pt-BR');
}

function fmtTime(sec: unknown): string {
  const s = parseInt(String(sec), 10);
  if (isNaN(s) || s <= 0) return '—';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}min${r > 0 ? ` ${r}s` : ''}`;
}

function parseDate(d: unknown): Date | null {
  if (!d) return null;
  const str = String(d).replace(' ', 'T');
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

function fmtDate(d: unknown): string {
  const date = parseDate(d);
  if (!date) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDay(day: string): string {
  // Datas "YYYY-MM-DD" são interpretadas como UTC pelo JS; forçamos
  // T00:00:00 para tratar no fuso local e evitar deslocar um dia.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T00:00:00` : String(day).replace(' ', 'T');
  const date = new Date(iso);
  if (isNaN(date.getTime())) return day;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ── Parser de user-agent → dispositivo / SO / navegador ───────
type UaPart = { Icon: IconType; label: string };
type UaInfo = { device: UaPart; os: UaPart; browser: UaPart };

function parseUa(ua: string | null): UaInfo {
  const s = ua || '';
  const low = s.toLowerCase();

  let device: UaPart = { Icon: BsDisplay, label: 'Computador' };
  let os: UaPart = { Icon: BsCpu, label: 'Desconhecido' };
  let browser: UaPart = { Icon: BsGlobe2, label: 'Desconhecido' };
  if (!s.trim()) return { device, os, browser };

  // Dispositivo
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(low)) {
    device = { Icon: BsTablet, label: 'Tablet' };
  } else if (/mobile|iphone|ipod|android.*mobile|webos|blackberry|iemobile|opera mini/i.test(low)) {
    device = { Icon: BsPhone, label: 'Smartphone' };
  }

  // Sistema operacional
  if (/iphone|ipod/i.test(low)) os = { Icon: BsApple, label: 'iOS' };
  else if (/ipad/i.test(low)) os = { Icon: BsApple, label: 'iPadOS' };
  else if (/mac os x|macintosh/i.test(low)) os = { Icon: BsApple, label: 'macOS' };
  else if (/android/i.test(low)) os = { Icon: BsAndroid2, label: 'Android' };
  else if (/windows nt|win64|win32|wow64/i.test(low)) os = { Icon: BsWindows, label: 'Windows' };
  else if (/cros /i.test(low)) os = { Icon: BsGlobe2, label: 'Chrome OS' };
  else if (/linux|ubuntu|fedora|x11/i.test(low)) os = { Icon: BsUbuntu, label: 'Linux' };

  // Navegador
  if (/edg/i.test(s)) browser = { Icon: BsBrowserEdge, label: 'Microsoft Edge' };
  else if (/opr\/|opios|opt\/|opera/i.test(low)) browser = { Icon: BsGlobe2, label: 'Opera' };
  else if (/firefox|fxios|librewolf/i.test(low)) browser = { Icon: BsBrowserFirefox, label: 'Firefox' };
  else if (/samsungbrowser/i.test(low)) browser = { Icon: BsBrowserChrome, label: 'Samsung Internet' };
  else if (/chrome|crios|chromium|crmo/i.test(low)) browser = { Icon: BsBrowserChrome, label: 'Chrome' };
  else if (/safari/i.test(low) && !/chrome|crios|chromium|android/i.test(low))
    browser = { Icon: BsBrowserSafari, label: 'Safari' };
  else if (/trident|msie/i.test(low)) browser = { Icon: BsBrowserEdge, label: 'Internet Explorer' };

  return { device, os, browser };
}

// Bandeira (emoji) a partir do código de país (ex.: 'BR')
function countryFlag(code: string | undefined): string {
  if (!code || code.length !== 2) return '';
  try {
    const up = code.toUpperCase();
    return String.fromCodePoint(
      up.charCodeAt(0) - 65 + 0x1f1e6,
      up.charCodeAt(1) - 65 + 0x1f1e6,
    );
  } catch {
    return '';
  }
}

// ── Classificação de origem ───────────────────────────────────
type SrcCls = 'direct' | 'google' | 'facebook' | 'instagram' | 'whatsapp' | 'linkedin' | 'internal' | 'other';
type SrcInfo = { label: string; Icon: IconType; cls: SrcCls };

const SRC_MAP: Record<string, SrcInfo> = {
  direct: { label: 'Direto', Icon: BsBoxArrowInRight, cls: 'direct' },
  google_search: { label: 'Google Search', Icon: BsGoogle, cls: 'google' },
  google_ads: { label: 'Google Ads', Icon: BsGoogle, cls: 'google' },
  google: { label: 'Google', Icon: BsGoogle, cls: 'google' },
  bing: { label: 'Bing', Icon: BsSearch, cls: 'other' },
  bing_ads: { label: 'Bing Ads', Icon: BsSearch, cls: 'other' },
  yahoo: { label: 'Yahoo', Icon: BsSearch, cls: 'other' },
  facebook: { label: 'Facebook', Icon: BsFacebook, cls: 'facebook' },
  facebook_ads: { label: 'Facebook Ads', Icon: BsFacebook, cls: 'facebook' },
  instagram: { label: 'Instagram', Icon: BsInstagram, cls: 'instagram' },
  instagram_ads: { label: 'Instagram Ads', Icon: BsInstagram, cls: 'instagram' },
  linkedin: { label: 'LinkedIn', Icon: BsLinkedin, cls: 'linkedin' },
  youtube: { label: 'YouTube', Icon: BsYoutube, cls: 'other' },
  youtube_ads: { label: 'YouTube Ads', Icon: BsYoutube, cls: 'other' },
  twitter: { label: 'Twitter / X', Icon: BsTwitterX, cls: 'other' },
  whatsapp: { label: 'WhatsApp', Icon: BsWhatsapp, cls: 'whatsapp' },
  email: { label: 'E-mail', Icon: BsEnvelope, cls: 'other' },
  newsletter: { label: 'Newsletter', Icon: BsEnvelopePaper, cls: 'other' },
};

function srcInfo(src: string | null): SrcInfo {
  const key = src || 'direct';
  if (SRC_MAP[key]) return SRC_MAP[key];
  return { label: key, Icon: BsLink45Deg, cls: 'other' };
}

const EVENT_LABELS: Record<string, string> = {
  nav_click: 'Nav',
  chatbot_open: 'Chatbot',
  form_submit: 'Formulário',
  whatsapp_click: 'WhatsApp',
  cta_click: 'CTA',
};
const EVENT_CLS: Record<string, string> = {
  nav_click: s.evNav,
  chatbot_open: s.evChatbot,
  form_submit: s.evForm,
  whatsapp_click: s.evWhats,
  cta_click: s.evCta,
};

function SrcLabel({ src, campaign }: { src: string | null; campaign?: string | null }) {
  const info = srcInfo(src);
  const isPaid = !!src && src.endsWith('_ads');
  const Icon = info.Icon;
  return (
    <>
      <Icon className={s.srcIcon} />
      <span className={s.srcName}>{info.label}</span>
      {isPaid ? (
        <span className={`${s.srcTypeTag} ${s.srcTypePaid}`}>Pago</span>
      ) : src === 'google_search' ? (
        <span className={`${s.srcTypeTag} ${s.srcTypeOrganic}`}>Orgânico</span>
      ) : null}
      {campaign ? (
        <span className={s.srcCampaign} title="Campanha">
          {campaign}
        </span>
      ) : null}
    </>
  );
}

function EventBadge({ type }: { type: string }) {
  return (
    <span className={`${s.eventBadge} ${EVENT_CLS[type] ?? s.evOther}`}>
      {EVENT_LABELS[type] ?? type}
    </span>
  );
}

// ── Empty / loading helpers ───────────────────────────────────
function Empty({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className={s.empty}>
      <Icon className={s.emptyIcon} />
      {children}
    </div>
  );
}

// ── Ficha "Informações do visitante" ──────────────────────────
function VInfoRow({ Icon, label, children }: { Icon: IconType; label: string; children: React.ReactNode }) {
  return (
    <div className={s.vinfoRow}>
      <span className={s.vinfoLabel}>
        <Icon /> {label}
      </span>
      <span className={s.vinfoValue}>{children}</span>
    </div>
  );
}

function UaChip({ part }: { part: UaPart }) {
  const Icon = part.Icon;
  return (
    <span className={s.vinfoChip}>
      <Icon /> {part.label}
    </span>
  );
}

function VisitorInfoPanel({
  visitor,
  geo,
  pageviews,
}: {
  visitor: VisitorInfo;
  geo: Geo;
  pageviews: DetailPv[];
}) {
  const ua = parseUa(visitor.user_agent);

  const locParts: string[] = [];
  if (geo) {
    if (geo.city) locParts.push(geo.city);
    if (geo.region && geo.region !== geo.city) locParts.push(geo.region);
    if (geo.country) locParts.push(geo.country);
  }
  const flag = geo?.countryCode ? countryFlag(geo.countryCode) : '';
  const locText = locParts.length ? `${locParts.join(', ')}${flag ? ` ${flag}` : ''}` : '—';

  // Origem inicial: primeira página (mais antiga) com referrer não-direto
  let firstSrc: string | null = null;
  for (let i = pageviews.length - 1; i >= 0; i--) {
    const rs = pageviews[i].referrer_src;
    if (rs && rs !== 'internal' && rs !== 'direct') {
      firstSrc = rs;
      break;
    }
  }

  return (
    <div className={s.vinfo}>
      <div className={s.vinfoSectionTitle}>
        <BsPersonVcard /> Identificação
      </div>
      <div className={s.vinfoGrid}>
        <VInfoRow Icon={BsPerson} label="Visitante">
          {visitor.display_name ? (
            <span className={`${s.visitorBadge} ${s.visitorBadgeNamed}`}>
              <BsPersonCheck /> {visitor.display_name}
            </span>
          ) : (
            <span className={s.visitorBadge}>
              <BsPerson /> Visitante {String(visitor.visitor_num)}
            </span>
          )}
        </VInfoRow>
        <VInfoRow Icon={BsHash} label="Nº">
          {String(visitor.visitor_num)}
        </VInfoRow>
        {visitor.lead_key ? (
          <VInfoRow Icon={BsLink45Deg} label="Lead (CRM)">
            <code className={s.vinfoCode}>{visitor.lead_key}</code>
          </VInfoRow>
        ) : null}
        <VInfoRow Icon={BsSignpost} label="Origem">
          <span className={`${s.refSourceCell} ${s.refSourceCompact}`}>
            <SrcLabel src={firstSrc ?? 'direct'} />
          </span>
        </VInfoRow>
      </div>

      <div className={s.vinfoSectionTitle}>
        <BsGeoAlt /> Localização &amp; rede
      </div>
      <div className={s.vinfoGrid}>
        <VInfoRow Icon={BsGeoAlt} label="Cidade / Região">
          {locText}
        </VInfoRow>
        <VInfoRow Icon={BsHddNetwork} label="IP">
          {visitor.last_ip ? <code className={s.vinfoCode}>{visitor.last_ip}</code> : '—'}
        </VInfoRow>
        {geo?.org ? (
          <VInfoRow Icon={BsBuilding} label="Provedor">
            {geo.org}
          </VInfoRow>
        ) : null}
      </div>

      <div className={s.vinfoSectionTitle}>
        <BsLaptop /> Dispositivo &amp; software
      </div>
      <div className={s.vinfoGrid}>
        <VInfoRow Icon={BsPhone} label="Dispositivo">
          <UaChip part={ua.device} />
        </VInfoRow>
        <VInfoRow Icon={BsCpu} label="Sistema">
          <UaChip part={ua.os} />
        </VInfoRow>
        <VInfoRow Icon={BsGlobe2} label="Navegador">
          <UaChip part={ua.browser} />
        </VInfoRow>
        <VInfoRow Icon={BsAspectRatio} label="Tela">
          {visitor.screen || '—'}
        </VInfoRow>
        <VInfoRow Icon={BsTranslate} label="Idioma">
          {visitor.language || '—'}
        </VInfoRow>
        <VInfoRow Icon={BsClock} label="Fuso horário">
          {visitor.timezone || '—'}
        </VInfoRow>
      </div>

      <div className={s.vinfoSectionTitle}>
        <BsCalendarWeek /> Atividade
      </div>
      <div className={s.vinfoGrid}>
        <VInfoRow Icon={BsArrowRepeat} label="Visitas">
          {fmt(visitor.visit_count)}
        </VInfoRow>
        <VInfoRow Icon={BsBoxArrowInRight} label="Primeira">
          {fmtDate(visitor.first_seen)}
        </VInfoRow>
        <VInfoRow Icon={BsClockHistory} label="Última">
          {fmtDate(visitor.last_seen)}
        </VInfoRow>
      </div>

      {visitor.user_agent ? (
        <div className={s.vinfoUa} title="User-Agent completo">
          {visitor.user_agent}
        </div>
      ) : null}
    </div>
  );
}

function Pagination({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className={s.pagination}>
      <button className={s.pgBtn} disabled={page === 0} onClick={onPrev} aria-label="Anterior">
        <RiArrowLeftSLine />
      </button>
      <span className={s.pgInfo}>
        {page + 1} / {totalPages}
      </span>
      <button
        className={s.pgBtn}
        disabled={page >= totalPages - 1}
        onClick={onNext}
        aria-label="Próxima"
      >
        <RiArrowRightSLine />
      </button>
    </div>
  );
}

// ── Tooltip do gráfico ────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { label: string } }> }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className={s.tooltip}>
      <span className={s.tooltipLabel}>{payload[0].payload.label}</span>
      <span className={s.tooltipValue}>
        {v} visita{v !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [refreshedAt, setRefreshedAt] = useState('');
  const [spinning, setSpinning] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [referrers, setReferrers] = useState<ReferrerRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);

  const [pgRef, setPgRef] = useState(0);
  const [pgPages, setPgPages] = useState(0);
  const [pgEvents, setPgEvents] = useState(0);
  const [pgVis, setPgVis] = useState(0);

  // Modal
  const [modalVid, setModalVid] = useState<string | null>(null);
  const [modalVnum, setModalVnum] = useState<string>('');
  const [modalTab, setModalTab] = useState<'info' | 'timeline' | 'pages' | 'events'>('info');
  const [modalPvs, setModalPvs] = useState<DetailPv[]>([]);
  const [modalEvs, setModalEvs] = useState<DetailEv[]>([]);
  const [modalVisitor, setModalVisitor] = useState<VisitorInfo | null>(null);
  const [modalGeo, setModalGeo] = useState<Geo>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const apiFetch = useCallback(async (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    );
    const res = await fetch(`${API}?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [ov, rf, pg, ev, vi] = await Promise.all([
        apiFetch({ section: 'overview', days }),
        apiFetch({ section: 'referrers', days }),
        apiFetch({ section: 'pages', days }),
        apiFetch({ section: 'events', days }),
        apiFetch({ section: 'visitors', days }),
      ]);
      if (ov?.ok) setOverview(ov);
      if (rf?.ok) {
        setReferrers((rf.rows as ReferrerRow[]).filter((r) => r.referrer_src !== 'internal'));
        setPgRef(0);
      }
      if (pg?.ok) {
        setPages(pg.rows as PageRow[]);
        setPgPages(0);
      }
      if (ev?.ok) {
        setEvents(ev.rows as EventRow[]);
        setPgEvents(0);
      }
      if (vi?.ok) {
        setVisitors(vi.rows as VisitorRow[]);
        setPgVis(0);
      }
    } catch (e) {
      console.error('[analytics] load', e);
    }
  }, [apiFetch, days]);

  useEffect(() => {
    loadAll();
    const now = new Date();
    setRefreshedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, [loadAll]);

  // Fecha a drawer com Esc
  useEffect(() => {
    if (!modalVid) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalVid(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalVid]);

  const handleRefresh = () => {
    setSpinning(true);
    loadAll().finally(() => {
      setTimeout(() => {
        setSpinning(false);
        const now = new Date();
        setRefreshedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      }, 500);
    });
  };

  const openVisitor = async (vid: string, vnum: string) => {
    setModalVid(vid);
    setModalVnum(vnum);
    setModalTab('info');
    setModalPvs([]);
    setModalEvs([]);
    setModalVisitor(null);
    setModalGeo(null);
    setModalLoading(true);
    try {
      const data = await apiFetch({ section: 'visitor_detail', visitor_id: vid });
      if (data?.ok) {
        setModalPvs((data.pageviews as DetailPv[]) || []);
        setModalEvs((data.events as DetailEv[]) || []);
        setModalVisitor((data.visitor as VisitorInfo) || null);
        setModalGeo((data.geo as Geo) ?? null);
      }
    } catch (e) {
      console.error('[analytics] visitor detail', e);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Dados derivados ─────────────────────────────────────────
  const chartData = (overview?.chart ?? []).map((r) => ({ label: fmtDay(r.day), visits: num(r.visits) }));
  const totalDevices = overview ? overview.mobile + overview.desktop || 1 : 1;
  const mobilePct = overview ? Math.round((overview.mobile / totalDevices) * 100) : 0;

  const maxRefVisits = Math.max(1, ...referrers.map((r) => num(r.visits)));
  const maxPageViews = pages.length ? num(pages[0].views) : 1;

  const visRef = referrers.slice(pgRef * PAGE_SIZE, pgRef * PAGE_SIZE + PAGE_SIZE);
  const visPages = pages.slice(pgPages * PAGE_SIZE, pgPages * PAGE_SIZE + PAGE_SIZE);
  const visEvents = events.slice(pgEvents * PAGE_SIZE, pgEvents * PAGE_SIZE + PAGE_SIZE);
  const visVisitors = visitors.slice(pgVis * PAGE_SIZE, pgVis * PAGE_SIZE + PAGE_SIZE);

  const loading = overview === null;

  // Timeline combinada (modal)
  const timeline = [
    ...modalPvs.map((p) => ({ at: parseDate(p.created_at)?.getTime() ?? 0, type: 'pv' as const, data: p })),
    ...modalEvs.map((e) => ({ at: parseDate(e.created_at)?.getTime() ?? 0, type: 'ev' as const, data: e })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 50);

  const card = (
    icon: React.ReactNode,
    value: React.ReactNode,
    label: string,
    sub: React.ReactNode,
  ) => (
    <div className={s.card}>
      <div className={s.cardIcon}>{icon}</div>
      <div className={`${s.cardValue}${loading ? ` ${s.cardValueLoading}` : ''}`}>{loading ? '—' : value}</div>
      <div className={s.cardLabel}>{label}</div>
      <div className={s.cardSub}>{sub}</div>
    </div>
  );

  return (
    <>
      {/* ── Cabeçalho (full-width, estilo Isoart) + período ── */}
      <div className={s.headerBar}>
        <div className={s.headerLeft}>
          <div>
            <h1 className={s.title}>Analytics</h1>
            <p className={s.subtitle}>Visitas, origens e comportamento dos visitantes</p>
          </div>
          {refreshedAt && <span className={s.refreshStatus}>Atualizado às {refreshedAt}</span>}
        </div>
        <div className={s.headerRight}>
          <button className={s.refreshBtn} onClick={handleRefresh} title="Atualizar agora">
            <RiRefreshLine className={spinning ? s.spinning : undefined} />
          </button>
          <div className={s.period} role="group" aria-label="Período">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                className={`${s.periodBtn}${days === d ? ` ${s.periodBtnActive}` : ''}`}
                onClick={() => setDays(d)}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.content}>
      {/* ── Cards ── */}
      <div className={s.cards}>
        {card(<RiEyeLine />, fmt(overview?.total_pageviews), 'Visitas', 'Page views no período')}
        {card(<RiGroupLine />, fmt(overview?.unique_visitors), 'Visitantes únicos', 'IDs únicos no período')}
        {card(<RiTimeLine />, fmtTime(overview?.avg_time_sec), 'Tempo médio', 'Permanência por visita')}
        {card(<RiLoopLeftLine />, fmt(overview?.returning), 'Visitantes que voltaram', 'Retornaram ao site')}
        {card(
          <RiSmartphoneLine />,
          `${mobilePct}%`,
          'Mobile',
          overview ? `${overview.mobile} mobile / ${overview.desktop} desktop` : 'vs. desktop',
        )}
      </div>

      {/* ── Gráfico ── */}
      <div className={`${s.panel} ${s.panelChart}`}>
        <div className={s.panelHeader}>
          <span className={s.panelTitle}>
            <RiBarChartLine /> Visitas por dia
          </span>
        </div>
        <div className={s.chartWrap}>
          {chartData.length === 0 ? (
            <Empty icon={RiBarChartLine}>Sem dados ainda</Empty>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(221,219,225,0.08)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(221,219,225,0.4)', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  tick={{ fill: 'rgba(221,219,225,0.4)', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(77, 91, 252,0.2)' }} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#visitsGrad)"
                  dot={{ r: 2.5, fill: ACCENT }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Referências + Páginas + Ações ── */}
      <div className={s.row3}>
        {/* Referências */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>
              <RiSignpostLine /> Referências
            </span>
          </div>
          <div className={s.panelBody}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Origem</th>
                  <th className={s.numCell}>Visitas</th>
                  <th className={s.numCell}>Únicos</th>
                </tr>
              </thead>
              <tbody>
                {visRef.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <Empty icon={RiFilterLine}>Sem dados ainda</Empty>
                    </td>
                  </tr>
                ) : (
                  visRef.map((r, i) => {
                    const pct = Math.round((num(r.visits) / maxRefVisits) * 90);
                    return (
                      <tr key={`${r.referrer_src}-${r.campaign}-${i}`}>
                        <td>
                          <span className={s.refSourceCell}>
                            <SrcLabel src={r.referrer_src} campaign={r.campaign} />
                          </span>
                        </td>
                        <td className={s.numCell}>
                          <span className={s.bar} style={{ width: `${Math.max(pct, 4)}px` }} />
                          {fmt(r.visits)}
                        </td>
                        <td className={`${s.numCell} ${s.numMuted}`}>{fmt(r.visitors)} únicos</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pgRef}
            total={referrers.length}
            onPrev={() => setPgRef((p) => Math.max(0, p - 1))}
            onNext={() => setPgRef((p) => p + 1)}
          />
        </div>

        {/* Top páginas */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>
              <RiFileTextLine /> Top páginas
            </span>
          </div>
          <div className={s.panelBody}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Página</th>
                  <th className={s.numCell}>Views</th>
                  <th className={s.numCell}>Visitantes</th>
                  <th className={s.numCell}>Tempo médio</th>
                </tr>
              </thead>
              <tbody>
                {visPages.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <Empty icon={RiFileTextLine}>Sem dados ainda</Empty>
                    </td>
                  </tr>
                ) : (
                  visPages.map((r, i) => {
                    const pct = Math.round((num(r.views) / maxPageViews) * 80);
                    return (
                      <tr key={`${r.path}-${i}`}>
                        <td className={s.pathCell} title={r.path}>
                          <span className={s.bar} style={{ width: `${Math.max(pct, 4)}px` }} />
                          {r.path || '/'}
                        </td>
                        <td className={s.numCell}>{fmt(r.views)}</td>
                        <td className={s.numCell}>{fmt(r.visitors)}</td>
                        <td className={s.numCell}>{fmtTime(r.avg_time)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pgPages}
            total={pages.length}
            onPrev={() => setPgPages((p) => Math.max(0, p - 1))}
            onNext={() => setPgPages((p) => p + 1)}
          />
        </div>

        {/* Ações dos visitantes */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>
              <RiCursorLine /> Ações dos visitantes
            </span>
          </div>
          <div className={s.panelBody}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Ação</th>
                  <th className={s.numCell}>Total</th>
                </tr>
              </thead>
              <tbody>
                {visEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <Empty icon={RiCursorLine}>Sem interações ainda</Empty>
                    </td>
                  </tr>
                ) : (
                  visEvents.map((r, i) => (
                    <tr key={`${r.event_type}-${r.event_label}-${i}`}>
                      <td>
                        <EventBadge type={r.event_type} />
                      </td>
                      <td className={s.labelCell} title={r.event_label}>
                        {r.event_label}
                      </td>
                      <td className={s.numCell}>{fmt(r.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pgEvents}
            total={events.length}
            onPrev={() => setPgEvents((p) => Math.max(0, p - 1))}
            onNext={() => setPgEvents((p) => p + 1)}
          />
        </div>
      </div>

      {/* ── Visitantes individuais ── */}
      <div className={s.panel}>
        <div className={s.panelHeader}>
          <span className={s.panelTitle}>
            <RiUserLine /> Visitantes individuais
          </span>
          <span className={s.panelHint}>Clique para ver detalhes</span>
        </div>
        <div className={s.panelBody}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Origem</th>
                <th className={s.numCell}>Sessões</th>
                <th className={s.numCell}>Páginas</th>
                <th className={s.numCell}>Tempo médio</th>
                <th>Dispositivo</th>
                <th>Última visita</th>
                <th>Última página</th>
              </tr>
            </thead>
            <tbody>
              {visVisitors.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <Empty icon={RiUserLine}>Sem visitantes ainda</Empty>
                  </td>
                </tr>
              ) : (
                visVisitors.map((r) => {
                  const isMobile = r.device === 'mobile';
                  return (
                    <tr
                      key={r.id}
                      className={s.visitorRow}
                      onClick={() => openVisitor(r.id, String(r.visitor_num))}
                    >
                      <td>
                        {r.display_name ? (
                          <span className={s.visitorIdCell}>
                            <span
                              className={`${s.visitorBadge} ${s.visitorBadgeNamed}`}
                              title="Lead identificado pelo formulário"
                            >
                              <BsPersonCheck /> {r.display_name}
                            </span>
                            <span className={s.visitorNumSub}>Visitante {String(r.visitor_num)}</span>
                          </span>
                        ) : (
                          <span className={s.visitorBadge}>
                            <RiUserLine /> Visitante {String(r.visitor_num)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`${s.refSourceCell} ${s.refSourceCompact}`}>
                          <SrcLabel src={r.first_referrer} campaign={r.first_campaign} />
                        </span>
                      </td>
                      <td className={s.numCell}>{fmt(r.visit_count)}</td>
                      <td className={s.numCell}>{fmt(r.pageviews)}</td>
                      <td className={s.numCell}>{fmtTime(r.avg_time)}</td>
                      <td>
                        <span className={`${s.deviceBadge} ${isMobile ? s.deviceMobile : s.deviceDesktop}`}>
                          {isMobile ? <RiSmartphoneLine /> : <RiComputerLine />}
                          {isMobile ? ' Mobile' : ' Desktop'}
                        </span>
                      </td>
                      <td className={s.dateCell}>{fmtDate(r.last_seen)}</td>
                      <td className={s.pathCell} title={r.last_path ?? ''}>
                        {r.last_path || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pgVis}
          total={visitors.length}
          onPrev={() => setPgVis((p) => Math.max(0, p - 1))}
          onNext={() => setPgVis((p) => p + 1)}
        />
      </div>
      </div>{/* /content */}

      {/* ── Drawer lateral: ficha do visitante ── */}
      <div
        className={`${s.drawerOverlay}${modalVid ? ` ${s.drawerOverlayVisible}` : ''}`}
        onClick={() => setModalVid(null)}
        aria-hidden={!modalVid}
      />
      <aside
        className={`${s.drawer}${modalVid ? ` ${s.drawerOpen}` : ''}`}
        aria-label="Ficha do visitante"
        aria-hidden={!modalVid}
      >
        <div className={s.drawerHead}>
          <div className={s.drawerHeadLeft}>
            <span className={s.drawerTitle}>
              {modalVisitor?.display_name || `Visitante ${modalVnum}`}
            </span>
            <span className={s.drawerSub}>
              {modalVisitor?.display_name
                ? `Visitante ${modalVnum} · ficha do visitante`
                : 'Ficha do visitante'}
            </span>
          </div>
          <button className={s.modalClose} onClick={() => setModalVid(null)} aria-label="Fechar">
            <RiCloseLine />
          </button>
        </div>
            <div className={s.drawerBody}>
              <div className={s.modalTabs}>
                {(['info', 'timeline', 'pages', 'events'] as const).map((t) => (
                  <button
                    key={t}
                    className={`${s.modalTabBtn}${modalTab === t ? ` ${s.modalTabBtnActive}` : ''}`}
                    onClick={() => setModalTab(t)}
                  >
                    {t === 'info'
                      ? 'Informações do visitante'
                      : t === 'timeline'
                        ? 'Linha do tempo'
                        : t === 'pages'
                          ? 'Páginas'
                          : 'Ações'}
                  </button>
                ))}
              </div>

              {/* Informações do visitante */}
              {modalTab === 'info' && (
                <div>
                  {modalLoading ? (
                    <Empty icon={RiHourglassLine}>Carregando…</Empty>
                  ) : !modalVisitor ? (
                    <Empty icon={RiUserLine}>Sem informações</Empty>
                  ) : (
                    <VisitorInfoPanel visitor={modalVisitor} geo={modalGeo} pageviews={modalPvs} />
                  )}
                </div>
              )}

              {/* Timeline */}
              {modalTab === 'timeline' && (
                <div>
                  {modalLoading ? (
                    <Empty icon={RiHourglassLine}>Carregando…</Empty>
                  ) : timeline.length === 0 ? (
                    <Empty icon={RiHourglassLine}>Nenhuma atividade</Empty>
                  ) : (
                    <ul className={s.timeline}>
                      {timeline.map((item, i) => {
                        if (item.type === 'pv') {
                          const p = item.data;
                          const showSrc =
                            p.referrer_src && p.referrer_src !== 'internal' && p.referrer_src !== 'direct';
                          return (
                            <li key={`pv-${i}`} className={s.timelineItem}>
                              <div className={`${s.timelineDot} ${s.timelineDotPv}`}>
                                <RiFileTextLine />
                              </div>
                              <div className={s.timelineContent}>
                                <div className={s.tlMain}>{p.path || '/'}</div>
                                <div className={s.tlMeta}>
                                  {fmtDate(p.created_at)}
                                  {p.time_on_page ? ` · ${fmtTime(p.time_on_page)}` : ''}
                                  {showSrc ? (
                                    <>
                                      {' · via '}
                                      <SrcLabel src={p.referrer_src} campaign={p.utm_campaign} />
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </li>
                          );
                        }
                        const e = item.data;
                        return (
                          <li key={`ev-${i}`} className={s.timelineItem}>
                            <div className={`${s.timelineDot} ${s.timelineDotEv}`}>
                              <RiCursorLine />
                            </div>
                            <div className={s.timelineContent}>
                              <div className={s.tlMain}>
                                <EventBadge type={e.event_type} /> {e.event_label}
                              </div>
                              <div className={s.tlMeta}>
                                {fmtDate(e.created_at)} · {e.path || ''}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* Páginas */}
              {modalTab === 'pages' && (
                <div>
                  {modalPvs.length === 0 ? (
                    <Empty icon={RiFileList2Line}>Nenhuma página</Empty>
                  ) : (
                    <table className={s.table}>
                      <thead>
                        <tr>
                          <th>Página</th>
                          <th>Origem</th>
                          <th>Tempo</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalPvs.map((p, i) => {
                          const src = p.referrer_src && p.referrer_src !== 'internal' ? p.referrer_src : 'direct';
                          return (
                            <tr key={`mp-${i}`}>
                              <td className={s.pathCell} title={p.path}>
                                {p.path || '/'}
                              </td>
                              <td>
                                <span className={`${s.refSourceCell} ${s.refSourceCompact}`}>
                                  <SrcLabel src={src} campaign={p.utm_campaign} />
                                </span>
                              </td>
                              <td className={s.numCell}>{fmtTime(p.time_on_page)}</td>
                              <td className={s.dateCell}>{fmtDate(p.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Ações */}
              {modalTab === 'events' && (
                <div>
                  {modalEvs.length === 0 ? (
                    <Empty icon={RiCursorLine}>Nenhuma ação registrada</Empty>
                  ) : (
                    <table className={s.table}>
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Ação</th>
                          <th>Página</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalEvs.map((e, i) => (
                          <tr key={`me-${i}`}>
                            <td>
                              <EventBadge type={e.event_type} />
                            </td>
                            <td className={s.labelCell} title={e.event_label}>
                              {e.event_label}
                            </td>
                            <td className={s.pathCell} title={e.path}>
                              {e.path || ''}
                            </td>
                            <td className={s.dateCell}>{fmtDate(e.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
      </aside>
    </>
  );
}
