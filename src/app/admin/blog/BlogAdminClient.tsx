'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPost, updatePost, deletePost, getPostById } from '@/actions/blogActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import BlogDrawer, { type DrawerPost } from './BlogDrawer';
import BlogAnalytics from './BlogAnalytics';
import styles from './page.module.css';

type Tab = 'artigos' | 'analytics';

type PostRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  coverImage: string | null;
  destaque: boolean;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
};

type Props = {
  posts: PostRow[];
  initialCategories: string[];
};

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(date)
  );
}

const STATUS_LABEL: Record<string, string> = {
  publicado: 'Publicado',
  rascunho: 'Rascunho',
  agendado: 'Agendado',
};

export default function BlogAdminClient({ posts: initialPosts, initialCategories }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('artigos');
  const [posts, setPosts] = useState(initialPosts);
  const [categories, setCategories] = useState(initialCategories);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<DrawerPost | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setDrawerData(undefined);
    setDrawerOpen(true);
  }

  async function openEdit(id: string) {
    const post = await getPostById(id);
    if (!post) return;
    setDrawerData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content,
      category: post.category ?? '',
      tags: post.tags.join(', '),
      coverImage: post.coverImage ?? '',
      coverAlt: post.coverAlt ?? '',
      readTimeMinutes: post.readTimeMinutes?.toString() ?? '',
      authorName: post.authorName,
      authorTitle: post.authorTitle ?? '',
      destaque: post.destaque,
      status: post.status as DrawerPost['status'],
      metaTitle: post.metaTitle ?? '',
      metaDescription: post.metaDescription ?? '',
    });
    setDrawerOpen(true);
  }

  async function handleSave(data: DrawerPost) {
    const payload = {
      title: data.title,
      slug: data.slug || undefined,
      excerpt: data.excerpt || undefined,
      content: data.content,
      category: data.category || undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      coverImage: data.coverImage || undefined,
      coverAlt: data.coverAlt || undefined,
      readTimeMinutes: data.readTimeMinutes ? parseInt(data.readTimeMinutes) : undefined,
      authorName: data.authorName,
      authorTitle: data.authorTitle || undefined,
      destaque: data.destaque,
      status: data.status,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
    };

    if (data.id) {
      await updatePost(data.id, payload);
    } else {
      await createPost(payload);
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePost(deleteId);
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function handleCategoryCreated(cat: string) {
    if (!categories.includes(cat)) setCategories((prev) => [...prev, cat]);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.subtitle}>{posts.length} artigo{posts.length !== 1 ? 's' : ''}</p>
        </div>
        {tab === 'artigos' && (
          <button type="button" className={styles.newBtn} onClick={openNew}>
            + Novo artigo
          </button>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === 'artigos' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('artigos')}
        >
          Artigos
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === 'analytics' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {tab === 'analytics' && <BlogAnalytics />}

      {tab === 'artigos' && (
        posts.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum artigo ainda.</p>
            <button type="button" className={styles.newBtn} style={{ marginTop: '1rem' }} onClick={openNew}>
              Criar primeiro artigo
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Artigo</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Publicado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className={styles.tdTitle}>
                      <div className={styles.titleCell}>
                        {post.coverImage ? (
                          <div className={styles.thumb}>
                            <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div className={styles.thumbPlaceholder} />
                        )}
                        <div>
                          <span className={styles.titleText}>{post.title}</span>
                          <span className={styles.slug}>/{post.slug}</span>
                          {post.destaque && <span className={styles.destaqueChip}>★ destaque</span>}
                        </div>
                      </div>
                    </td>
                    <td>{post.category ?? <span className={styles.empty2}>—</span>}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[`badge_${post.status}`]}`}>
                        {STATUS_LABEL[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className={styles.tdDate}>{formatDate(post.publishedAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <a
                          href={`/blog/${post.slug}`}
                          className={styles.actionBtn}
                          target="_blank"
                          rel="noopener"
                        >
                          Ver
                        </a>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openEdit(post.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtnDanger}
                          onClick={() => setDeleteId(post.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <BlogDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialData={drawerData}
        onSave={handleSave}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir artigo"
        message="Esta ação não pode ser desfeita. O artigo será removido permanentemente."
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
