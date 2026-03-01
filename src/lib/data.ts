/* eslint-disable @typescript-eslint/no-explicit-any */
// Data service layer — fetches via server-side API to bypass RLS
import { supabase } from './supabase'
import type { Agent, Bot, Ticket, Suggestion, AppUser, Department } from './supabase'

// Cache the org data fetch
let orgDataCache: { data: OrgData | null; fetchedAt: number } = { data: null, fetchedAt: 0 }
const CACHE_TTL = 10000 // 10 seconds

interface OrgData {
  org: Record<string, unknown> | null
  membership: Record<string, unknown> | null
  departments: any[]
  agents: any[]
  audit: any[]
}

async function fetchOrgData(userId?: string): Promise<OrgData> {
  if (!userId) return { org: null, membership: null, departments: [], agents: [], audit: [] }

  const now = Date.now()
  if (orgDataCache.data && now - orgDataCache.fetchedAt < CACHE_TTL) {
    return orgDataCache.data
  }

  try {
    const res = await fetch(`/api/org/data?userId=${userId}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch org data')
    const data = await res.json() as OrgData
    orgDataCache = { data, fetchedAt: now }
    return data
  } catch (e) {
    console.error('fetchOrgData:', e)
    return { org: null, membership: null, departments: [], agents: [], audit: [] }
  }
}

// Get current user ID from supabase session
async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

export async function getAgents() {
  const userId = await getCurrentUserId()
  const data = await fetchOrgData(userId || undefined)
  return data.agents || []
}

export async function getBots() {
  return [] // Bots table may not exist yet
}

export async function getTickets() {
  return [] // Tickets not yet implemented
}

export async function getSuggestions() {
  return [] // Suggestions not yet implemented
}

export async function getUsers() {
  return [] // Users list via separate API later
}

export async function getDepartments() {
  const userId = await getCurrentUserId()
  const data = await fetchOrgData(userId || undefined)
  return data.departments || []
}

export async function getAuditLog(limit = 50) {
  const userId = await getCurrentUserId()
  const data = await fetchOrgData(userId || undefined)
  return (data.audit || []).slice(0, limit)
}

export async function getPolicies() {
  return [] // Policies not yet implemented
}

export type { Agent, Bot, Ticket, Suggestion, AppUser, Department }
