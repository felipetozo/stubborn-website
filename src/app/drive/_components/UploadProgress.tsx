import { Loader2, Check, X } from 'lucide-react'

interface UploadProgressProps {
  files: { name: string; status: 'uploading' | 'done' | 'error' }[]
  onClose: () => void
}

export function UploadProgress({ files, onClose }: UploadProgressProps) {
  const allDone = files.every(f => f.status !== 'uploading')

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-xl border shadow-2xl"
      style={{ background: '#111', borderColor: '#2a2a2a' }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: '#222' }}
      >
        <span className="text-xs font-medium text-white">
          {allDone ? 'Upload complete' : 'Uploading files…'}
        </span>
        {allDone && (
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#666' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="max-h-48 overflow-y-auto p-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs" style={{ color: '#ccc' }}>
                {f.name}
              </p>
            </div>
            {f.status === 'uploading' && (
              <Loader2 size={12} className="animate-spin text-white shrink-0" />
            )}
            {f.status === 'done' && <Check size={12} className="text-green-400 shrink-0" />}
            {f.status === 'error' && <X size={12} className="text-red-400 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
