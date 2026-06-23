import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DRIVE_ROOT, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

interface FolderNode {
  name: string
  path: string
  depth: number
}

function walk(dir: string, rel: string, depth: number, out: FolderNode[]) {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue
    const relPath = rel ? `${rel}/${e.name}` : e.name
    out.push({ name: e.name, path: relPath, depth })
    walk(path.join(dir, e.name), relPath, depth + 1, out)
  }
}

export async function GET() {
  ensureDirs()
  const out: FolderNode[] = []
  walk(DRIVE_ROOT, '', 0, out)
  out.sort((a, b) => a.path.localeCompare(b.path))
  return NextResponse.json({ folders: out })
}
