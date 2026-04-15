'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Folder,
  Film,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  File,
  ChevronRight,
  Plus,
  FolderPlus,
  Upload,
  FolderOpen,
  Download,
  Trash2,
  MoreHorizontal,
  Home,
  Clock,
  RotateCcw,
  X,
  Check,
  Loader2,
  Grid3X3,
  List,
  AlertTriangle,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DriveFile {
  name: string
  type: 'file' | 'folder'
  size: number | null
  modified: string
  path: string
}

type ViewMode = 'grid' | 'list'
type SidebarView = 'home' | 'recent' | 'trash'

type ContextMenu =
  | { kind: 'file';  file: DriveFile;  x: number; y: number }
  | { kind: 'trash'; item: TrashItem;  x: number; y: number }
  | { kind: 'canvas'; x: number; y: number }

interface TrashItem {
  id: string
  name: string
  originalPath: string
  trashedAt: string
  isDirectory: boolean
  size: number | null
  daysLeft: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSize(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'avif']
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v']

function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}

function isImage(name: string) { return IMAGE_EXTS.includes(fileExt(name)) }
function isVideo(name: string) { return VIDEO_EXTS.includes(fileExt(name)) }
function isMedia(name: string) { return isImage(name) || isVideo(name) }

function previewUrl(filePath: string) {
  return `/api/drive/preview?path=${encodeURIComponent(filePath)}`
}

function getFileIcon(name: string) {
  const ext = fileExt(name)
  if (VIDEO_EXTS.includes(ext))
    return { Icon: Film, color: '#a855f7' }
  if (IMAGE_EXTS.includes(ext))
    return { Icon: ImageIcon, color: '#22c55e' }
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext))
    return { Icon: Music, color: '#f59e0b' }
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext))
    return { Icon: FileText, color: '#3b82f6' }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext))
    return { Icon: Archive, color: '#f97316' }
  return { Icon: File, color: '#6b7280' }
}

// ── ConfirmDialog ──────────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
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

// ── NewFolderModal ─────────────────────────────────────────────────────────────

function NewFolderModal({
  currentPath,
  onCreated,
  onClose,
}: {
  currentPath: string
  onCreated: () => void
  onClose: () => void
}) {
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

// ── UploadProgress ─────────────────────────────────────────────────────────────

function UploadProgress({
  files,
  onClose,
}: {
  files: { name: string; status: 'uploading' | 'done' | 'error' }[]
  onClose: () => void
}) {
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

// ── DropdownMenu (shared) ──────────────────────────────────────────────────────

function DropdownMenu({
  x,
  y,
  children,
  onClick,
}: {
  x: number
  y: number
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Adjust position so menu doesn't overflow viewport
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

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: React.FC<{ size?: number; style?: React.CSSProperties }>
  label: string
  danger?: boolean
  onClick: () => void
}) {
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

function MenuDivider() {
  return <div className="my-1 border-t" style={{ borderColor: '#1f1f1f' }} />
}

// ── Main component ─────────────────────────────────────────────────────────────

function DriveInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPath  = searchParams?.get('path') || ''
  const sidebarView  = (searchParams?.get('view') || 'home') as SidebarView

  const [files, setFiles]               = useState<DriveFile[]>([])
  const [trashItems, setTrashItems]     = useState<TrashItem[]>([])
  const [recentFiles, setRecentFiles]   = useState<DriveFile[]>([])
  const [loading, setLoading]           = useState(true)
  const [viewMode, setViewMode]         = useState<ViewMode>('grid')
  const [isDragging, setIsDragging]     = useState(false)
  const [showNewMenu, setShowNewMenu]   = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [uploadQueue, setUploadQueue]   = useState<
    { name: string; status: 'uploading' | 'done' | 'error' }[]
  >([])
  const [showUploadProgress, setShowUploadProgress] = useState(false)
  const [contextMenu, setContextMenu]   = useState<ContextMenu | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DriveFile | null>(null)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [isZipping, setIsZipping] = useState(false)
  const [marquee, setMarquee] = useState<{
    startX: number; startY: number; currentX: number; currentY: number
  } | null>(null)

  const fileInputRef    = useRef<HTMLInputElement>(null)
  const folderInputRef  = useRef<HTMLInputElement>(null)
  const newMenuRef      = useRef<HTMLDivElement>(null)
  const dragCounter     = useRef(0)
  const marqueeRef      = useRef(marquee)
  marqueeRef.current    = marquee

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/drive/files?path=${encodeURIComponent(currentPath)}`)
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [currentPath])

  const fetchTrash = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/drive/trash')
      const data = await res.json()
      setTrashItems(data.items || [])
    } catch {
      setTrashItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRecent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/drive/recent')
      const data = await res.json()
      setRecentFiles(data.files || [])
    } catch {
      setRecentFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sidebarView === 'trash')  { fetchTrash();  return }
    if (sidebarView === 'recent') { fetchRecent(); return }
    fetchFiles()
  }, [sidebarView, fetchFiles, fetchTrash, fetchRecent])

  // ── Close menus on outside click ─────────────────────────────────────────────

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false)
      }
      if (contextMenu) {
        setContextMenu(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  // ── Marquee selection ────────────────────────────────────────────────────────

  function computeSelected(box: { startX: number; startY: number; currentX: number; currentY: number }) {
    const left   = Math.min(box.startX, box.currentX)
    const right  = Math.max(box.startX, box.currentX)
    const top    = Math.min(box.startY, box.currentY)
    const bottom = Math.max(box.startY, box.currentY)

    const newSelected = new Set<string>()
    document.querySelectorAll<HTMLElement>('[data-filepath]').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.left < right && r.right > left && r.top < bottom && r.bottom > top) {
        newSelected.add(el.dataset.filepath!)
      }
    })
    return newSelected
  }

  function handleCanvasMouseDown(e: React.MouseEvent) {
    // Only start marquee on background — not on file items, buttons, or inputs
    const target = e.target as HTMLElement
    if (target.closest('[data-filepath], button, input, a')) return
    if (e.button !== 0) return // left click only

    setSelectedPaths(new Set())
    setMarquee({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY })
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!marqueeRef.current) return
      const updated = { ...marqueeRef.current, currentX: e.clientX, currentY: e.clientY }
      setMarquee(updated)
      setSelectedPaths(computeSelected(updated))
    }
    function onMouseUp() {
      if (!marqueeRef.current) return
      setMarquee(null)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // ── Navigation ───────────────────────────────────────────────────────────────

  function navigate(folderPath: string) {
    router.push(`/drive${folderPath ? `?path=${encodeURIComponent(folderPath)}` : ''}`)
  }

  function navigateView(view: SidebarView) {
    router.push(view === 'home' ? '/drive' : `/drive?view=${view}`)
  }

  async function restoreTrashItem(id: string) {
    setContextMenu(null)
    await fetch('/api/drive/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchTrash()
  }

  async function purgeTrashItem(id: string) {
    setContextMenu(null)
    await fetch(`/api/drive/trash?id=${id}`, { method: 'DELETE' })
    fetchTrash()
  }

  async function emptyTrash() {
    await fetch('/api/drive/trash', { method: 'DELETE' })
    fetchTrash()
  }

  function getBreadcrumbs() {
    if (!currentPath) return []
    const parts = currentPath.split('/')
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join('/'),
    }))
  }

  // ── Upload ───────────────────────────────────────────────────────────────────

  async function uploadFiles(fileList: FileList | File[]) {
    const filesArray = Array.from(fileList)
    if (filesArray.length === 0) return

    setUploadQueue(filesArray.map(f => ({ name: f.name, status: 'uploading' as const })))
    setShowUploadProgress(true)

    const batchSize = 3
    for (let i = 0; i < filesArray.length; i += batchSize) {
      const batch = filesArray.slice(i, i + batchSize)
      const formData = new FormData()
      batch.forEach(f => formData.append('file', f))

      try {
        const res = await fetch(`/api/drive/upload?path=${encodeURIComponent(currentPath)}`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        setUploadQueue(prev =>
          prev.map(q => {
            const inBatch = batch.find(f => f.name === q.name)
            if (!inBatch) return q
            return { ...q, status: data.errors?.includes(q.name) ? 'error' : 'done' }
          })
        )
      } catch {
        setUploadQueue(prev =>
          prev.map(q => {
            const inBatch = batch.find(f => f.name === q.name)
            if (!inBatch) return q
            return { ...q, status: 'error' }
          })
        )
      }
    }

    await fetchFiles()
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) await uploadFiles(e.dataTransfer.files)
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  // pendingDeletePaths holds the full batch to delete after confirmation
  const pendingDeletePaths = useRef<string[]>([])

  function requestDelete(file: DriveFile) {
    setContextMenu(null)
    pendingDeletePaths.current = [file.path]
    setConfirmDelete(file)
  }

  function requestDeleteSelected() {
    const toDelete = files.filter(f => selectedPaths.has(f.path))
    if (toDelete.length === 0) return
    pendingDeletePaths.current = toDelete.map(f => f.path)
    setConfirmDelete(toDelete[0]) // used only for the modal message
  }

  async function confirmDeleteItem() {
    if (!confirmDelete) return
    setConfirmDelete(null)
    const paths = pendingDeletePaths.current
    pendingDeletePaths.current = []
    setSelectedPaths(new Set())
    await Promise.all(
      paths.map(p =>
        fetch(`/api/drive/delete?path=${encodeURIComponent(p)}`, { method: 'DELETE' }).catch(() => {})
      )
    )
    await fetchFiles()
  }

  // ── Download ─────────────────────────────────────────────────────────────────

  function toggleSelect(filePath: string) {
    setSelectedPaths(prev => {
      const next = new Set(prev)
      if (next.has(filePath)) next.delete(filePath)
      else next.add(filePath)
      return next
    })
  }

  function downloadFile(file: DriveFile) {
    const a = document.createElement('a')
    a.href = `/api/drive/download?path=${encodeURIComponent(file.path)}`
    a.download = file.name
    a.click()
  }

  async function downloadSelected() {
    const paths = Array.from(selectedPaths)
    if (paths.length === 0) return
    setIsZipping(true)
    try {
      const res = await fetch('/api/drive/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = paths.length === 1
        ? (files.find(f => f.path === paths[0])?.name ?? 'download')
        : 'download.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsZipping(false)
    }
  }

  // ── Context menus ─────────────────────────────────────────────────────────────

  function openFileMenu(file: DriveFile, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ kind: 'file', file, x: e.clientX, y: e.clientY })
  }

  function openCanvasMenu(e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ kind: 'canvas', x: e.clientX, y: e.clientY })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const breadcrumbs = getBreadcrumbs()
  const isEmpty = !loading && files.length === 0

  // ── Shared new-menu dropdown ──────────────────────────────────────────────────
  const newMenuDropdown = showNewMenu && (
    <div
      className="absolute left-0 top-full z-40 mt-1.5 min-w-[13rem] rounded-xl border py-1 shadow-2xl"
      style={{ background: '#111', borderColor: '#222' }}
      onClick={e => e.stopPropagation()}
    >
      <MenuItem icon={FolderPlus} label="New folder" onClick={() => { setShowNewMenu(false); setShowNewFolder(true) }} />
      <MenuDivider />
      <MenuItem icon={Upload} label="File upload" onClick={() => { setShowNewMenu(false); fileInputRef.current?.click() }} />
      <MenuItem icon={FolderOpen} label="Folder upload" onClick={() => { setShowNewMenu(false); folderInputRef.current?.click() }} />
    </div>
  )

  return (
    <div
      className="flex h-screen overflow-hidden select-none"
      style={{ background: '#000', color: '#fff', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className="flex h-full w-56 shrink-0 flex-col border-r"
        style={{ borderColor: '#1a1a1a', background: '#000' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: '#1a1a1a' }}>
          <img
            src="/img/stubborn-logotipo.svg"
            alt="Stubborn"
            className="h-5 brightness-0 invert"
            draggable={false}
          />
        </div>

        {/* New button */}
        <div className="px-3 pt-4 pb-2 relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(v => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            style={{ background: '#fff' }}
          >
            <Plus size={15} />
            New
          </button>
          {newMenuDropdown}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {(
            [
              { id: 'home',   label: 'Home',   Icon: Home   },
              { id: 'recent', label: 'Recent', Icon: Clock  },
              { id: 'trash',  label: 'Trash',  Icon: Trash2 },
            ] as { id: SidebarView; label: string; Icon: React.FC<{ size?: number; style?: React.CSSProperties }> }[]
          ).map(({ id, label, Icon }) => {
            const active = sidebarView === id
            return (
              <button
                key={id}
                onClick={() => navigateView(id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{
                  background: active ? '#1a1a1a' : 'transparent',
                  color: active ? '#fff' : '#888',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#888' }}
              >
                <Icon size={15} style={{ color: active ? '#fff' : '#666' }} />
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onContextMenu={sidebarView === 'home' ? openCanvasMenu : undefined}
      >
        {/* ── Top bar ────────────────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between border-b px-5 py-3 shrink-0"
          style={{ borderColor: '#1a1a1a' }}
        >
          <div className="flex items-center gap-2 text-xs">
            {sidebarView === 'home' && (
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => navigate('')}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors"
                  style={{ color: currentPath ? '#888' : '#fff', fontWeight: currentPath ? 400 : 500 }}
                  onMouseEnter={e => { if (currentPath) (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { if (currentPath) (e.currentTarget as HTMLElement).style.color = '#888' }}
                >
                  <Home size={11} /><span>Home</span>
                </button>
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.path} className="flex items-center gap-1">
                    <ChevronRight size={11} style={{ color: '#444' }} />
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="rounded px-1.5 py-0.5 transition-colors"
                      style={{ color: i === breadcrumbs.length - 1 ? '#fff' : '#888', fontWeight: i === breadcrumbs.length - 1 ? 500 : 400 }}
                      onMouseEnter={e => { if (i !== breadcrumbs.length - 1) (e.currentTarget as HTMLElement).style.color = '#fff' }}
                      onMouseLeave={e => { if (i !== breadcrumbs.length - 1) (e.currentTarget as HTMLElement).style.color = '#888' }}
                    >{crumb.name}</button>
                  </span>
                ))}
              </nav>
            )}
            {sidebarView === 'recent' && <span className="font-medium text-white">Recent</span>}
            {sidebarView === 'trash'  && (
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">Trash</span>
                {trashItems.length > 0 && (
                  <button
                    onClick={emptyTrash}
                    className="text-xs transition-colors"
                    style={{ color: '#666' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#666'}
                  >
                    Empty trash
                  </button>
                )}
              </div>
            )}
          </div>

          {/* View toggle (only in home) */}
          {sidebarView === 'home' && (
            <div className="flex items-center rounded-lg border p-0.5" style={{ borderColor: '#222' }}>
              <button onClick={() => setViewMode('grid')} className="rounded-md p-1.5 transition-colors" style={{ background: viewMode === 'grid' ? '#1a1a1a' : 'transparent' }}>
                <Grid3X3 size={13} style={{ color: viewMode === 'grid' ? '#fff' : '#555' }} />
              </button>
              <button onClick={() => setViewMode('list')} className="rounded-md p-1.5 transition-colors" style={{ background: viewMode === 'list' ? '#1a1a1a' : 'transparent' }}>
                <List size={13} style={{ color: viewMode === 'list' ? '#fff' : '#555' }} />
              </button>
            </div>
          )}
        </header>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-auto p-5 relative"
          onMouseDown={sidebarView === 'home' ? handleCanvasMouseDown : undefined}
        >
        {sidebarView === 'home' && loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
          </div>
        )}
        {sidebarView === 'home' && !loading && isEmpty && (
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="relative mb-2 h-32 w-32 opacity-80">
              <div
                className="absolute inset-4 rounded-lg"
                style={{ background: '#1a1a1a', transform: 'rotate(-8deg)' }}
              />
              <div
                className="absolute inset-3 rounded-lg"
                style={{ background: '#222', transform: 'rotate(-3deg)' }}
              />
              <div
                className="absolute inset-2 flex items-center justify-center rounded-lg"
                style={{ background: '#2a2a2a' }}
              >
                <Upload size={28} style={{ color: '#555' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="mb-1 text-lg font-medium text-white">Drop files here</p>
              <p className="text-sm" style={{ color: '#555' }}>
                or use the &ldquo;New&rdquo; button.
              </p>
            </div>
          </div>
        )}
        {sidebarView === 'home' && !loading && !isEmpty && viewMode === 'grid' && (
          /* Grid view */
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {files.map(file => {
              const { Icon, color } =
                file.type === 'folder' ? { Icon: Folder, color: '#888' } : getFileIcon(file.name)

              const isSelected = selectedPaths.has(file.path)
              const hasThumb = file.type === 'file' && isMedia(file.name)
              const sharedProps = {
                'data-filepath': file.path,
                onClick: () => {
                  if (marquee) return
                  if (file.type === 'folder') navigate(file.path)
                  else toggleSelect(file.path)
                },
                onContextMenu: (e: React.MouseEvent) => openFileMenu(file, e),
              }

              if (hasThumb) {
                // ── Media card (image / video) ──────────────────────────────
                return (
                  <div
                    key={file.path}
                    {...sharedProps}
                    className="group relative rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      aspectRatio: '16/10',
                      border: `1px solid ${isSelected ? '#555' : '#1a1a1a'}`,
                      outline: isSelected ? '2px solid rgba(255,255,255,0.15)' : 'none',
                    }}
                  >
                    {/* Thumbnail */}
                    {isImage(file.name) ? (
                      <img
                        src={previewUrl(file.path)}
                        alt={file.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <video
                        src={previewUrl(file.path)}
                        className="absolute inset-0 w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        draggable={false}
                      />
                    )}

                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 45%, rgba(0,0,0,0.4) 100%)',
                      }}
                    />

                    {/* Checkbox top-left */}
                    <div
                      className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100"
                      style={isSelected ? {
                        opacity: 1,
                        background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      } : {
                        background: 'rgba(0,0,0,0.55)',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                      }}
                      onClick={e => { e.stopPropagation(); toggleSelect(file.path) }}
                    >
                      <Check size={10} style={{ color: isSelected ? '#000' : 'rgba(255,255,255,0.85)' }} />
                    </div>

                    {/* Filename top-left */}
                    <div className="absolute top-0 inset-x-0 flex items-center justify-between pl-8 pr-8 pt-2">
                      <span className="truncate text-[11px] font-medium text-white drop-shadow">
                        {file.name}
                      </span>
                    </div>

                    {/* Size bottom-left */}
                    <span
                      className="absolute bottom-1.5 left-2 text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {formatSize(file.size)}
                    </span>

                    {/* 3-dot button */}
                    <button
                      className="absolute right-1.5 top-1.5 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                      onClick={e => openFileMenu(file, e)}
                    >
                      <MoreHorizontal size={13} className="text-white" />
                    </button>

                    {/* Selected ring */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: '2px solid rgba(255,255,255,0.4)' }}
                      />
                    )}
                  </div>
                )
              }

              // ── Regular card (folder / other file) ─────────────────────────
              return (
                <div
                  key={file.path}
                  {...sharedProps}
                  className="group relative flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer transition-colors"
                  style={{
                    borderColor: isSelected ? 'rgba(255,255,255,0.55)' : '#1a1a1a',
                    background: isSelected ? '#1a1a1a' : 'transparent',
                    boxShadow: isSelected ? '0 0 0 1px rgba(255,255,255,0.18)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (isSelected) return
                    ;(e.currentTarget as HTMLElement).style.background = '#0f0f0f'
                    ;(e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'
                  }}
                  onMouseLeave={e => {
                    if (isSelected) return
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a'
                  }}
                >
                  {/* Checkbox top-left */}
                  <div
                    className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100"
                    style={isSelected ? {
                      opacity: 1,
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    } : {
                      background: 'rgba(30,30,30,0.8)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}
                    onClick={e => { e.stopPropagation(); toggleSelect(file.path) }}
                  >
                    <Check size={10} style={{ color: isSelected ? '#000' : 'rgba(255,255,255,0.7)' }} />
                  </div>

                  <Icon size={32} style={{ color }} />
                  <span className="w-full truncate text-center text-xs leading-tight" style={{ color: '#ccc' }}>
                    {file.name}
                  </span>
                  <span className="text-[10px]" style={{ color: '#444' }}>
                    {file.type === 'folder' ? 'Folder' : formatSize(file.size)}
                  </span>

                  {/* 3-dot button */}
                  <button
                    className="absolute right-2 top-2 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: '#1a1a1a' }}
                    onClick={e => openFileMenu(file, e)}
                  >
                    <MoreHorizontal size={12} style={{ color: '#888' }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
        {sidebarView === 'home' && !loading && !isEmpty && viewMode === 'list' && (
          /* List view */
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: '#1a1a1a' }}>
            <table className="w-full">
              <thead>
                <tr
                  className="border-b text-left text-xs"
                  style={{ borderColor: '#1a1a1a', color: '#555' }}
                >
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Modified</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Size</th>
                  <th className="px-4 py-2.5 font-medium w-12" />
                </tr>
              </thead>
              <tbody>
                {files.map(file => {
                  const { Icon, color } =
                    file.type === 'folder'
                      ? { Icon: Folder, color: '#888' }
                      : getFileIcon(file.name)

                  const isSelectedRow = selectedPaths.has(file.path)
                  return (
                    <tr
                      key={file.path}
                      data-filepath={file.path}
                      className="group border-b cursor-pointer"
                      style={{
                        borderColor: '#111',
                        background: isSelectedRow ? '#151515' : 'transparent',
                        boxShadow: isSelectedRow ? 'inset 2px 0 0 rgba(255,255,255,0.25)' : 'none',
                      }}
                      onMouseEnter={e => {
                        if (!isSelectedRow)
                          (e.currentTarget as HTMLElement).style.background = '#0a0a0a'
                      }}
                      onMouseLeave={e => {
                        if (!isSelectedRow)
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                      onClick={() => {
                        if (marquee) return
                        if (file.type === 'folder') navigate(file.path)
                        else toggleSelect(file.path)
                      }}
                      onContextMenu={e => openFileMenu(file, e)}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {/* Checkbox */}
                          <div
                            className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100"
                            style={isSelectedRow ? {
                              opacity: 1,
                              background: '#fff',
                            } : {
                              background: 'transparent',
                              border: '1.5px solid rgba(255,255,255,0.25)',
                            }}
                            onClick={e => { e.stopPropagation(); toggleSelect(file.path) }}
                          >
                            {isSelectedRow && <Check size={9} style={{ color: '#000' }} />}
                          </div>
                          <Icon size={15} style={{ color }} />
                          <span className="text-xs" style={{ color: '#ccc' }}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs hidden md:table-cell"
                        style={{ color: '#555' }}
                      >
                        {formatDate(file.modified)}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs hidden sm:table-cell"
                        style={{ color: '#555' }}
                      >
                        {formatSize(file.size)}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 transition-all"
                          style={{ background: '#1a1a1a' }}
                          onClick={e => openFileMenu(file, e)}
                        >
                          <MoreHorizontal size={13} style={{ color: '#888' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Trash view ───────────────────────────────────────────────────── */}
        {sidebarView === 'trash' && (loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
          </div>
        ) : trashItems.length === 0 ? (
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
            <Trash2 size={36} style={{ color: '#333' }} />
            <p className="text-sm font-medium" style={{ color: '#555' }}>Trash is empty</p>
            <p className="text-xs" style={{ color: '#3a3a3a' }}>Items are deleted after {10} days</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: '#1a1a1a' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs" style={{ borderColor: '#1a1a1a', color: '#555' }}>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Original location</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Deleted</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Days left</th>
                  <th className="px-4 py-2.5 font-medium w-16" />
                </tr>
              </thead>
              <tbody>
                {trashItems.map(item => {
                  const { Icon, color } = item.isDirectory
                    ? { Icon: Folder, color: '#888' }
                    : getFileIcon(item.name)
                  const hasThumbTrash = !item.isDirectory && isMedia(item.name)
                  const thumbUrl = `/api/drive/trash-preview?id=${item.id}&name=${encodeURIComponent(item.name)}`
                  return (
                    <tr
                      key={item.id}
                      className="group border-b"
                      style={{ borderColor: '#111' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0a0a0a'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      onContextMenu={e => { e.preventDefault(); setContextMenu({ kind: 'trash', item, x: e.clientX, y: e.clientY }) }}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          {hasThumbTrash ? (
                            <div
                              className="shrink-0 rounded overflow-hidden"
                              style={{ width: 48, height: 36, background: '#111' }}
                            >
                              {isImage(item.name) ? (
                                <img
                                  src={thumbUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  draggable={false}
                                />
                              ) : (
                                <video
                                  src={thumbUrl}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                  muted
                                  playsInline
                                  draggable={false}
                                />
                              )}
                            </div>
                          ) : (
                            <Icon size={15} style={{ color }} />
                          )}
                          <span className="text-xs" style={{ color: '#ccc' }}>{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden md:table-cell" style={{ color: '#555' }}>
                        {item.originalPath.split('/').slice(0, -1).join('/') || '/'}
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: '#555' }}>
                        {formatDate(item.trashedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: item.daysLeft <= 2 ? '#f87171' : '#555' }}>
                        {item.daysLeft}d
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 transition-all"
                          style={{ background: '#1a1a1a' }}
                          onClick={e => { e.stopPropagation(); setContextMenu({ kind: 'trash', item, x: e.clientX, y: e.clientY }) }}
                        >
                          <MoreHorizontal size={13} style={{ color: '#888' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* ── Recent view ──────────────────────────────────────────────────── */}
        {sidebarView === 'recent' && (loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
            <Clock size={36} style={{ color: '#333' }} />
            <p className="text-sm font-medium" style={{ color: '#555' }}>No recent files</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: '#1a1a1a' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs" style={{ borderColor: '#1a1a1a', color: '#555' }}>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Location</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Modified</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Size</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map(file => {
                  const { Icon, color } = getFileIcon(file.name)
                  const hasThumbRecent = isMedia(file.name)
                  return (
                    <tr
                      key={file.path}
                      className="group border-b cursor-pointer"
                      style={{ borderColor: '#111' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0a0a0a'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      onClick={() => { navigate(file.path.split('/').slice(0, -1).join('/')) }}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          {hasThumbRecent ? (
                            <div
                              className="shrink-0 rounded overflow-hidden"
                              style={{ width: 48, height: 36, background: '#111' }}
                            >
                              {isImage(file.name) ? (
                                <img
                                  src={previewUrl(file.path)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  draggable={false}
                                />
                              ) : (
                                <video
                                  src={previewUrl(file.path)}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                  muted
                                  playsInline
                                  draggable={false}
                                />
                              )}
                            </div>
                          ) : (
                            <Icon size={15} style={{ color }} />
                          )}
                          <span className="text-xs" style={{ color: '#ccc' }}>{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden md:table-cell" style={{ color: '#555' }}>
                        {file.path.split('/').slice(0, -1).join('/') || '/'}
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: '#555' }}>
                        {formatDate(file.modified)}
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: '#555' }}>
                        {formatSize(file.size)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </main>

      {/* ── Marquee selection rectangle ──────────────────────────────────────── */}
      {marquee && (
        <div
          className="fixed pointer-events-none z-20"
          style={{
            left:   Math.min(marquee.startX, marquee.currentX),
            top:    Math.min(marquee.startY, marquee.currentY),
            width:  Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 4,
          }}
        />
      )}

      {/* ── Selection bar ────────────────────────────────────────────────────── */}
      {selectedPaths.size > 0 && !marquee && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-2xl"
          style={{ background: '#111', borderColor: '#2a2a2a' }}
        >
          <span className="text-xs font-medium text-white">
            {selectedPaths.size} selected
          </span>
          <div className="w-px h-3" style={{ background: '#333' }} />
          <button
            className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40"
            style={{ color: '#ccc' }}
            onMouseEnter={e => { if (!isZipping) (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#ccc')}
            onClick={downloadSelected}
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
            className="flex items-center gap-1.5 text-xs text-red-400 transition-colors hover:text-red-300"
            onClick={requestDeleteSelected}
          >
            <Trash2 size={12} />
            Delete
          </button>
          <button
            className="text-xs transition-colors"
            style={{ color: '#666' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}
            onClick={() => setSelectedPaths(new Set())}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Drag overlay ─────────────────────────────────────────────────────── */}
      {isDragging && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div
            className="absolute inset-4 rounded-2xl border-2 border-dashed"
            style={{ borderColor: '#fff', background: 'rgba(0,0,0,0.85)' }}
          />
          <Upload size={32} className="relative z-10 text-white" />
          <p className="relative z-10 text-sm font-medium text-white">Drop to upload</p>
        </div>
      )}

      {/* ── Context menus ────────────────────────────────────────────────────── */}
      {contextMenu?.kind === 'file' && (
        <DropdownMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.file.type === 'folder' && (
            <MenuItem
              icon={FolderOpen}
              label="Open"
              onClick={() => {
                navigate((contextMenu as { kind: 'file'; file: DriveFile; x: number; y: number }).file.path)
                setContextMenu(null)
              }}
            />
          )}
          {contextMenu.file.type === 'file' && (
            <MenuItem
              icon={Download}
              label="Download"
              onClick={() => {
                downloadFile((contextMenu as { kind: 'file'; file: DriveFile; x: number; y: number }).file)
                setContextMenu(null)
              }}
            />
          )}
          <MenuDivider />
          <MenuItem
            icon={Trash2}
            label="Delete"
            danger
            onClick={() =>
              requestDelete((contextMenu as { kind: 'file'; file: DriveFile; x: number; y: number }).file)
            }
          />
        </DropdownMenu>
      )}

      {contextMenu?.kind === 'canvas' && (
        <DropdownMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClick={e => e.stopPropagation()}
        >
          <MenuItem
            icon={FolderPlus}
            label="New folder"
            onClick={() => {
              setContextMenu(null)
              setShowNewFolder(true)
            }}
          />
          <MenuDivider />
          <MenuItem
            icon={Upload}
            label="File upload"
            onClick={() => {
              setContextMenu(null)
              fileInputRef.current?.click()
            }}
          />
          <MenuItem
            icon={FolderOpen}
            label="Folder upload"
            onClick={() => {
              setContextMenu(null)
              folderInputRef.current?.click()
            }}
          />
        </DropdownMenu>
      )}

      {/* ── Trash context menu ───────────────────────────────────────────────── */}
      {contextMenu?.kind === 'trash' && (
        <DropdownMenu x={contextMenu.x} y={contextMenu.y} onClick={e => e.stopPropagation()}>
          <MenuItem icon={RotateCcw} label="Restore" onClick={() => restoreTrashItem((contextMenu as { kind: 'trash'; item: TrashItem; x: number; y: number }).item.id)} />
          <MenuDivider />
          <MenuItem icon={Trash2} label="Delete forever" danger onClick={() => purgeTrashItem((contextMenu as { kind: 'trash'; item: TrashItem; x: number; y: number }).item.id)} />
        </DropdownMenu>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showNewFolder && (
        <NewFolderModal
          currentPath={currentPath}
          onCreated={fetchFiles}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={
            pendingDeletePaths.current.length > 1
              ? `${pendingDeletePaths.current.length} items will be permanently deleted and cannot be recovered.`
              : `"${confirmDelete.name}" will be permanently deleted and cannot be recovered.`
          }
          onConfirm={confirmDeleteItem}
          onCancel={() => { setConfirmDelete(null); pendingDeletePaths.current = [] }}
        />
      )}

      {showUploadProgress && (
        <UploadProgress
          files={uploadQueue}
          onClose={() => {
            setShowUploadProgress(false)
            setUploadQueue([])
          }}
        />
      )}

      {/* ── Hidden file inputs ───────────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files) {
            uploadFiles(e.target.files)
            e.target.value = ''
          }
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error – webkitdirectory is not in TypeScript types
        webkitdirectory=""
        className="hidden"
        onChange={e => {
          if (e.target.files) {
            uploadFiles(e.target.files)
            e.target.value = ''
          }
        }}
      />
      </div>
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function DrivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: '#000' }}>
          <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
        </div>
      }
    >
      <DriveInner />
    </Suspense>
  )
}
