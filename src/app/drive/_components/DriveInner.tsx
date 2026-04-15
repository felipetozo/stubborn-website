'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus,
  FolderPlus,
  Upload,
  FolderOpen,
  Download,
  Trash2,
  Home,
  Clock,
  ChevronRight,
  RotateCcw,
  Grid3X3,
  List,
  Loader2,
} from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DropdownMenu, MenuItem, MenuDivider } from '@/components/ui/DropdownMenu'
import { NewFolderModal } from './NewFolderModal'
import { UploadProgress } from './UploadProgress'
import { SelectionBar } from './SelectionBar'
import { FileGrid } from './FileGrid'
import { FileList } from './FileList'
import { TrashView } from './TrashView'
import { RecentView } from './RecentView'

import type { DriveFile, TrashItem, ViewMode, SidebarView, ContextMenu, Marquee } from '../types'

export function DriveInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPath = searchParams?.get('path') || ''
  const sidebarView = (searchParams?.get('view') || 'home') as SidebarView

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
  const [isZipping, setIsZipping]       = useState(false)
  const [marquee, setMarquee]           = useState<Marquee | null>(null)

  const fileInputRef   = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const newMenuRef     = useRef<HTMLDivElement>(null)
  const dragCounter    = useRef(0)
  const marqueeRef     = useRef(marquee)
  marqueeRef.current   = marquee
  const pendingDeletePaths = useRef<string[]>([])

  // ── Data fetching ──────────────────────────────────────────────────────────

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

  // ── Close menus on outside click ───────────────────────────────────────────

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false)
      }
      if (contextMenu) setContextMenu(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  // ── Marquee selection ──────────────────────────────────────────────────────

  function computeSelected(box: Marquee) {
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
    const target = e.target as HTMLElement
    if (target.closest('[data-filepath], button, input, a')) return
    if (e.button !== 0) return

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

  // ── Navigation ─────────────────────────────────────────────────────────────

  function navigate(folderPath: string) {
    router.push(`/drive${folderPath ? `?path=${encodeURIComponent(folderPath)}` : ''}`)
  }

  function navigateView(view: SidebarView) {
    router.push(view === 'home' ? '/drive' : `/drive?view=${view}`)
  }

  // ── Trash actions ──────────────────────────────────────────────────────────

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

  // ── Breadcrumbs ────────────────────────────────────────────────────────────

  function getBreadcrumbs() {
    if (!currentPath) return []
    const parts = currentPath.split('/')
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join('/'),
    }))
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

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

  // ── Drag & Drop ────────────────────────────────────────────────────────────

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

  // ── Delete ─────────────────────────────────────────────────────────────────

  function requestDelete(file: DriveFile) {
    setContextMenu(null)
    pendingDeletePaths.current = [file.path]
    setConfirmDelete(file)
  }

  function requestDeleteSelected() {
    const toDelete = files.filter(f => selectedPaths.has(f.path))
    if (toDelete.length === 0) return
    pendingDeletePaths.current = toDelete.map(f => f.path)
    setConfirmDelete(toDelete[0])
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

  // ── Download ───────────────────────────────────────────────────────────────

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

  // ── Context menus ──────────────────────────────────────────────────────────

  function openFileMenu(file: DriveFile, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ kind: 'file', file, x: e.clientX, y: e.clientY })
  }

  function openCanvasMenu(e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ kind: 'canvas', x: e.clientX, y: e.clientY })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const breadcrumbs = getBreadcrumbs()
  const isEmpty = !loading && files.length === 0

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
        {/* ── Top bar ──────────────────────────────────────────────────────────*/}
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
            {sidebarView === 'trash' && (
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

        {/* ── Main content ─────────────────────────────────────────────────────*/}
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
                <div className="absolute inset-4 rounded-lg" style={{ background: '#1a1a1a', transform: 'rotate(-8deg)' }} />
                <div className="absolute inset-3 rounded-lg" style={{ background: '#222', transform: 'rotate(-3deg)' }} />
                <div className="absolute inset-2 flex items-center justify-center rounded-lg" style={{ background: '#2a2a2a' }}>
                  <Upload size={28} style={{ color: '#555' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="mb-1 text-lg font-medium text-white">Drop files here</p>
                <p className="text-sm" style={{ color: '#555' }}>or use the &ldquo;New&rdquo; button.</p>
              </div>
            </div>
          )}
          {sidebarView === 'home' && !loading && !isEmpty && viewMode === 'grid' && (
            <FileGrid
              files={files}
              selectedPaths={selectedPaths}
              isMarqueeActive={!!marquee}
              onToggleSelect={toggleSelect}
              onNavigate={navigate}
              onOpenMenu={openFileMenu}
            />
          )}
          {sidebarView === 'home' && !loading && !isEmpty && viewMode === 'list' && (
            <FileList
              files={files}
              selectedPaths={selectedPaths}
              isMarqueeActive={!!marquee}
              onToggleSelect={toggleSelect}
              onNavigate={navigate}
              onOpenMenu={openFileMenu}
            />
          )}
          {sidebarView === 'trash' && (
            <TrashView
              trashItems={trashItems}
              loading={loading}
              onContextMenu={(item, x, y) =>
                setContextMenu({ kind: 'trash', item, x, y })
              }
            />
          )}
          {sidebarView === 'recent' && (
            <RecentView
              recentFiles={recentFiles}
              loading={loading}
              onNavigate={navigate}
            />
          )}
        </main>

        {/* ── Marquee selection rectangle ───────────────────────────────────── */}
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

        {/* ── Selection bar ─────────────────────────────────────────────────── */}
        {selectedPaths.size > 0 && !marquee && (
          <SelectionBar
            count={selectedPaths.size}
            isZipping={isZipping}
            onDownload={downloadSelected}
            onDelete={requestDeleteSelected}
            onClear={() => setSelectedPaths(new Set())}
          />
        )}

        {/* ── Drag overlay ──────────────────────────────────────────────────── */}
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

        {/* ── Context menu: file ────────────────────────────────────────────── */}
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

        {/* ── Context menu: canvas ──────────────────────────────────────────── */}
        {contextMenu?.kind === 'canvas' && (
          <DropdownMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClick={e => e.stopPropagation()}
          >
            <MenuItem
              icon={FolderPlus}
              label="New folder"
              onClick={() => { setContextMenu(null); setShowNewFolder(true) }}
            />
            <MenuDivider />
            <MenuItem
              icon={Upload}
              label="File upload"
              onClick={() => { setContextMenu(null); fileInputRef.current?.click() }}
            />
            <MenuItem
              icon={FolderOpen}
              label="Folder upload"
              onClick={() => { setContextMenu(null); folderInputRef.current?.click() }}
            />
          </DropdownMenu>
        )}

        {/* ── Context menu: trash ───────────────────────────────────────────── */}
        {contextMenu?.kind === 'trash' && (
          <DropdownMenu x={contextMenu.x} y={contextMenu.y} onClick={e => e.stopPropagation()}>
            <MenuItem
              icon={RotateCcw}
              label="Restore"
              onClick={() => restoreTrashItem((contextMenu as { kind: 'trash'; item: TrashItem; x: number; y: number }).item.id)}
            />
            <MenuDivider />
            <MenuItem
              icon={Trash2}
              label="Delete forever"
              danger
              onClick={() => purgeTrashItem((contextMenu as { kind: 'trash'; item: TrashItem; x: number; y: number }).item.id)}
            />
          </DropdownMenu>
        )}

        {/* ── Modals ────────────────────────────────────────────────────────── */}
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
            onClose={() => { setShowUploadProgress(false); setUploadQueue([]) }}
          />
        )}

        {/* ── Hidden file inputs ────────────────────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files) { uploadFiles(e.target.files); e.target.value = '' }
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
            if (e.target.files) { uploadFiles(e.target.files); e.target.value = '' }
          }}
        />
      </div>
    </div>
  )
}
