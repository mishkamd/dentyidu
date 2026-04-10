import crypto from "crypto"

const getSecret = () => process.env.SESSION_SECRET || process.env.DATABASE_URL || 'fallback-secret'

// Sign admin ID into a session token to prevent session fixation
export function createSessionToken(adminId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex')
  const payload = `${adminId}:${nonce}`
  const hmac = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
  return `${payload}:${hmac}`
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(':')
  if (parts.length !== 3) return null
  const [adminId, nonce, hmac] = parts
  const expected = crypto.createHmac('sha256', getSecret()).update(`${adminId}:${nonce}`).digest('hex')
  if (hmac.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) return null
  return adminId
}
