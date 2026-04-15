import { Folder, Check, MoreHorizontal } from 'lucide-react'
import type { DriveFile } from '../types'
import {
  getFileIcon,
  isMedia,
  isImage,
  previewUrl,
  formatSize,
  formatDate,
} from '../utils'

interface FileListProps {
  files: DriveFile[]
  selectedPaths: Set<string>
  isMarqueeActive: boolean
  onToggleSelect: (path: string) => void
  onNavigate: (path: string) => void
  onOpenMenu: (file: DriveFile, e: React.MouseEvent) => void
}

export function FileList({
  files,
  selectedPaths,
  isMarqueeActive,
  onToggleSelect,
  onNavigate,
  onOpenMenu,
}: FileListProps) {
  return (
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
            const hasThumb = isMedia(file.name)

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
                  if (isMarqueeActive) return
                  if (file.type === 'folder') onNavigate(file.path)
                  else onToggleSelect(file.path)
                }}
                onContextMenu={e => onOpenMenu(file, e)}
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
                      onClick={e => { e.stopPropagation(); onToggleSelect(file.path) }}
                    >
                      {isSelectedRow && <Check size={9} style={{ color: '#000' }} />}
                    </div>

                    {hasThumb ? (
                      <div
                        className="shrink-0 rounded overflow-hidden"
                        style={{ width: 32, height: 24, background: '#111' }}
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
                    <span className="text-xs" style={{ color: '#ccc' }}>
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs hidden md:table-cell" style={{ color: '#555' }}>
                  {formatDate(file.modified)}
                </td>
                <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: '#555' }}>
                  {formatSize(file.size)}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 transition-all"
                    style={{ background: '#1a1a1a' }}
                    onClick={e => onOpenMenu(file, e)}
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
  )
}
