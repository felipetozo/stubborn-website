import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path') || ''
  const safePath = sanitizePath(filePath)
  const fullPath = path.join(DRIVE_ROOT, safePath)

  if (!fullPath.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) {
    return NextResponse.json({ error: 'Cannot download a directory' }, { status: 400 })
  }

  const buffer = fs.readFileSync(fullPath)
  const fileName = path.basename(fullPath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size.toString(),
    },
  })
}
