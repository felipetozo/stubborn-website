import { useState, useEffect } from 'react'
import { Folder, Home, Loader2, Check } from 'lucide-react'

interface FolderNode {
  name: string
  path: string
  depth: number
}

interface MoveModalProps {
  paths: string[]
  onMoved: () => void
  onClose: () => void
}

export function MoveModal({ paths, onMoved, onClose }: MoveModalProps) {
  const [folders, setFolders]   = useState<FolderNode[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [moving, setMoving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/drive/folders')
      .then(r => r.json())
      .then(d => setFolders(d.folders || []))
      .catch(() => setFolders([]))
      .finally(() => setLoading(false))
  }, [])

  // A destination is invalid if it's one of the moved items or a descendant of one.
  const pathSet = new Set(paths)
  const isInvalid = (f: FolderNode) =>
    pathSet.has(f.path) || paths.some(p => f.path.startsWith(`${p}/`))

  async function handleMove() {
    if (selected === null) return
    setMoving(true)
    setError('')
    try {
      const res = await fetch('/api/drive/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths, destination: selected }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to move')
        return
      }
      onMoved()
      onClose()
    } catch {
      setError('Connection error')
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#111', borderColor: '#2a2a2a' }}
      >
        <h3 className="mb-1 text-sm font-semibold text-white">
          Move {paths.length > 1 ? `${paths.length} items` : 'item'}
        </h3>
        <p className="mb-4 text-xs" style={{ color: '#666' }}>
          Choose a destination folder
        </p>

        <div
          className="max-h-64 overflow-y-auto rounded-lg border"
          style={{ borderColor: '#222', background: '#0a0a0a' }}
        >
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 size={16} className="animate-spin" style={{ color: '#444' }} />
            </div>
          ) : (
            <>
              <button
                onClick={() => setSelected('')}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{
                  background: selected === '' ? '#1a1a1a' : 'transparent',
                  color: selected === '' ? '#fff' : '#aaa',
                }}
              >
                <Home size={14} style={{ color: '#666' }} />
                Home
              </button>
              {folders.map(f => {
                const disabled = isInvalid(f)
                const active = selected === f.path
                return (
                  <button
                    key={f.path}
                    disabled={disabled}
                    onClick={() => setSelected(f.path)}
                    className="flex w-full items-center gap-2 py-2 pr-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      paddingLeft: 12 + f.depth * 16,
                      background: active ? '#1a1a1a' : 'transparent',
                      color: active ? '#fff' : '#aaa',
                    }}
                  >
                    <Folder size={14} style={{ color: '#666' }} />
                    {f.name}
                  </button>
                )
              })}
            </>
          )}
        </div>

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
            onClick={handleMove}
            disabled={selected === null || moving}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-black disabled:opacity-40"
            style={{ background: '#fff' }}
          >
            {moving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Move here
          </button>
        </div>
      </div>
    </div>
  )
}
