'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type Props = {
  contentHtml: string;
};

function extractHeadings(html: string): TocItem[] {
  const matches = [...html.matchAll(/<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-4]>/gi)];
  return matches.map((m) => ({
    level: parseInt(m[1]),
    id: m[2],
    text: m[3].replace(/<[^>]+>/g, ''),
  }));
}

export default function TableOfContents({ contentHtml }: Props) {
  const items = extractHeadings(contentHtml);
  const [activeId, setActiveId] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, 6);

  return (
    <nav className={styles.toc} aria-label="Índice do artigo">
      <p className={styles.tocTitle}>Neste artigo</p>
      <ol className={styles.tocList}>
        {visibleItems.map((item) => (
          <li
            key={item.id}
            className={styles.tocItem}
            style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${item.id}`}
              className={`${styles.tocLink} ${activeId === item.id ? styles.tocLinkActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(item.id);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
      {items.length > 6 && (
        <button
          type="button"
          className={styles.tocToggle}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Mostrar menos' : `Mostrar todos (${items.length})`}
        </button>
      )}
    </nav>
  );
}
