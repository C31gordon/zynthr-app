import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

interface SaveOrgBody {
  userId: string
  orgName: string
  industry: string
  companySize: string
  contactName?: string
  contactEmail?: string
  departments: { name: string; icon?: string; description?: string }[]
  teamMembers?: { name: string; email: string; department: string; tier: number }[]
  integrations?: string[]
  baa?: { signerName: string; signerTitle: string; orgName: string } | null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveOrgBody
    const { userId, orgName, industry, companySize, departments, teamMembers, baa } = body

    if (!userId || !orgName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already has an org
    const { data: existingMember } = await db
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .single()

    let orgId: string

    if (existingMember?.org_id) {
      orgId = existingMember.org_id
      // Update existing org
      await db.from('organizations')
        .update({
          name: orgName,
          industry,
          hipaa_required: industry === 'healthcare',
          settings: { companySize, contactName: body.contactName, contactEmail: body.contactEmail },
        })
        .eq('id', orgId)
    } else {
      // Create new org
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const { data: newOrg, error: orgError } = await db
        .from('organizations')
        .insert({
          name: orgName,
          slug,
          industry,
          plan: 'free',
          owner_id: userId,
          hipaa_required: industry === 'healthcare',
          settings: { companySize, contactName: body.contactName, contactEmail: body.contactEmail },
        })
        .select()
        .single()

      if (orgError || !newOrg) {
        return NextResponse.json({ error: orgError?.message || 'Failed to create org' }, { status: 500 })
      }
      orgId = newOrg.id

      // Create membership
      await db.from('org_members').insert({
        org_id: orgId,
        user_id: userId,
        role: 'owner',
        permission_tier: 100,
        status: 'active',
      })
    }

    // Delete existing departments and recreate
    await db.from('departments').delete().eq('org_id', orgId)

    if (departments?.length) {
      const deptInserts = departments.map(d => ({
        org_id: orgId,
        name: d.name,
        icon: d.icon || null,
        description: d.description || null,
        status: 'active',
      }))
      await db.from('departments').insert(deptInserts)
    }

    // Save BAA if signed
    if (baa) {
      await db.from('agreements').upsert({
        org_id: orgId,
        type: 'baa',
        signer_name: baa.signerName,
        signer_title: baa.signerTitle,
        org_name: baa.orgName,
        signed_at: new Date().toISOString(),
        method: 'digital',
        status: 'signed',
      }, { onConflict: 'org_id,type' }).select()
    }

    // Log team member invites (actual invite system is future work)
    if (teamMembers?.length) {
      console.log(`Team invites for org ${orgId}:`, teamMembers)
    }

    return NextResponse.json({
      success: true,
      orgId,
      departments: departments?.length || 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('save-org-setup error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
