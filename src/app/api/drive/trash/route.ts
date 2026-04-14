import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  DRIVE_ROOT, TRASH_DIR, TRASH_DAYS,
  ensureDirs, readManifest, writeManifest, cleanupExpired,
} from '@/lib/driveTrash'

export const runtime = 'nodejs'

/** GET /api/drive/trash — list trashed items */
export async function GET() {
  ensureDirs()
  cleanupExpired()
  const items = readManifest()
  // Add days-remaining info
  const now = Date.now()
  const enriched = items.map(item => ({
    ...item,
    daysLeft: Math.ceil(
      (new Date(item.trashedAt).getTime() + TRASH_DAYS * 864e5 - now) / 864e5
    ),
  }))
  return NextResponse.json({ items: enriched })
}

/** DELETE /api/drive/trash?id=xxx  — purge one item permanently
 *  DELETE /api/drive/trash          — empty entire trash             */
export async function DELETE(request: NextRequest) {
  ensureDirs()
  const id = request.nextUrl.searchParams.get('id')
  const items = readManifest()

  if (id) {
    const item = items.find(i => i.id === id)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const trashPath = path.join(TRASH_DIR, id)
    if (fs.existsSync(trashPath)) fs.rmSync(trashPath, { recursive: true, force: true })
    writeManifest(items.filter(i => i.id !== id))
    return NextResponse.json({ purged: id })
  }

  // Empty all
  for (const item of items) {
    const trashPath = path.join(TRASH_DIR, item.id)
    if (fs.existsSync(trashPath)) fs.rmSync(trashPath, { recursive: true, force: true })
  }
  writeManifest([])
  return NextResponse.json({ purged: 'all' })
}

/** POST /api/drive/trash  { id }  — restore item to original location */
export async function POST(request: NextRequest) {
  ensureDirs()
  const { id } = await request.json()
  const items = readManifest()
  const item  = items.find(i => i.id === id)

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const trashPath    = path.join(TRASH_DIR, item.id)
  const restorePath  = path.join(DRIVE_ROOT, item.originalPath)
  const restoreDir   = path.dirname(restorePath)

  if (!trashPath.startsWith(TRASH_DIR) || !restorePath.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(trashPath)) {
    return NextResponse.json({ error: 'Trashed file missing' }, { status: 404 })
  }

  // If original location already exists, add suffix
  let target = restorePath
  if (fs.existsSync(target)) {
    const ext  = path.extname(item.name)
    const base = path.basename(item.name, ext)
    target = path.join(restoreDir, `${base} (restored)${ext}`)
  }

  if (!fs.existsSync(restoreDir)) fs.mkdirSync(restoreDir, { recursive: true })
  fs.renameSync(trashPath, target)
  writeManifest(items.filter(i => i.id !== id))
  return NextResponse.json({ restored: item.originalPath })
}
