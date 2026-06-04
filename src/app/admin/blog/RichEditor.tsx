'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import styles from './RichEditor.module.css';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichEditor({ value, onChange, placeholder = 'Escreva o conteúdo do artigo...' }: Props) {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: styles.editorContent },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImage(file: File) {
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } finally {
      uploadingRef.current = false;
    }
  }

  function setLink() {
    const url = window.prompt('URL do link:');
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, title: string, label: string) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Negrito', 'B')}
          {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Itálico', 'I')}
          {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Tachado', 'S̶')}
          {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Código inline', '<>')}
        </div>

        <div className={styles.toolGroup}>
          {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Título 2', 'H2')}
          {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Título 3', 'H3')}
          {btn(editor.isActive('heading', { level: 4 }), () => editor.chain().focus().toggleHeading({ level: 4 }).run(), 'Título 4', 'H4')}
        </div>

        <div className={styles.toolGroup}>
          {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Lista', '• —')}
          {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Lista numerada', '1.')}
          {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Citação', '"')}
          {btn(false, () => editor.chain().focus().setHorizontalRule().run(), 'Divisor', '—')}
        </div>

        <div className={styles.toolGroup}>
          {btn(editor.isActive('link'), () => setLink(), 'Link', '🔗')}
          <button
            type="button"
            title="Inserir imagem"
            onMouseDown={(e) => { e.preventDefault(); imgInputRef.current?.click(); }}
            className={styles.toolBtn}
          >
            🖼
          </button>
        </div>

        <div className={styles.toolGroup}>
          {btn(false, () => editor.chain().focus().undo().run(), 'Desfazer', '↩')}
          {btn(false, () => editor.chain().focus().redo().run(), 'Refazer', '↪')}
        </div>
      </div>

      <EditorContent editor={editor} className={styles.editorWrap} />

      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
