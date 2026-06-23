'use client'

import { useState } from 'react'
import { getFileIcon, thumbnailUrl } from '../utils'

interface ThumbProps {
  /** Display name (used for the file-type icon fallback and extension detection). */
  name: string
  /** Path under the drive root to fetch the thumbnail for. */
  path: string
  className?: string
  iconSize?: number
}

/**
 * Renders a small server-generated thumbnail (cheap webp), falling back to the
 * file-type icon when no thumbnail can be produced (e.g. a video on a host
 * without ffmpeg, or an unsupported format). It never downloads the full file.
 */
export function Thumb({ name, path, className, iconSize = 28 }: ThumbProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    const { Icon, color } = getFileIcon(name)
    return (
      <div
        className={`flex items-center justify-center ${className ?? ''}`}
        style={{ background: '#0f0f0f' }}
      >
        <Icon size={iconSize} style={{ color }} />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbnailUrl(path, name)}
      alt={name}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
