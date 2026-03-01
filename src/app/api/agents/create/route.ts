import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description, department, capabilities, systems, aiModel, emoji, permissionTier } = body

    if (!userId || !name || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: member } = await db
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .single()

    if (!member?.org_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const { data: dept } = await db
      .from('departments')
      .select('id')
      .eq('org_id', member.org_id)
      .eq('name', department)
      .single()

    const { data: agent, error } = await db
      .from('agents')
      .insert({
        org_id: member.org_id,
        department_id: dept?.id || null,
        name,
        description: description || null,
        status: 'active',
        capabilities: capabilities || [],
        connected_systems: systems || [],
        model: aiModel || 'claude-4-sonnet',
        icon: emoji || '🤖',
        permission_tier: (() => {
          const tierMap: Record<string, number> = { 'Tier 1 Owner/Executive': 1, 'Tier 2 Dept Head': 2, 'Tier 3 Manager': 3, 'Tier 4 Specialist': 4 }
          return tierMap[permissionTier] || 3
        })(),
      })
      .select('*, department:departments(id, name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
