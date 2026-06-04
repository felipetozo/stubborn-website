import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized, STUBBORN_CLIENT } from '@/lib/stubbornConnect';

export const dynamic = 'force-dynamic';

const SERVICOS = [
  'Desenvolvimento web',
  'Gestão de redes sociais',
  'SEO',
  'Identidade visual',
];

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Cases recentes alimentados pelo blog institucional publicado.
  let postsRecentes: Array<{
    titulo: string;
    slug: string;
    categoria: string | null;
    excerpt: string | null;
    publicado_em: string | null;
  }> = [];

  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'publicado' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: {
        title: true,
        slug: true,
        category: true,
        excerpt: true,
        publishedAt: true,
      },
    });
    postsRecentes = posts.map((p) => ({
      titulo: p.title,
      slug: p.slug,
      categoria: p.category,
      excerpt: p.excerpt,
      publicado_em: p.publishedAt?.toISOString() ?? null,
    }));
  } catch {
    postsRecentes = [];
  }

  return NextResponse.json({
    client: STUBBORN_CLIENT,
    updated_at: new Date().toISOString(),
    data: {
      servicos: SERVICOS,
      posts_recentes: postsRecentes,
    },
  });
}
