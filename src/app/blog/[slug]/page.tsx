export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getRelatedPosts } from '@/actions/blogActions';
import TableOfContents from './TableOfContents';
import styles from './page.module.css';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(date)
  );
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
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(slug, post.category, 3);
  const contentWithIds = injectHeadingIds(post.content);

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrap}>
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Início</Link>
          <span className={styles.breadcrumbSep} aria-hidden>/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSep} aria-hidden>/</span>
          <span className={styles.breadcrumbCurrent}>{post.title}</span>
        </div>
      </div>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {post.category && <span className={styles.categoryTag}>{post.category}</span>}
          <h1 className={styles.title}>{post.title}</h1>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

          <div className={styles.heroMeta}>
            {post.authorImage ? (
              <Image
                src={post.authorImage}
                alt={post.authorName}
                width={44}
                height={44}
                className={styles.authorAvatar}
              />
            ) : (
              <span className={styles.authorAvatarFallback}>{post.authorName.charAt(0)}</span>
            )}
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{post.authorName}</span>
              {post.authorTitle && <span className={styles.authorTitle}>{post.authorTitle}</span>}
            </div>
            <div className={styles.heroMetaDivider} />
            <time className={styles.metaDate} dateTime={post.publishedAt?.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            {post.readTimeMinutes && (
              <>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaRead}>{post.readTimeMinutes} min de leitura</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Cover */}
      {post.coverImage && (
        <div className={styles.coverWrap}>
          <div className={styles.coverImg}>
            <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
          </div>
        </div>
      )}

      {/* Body layout */}
      <div className={styles.layout}>
        <div className={styles.aside}>
          <div className={styles.stickyAside}>
            <TableOfContents contentHtml={contentWithIds} />
          </div>
        </div>

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />
      </div>

      {/* Related posts */}
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
