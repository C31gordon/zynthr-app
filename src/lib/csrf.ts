import { randomBytes, createHmac } from 'crypto'
import { cookies } from 'next/headers'

const CSRF_SECRET = process.env.CSRF_SECRET || 'milliebot-csrf-secret-change-in-prod'
const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  const hmac = createHmac('sha256', CSRF_SECRET).update(token).digest('hex')
  return `${token}.${hmac}`
}

export function validateCsrfToken(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [value, sig] = parts
  const expected = createHmac('sha256', CSRF_SECRET).update(value).digest('hex')
  return sig === expected
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })
  return token
}

export async function verifyCsrfFromRequest(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER)
  if (!headerToken) return false

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  if (!cookieToken) return false

  return headerToken === cookieToken && validateCsrfToken(cookieToken)
}
