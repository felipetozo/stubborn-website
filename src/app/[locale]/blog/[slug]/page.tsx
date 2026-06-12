export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { getPostBySlug, getRelatedPosts } from '@/actions/blogActions';
import TableOfContents from '../../../blog/[slug]/TableOfContents';
import styles from '../../../blog/[slug]/page.module.css';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const siteUrl = 'https://stubborn.com.br';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `${siteUrl}/blog/${slug}`;
  const image = post.coverImage ?? `${siteUrl}/img/stubborn-logotipo.png`;
  const ogLocale = locale === 'pt-BR' ? 'pt_BR' : locale === 'en-GB' ? 'en_GB' : 'es_ES';

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
      siteName: 'Stubborn',
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [image],
    },
  };
}

function formatDate(date: Date | null, locale: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
}

function injectHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<h([2-4])([^>]*)>(.*?)<\/h[2-4]>/gi, (_, level, attrs, inner) => {
    if (/id="/i.test(attrs)) return _;
    const text = inner.replace(/<[^>]+>/g, '');
    const id =
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-') || `heading-${++counter}`;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(slug, post.category, 3);
  const contentWithIds = injectHeadingIds(post.content);

  const postUrl = `${siteUrl}/blog/${slug}`;
  const image = post.coverImage ?? `${siteUrl}/img/stubborn-logotipo.png`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    url: postUrl,
    datePublished: post.publishedAt?.toISOString(),
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Stubborn',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/img/stubborn-logotipo.png` },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className={styles.breadcrumbWrap}>
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Início</Link>
          <span className={styles.breadcrumbSep} aria-hidden>/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSep} aria-hidden>/</span>
          <span className={styles.breadcrumbCurrent}>{post.title}</span>
        </div>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {post.category && <span className={styles.categoryTag}>{post.category}</span>}
          <h1 className={styles.title}>{post.title}</h1>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
          <div className={styles.heroMeta}>
            {post.authorImage ? (
              <Image src={post.authorImage} alt={post.authorName} width={44} height={44} className={styles.authorAvatar} />
            ) : (
              <span className={styles.authorAvatarFallback}>{post.authorName.charAt(0)}</span>
            )}
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{post.authorName}</span>
              {post.authorTitle && <span className={styles.authorTitle}>{post.authorTitle}</span>}
            </div>
            <div className={styles.heroMetaDivider} />
            <time className={styles.metaDate} dateTime={post.publishedAt?.toISOString()}>
              {formatDate(post.publishedAt, locale)}
            </time>
            {post.readTimeMinutes && (
              <>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaRead}>{t('minRead', { minutes: post.readTimeMinutes })}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className={styles.coverWrap}>
          <div className={styles.coverImg}>
            <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.aside}>
          <div className={styles.stickyAside}>
            <TableOfContents contentHtml={contentWithIds} />
          </div>
        </div>
        <article className={styles.article} dangerouslySetInnerHTML={{ __html: contentWithIds }} />
      </div>

      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedTitle}>Leitura recomendada</h2>
            <div className={styles.relatedGrid}>
              {related.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className={styles.relatedCard}>
                  {rel.coverImage ? (
                    <div className={styles.relatedImg}>
                      <Image src={rel.coverImage} alt={rel.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className={styles.relatedImgPlaceholder} />
                  )}
                  <div className={styles.relatedBody}>
                    {rel.category && <span className={styles.categoryTagSm}>{rel.category}</span>}
                    <h3 className={styles.relatedCardTitle}>{rel.title}</h3>
                    {rel.excerpt && <p className={styles.relatedExcerpt}>{rel.excerpt}</p>}
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedAuthor}>{rel.authorName}</span>
                      {rel.readTimeMinutes && (
                        <>
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.metaRead}>{rel.readTimeMinutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
