const COOKIE_NAME = 'stubborn_admin_session'

function getSecret(): string {
  return process.env.ADMIN_SECRET || 'stubborn-admin-fallback-secret-change-in-prod'
}

async function hmac(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function signToken(value: string): Promise<string> {
  const sig = await hmac(value)
  return `${value}.${sig}`
}

export async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const value = token.substring(0, lastDot)
  const sig = token.substring(lastDot + 1)
  const expected = await hmac(value)
  return sig === expected && value === 'authenticated'
}

export { COOKIE_NAME }
