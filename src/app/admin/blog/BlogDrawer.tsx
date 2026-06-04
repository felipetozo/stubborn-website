'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CoverUpload from './CoverUpload';
import styles from './BlogDrawer.module.css';

const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false });

export type DrawerPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  coverImage: string;
  coverAlt: string;
  readTimeMinutes: string;
  authorName: string;
  authorTitle: string;
  destaque: boolean;
  status: 'publicado' | 'rascunho' | 'agendado';
  metaTitle: string;
  metaDescription: string;
};

const EMPTY: DrawerPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  coverImage: '',
  coverAlt: '',
  readTimeMinutes: '',
  authorName: '',
  authorTitle: '',
  destaque: false,
  status: 'rascunho',
  metaTitle: '',
  metaDescription: '',
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: DrawerPost;
  onSave: (data: DrawerPost) => Promise<void>;
  categories: string[];
  onCategoryCreated: (cat: string) => void;
};

export default function BlogDrawer({ open, onClose, initialData, onSave, categories, onCategoryCreated }: Props) {
  const [data, setData] = useState<DrawerPost>(initialData ?? EMPTY);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [newCat, setNewCat] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setData(initialData ?? EMPTY);
    setError('');
  }, [initialData, open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const set = <K extends keyof DrawerPost>(key: K, value: DrawerPost[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.title.trim()) { setError('Título obrigatório.'); return; }
    if (!data.authorName.trim()) { setError('Autor obrigatório.'); return; }
    setError('');
    startTransition(async () => {
      try {
        await onSave(data);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      }
    });
  }

  function addCategory() {
    const name = newCat.trim();
    if (!name || categories.includes(name)) return;
    onCategoryCreated(name);
    set('category', name);
    setNewCat('');
    setAddingCat(false);
  }

  const field = (id: string, label: string, children: React.ReactNode, hint?: string) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      {children}
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );

  const input = (id: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input id={id} className={styles.input} {...props} />
  );

  const textarea = (id: string, props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea id={id} className={styles.textarea} {...props} />
  );

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} aria-label="Artigo">
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>{data.id ? 'Editar artigo' : 'Novo artigo'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.drawerBody}>
          <div className={styles.columns}>
            {/* Coluna esquerda — conteúdo principal */}
            <div className={styles.colMain}>
              {field('bd-title', 'Título *',
                input('bd-title', {
                  value: data.title,
                  onChange: (e) => set('title', e.target.value),
                  placeholder: 'Título do artigo',
                  required: true,
                  className: `${styles.input} ${styles.inputLarge}`,
                })
              )}

              {field('bd-excerpt', 'Resumo / Subtítulo',
                textarea('bd-excerpt', {
                  value: data.excerpt,
                  onChange: (e) => set('excerpt', e.target.value),
                  placeholder: 'Breve descrição exibida na listagem',
                  rows: 2,
                })
              )}

              <div className={styles.field}>
                <label className={styles.label}>Conteúdo</label>
                <RichEditor
                  value={data.content}
                  onChange={(html) => set('content', html)}
                />
              </div>
            </div>

            {/* Coluna direita — configurações */}
            <div className={styles.colSide}>
              <div className={styles.sideSection}>
                <p className={styles.sideSectionTitle}>Capa</p>
                <CoverUpload
                  value={data.coverImage}
                  onChange={(url) => set('coverImage', url)}
                />
                {data.coverImage && field('bd-coverAlt', 'Texto alternativo (ALT)',
                  input('bd-coverAlt', {
                    value: data.coverAlt,
                    onChange: (e) => set('coverAlt', e.target.value),
                    placeholder: 'Descrição da imagem para acessibilidade',
                  })
                )}
              </div>

              <div className={styles.sideSection}>
                <p className={styles.sideSectionTitle}>Publicação</p>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="bd-status">Status</label>
                  <select
                    id="bd-status"
                    className={styles.select}
                    value={data.status}
                    onChange={(e) => set('status', e.target.value as DrawerPost['status'])}
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="publicado">Publicado</option>
                    <option value="agendado">Agendado</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="bd-slug">Slug</label>
                  <input
                    id="bd-slug"
                    className={styles.input}
                    value={data.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    placeholder="gerado-automaticamente"
                  />
                </div>

                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={data.destaque}
                    onChange={(e) => set('destaque', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Destacar no blog</span>
                </label>
              </div>

              <div className={styles.sideSection}>
                <p className={styles.sideSectionTitle}>Categoria &amp; Tags</p>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="bd-category">Categoria</label>
                  <div className={styles.categoryRow}>
                    <select
                      id="bd-category"
                      className={styles.select}
                      value={data.category}
                      onChange={(e) => set('category', e.target.value)}
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.addCatBtn}
                      onClick={() => setAddingCat((v) => !v)}
                    >
                      +
                    </button>
                  </div>

                  {addingCat && (
                    <div className={styles.newCatRow}>
                      <input
                        className={styles.input}
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        placeholder="Nova categoria"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                        autoFocus
                      />
                      <button type="button" className={styles.newCatSave} onClick={addCategory}>OK</button>
                    </div>
                  )}
                </div>

                {field('bd-tags', 'Tags',
                  input('bd-tags', {
                    value: data.tags,
                    onChange: (e) => set('tags', e.target.value),
                    placeholder: 'seo, marketing, blog (separadas por vírgula)',
                  }),
                  'Separadas por vírgula'
                )}
              </div>

              <div className={styles.sideSection}>
                <p className={styles.sideSectionTitle}>Autor</p>

                {field('bd-authorName', 'Nome *',
                  input('bd-authorName', {
                    value: data.authorName,
                    onChange: (e) => set('authorName', e.target.value),
                    placeholder: 'Nome do autor',
                    required: true,
                  })
                )}

                {field('bd-authorTitle', 'Cargo',
                  input('bd-authorTitle', {
                    value: data.authorTitle,
                    onChange: (e) => set('authorTitle', e.target.value),
                    placeholder: 'ex: CEO, Especialista em SEO',
                  })
                )}

                {field('bd-readTime', 'Tempo de leitura (min)',
                  input('bd-readTime', {
                    type: 'number',
                    min: 1,
                    value: data.readTimeMinutes,
                    onChange: (e) => set('readTimeMinutes', e.target.value),
                    placeholder: 'ex: 8',
                  })
                )}
              </div>

              <div className={styles.sideSection}>
                <p className={styles.sideSectionTitle}>SEO</p>

                {field('bd-metaTitle', 'Meta título',
                  input('bd-metaTitle', {
                    value: data.metaTitle,
                    onChange: (e) => set('metaTitle', e.target.value),
                    placeholder: 'Título para buscadores (opcional)',
                  })
                )}

                {field('bd-metaDesc', 'Meta descrição',
                  textarea('bd-metaDesc', {
                    value: data.metaDescription,
                    onChange: (e) => set('metaDescription', e.target.value),
                    placeholder: 'Descrição para buscadores — até 160 caracteres',
                    rows: 3,
                    maxLength: 160,
                  })
                )}
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.drawerFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.saveBtn} ${data.status === 'publicado' ? styles.saveBtnPublish : ''}`}
              disabled={isPending}
            >
              {isPending
                ? 'Salvando...'
                : data.status === 'publicado'
                ? 'Publicar'
                : 'Salvar rascunho'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
