'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RiEyeLine, RiGroupLine, RiTimeLine, RiSmartphoneLine, RiRefreshLine } from 'react-icons/ri';
import styles from './analytics.module.css';

const API = '/api/admin/blog/analytics';
const ACCENT = 'rgb(77, 91, 252)';
const DAYS_OPTIONS = [7, 30, 90] as const;
type Days = (typeof DAYS_OPTIONS)[number];

type Overview = {
  total_views: number;
  unique_visitors: number;
  avg_time_sec: number;
  mobile_pct: number;
  chart: Array<{ day: string; views: number }>;
};
type TopPost = {
  slug: string;
  title: string | null;
  cover_image: string | null;
  views: number;
  visitors: number;
  avg_time: number | null;
  mobile_pct: number;
};
type CategoryRow = { category: string; views: number };
type SourceRow = { source: string; views: number };

type Data = {
  ok: boolean;
  overview: Overview;
  top_posts: TopPost[];
  categories: CategoryRow[];
  sources: SourceRow[];
};

function fmtTime(sec: number) {
  if (!sec) return '—';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR');
}

const SOURCE_LABEL: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  Direto: 'Direto',
};

function fmtDay(day: string, totalDays: Days) {
  const d = new Date(day + 'T00:00:00');
  if (totalDays <= 7) return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function BlogAnalytics() {
  const [days, setDays] = useState<Days>(30);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}?days=${days}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Erro');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const ov = data?.overview;
  const maxViews = data ? Math.max(...data.top_posts.map((p) => p.views), 1) : 1;
  const maxCat = data ? Math.max(...data.categories.map((c) => c.views), 1) : 1;

  return (
    <div className={styles.root}>
      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.periodGroup}>
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.periodBtn} ${days === d ? styles.periodBtnActive : ''}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
        <button type="button" className={styles.refreshBtn} onClick={load} disabled={loading}>
          <RiRefreshLine size={15} className={loading ? styles.spin : ''} />
        </button>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <KpiCard
          icon={<RiEyeLine size={18} />}
          label="Leituras"
          value={ov ? fmtNum(ov.total_views) : '—'}
          loading={loading}
        />
        <KpiCard
          icon={<RiGroupLine size={18} />}
          label="Visitantes únicos"
          value={ov ? fmtNum(ov.unique_visitors) : '—'}
          loading={loading}
        />
        <KpiCard
          icon={<RiTimeLine size={18} />}
          label="Tempo médio"
          value={ov ? fmtTime(ov.avg_time_sec) : '—'}
          loading={loading}
        />
        <KpiCard
          icon={<RiSmartphoneLine size={18} />}
          label="Mobile"
          value={ov ? `${ov.mobile_pct}%` : '—'}
          loading={loading}
        />
      </div>

      {/* chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Leituras por dia</h3>
        {loading ? (
          <div className={styles.chartSkeleton} />
        ) : ov && ov.chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ov.chart} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="blogGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="day"
                tickFormatter={(v) => fmtDay(v, days)}
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.4)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.4)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                formatter={(v) => [fmtNum(Number(v)), 'Leituras']}
                labelFormatter={(l) => fmtDay(l, days)}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#blogGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.empty}>Nenhum dado no período.</p>
        )}
      </div>

      <div className={styles.twoCol}>
        {/* top posts */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Artigos mais lidos</h3>
          {loading ? (
            <SkeletonRows />
          ) : data && data.top_posts.length > 0 ? (
            <div className={styles.postList}>
              {data.top_posts.map((post, i) => (
                <div key={post.slug} className={styles.postRow}>
                  <span className={styles.postRank}>{i + 1}</span>
                  {post.cover_image ? (
                    <div className={styles.postThumb}>
                      <Image src={post.cover_image} alt={post.title ?? post.slug} fill style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className={styles.postThumbPlaceholder} />
                  )}
                  <div className={styles.postInfo}>
                    <span className={styles.postTitle}>{post.title ?? `/${post.slug}`}</span>
                    <div className={styles.postMeta}>
                      <span>{fmtNum(post.views)} leituras</span>
                      <span className={styles.dot}>·</span>
                      <span>{fmtNum(post.visitors)} visitantes</span>
                      {post.avg_time != null && (
                        <>
                          <span className={styles.dot}>·</span>
                          <span>{fmtTime(post.avg_time)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.postBar}>
                    <div
                      className={styles.postBarFill}
                      style={{ width: `${Math.round((post.views / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Nenhum artigo com visitas.</p>
          )}
        </div>

        {/* right column: categories + sources */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Por categoria</h3>
            {loading ? (
              <SkeletonRows count={4} />
            ) : data && data.categories.length > 0 ? (
              <div className={styles.simpleList}>
                {data.categories.map((c) => (
                  <div key={c.category} className={styles.simpleRow}>
                    <div className={styles.simpleLeft}>
                      <span className={styles.simpleLabel}>{c.category}</span>
                      <div className={styles.simpleBar}>
                        <div
                          className={styles.simpleBarFill}
                          style={{ width: `${Math.round((c.views / maxCat) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className={styles.simpleValue}>{fmtNum(c.views)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Sem dados.</p>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Fontes de tráfego</h3>
            {loading ? (
              <SkeletonRows count={4} />
            ) : data && data.sources.length > 0 ? (
              <div className={styles.simpleList}>
                {data.sources.map((s) => {
                  const maxSrc = Math.max(...data.sources.map((x) => x.views), 1);
                  return (
                    <div key={s.source} className={styles.simpleRow}>
                      <div className={styles.simpleLeft}>
                        <span className={styles.simpleLabel}>
                          {SOURCE_LABEL[s.source] ?? s.source}
                        </span>
                        <div className={styles.simpleBar}>
                          <div
                            className={styles.simpleBarFill}
                            style={{ width: `${Math.round((s.views / maxSrc) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={styles.simpleValue}>{fmtNum(s.views)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.empty}>Sem dados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div>
        <p className={styles.kpiLabel}>{label}</p>
        {loading ? (
          <div className={styles.kpiSkeleton} />
        ) : (
          <p className={styles.kpiValue}>{value}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className={styles.skeletonRows}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  );
}
