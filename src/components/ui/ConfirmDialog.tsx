'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open?:         boolean   // se omitido, sempre visível (compatibilidade legada)
  title?:        string
  message:       string
  confirmLabel?: string
  danger?:       boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export function ConfirmDialog({
  open = true,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter')  onConfirm()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#111', borderColor: '#2a2a2a' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          {danger && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)' }}
            >
              <AlertTriangle size={15} className="text-red-400" />
            </div>
          )}
          <div>
            {title && <p className="text-sm font-medium text-white">{title}</p>}
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
            Cancelar
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors"
            style={{ background: danger ? '#dc2626' : '#2563eb' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = danger ? '#b91c1c' : '#1d4ed8')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = danger ? '#dc2626' : '#2563eb')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
