import {
  Film,
  Image as ImageIcon,
  Music,
  FileText,
  Archive,
  File,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function formatSize(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'avif']
export const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v']

export function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}

export function isImage(name: string) {
  return IMAGE_EXTS.includes(fileExt(name))
}

export function isVideo(name: string) {
  return VIDEO_EXTS.includes(fileExt(name))
}

export function isMedia(name: string) {
  return isImage(name) || isVideo(name)
}

export function previewUrl(filePath: string) {
  return `/api/drive/preview?path=${encodeURIComponent(filePath)}`
}

export function getFileIcon(name: string): { Icon: LucideIcon; color: string } {
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
