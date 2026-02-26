// API layer — fetches from Supabase with fallback to demo data
import { supabase } from './supabase'

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001'

export async function fetchDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('sort_order')
  if (error) console.error('fetchDepartments:', error.message)
  return data || []
}

export async function fetchRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('tenant_id', TENANT_ID)
  if (error) console.error('fetchRoles:', error.message)
  return data || []
}

export async function fetchAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*, departments(name, icon)')
    .eq('tenant_id', TENANT_ID)
  if (error) console.error('fetchAgents:', error.message)
  return data || []
}

export async function fetchTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, departments!tickets_target_department_id_fkey(name)')
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })
  if (error) console.error('fetchTickets:', error.message)
  return data || []
}

export async function fetchSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('vote_count', { ascending: false })
  if (error) console.error('fetchSuggestions:', error.message)
  return data || []
}

export async function fetchAuditLog(limit = 50) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) console.error('fetchAuditLog:', error.message)
  return data || []
}

export async function fetchPolicies() {
  const { data, error } = await supabase
    .from('rkbac_policies')
    .select('*')
    .eq('tenant_id', TENANT_ID)
  if (error) console.error('fetchPolicies:', error.message)
  return data || []
}

export async function fetchDataCategories() {
  const { data, error } = await supabase
    .from('data_categories')
    .select('*')
    .eq('tenant_id', TENANT_ID)
  if (error) console.error('fetchDataCategories:', error.message)
  return data || []
}

// Create records
export async function createTicket(ticket: {
  title: string
  description: string
  target_department_id: string
  priority?: string
  category?: string
}) {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      ...ticket,
      tenant_id: TENANT_ID,
      requester_id: 'demo-user',
      status: 'new',
      priority: ticket.priority || 'medium',
      source: 'chat',
    })
    .select()
    .single()
  if (error) console.error('createTicket:', error.message)
  return { data, error }
}

export async function createSuggestion(suggestion: {
  title: string
  description: string
}) {
  const { data, error } = await supabase
    .from('suggestions')
    .insert({
      ...suggestion,
      tenant_id: TENANT_ID,
      submitted_by: 'demo-user',
      status: 'new',
      vote_count: 1,
    })
    .select()
    .single()
  if (error) console.error('createSuggestion:', error.message)
  return { data, error }
}

export async function logAudit(action: string, details: Record<string, unknown> = {}) {
  return supabase.from('audit_log').insert({
    tenant_id: TENANT_ID,
    action,
    details,
    severity: 'info',
  })
}
