'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import styles from './CoverUpload.module.css';

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function CoverUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload.');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload.');
    } finally {
      setLoading(false);
    }
  }

  function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files);
  }

  return (
    <div className={styles.wrap}>
      {value ? (
        <div className={styles.preview}>
          <Image src={value} alt="Capa" fill style={{ objectFit: 'cover' }} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onChange('')}
            aria-label="Remover imagem"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDrag : ''} ${loading ? styles.dropzoneLoading : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.loadingText}>Enviando...</span>
          ) : (
            <>
              <span className={styles.icon}>🖼</span>
              <span className={styles.hint}>Clique ou arraste uma imagem</span>
              <span className={styles.sub}>JPEG, PNG, WEBP — até 8 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className={styles.fileInput}
        onChange={(e) => handleFile(e.target.files)}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
