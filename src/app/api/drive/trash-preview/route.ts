import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { TRASH_DIR, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  bmp: 'image/bmp', avif: 'image/avif',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  avi: 'video/x-msvideo', mkv: 'video/x-matroska', m4v: 'video/x-m4v',
}

function getMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return MIME_TYPES[ext] || 'application/octet-stream'
}

export async function GET(request: NextRequest) {
  ensureDirs()
  const id   = request.nextUrl.searchParams.get('id')   || ''
  const name = request.nextUrl.searchParams.get('name') || ''

  if (!id || id.includes('/') || id.includes('..')) {
    return new NextResponse('Invalid id', { status: 400 })
  }

  const fullPath = path.join(TRASH_DIR, id)

  if (!fullPath.startsWith(TRASH_DIR) || !fs.existsSync(fullPath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) return new NextResponse('Is a directory', { status: 400 })

  const mime     = getMime(name)
  const fileSize = stat.size
  const range    = request.headers.get('range')

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
    const start    = parseInt(startStr, 10)
    const end      = endStr ? parseInt(endStr, 10) : fileSize - 1
    const chunk    = end - start + 1
    const stream   = fs.createReadStream(fullPath, { start, end })
    const webStream = new ReadableStream({
      start(c) { stream.on('data', d => c.enqueue(d)); stream.on('end', () => c.close()); stream.on('error', e => c.error(e)) },
      cancel() { stream.destroy() },
    })
    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk),
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  const stream = fs.createReadStream(fullPath)
  const webStream = new ReadableStream({
    start(c) { stream.on('data', d => c.enqueue(d)); stream.on('end', () => c.close()); stream.on('error', e => c.error(e)) },
    cancel() { stream.destroy() },
  })
  return new NextResponse(webStream, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(fileSize),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
