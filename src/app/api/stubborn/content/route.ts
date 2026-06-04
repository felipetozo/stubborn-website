import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createPost } from '@/actions/blogActions';
import { isAuthorized } from '@/lib/stubbornConnect';

export const dynamic = 'force-dynamic';

type ContentPayload = {
  type?: string;
  content?: string;
  metadata?: Record<string, unknown> | null;
  published_at?: string | null;
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: ContentPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { type, content, metadata, published_at } = body;
  if (!type || !content) {
    return NextResponse.json(
      { ok: false, error: 'missing_fields', detail: 'type e content são obrigatórios' },
      { status: 400 },
    );
  }

  const publishedAt = published_at ? new Date(published_at) : null;
  const meta = (metadata ?? {}) as Record<string, unknown>;
  let blogPostId: string | null = null;

  // blog_post → cria rascunho no blog institucional para revisão no admin.
  if (type === 'blog_post') {
    const title = asString(meta.title) ?? content.slice(0, 80);
    try {
      const post = await createPost({
        title,
        // slug único: usa o do metadata ou deriva do título + sufixo curto p/ evitar colisão.
        slug: asString(meta.slug) ?? `${slugify(title)}-${Date.now().toString(36)}`,
        excerpt: asString(meta.excerpt),
        content,
        category: asString(meta.category),
        coverImage: asString(meta.cover_image) ?? asString(meta.coverImage),
        coverAlt: asString(meta.cover_alt) ?? asString(meta.coverAlt),
        authorName: asString(meta.author_name) ?? 'Equipe',
        authorTitle: asString(meta.author_title),
        metaTitle: asString(meta.meta_title),
        metaDescription: asString(meta.meta_description),
        status: 'rascunho',
        publishedAt: null,
      });
      blogPostId = post.id;
    } catch (err) {
      // Não falha a integração se o blog recusar — registra mesmo assim.
      console.error('[stubborn-connect] falha ao criar rascunho de blog:', err);
    }
  }

  try {
    await prisma.stubbornContentLog.create({
      data: {
        type,
        content,
        metadata: (metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        publishedAt,
        blogPostId,
        action: 'saved',
      },
    });
  } catch (err) {
    console.error('[stubborn-connect] falha ao registrar conteúdo:', err);
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action: 'saved' });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}
