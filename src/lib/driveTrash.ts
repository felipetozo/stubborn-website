import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export const DRIVE_ROOT  = path.join(process.cwd(), 'drive-storage')
export const TRASH_DIR   = path.join(DRIVE_ROOT, '.trash')
export const MANIFEST    = path.join(TRASH_DIR, '.manifest.json')
export const TRASH_DAYS  = 10

export interface TrashItem {
  id: string
  name: string
  originalPath: string   // relative to DRIVE_ROOT
  trashedAt: string      // ISO
  isDirectory: boolean
  size: number | null
}

export function ensureDirs() {
  if (!fs.existsSync(DRIVE_ROOT)) fs.mkdirSync(DRIVE_ROOT, { recursive: true })
  if (!fs.existsSync(TRASH_DIR))  fs.mkdirSync(TRASH_DIR,  { recursive: true })
}

export function readManifest(): TrashItem[] {
  if (!fs.existsSync(MANIFEST)) return []
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf-8')) } catch { return [] }
}

export function writeManifest(items: TrashItem[]) {
  fs.writeFileSync(MANIFEST, JSON.stringify(items, null, 2))
}

/** Remove items older than TRASH_DAYS days, permanently. */
export function cleanupExpired() {
  const cutoff = Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000
  const items  = readManifest()
  const kept: TrashItem[] = []

  for (const item of items) {
    if (new Date(item.trashedAt).getTime() < cutoff) {
      const trashPath = path.join(TRASH_DIR, item.id)
      try {
        if (fs.existsSync(trashPath))
          fs.rmSync(trashPath, { recursive: true, force: true })
      } catch { /* ignore */ }
    } else {
      kept.push(item)
    }
  }

  writeManifest(kept)
}

export function sanitizePath(inputPath: string): string {
  const n = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return n === '.' ? '' : n
}

/** Move a file/dir into the trash. Returns the new TrashItem. */
export function moveToTrash(relativePath: string): TrashItem {
  ensureDirs()
  const safePath  = sanitizePath(relativePath)
  const fullPath  = path.join(DRIVE_ROOT, safePath)
  const stat      = fs.statSync(fullPath)
  const id        = crypto.randomUUID()
  const trashPath = path.join(TRASH_DIR, id)

  fs.renameSync(fullPath, trashPath)

  const item: TrashItem = {
    id,
    name:         path.basename(safePath),
    originalPath: safePath,
    trashedAt:    new Date().toISOString(),
    isDirectory:  stat.isDirectory(),
    size:         stat.isDirectory() ? null : stat.size,
  }

  const manifest = readManifest()
  manifest.push(item)
  writeManifest(manifest)
  return item
}
