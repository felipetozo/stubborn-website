import { Loader2, Folder, Trash2, MoreHorizontal, RotateCcw } from 'lucide-react'
import type { TrashItem } from '../types'
import { getFileIcon, isMedia, isImage, formatDate } from '../utils'

interface TrashViewProps {
  trashItems: TrashItem[]
  loading: boolean
  onContextMenu: (item: TrashItem, x: number, y: number) => void
}

export function TrashView({ trashItems, loading, onContextMenu }: TrashViewProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
      </div>
    )
  }

  if (trashItems.length === 0) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
        <Trash2 size={36} style={{ color: '#333' }} />
        <p className="text-sm font-medium" style={{ color: '#555' }}>Trash is empty</p>
        <p className="text-xs" style={{ color: '#3a3a3a' }}>Items are deleted after 10 days</p>
      </div>
    )
  }

  return (
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
            const hasThumb = !item.isDirectory && isMedia(item.name)
            const thumbUrl = `/api/drive/trash-preview?id=${item.id}&name=${encodeURIComponent(item.name)}`

            return (
              <tr
                key={item.id}
                className="group border-b"
                style={{ borderColor: '#111' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0a0a0a'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                onContextMenu={e => {
                  e.preventDefault()
                  onContextMenu(item, e.clientX, e.clientY)
                }}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {hasThumb ? (
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
                <td
                  className="px-4 py-2.5 text-xs hidden sm:table-cell"
                  style={{ color: item.daysLeft <= 2 ? '#f87171' : '#555' }}
                >
                  {item.daysLeft}d
                </td>
                <td className="px-4 py-2.5">
                  <button
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 transition-all"
                    style={{ background: '#1a1a1a' }}
                    onClick={e => {
                      e.stopPropagation()
                      onContextMenu(item, e.clientX, e.clientY)
                    }}
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

// Re-export icons used in context menu so DriveInner doesn't need to import them separately
export { RotateCcw }
