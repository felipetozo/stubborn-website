import { Folder, Check, MoreHorizontal } from 'lucide-react'
import type { DriveFile } from '../types'
import {
  getFileIcon,
  isMedia,
  isImage,
  previewUrl,
  formatSize,
} from '../utils'

interface FileGridProps {
  files: DriveFile[]
  selectedPaths: Set<string>
  isMarqueeActive: boolean
  onToggleSelect: (path: string) => void
  onNavigate: (path: string) => void
  onOpenMenu: (file: DriveFile, e: React.MouseEvent) => void
}

export function FileGrid({
  files,
  selectedPaths,
  isMarqueeActive,
  onToggleSelect,
  onNavigate,
  onOpenMenu,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {files.map(file => {
        const { Icon, color } =
          file.type === 'folder' ? { Icon: Folder, color: '#888' } : getFileIcon(file.name)

        const isSelected = selectedPaths.has(file.path)
        const hasThumb = file.type === 'file' && isMedia(file.name)

        const sharedProps = {
          'data-filepath': file.path,
          onClick: () => {
            if (isMarqueeActive) return
            if (file.type === 'folder') onNavigate(file.path)
            else onToggleSelect(file.path)
          },
          onContextMenu: (e: React.MouseEvent) => onOpenMenu(file, e),
        }

        if (hasThumb) {
          // ── Media card (image / video) ────────────────────────────────────
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
                onClick={e => { e.stopPropagation(); onToggleSelect(file.path) }}
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
                onClick={e => onOpenMenu(file, e)}
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

        // ── Regular card (folder / other file) ───────────────────────────────
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
              onClick={e => { e.stopPropagation(); onToggleSelect(file.path) }}
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
              onClick={e => onOpenMenu(file, e)}
            >
              <MoreHorizontal size={12} style={{ color: '#888' }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
