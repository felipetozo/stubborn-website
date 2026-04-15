import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export const runtime = 'nodejs'

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

export async function POST(request: NextRequest) {
  let paths: string[]
  try {
    const body = await request.json()
    paths = body.paths
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({ error: 'No paths provided' }, { status: 400 })
  }

  const validItems = paths
    .map(p => {
      const safe = sanitizePath(p)
      const full = path.join(DRIVE_ROOT, safe)
      if (!full.startsWith(DRIVE_ROOT)) return null
      if (!fs.existsSync(full)) return null
      return { full, name: path.basename(full) }
    })
    .filter((item): item is { full: string; name: string } => item !== null)

  if (validItems.length === 0) {
    return NextResponse.json({ error: 'No valid paths found' }, { status: 400 })
  }

  return new Promise<NextResponse>((resolve) => {
    const archive = archiver('zip', { zlib: { level: 6 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => chunks.push(chunk))

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks)
      resolve(
        new NextResponse(buffer, {
          headers: {
            'Content-Disposition': 'attachment; filename="download.zip"',
            'Content-Type': 'application/zip',
            'Content-Length': buffer.length.toString(),
          },
        })
      )
    })

    archive.on('error', () => {
      resolve(NextResponse.json({ error: 'Failed to create archive' }, { status: 500 }))
    })

    for (const item of validItems) {
      const stat = fs.statSync(item.full)
      if (stat.isDirectory()) {
        archive.directory(item.full, item.name)
      } else {
        archive.file(item.full, { name: item.name })
      }
    }

    archive.finalize()
  })
}
