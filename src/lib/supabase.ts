import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// Service role client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  { auth: { persistSession: false } }
)

// Database types
export type RoleTier = 'owner' | 'department_head' | 'manager' | 'specialist'
export type AgentStatus = 'active' | 'paused' | 'configuring' | 'error'
export type BotStatus = 'active' | 'paused' | 'configuring' | 'error'
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_on_requester' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SuggestionStatus = 'new' | 'under_review' | 'planned' | 'building' | 'shipped' | 'declined'
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted'
export type ExceptionDuration = 'one_time' | '30_days' | '60_days' | '90_days' | 'custom' | 'permanent'
export type ExceptionStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'revoked'
export type MemoryScope = 'core' | 'department' | 'agent' | 'bot'

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  brand_primary: string
  brand_secondary: string
  plan: string
}

export interface Department {
  id: string
  tenant_id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
}

export interface Role {
  id: string
  tenant_id: string
  name: string
  tier: RoleTier
  department_id: string | null
}

export interface AppUser {
  id: string
  auth_id: string
  tenant_id: string
  role_id: string
  department_id: string | null
  email: string
  full_name: string
  avatar_url: string | null
  is_active: boolean
  dashboard_config: Record<string, unknown>
  settings: Record<string, unknown>
  role?: Role
  department?: Department
  tenant?: Tenant
}

export interface Agent {
  id: string
  tenant_id: string
  department_id: string
  name: string
  description: string | null
  avatar_url: string | null
  status: AgentStatus
  owner_user_id: string | null
  capabilities: string[]
  department?: Department
}

export interface Bot {
  id: string
  tenant_id: string
  agent_id: string
  department_id: string
  name: string
  description: string | null
  icon: string | null
  status: BotStatus
  bot_type: string | null
  capabilities: string[]
}

export interface Ticket {
  id: string
  tenant_id: string
  ticket_number: number
  title: string
  description: string
  requester_id: string
  target_department_id: string
  assigned_to: string | null
  status: TicketStatus
  priority: TicketPriority
  category: string | null
  created_at: string
  updated_at: string
  requester?: AppUser
  target_department?: Department
}

export interface Suggestion {
  id: string
  tenant_id: string
  suggestion_number: number
  title: string
  description: string
  submitted_by: string
  status: SuggestionStatus
  vote_count: number
  created_at: string
}

export interface Notification {
  id: string
  title: string
  body: string | null
  type: string
  is_read: boolean
  created_at: string
}

// Demo mode flag
export const DEMO_MODE = false

// Demo user for unauthenticated browsing
export const DEMO_USER = {
  id: 'demo-user',
  email: 'cgordon@risere.com',
  full_name: 'Courtney Gordon',
  role: 'COO',
  tier: 'owner' as RoleTier,
  tenant: 'RISE Real Estate',
}
