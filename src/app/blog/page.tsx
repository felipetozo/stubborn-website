export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPublishedPosts, getBlogCategories } from '@/actions/blogActions';
import styles from './page.module.css';

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos, guias e insights para o seu negócio.',
};

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [posts, categories] = await Promise.all([
    getPublishedPosts(category),
    getBlogCategories(),
  ]);

  const [featured, ...rest] = posts;

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <header className={styles.pageHeader}>
          <p className={styles.pageLabel}>Blog</p>
          <h1 className={styles.pageTitle}>Insights para o seu negócio</h1>
          <p className={styles.pageSubtitle}>
            Artigos, guias e estratégias para crescer com mais inteligência.
          </p>
        </header>

        {categories.length > 0 && (
          <nav className={styles.categoryBar} aria-label="Filtrar por categoria">
            <Link
              href="/blog"
              className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ''}`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`${styles.categoryChip} ${category === cat ? styles.categoryChipActive : ''}`}
              >
                {cat}
              </Link>
            ))}
          </nav>
        )}

        {featured && (
          <Link href={`/blog/${featured.slug}`} className={styles.featured}>
            {featured.coverImage && (
              <div className={styles.featuredImg}>
                <Image src={featured.coverImage} alt={featured.title} fill style={{ objectFit: 'cover' }} />
              </div>
            )}
            {!featured.coverImage && <div className={styles.featuredImgPlaceholder} />}
            <div className={styles.featuredBody}>
              {featured.category && <span className={styles.categoryTag}>{featured.category}</span>}
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              {featured.excerpt && <p className={styles.featuredExcerpt}>{featured.excerpt}</p>}
              <div className={styles.featuredMeta}>
                {featured.authorImage ? (
                  <Image
                    src={featured.authorImage}
                    alt={featured.authorName}
                    width={32}
                    height={32}
                    className={styles.authorAvatar}
                  />
                ) : (
                  <span className={styles.authorAvatarFallback}>
                    {featured.authorName.charAt(0)}
                  </span>
                )}
                <span className={styles.authorName}>{featured.authorName}</span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaDate}>{formatDate(featured.publishedAt)}</span>
                {featured.readTimeMinutes && (
                  <>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaRead}>{featured.readTimeMinutes} min de leitura</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
                {post.coverImage ? (
                  <div className={styles.cardImg}>
                    <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className={styles.cardImgPlaceholder} />
                )}
                <div className={styles.cardBody}>
                  {post.category && <span className={styles.categoryTag}>{post.category}</span>}
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
                  <div className={styles.cardMeta}>
                    {post.authorImage ? (
                      <Image
                        src={post.authorImage}
                        alt={post.authorName}
                        width={24}
                        height={24}
                        className={styles.authorAvatar}
                      />
                    ) : (
                      <span className={styles.authorAvatarFallbackSm}>
                        {post.authorName.charAt(0)}
                      </span>
                    )}
                    <span className={styles.authorName}>{post.authorName}</span>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.metaDate}>{formatDate(post.publishedAt)}</span>
                    {post.readTimeMinutes && (
                      <>
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.metaRead}>{post.readTimeMinutes} min</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className={styles.empty}>
            <p>Nenhum artigo publicado ainda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
