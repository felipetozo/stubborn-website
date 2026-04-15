import { Loader2, Clock } from 'lucide-react'
import type { DriveFile } from '../types'
import { getFileIcon, isMedia, isImage, previewUrl, formatSize, formatDate } from '../utils'

interface RecentViewProps {
  recentFiles: DriveFile[]
  loading: boolean
  onNavigate: (path: string) => void
}

export function RecentView({ recentFiles, loading, onNavigate }: RecentViewProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
      </div>
    )
  }

  if (recentFiles.length === 0) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
        <Clock size={36} style={{ color: '#333' }} />
        <p className="text-sm font-medium" style={{ color: '#555' }}>No recent files</p>
      </div>
    )
  }

  return (
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
            const hasThumb = isMedia(file.name)

            return (
              <tr
                key={file.path}
                className="group border-b cursor-pointer"
                style={{ borderColor: '#111' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0a0a0a'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                onClick={() => onNavigate(file.path.split('/').slice(0, -1).join('/'))}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {hasThumb ? (
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
  )
}
