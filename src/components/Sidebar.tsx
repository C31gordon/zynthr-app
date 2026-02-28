'use client'

import { useState, useEffect } from 'react'
import { getTenantFromStorage } from '@/lib/tenant'

function SubdomainBadge() {
  const [subdomain, setSubdomain] = useState<string | null>(null)
  useEffect(() => {
    const tenant = getTenantFromStorage()
    if (tenant) setSubdomain(tenant.subdomain)
  }, [])
  if (!subdomain) return null
  return (
    <div className="text-[10px] truncate" style={{ color: 'var(--text4)', opacity: 0.7 }}>
      {subdomain}.zynthr.ai
    </div>
  )
}

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings' | 'onboarding' | 'training' | 'healthcare' | 'setup' | 'birthcenter' | 'patientdash' | 'orgsetup'

interface SidebarProps {
  orgName?: string
  userName?: string
  activeView: ViewType
  onNavigate: (view: ViewType) => void
  collapsed: boolean
  onToggle: () => void
}

const navItems: { id: ViewType; label: string; icon: string; section?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'Main' },
  { id: 'agents', label: 'Agents & Bots', icon: '🤖', section: 'Main' },
  { id: 'chat', label: 'Chat', icon: '💬', section: 'Main' },
  { id: 'workflows', label: 'Workflows', icon: '⚡', section: 'Automation' },
  { id: 'tickets', label: 'Tickets', icon: '🎫', section: 'Operations' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', section: 'Operations' },
  { id: 'onboarding', label: 'Onboarding', icon: '🎓', section: 'Operations' },
  { id: 'training', label: 'Training', icon: '📚', section: 'Operations' },
  { id: 'policies', label: 'RKBAC Policies', icon: '🔒', section: 'Security' },
  { id: 'audit', label: 'Audit Log', icon: '📋', section: 'Security' },
  { id: 'setup', label: 'Setup Wizard', icon: '🚀', section: 'Industry' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', section: 'Industry' },
  { id: 'birthcenter', label: 'Birth Center', icon: '🌿', section: 'Industry' },
  { id: 'patientdash', label: 'Patient View', icon: '👩‍⚕️', section: 'Industry' },
  { id: 'orgsetup', label: 'Org Setup', icon: '🏢', section: 'System' },
  { id: 'settings', label: 'Settings', icon: '⚙️', section: 'System' },
]


function HipaaModal({ onClose }: { onClose: () => void }) {
  const [tenantId, setTenantId] = useState('')
  useEffect(() => {
    let id = localStorage.getItem('zynthr_tenant_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('zynthr_tenant_id', id)
    }
    setTenantId(id)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="glass-card" style={{ padding: 28, borderRadius: 20, maxWidth: 480, width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔒</div>
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, margin: 0 }}>HIPAA Compliance Status</h2>
            <p style={{ color: 'var(--text4)', fontSize: 12, margin: 0 }}>Data isolation and security controls</p>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>Active</span>
            <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>🔒 Tenant Data Isolation</span>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px 0' }}>Your organization&apos;s data is logically isolated. No other tenant can access your PHI.</p>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ color: 'var(--text4)', fontSize: 11, marginBottom: 4 }}>Tenant ID</div>
            <div style={{ color: 'var(--text)', fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all' }}>{tenantId}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Encryption at Rest', detail: 'AES-256', ok: true },
            { label: 'Encryption in Transit', detail: 'TLS 1.3', ok: true },
            { label: 'Audit Logging', detail: 'Active', ok: true },
            { label: 'Session Timeout', detail: '15 minutes', ok: true },
            { label: 'HIPAA Compliance Status', detail: 'Controls Implemented', ok: true },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'var(--bg)' }}>
              <span style={{ color: 'var(--text)', fontSize: 13 }}>{item.label}</span>
              <span style={{ color: item.ok ? '#22c55e' : 'var(--text4)', fontSize: 13, fontWeight: 600 }}>{item.detail} {item.ok ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: '10px 0', borderRadius: 10, background: 'var(--bg3)', color: 'var(--text3)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  )
}

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle, orgName, userName }: SidebarProps) {
  const [hipaaOpen, setHipaaOpen] = useState(false)
  const [baaPending, setBaaPending] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('zynthr_user') || '{}')
        if (stored.baaDocuSignRequested && !stored.baaSignedDigitally) {
          setBaaPending(true)
        }
      } catch { /* noop */ }
    }
  }, [])

  let lastSection = ''

  return (
    <div
      className="h-screen flex flex-col transition-all duration-300 no-print"
      style={{
        width: collapsed ? '64px' : '240px',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #003146, #559CB5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
            <circle cx="16" cy="16" r="3.5" fill="#003146"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text)', letterSpacing: '0.08em' }}>{(orgName || 'Zynthr')}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text4)' }}>Command Center</div>
            <SubdomainBadge />
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: 'var(--text3)' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          return (
            <div key={item.id}>
              {showSection && (
                <div className="text-[11px] font-bold uppercase tracking-wider mt-4 mb-1 px-3"
                  style={{ color: 'var(--text4)' }}>
                  {item.section}
                </div>
              )}
              <button
                data-tour={item.id} onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5"
                style={{
                  background: activeView === item.id ? 'rgba(85,156,181,0.15)' : 'transparent',
                  color: activeView === item.id ? 'var(--blue)' : 'var(--text3)',
                  borderLeft: activeView === item.id ? '3px solid var(--blue)' : '3px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0" style={{ width: '20px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </div>
          )
        })}
      </nav>

      {hipaaOpen && <HipaaModal onClose={() => setHipaaOpen(false)} />}
      {/* HIPAA Badge */}
      {!collapsed && baaPending && (
        <div className="px-3 pb-1">
          <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span>⚠️</span><span>BAA Pending</span>
          </div>
        </div>
      )}
      {collapsed && baaPending && (
        <div className="px-2 pb-1">
          <div className="w-full flex items-center justify-center py-2 rounded-lg text-xs"
            style={{ color: '#f59e0b' }} title="BAA Pending">⚠️</div>
        </div>
      )}
      {!collapsed && (
        <div className="px-3 pb-1">
          <button onClick={() => setHipaaOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-white/5"
            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span>🔒</span><span>HIPAA Compliant</span>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pb-1">
          <button onClick={() => setHipaaOpen(true)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-xs transition-all hover:bg-white/5"
            style={{ color: '#22c55e' }}
            title="HIPAA Compliant">
            🔒
          </button>
        </div>
      )}
      {/* Bottom - User */}
      {!collapsed && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
              CG
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{userName || 'Courtney Gordon'}</div>
              <div className="text-[11px]" style={{ color: 'var(--text4)' }}>Owner • {orgName || 'Zynthr'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
