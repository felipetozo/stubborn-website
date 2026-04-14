import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { DRIVE_ROOT, TRASH_DIR, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

interface RecentFile {
  name: string
  path: string
  size: number
  modified: string
  type: 'file'
}

function walkFiles(dir: string, root: string): RecentFile[] {
  const results: RecentFile[] = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (fullPath.startsWith(TRASH_DIR)) continue // skip trash

    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, root))
    } else {
      const stat = fs.statSync(fullPath)
      results.push({
        name:     entry.name,
        path:     path.relative(root, fullPath),
        size:     stat.size,
        modified: stat.mtime.toISOString(),
        type:     'file',
      })
    }
  }
  return results
}

export async function GET() {
  ensureDirs()
  const all = walkFiles(DRIVE_ROOT, DRIVE_ROOT)
  all.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  return NextResponse.json({ files: all.slice(0, 50) })
}
