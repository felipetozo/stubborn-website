import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-xs rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#111', borderColor: '#2a2a2a' }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(239,68,68,0.12)' }}
          >
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Delete item</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: '#888' }}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-xs font-medium transition-colors"
            style={{ color: '#888' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#888')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors"
            style={{ background: '#dc2626' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#b91c1c')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#dc2626')}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
