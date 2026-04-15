import { useState, useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'

// ── DropdownMenu ───────────────────────────────────────────────────────────────

interface DropdownMenuProps {
  x: number
  y: number
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
}

export function DropdownMenu({ x, y, children, onClick }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: y, left: x })

  useEffect(() => {
    if (!ref.current) return
    const { offsetWidth: w, offsetHeight: h } = ref.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    setPos({
      top: y + h > vh ? Math.max(0, y - h) : y,
      left: x + w > vw ? Math.max(0, x - w) : x,
    })
  }, [x, y])

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[10rem] rounded-xl border py-1 shadow-2xl"
      style={{ top: pos.top, left: pos.left, background: '#111', borderColor: '#222' }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── MenuItem ───────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: LucideIcon
  label: string
  danger?: boolean
  onClick: () => void
}

export function MenuItem({ icon: Icon, label, danger, onClick }: MenuItemProps) {
  return (
    <button
      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors"
      style={{ color: danger ? '#f87171' : '#ccc' }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLElement).style.background = danger
          ? 'rgba(239,68,68,0.08)'
          : 'rgba(255,255,255,0.04)')
      }
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      onClick={onClick}
    >
      <Icon size={13} style={{ color: danger ? '#f87171' : '#666' }} />
      {label}
    </button>
  )
}

// ── MenuDivider ────────────────────────────────────────────────────────────────

export function MenuDivider() {
  return <div className="my-1 border-t" style={{ borderColor: '#1f1f1f' }} />
}
