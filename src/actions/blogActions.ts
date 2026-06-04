'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export type BlogPostStatus = 'publicado' | 'rascunho' | 'agendado';

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  coverAlt?: string;
  readTimeMinutes?: number;
  authorName: string;
  authorTitle?: string;
  authorImage?: string;
  destaque?: boolean;
  status?: BlogPostStatus;
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
};

export async function getPublishedPosts(category?: string) {
  return prisma.blogPost.findMany({
    where: {
      status: 'publicado',
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      coverImage: true,
      coverAlt: true,
      readTimeMinutes: true,
      authorName: true,
      authorTitle: true,
      authorImage: true,
      destaque: true,
      publishedAt: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getAllPostsAdmin() {
  return prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      coverImage: true,
      destaque: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createPost(data: BlogPostInput) {
  const slug = data.slug?.trim() || generateSlug(data.title);
  const isPublished = data.status === 'publicado';

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags ?? [],
      coverImage: data.coverImage,
      coverAlt: data.coverAlt,
      readTimeMinutes: data.readTimeMinutes,
      authorName: data.authorName,
      authorTitle: data.authorTitle,
      authorImage: data.authorImage,
      destaque: data.destaque ?? false,
      status: data.status ?? 'rascunho',
      published: isPublished,
      publishedAt: data.publishedAt ?? (isPublished ? new Date() : null),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  return post;
}

export async function updatePost(id: string, data: Partial<BlogPostInput>) {
  const existing = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
  const wasPublished = existing.status === 'publicado';
  const nowPublished = (data.status ?? existing.status) === 'publicado';

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.coverAlt !== undefined && { coverAlt: data.coverAlt }),
      ...(data.readTimeMinutes !== undefined && { readTimeMinutes: data.readTimeMinutes }),
      ...(data.authorName !== undefined && { authorName: data.authorName }),
      ...(data.authorTitle !== undefined && { authorTitle: data.authorTitle }),
      ...(data.authorImage !== undefined && { authorImage: data.authorImage }),
      ...(data.destaque !== undefined && { destaque: data.destaque }),
      ...(data.status !== undefined && { status: data.status, published: nowPublished }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      publishedAt:
        data.publishedAt !== undefined
          ? data.publishedAt
          : !wasPublished && nowPublished
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/admin/blog');
  return post;
}

export async function deletePost(id: string) {
  const post = await prisma.blogPost.delete({ where: { id } });
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  return post;
}

export async function getRelatedPosts(currentSlug: string, category?: string | null, limit = 3) {
  return prisma.blogPost.findMany({
    where: {
      status: 'publicado',
      slug: { not: currentSlug },
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      coverImage: true,
      coverAlt: true,
      readTimeMinutes: true,
      authorName: true,
      publishedAt: true,
    },
  });
}

export async function getBlogCategories() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'publicado', category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });
  return posts.map((p) => p.category).filter(Boolean) as string[];
}

export async function getBlogCategoriesAdmin() {
  const posts = await prisma.blogPost.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });
  return posts.map((p) => p.category).filter(Boolean) as string[];
}
