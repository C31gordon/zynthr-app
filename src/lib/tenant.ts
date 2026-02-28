export const RESERVED_SUBDOMAINS = [
  'app', 'www', 'api', 'admin', 'mail', 'smtp', 'docs',
  'help', 'support', 'status', 'blog', 'billing',
]

export interface TenantInfo {
  subdomain: string
  fullDomain: string
}

export function getTenantFromSubdomain(): TenantInfo | null {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname
  const match = hostname.match(/^([a-z0-9][a-z0-9-]*[a-z0-9])\.zynthr\.ai$/)
  if (!match) return null
  const subdomain = match[1]
  if (RESERVED_SUBDOMAINS.includes(subdomain)) return null
  return { subdomain, fullDomain: `${subdomain}.zynthr.ai` }
}

export function getTenantFromStorage(): TenantInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('zynthr_user')
    if (!raw) return null
    const user = JSON.parse(raw)
    if (user.subdomain) {
      return { subdomain: user.subdomain, fullDomain: `${user.subdomain}.zynthr.ai` }
    }
  } catch { /* ignore */ }
  return null
}

export function validateSubdomain(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: 'Subdomain is required' }
  if (value.length < 3) return { valid: false, error: 'Must be at least 3 characters' }
  if (value.length > 30) return { valid: false, error: 'Must be 30 characters or fewer' }
  if (value.startsWith('-') || value.endsWith('-')) {
    return { valid: false, error: 'Cannot start or end with a hyphen' }
  }
  if (!/^[a-z0-9-]+$/.test(value)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens' }
  }
  if (RESERVED_SUBDOMAINS.includes(value)) {
    return { valid: false, error: 'This subdomain is reserved' }
  }
  return { valid: true }
}

export function isSubdomainTaken(value: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const users = JSON.parse(localStorage.getItem('zynthr_users') || '[]')
    return users.some((u: { subdomain?: string }) => u.subdomain === value)
  } catch { return false }
}
