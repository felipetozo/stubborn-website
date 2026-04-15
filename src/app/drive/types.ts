export interface DriveFile {
  name: string
  type: 'file' | 'folder'
  size: number | null
  modified: string
  path: string
}

export type ViewMode = 'grid' | 'list'
export type SidebarView = 'home' | 'recent' | 'trash'

export type ContextMenu =
  | { kind: 'file';   file: DriveFile; x: number; y: number }
  | { kind: 'trash';  item: TrashItem; x: number; y: number }
  | { kind: 'canvas'; x: number; y: number }

export interface TrashItem {
  id: string
  name: string
  originalPath: string
  trashedAt: string
  isDirectory: boolean
  size: number | null
  daysLeft: number
}

export type Marquee = {
  startX: number
  startY: number
  currentX: number
  currentY: number
}
