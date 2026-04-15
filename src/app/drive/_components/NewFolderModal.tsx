import { useState, useEffect, useRef } from 'react'
import { Check, Loader2 } from 'lucide-react'

interface NewFolderModalProps {
  currentPath: string
  onCreated: () => void
  onClose: () => void
}

export function NewFolderModal({ currentPath, onCreated, onClose }: NewFolderModalProps) {
  const [name, setName] = useState('New folder')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/drive/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: currentPath, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create folder')
      } else {
        onCreated()
        onClose()
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#111', borderColor: '#2a2a2a' }}
      >
        <h3 className="mb-4 text-sm font-semibold text-white">New folder</h3>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreate()
            if (e.key === 'Escape') onClose()
          }}
          className="w-full rounded-lg border px-3 py-2 text-sm text-white outline-none"
          style={{ background: '#1a1a1a', borderColor: '#333' }}
          onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#555')}
          onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#333')}
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium transition-colors"
            style={{ color: '#888' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#888')}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-black disabled:opacity-40"
            style={{ background: '#fff' }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
