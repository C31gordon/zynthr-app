'use client'

import { useState, useEffect } from 'react'
import { getPolicies } from '@/lib/data'

type PolicyTier = 'owner' | 'department_head' | 'manager' | 'specialist'
type ExceptionStatus = 'active' | 'pending' | 'expired' | 'denied'
type ExceptionDuration = 'one-time' | '30-days' | '60-days' | '90-days' | 'custom' | 'permanent'

interface PolicyRow {
  id: string
  name: string
  description: string | null
  policy_type: string
  active: boolean
  created_at: string
  updated_at: string
}

interface ExceptionWaiver {
  id: string
  policyId: string
  policyName: string
  requestedBy: string
  department: string
  reason: string
  duration: ExceptionDuration
  expiresAt: string
  status: ExceptionStatus
  approvedBy: string | null
  requestedAt: string
  riskLevel: 'low' | 'medium' | 'high'
}

// Static exceptions for now (exception_waivers table may not exist yet)
const exceptions: ExceptionWaiver[] = [
  {
    id: 'EXC-001', policyId: 'POL-001', policyName: 'Financial Data Access',
    requestedBy: 'Sarah Chen', department: 'Marketing',
    reason: 'Need revenue data for Q1 marketing ROI report to present at leadership meeting',
    duration: '30-days', expiresAt: 'Mar 25, 2026', status: 'active',
    approvedBy: 'Courtney Gordon', requestedAt: 'Feb 23, 2026', riskLevel: 'medium',
  },
  {
    id: 'EXC-002', policyId: 'POL-003', policyName: 'Operations SOP Sharing',
    requestedBy: 'Mona Vogel', department: 'Training',
    reason: 'Building new-hire training module that references move-in/move-out SOPs',
    duration: '60-days', expiresAt: 'Apr 24, 2026', status: 'active',
    approvedBy: 'Courtney Gordon', requestedAt: 'Feb 22, 2026', riskLevel: 'low',
  },
  {
    id: 'EXC-003', policyId: 'POL-003', policyName: 'Operations SOP Sharing',
    requestedBy: 'Brett Johnson', department: 'HR',
    reason: 'Need lease renewal process docs for HR compliance audit',
    duration: 'one-time', expiresAt: 'One-time access', status: 'pending',
    approvedBy: null, requestedAt: 'Feb 25, 2026', riskLevel: 'low',
  },
]

const tierColors: Record<PolicyTier, string> = {
  owner: 'var(--red)', department_head: 'var(--orange)', manager: 'var(--blue)', specialist: 'var(--text4)',
}

const tierLabels: Record<PolicyTier, string> = {
  owner: 'Owner', department_head: 'Department Head', manager: 'Manager', specialist: 'Specialist',
}

const policyTypeToTier: Record<string, PolicyTier> = {
  owner_only: 'owner', deny: 'department_head', allow: 'manager',
}

const riskColors: Record<string, string> = {
  low: 'var(--green)', medium: 'var(--orange)', high: 'var(--red)',
}

export default function PoliciesView() {
  const [tab, setTab] = useState<'policies' | 'exceptions'>('policies')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)
  const [policies, setPolicies] = useState<PolicyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPolicies().then((data) => { setPolicies(data as PolicyRow[]); setLoading(false) })
  }, [])

  const pendingExceptions = exceptions.filter(e => e.status === 'pending').length

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading policies...</p></div>
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Access Policies</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Manage who can see what — roles, knowledge boundaries, and exception waivers
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}>
          + New Policy
        </button>
      </div>

      {/* RKBAC Overview Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
            RKBAC™ Permission Hierarchy
          </span>
          <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full" style={{ background: 'var(--green)22', color: 'var(--green)' }}>
            All Systems Normal
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['owner', 'department_head', 'manager', 'specialist'] as PolicyTier[]).map((tier, i) => (
            <div key={tier} className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-lg text-center" style={{
                background: `${tierColors[tier]}15`, border: `1px solid ${tierColors[tier]}40`, minWidth: '170px',
              }}>
                <div className="text-xs font-medium" style={{ color: tierColors[tier] }}>{tierLabels[tier]}</div>
                <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text4)' }}>
                  {tier === 'owner' ? 'Full access • Immutable rules' :
                   tier === 'department_head' ? 'Department scope • Sandboxed' :
                   tier === 'manager' ? 'Team scope • Restricted' : 'Task scope • Read-only default'}
                </div>
              </div>
              {i < 3 && <span style={{ color: 'var(--text4)' }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg2)' }}>
        <button onClick={() => setTab('policies')}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
          style={{ background: tab === 'policies' ? 'var(--bg3)' : 'transparent', color: tab === 'policies' ? 'var(--text)' : 'var(--text4)' }}>
          Policies ({policies.length})
        </button>
        <button onClick={() => setTab('exceptions')}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative"
          style={{ background: tab === 'exceptions' ? 'var(--bg3)' : 'transparent', color: tab === 'exceptions' ? 'var(--text)' : 'var(--text4)' }}>
          Exception Waivers ({exceptions.length})
          {pendingExceptions > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'var(--orange)', color: 'white' }}>{pendingExceptions}</span>
          )}
        </button>
      </div>

      {/* Policies Tab */}
      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.map(policy => {
            const tier = policyTypeToTier[policy.policy_type] || 'manager'
            const isImmutable = policy.policy_type === 'owner_only'
            return (
              <div key={policy.id} className="glass-card rounded-xl overflow-hidden">
                <div className="p-4 cursor-pointer hover:opacity-90 transition-all"
                  onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${tierColors[tier]}15` }}>
                        <span style={{ color: tierColors[tier] }}>{isImmutable ? '🔒' : '📦'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: 'var(--text)' }}>{policy.name}</span>
                          <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                            style={{ background: `${tierColors[tier]}22`, color: tierColors[tier] }}>
                            {tierLabels[tier]}
                          </span>
                          <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                            {isImmutable ? '🔒 Immutable' : '📦 Sandboxed'}
                          </span>
                          <span className={`text-[11px] px-2.5 py-1 rounded-full ${policy.active ? '' : 'opacity-50'}`}
                            style={{ background: policy.active ? 'var(--green)22' : 'var(--text4)22', color: policy.active ? 'var(--green)' : 'var(--text4)' }}>
                            {policy.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{policy.description}</p>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text4)', transform: expandedPolicy === policy.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </div>
                </div>

                {expandedPolicy === policy.id && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="pt-3 text-xs space-y-1" style={{ color: 'var(--text3)' }}>
                      <div>Type: <strong>{policy.policy_type}</strong></div>
                      <div>Created: {new Date(policy.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Exceptions Tab */}
      {tab === 'exceptions' && (
        <div className="space-y-3">
          {exceptions.map(exc => (
            <div key={exc.id} className="glass-card p-4 rounded-xl" style={{
              borderLeft: `3px solid ${exc.status === 'pending' ? 'var(--orange)' : exc.status === 'active' ? 'var(--green)' : 'var(--text4)'}`,
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{exc.requestedBy}</span>
                    <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{exc.department}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text4)' }}>→</span>
                    <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{exc.policyName}</span>
                  </div>
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text2)' }}>{exc.reason}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: 'var(--text4)' }}>
                    <span>📅 Requested: {exc.requestedAt}</span>
                    <span>⏱ Duration: {exc.duration}</span>
                    <span style={{ color: riskColors[exc.riskLevel] }}>● Risk: {exc.riskLevel.charAt(0).toUpperCase() + exc.riskLevel.slice(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exc.status === 'pending' ? (
                    <>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--green)22', color: 'var(--green)' }}>✅ Approve</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--red)15', color: 'var(--red)' }}>❌ Deny</button>
                    </>
                  ) : (
                    <span className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: exc.status === 'active' ? 'var(--green)22' : 'var(--text4)22', color: exc.status === 'active' ? 'var(--green)' : 'var(--text4)' }}>
                      {exc.status === 'active' ? '✅ Approved' : '❌ Denied'}
                    </span>
                  )}
                </div>
              </div>
              {exc.approvedBy && <div className="text-[11px] mt-2" style={{ color: 'var(--text4)' }}>Approved by {exc.approvedBy}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
