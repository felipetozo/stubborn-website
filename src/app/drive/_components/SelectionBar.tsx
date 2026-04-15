import { Download, Trash2, X, Loader2 } from 'lucide-react'

interface SelectionBarProps {
  count: number
  isZipping: boolean
  onDownload: () => void
  onDelete: () => void
  onClear: () => void
}

export function SelectionBar({ count, isZipping, onDownload, onDelete, onClear }: SelectionBarProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-2xl"
      style={{ background: '#111', borderColor: '#2a2a2a' }}
    >
      <span className="text-xs font-medium text-white">
        {count} selected
      </span>
      <div className="w-px h-3" style={{ background: '#333' }} />
      <button
        className="flex cursor-pointer items-center gap-1.5 text-xs transition-colors disabled:opacity-40"
        style={{ color: '#ccc' }}
        onMouseEnter={e => { if (!isZipping) (e.currentTarget as HTMLElement).style.color = '#fff' }}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#ccc')}
        onClick={onDownload}
        disabled={isZipping}
      >
        {isZipping
          ? <Loader2 size={12} className="animate-spin" />
          : <Download size={12} />
        }
        {isZipping ? 'Compactando…' : 'Download'}
      </button>
      <div className="w-px h-3" style={{ background: '#333' }} />
      <button
        className="flex cursor-pointer items-center gap-1.5 text-xs text-red-400 transition-colors hover:text-red-300"
        onClick={onDelete}
      >
        <Trash2 size={12} />
        Delete
      </button>
      <button
        className="cursor-pointer text-xs transition-colors"
        style={{ color: '#666' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}
        onClick={onClear}
      >
        <X size={13} />
      </button>
    </div>
  )
}
