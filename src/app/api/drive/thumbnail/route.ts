import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { spawnSync } from 'child_process'
import sharp from 'sharp'
import { DRIVE_ROOT, sanitizePath, ensureDirs } from '@/lib/driveTrash'

export const runtime = 'nodejs'

const THUMB_DIR = path.join(DRIVE_ROOT, '.thumbs')
const THUMB_SIZE = 480

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'avif', 'tiff', 'tif']
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v']

function fileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || ''
}

// ── ffmpeg discovery (cached per process) ─────────────────────────────────────
let ffmpegResolved = false
let ffmpegBin: string | null = null
function findFfmpeg(): string | null {
  if (ffmpegResolved) return ffmpegBin
  ffmpegResolved = true
  for (const cand of ['ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg']) {
    try {
      const r = spawnSync(cand, ['-version'], { stdio: 'ignore' })
      if (r.status === 0) { ffmpegBin = cand; break }
    } catch { /* keep looking */ }
  }
  return ffmpegBin
}

function serveWebp(cachePath: string): NextResponse {
  const buf = fs.readFileSync(cachePath)
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(buf.length),
      // key includes mtime+size, so a changed file gets a new url → safe to cache hard
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function GET(request: NextRequest) {
  ensureDirs()
  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true })

  const safePath = sanitizePath(request.nextUrl.searchParams.get('path') || '')
  const fullPath = path.join(DRIVE_ROOT, safePath)

  if (!safePath || !fullPath.startsWith(DRIVE_ROOT)) {
    return new NextResponse('Invalid path', { status: 400 })
  }
  if (!fs.existsSync(fullPath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) {
    return new NextResponse('Is a directory', { status: 400 })
  }

  // `name` lets trashed files (stored on disk as a UUID) keep their real extension
  const displayName = request.nextUrl.searchParams.get('name') || path.basename(fullPath)
  const ext = fileExt(displayName)
  const isImage = IMAGE_EXTS.includes(ext)
  const isVideo = VIDEO_EXTS.includes(ext)

  if (!isImage && !isVideo) {
    return new NextResponse('Not thumbnailable', { status: 415 })
  }

  const key = crypto
    .createHash('sha1')
    .update(`${safePath}:${stat.mtimeMs}:${stat.size}`)
    .digest('hex')
  const cachePath = path.join(THUMB_DIR, `${key}.webp`)

  if (fs.existsSync(cachePath)) {
    return serveWebp(cachePath)
  }

  try {
    if (isImage) {
      await sharp(fullPath, { sequentialRead: true, failOn: 'none' })
        .rotate()
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(cachePath)
    } else {
      const ff = findFfmpeg()
      if (!ff) return new NextResponse('No video thumbnailer', { status: 415 })

      const tmp = path.join(os.tmpdir(), `drive-thumb-${key}.png`)
      // input-seek (-ss before -i) is fast even on huge files; grab one frame ~1s in
      const r = spawnSync(
        ff,
        ['-y', '-ss', '1', '-i', fullPath, '-frames:v', '1', '-vf', `scale=${THUMB_SIZE}:-1`, tmp],
        { stdio: 'ignore', timeout: 20000 }
      )
      if (r.status !== 0 || !fs.existsSync(tmp)) {
        return new NextResponse('Video thumbnail failed', { status: 415 })
      }
      await sharp(tmp).webp({ quality: 72 }).toFile(cachePath)
      try { fs.unlinkSync(tmp) } catch { /* best effort */ }
    }
  } catch {
    return new NextResponse('Thumbnail failed', { status: 415 })
  }

  return serveWebp(cachePath)
}
