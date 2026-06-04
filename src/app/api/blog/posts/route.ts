import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/actions/blogActions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '3', 10) || 3));
  const category = searchParams.get('category') ?? undefined;

  try {
    const posts = await getPublishedPosts(category);
    return NextResponse.json({ ok: true, posts: posts.slice(0, limit) });
  } catch {
    return NextResponse.json({ ok: false, posts: [] }, { status: 500 });
  }
}
