import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const { data: member } = await db
      .from('org_members')
      .select('org_id, role, permission_tier')
      .eq('user_id', userId)
      .single()

    if (!member?.org_id) {
      return NextResponse.json({ org: null, departments: [], agents: [], audit: [] })
    }

    const orgId = member.org_id

    const [orgRes, deptsRes, agentsRes, auditRes] = await Promise.all([
      db.from('organizations').select('*').eq('id', orgId).single(),
      db.from('departments').select('*').eq('org_id', orgId),
      db.from('agents').select('*').eq('org_id', orgId).catch(() => ({ data: [] })),
      db.from('audit_log').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(10).catch(() => ({ data: [] })),
    ])

    return NextResponse.json({
      org: orgRes.data,
      membership: member,
      departments: deptsRes.data || [],
      agents: agentsRes.data || [],
      audit: auditRes.data || [],
    })
  } catch (error) {
    console.error('org/data error:', error)
    return NextResponse.json({ error: 'Failed to load org data' }, { status: 500 })
  }
}
