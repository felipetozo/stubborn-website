import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

function ensureRoot() {
  if (!fs.existsSync(DRIVE_ROOT)) {
    fs.mkdirSync(DRIVE_ROOT, { recursive: true })
  }
}

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

export async function GET(request: NextRequest) {
  ensureRoot()

  const folderPath = request.nextUrl.searchParams.get('path') || ''
  const safePath = sanitizePath(folderPath)
  const fullPath = path.join(DRIVE_ROOT, safePath)

  if (!fullPath.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Path not found' }, { status: 404 })
  }

  const stat = fs.statSync(fullPath)
  if (!stat.isDirectory()) {
    return NextResponse.json({ error: 'Not a directory' }, { status: 400 })
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true })

  const files = entries
    .filter(e => !e.name.startsWith('.'))
    .map(entry => {
      const entryPath = path.join(fullPath, entry.name)
      const stats = fs.statSync(entryPath)
      const relativePath = safePath ? `${safePath}/${entry.name}` : entry.name
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: entry.isFile() ? stats.size : null,
        modified: stats.mtime.toISOString(),
        path: relativePath,
      }
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  return NextResponse.json({ files, currentPath: safePath })
}
