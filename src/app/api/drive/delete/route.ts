import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DRIVE_ROOT, sanitizePath, moveToTrash, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest) {
  ensureDirs()
  const itemPath = request.nextUrl.searchParams.get('path') || ''
  const safePath = sanitizePath(itemPath)

  if (!safePath) {
    return NextResponse.json({ error: 'Cannot delete root' }, { status: 400 })
  }

  const fullPath = path.join(DRIVE_ROOT, safePath)

  if (!fullPath.startsWith(DRIVE_ROOT) || fullPath === DRIVE_ROOT) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const item = moveToTrash(safePath)
  return NextResponse.json({ trashed: item })
}
