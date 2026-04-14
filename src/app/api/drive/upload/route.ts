import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 300

const DRIVE_ROOT = path.join(process.cwd(), 'drive-storage')

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath).replace(/^(\.\.[/\\])+/, '')
  return normalized === '.' ? '' : normalized
}

function sanitizeFileName(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._\-\s()[\]{}]/g, '_')
}

export async function POST(request: NextRequest) {
  const folderPath = request.nextUrl.searchParams.get('path') || ''
  const safePath = sanitizePath(folderPath)
  const uploadDir = path.join(DRIVE_ROOT, safePath)

  if (!uploadDir.startsWith(DRIVE_ROOT)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const formData = await request.formData()
  const uploadedFiles: string[] = []
  const errors: string[] = []

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      try {
        // Preserve relative path for folder uploads
        const relativeName = (value as File & { webkitRelativePath?: string }).webkitRelativePath || value.name
        const safeName = relativeName
          .split('/')
          .map(sanitizeFileName)
          .join('/')

        const targetPath = path.join(uploadDir, safeName)

        if (!targetPath.startsWith(DRIVE_ROOT)) {
          errors.push(`Skipped: ${value.name}`)
          continue
        }

        // Ensure parent directory exists (for folder uploads)
        const parentDir = path.dirname(targetPath)
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true })
        }

        const buffer = Buffer.from(await value.arrayBuffer())
        fs.writeFileSync(targetPath, buffer)
        uploadedFiles.push(safeName)
      } catch {
        errors.push(value.name)
      }
    }
  }

  return NextResponse.json({ uploaded: uploadedFiles, errors })
}
