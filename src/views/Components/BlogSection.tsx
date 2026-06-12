'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import styles from './BlogSection.module.css';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  coverImage: string | null;
  authorName: string;
  publishedAt: string | null;
};

function formatDate(date: string | null, locale: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export default function BlogSection() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/blog/posts?limit=3')
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.ok) setPosts(data.posts as Post[]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="landing-blog-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.badge}>{t('badge')}</span>
          <h2 id="landing-blog-title" className={styles.title}>{t('title')}</h2>
          <p className={styles.lead}>{t('description')}</p>
        </header>

        <div className={styles.grid}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
              {post.coverImage ? (
                <div className={styles.cardImg}>
                  <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div className={styles.cardImgPlaceholder} />
              )}
              <div className={styles.cardBody}>
                {post.category && <span className={styles.tag}>{post.category}</span>}
                <h3 className={styles.cardTitle}>{post.title}</h3>
                {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
                <div className={styles.cardMeta}>
                  <span>{post.authorName}</span>
                  <span className={styles.dot}>·</span>
                  <span>{formatDate(post.publishedAt, locale)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/blog" className={styles.allLink}>{t('seeAll')}</Link>
        </div>
      </div>
    </section>
  );
}
