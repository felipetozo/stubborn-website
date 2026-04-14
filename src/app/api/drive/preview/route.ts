import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif',
  // Videos
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  avi: 'video/x-msvideo', mkv: 'video/x-matroska', m4v: 'video/x-m4v',
  wmv: 'video/x-ms-wmv',
  // Audio
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  flac: 'audio/flac', aac: 'audio/aac', m4a: 'audio/x-m4a',
  // Docs
  pdf: 'application/pdf',
}

function getMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path') || ''
  const safePath = sanitizePath(filePath)
  const fullPath = path.join(DRIVE_ROOT, safePath)

  if (!fullPath.startsWith(DRIVE_ROOT)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (!fs.existsSync(fullPath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) {
    return new NextResponse('Is a directory', { status: 400 })
  }

  const mime = getMime(path.basename(fullPath))
  const fileSize = stat.size
  const rangeHeader = request.headers.get('range')

  if (rangeHeader) {
    // Partial content — needed for video seeking
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-')
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1
    const chunkSize = end - start + 1

    const nodeStream = fs.createReadStream(fullPath, { start, end })
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', chunk => controller.enqueue(chunk))
        nodeStream.on('end', () => controller.close())
        nodeStream.on('error', err => controller.error(err))
      },
      cancel() {
        nodeStream.destroy()
      },
    })

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  // Full file
  const nodeStream = fs.createReadStream(fullPath)
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', chunk => controller.enqueue(chunk))
      nodeStream.on('end', () => controller.close())
      nodeStream.on('error', err => controller.error(err))
    },
    cancel() {
      nodeStream.destroy()
    },
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
