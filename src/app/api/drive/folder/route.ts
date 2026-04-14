import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

export async function POST(request: NextRequest) {
  const { folderPath, name } = await request.json()

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
  }

  const safePath = sanitizePath(folderPath || '')
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._\-\s]/g, '_')
  const fullPath = path.join(DRIVE_ROOT, safePath, safeName)

  if (!fullPath.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Folder already exists' }, { status: 409 })
  }

  fs.mkdirSync(fullPath, { recursive: true })

  return NextResponse.json({ created: safeName })
}
