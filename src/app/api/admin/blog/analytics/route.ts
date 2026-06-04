import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '30', 10) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [totalPv, avgTime, devices, chart, unique, topPosts, categories, sources] =
      await Promise.all([
        prisma.analyticsPageview.count({
          where: { createdAt: { gt: since }, path: { contains: '/blog/' } },
        }),

        prisma.analyticsPageview.aggregate({
          _avg: { timeOnPage: true },
          where: {
            createdAt: { gt: since },
            path: { contains: '/blog/' },
            timeOnPage: { gt: 0 },
          },
        }),

        prisma.analyticsPageview.groupBy({
          by: ['isMobile'],
          _count: { _all: true },
          where: { createdAt: { gt: since }, path: { contains: '/blog/' } },
        }),

        prisma.$queryRaw<Array<{ day: string; views: number }>>`
          SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS views
            FROM analytics_pageview
           WHERE created_at > ${since}
             AND path LIKE '%/blog/%'
           GROUP BY day ORDER BY day ASC`,

        prisma.$queryRaw<Array<{ n: number }>>`
          SELECT COUNT(DISTINCT visitor_id)::int AS n
            FROM analytics_pageview
           WHERE created_at > ${since}
             AND path LIKE '%/blog/%'`,

        // top posts: slug = last path segment, join com blog_posts para title/cover
        prisma.$queryRaw<Array<{
          slug: string;
          title: string | null;
          cover_image: string | null;
          views: number;
          visitors: number;
          avg_time: number | null;
          mobile_count: number;
        }>>`
          SELECT
            SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1) AS slug,
            bp.title,
            bp.cover_image,
            COUNT(*)::int                                        AS views,
            COUNT(DISTINCT p.visitor_id)::int                    AS visitors,
            AVG(CASE WHEN p.time_on_page > 0 THEN p.time_on_page END)::float AS avg_time,
            SUM(CASE WHEN p.is_mobile THEN 1 ELSE 0 END)::int   AS mobile_count
          FROM analytics_pageview p
          LEFT JOIN blog_posts bp
            ON bp.slug = SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1)
          WHERE p.created_at > ${since}
            AND p.path LIKE '%/blog/%'
            AND SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1) != 'blog'
          GROUP BY SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1), bp.title, bp.cover_image
          ORDER BY views DESC
          LIMIT 20`,

        // views por categoria
        prisma.$queryRaw<Array<{ category: string; views: number }>>`
          SELECT
            COALESCE(bp.category, 'Sem categoria') AS category,
            COUNT(*)::int AS views
          FROM analytics_pageview p
          LEFT JOIN blog_posts bp
            ON bp.slug = SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1)
          WHERE p.created_at > ${since}
            AND p.path LIKE '%/blog/%'
            AND SPLIT_PART(TRIM(TRAILING '/' FROM p.path), '/', -1) != 'blog'
          GROUP BY COALESCE(bp.category, 'Sem categoria')
          ORDER BY views DESC`,

        // fontes de tráfego
        prisma.$queryRaw<Array<{ source: string; views: number }>>`
          SELECT
            COALESCE(NULLIF(referrer_src, ''), 'Direto') AS source,
            COUNT(*)::int AS views
          FROM analytics_pageview
          WHERE created_at > ${since}
            AND path LIKE '%/blog/%'
          GROUP BY COALESCE(NULLIF(referrer_src, ''), 'Direto')
          ORDER BY views DESC
          LIMIT 10`,
      ]);

    let mobile = 0;
    let desktop = 0;
    for (const d of devices) {
      if (d.isMobile) mobile += d._count._all;
      else desktop += d._count._all;
    }

    return NextResponse.json({
      ok: true,
      overview: {
        total_views: totalPv,
        unique_visitors: Number(unique[0]?.n ?? 0),
        avg_time_sec: Math.round(avgTime._avg.timeOnPage ?? 0),
        mobile_pct: totalPv > 0 ? Math.round((mobile / totalPv) * 100) : 0,
        chart,
      },
      top_posts: topPosts.map((p) => ({
        ...p,
        views: Number(p.views),
        visitors: Number(p.visitors),
        avg_time: p.avg_time != null ? Math.round(Number(p.avg_time)) : null,
        mobile_pct:
          Number(p.views) > 0 ? Math.round((Number(p.mobile_count) / Number(p.views)) * 100) : 0,
      })),
      categories: categories.map((c) => ({ ...c, views: Number(c.views) })),
      sources: sources.map((s) => ({ ...s, views: Number(s.views) })),
    });
  } catch (err) {
    console.error('[blog/analytics]', err);
    return NextResponse.json({ ok: false, error: 'Erro interno.' }, { status: 500 });
  }
}
