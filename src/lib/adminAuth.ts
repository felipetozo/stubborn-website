import { createHmac } from 'crypto'

const COOKIE_NAME = 'stubborn_admin_session'

function getSecret(): string {
  return process.env.ADMIN_SECRET || 'stubborn-admin-fallback-secret-change-in-prod'
}

export function signToken(value: string): string {
  const sig = createHmac('sha256', getSecret()).update(value).digest('hex')
  return `${value}.${sig}`
}

export function verifyToken(token: string): boolean {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const value = token.substring(0, lastDot)
  const sig = token.substring(lastDot + 1)
  const expected = createHmac('sha256', getSecret()).update(value).digest('hex')
  return sig === expected && value === 'authenticated'
}

export { COOKIE_NAME }
