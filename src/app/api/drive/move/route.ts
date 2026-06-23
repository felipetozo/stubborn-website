import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DRIVE_ROOT, sanitizePath, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

/** Returns a non-colliding target path inside `dir` for `name`. */
function uniqueDest(dir: string, name: string): string {
  let candidate = path.join(dir, name)
  if (!fs.existsSync(candidate)) return candidate
  const ext  = path.extname(name)
  const base = path.basename(name, ext)
  let i = 1
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base} (${i})${ext}`)
    i++
  }
  return candidate
}

export async function POST(request: NextRequest) {
  ensureDirs()

  const { paths, destination } = await request.json()

  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({ error: 'No paths provided' }, { status: 400 })
  }

  const safeDest = sanitizePath(destination ?? '')
  const destFull = path.join(DRIVE_ROOT, safeDest)

  if (!destFull.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
  }
  if (!fs.existsSync(destFull) || !fs.statSync(destFull).isDirectory()) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
  }

  const errors: string[] = []
  let moved = 0

  for (const p of paths) {
    const safeSrc = sanitizePath(p)
    if (!safeSrc) { errors.push(p); continue }

    const srcFull = path.join(DRIVE_ROOT, safeSrc)
    const name    = path.basename(safeSrc)
    const srcDir  = path.dirname(srcFull)

    if (!srcFull.startsWith(DRIVE_ROOT) || srcFull === DRIVE_ROOT) { errors.push(name); continue }
    if (!fs.existsSync(srcFull)) { errors.push(name); continue }

    // already in the destination → nothing to do, skip silently
    if (destFull === srcDir) continue

    // can't move a folder into itself or one of its descendants
    const rel = path.relative(srcFull, destFull)
    if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
      errors.push(name)
      continue
    }

    try {
      fs.renameSync(srcFull, uniqueDest(destFull, name))
      moved++
    } catch {
      errors.push(name)
    }
  }

  return NextResponse.json({ moved, errors })
}
