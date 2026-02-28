'use client'

import { useState, useEffect, useCallback } from 'react'

/* ──────────────────────── Types ──────────────────────── */

interface OrgInfo {
  name: string
  industry: string
  size: string
  contactName: string
  contactEmail: string
}

interface Department {
  id: string
  name: string
  description: string
  enabled: boolean
  defaultTier: number
}

interface Integration {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  connecting: boolean
  recommended: string[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  department: string
  tier: number
}

/* ──────────────────────── Data ──────────────────────── */

const INDUSTRIES = [
  { id: 'property', label: 'Property Management', icon: '🏠' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'finance', label: 'Finance', icon: '🏦' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { id: 'other', label: 'Other', icon: '⚙️' },
]

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

const DEPT_TEMPLATES: Record<string, Department[]> = {
  property: [
    { id: 'd1', name: 'Operations', description: 'Day-to-day property operations and management', enabled: true, defaultTier: 2 },
    { id: 'd2', name: 'Leasing', description: 'Tenant acquisition, tours, and lease administration', enabled: true, defaultTier: 3 },
    { id: 'd3', name: 'Maintenance', description: 'Work orders, preventive maintenance, and vendor coordination', enabled: true, defaultTier: 3 },
    { id: 'd4', name: 'Training', description: 'Staff development and compliance training programs', enabled: true, defaultTier: 3 },
    { id: 'd5', name: 'HR', description: 'Hiring, benefits, employee relations', enabled: true, defaultTier: 2 },
    { id: 'd6', name: 'Marketing', description: 'Brand, advertising, and resident engagement', enabled: true, defaultTier: 3 },
    { id: 'd7', name: 'Finance', description: 'Budgets, AP/AR, financial reporting', enabled: true, defaultTier: 2 },
    { id: 'd8', name: 'Compliance', description: 'Fair housing, regulatory adherence, audits', enabled: true, defaultTier: 2 },
    { id: 'd9', name: 'IT', description: 'Technology infrastructure and support', enabled: true, defaultTier: 2 },
  ],
  healthcare: [
    { id: 'd1', name: 'Front Office', description: 'Patient check-in, scheduling, and reception', enabled: true, defaultTier: 3 },
    { id: 'd2', name: 'Billing & Claims', description: 'Insurance claims, coding, and revenue cycle', enabled: true, defaultTier: 3 },
    { id: 'd3', name: 'Clinical Operations', description: 'Clinical workflows, staffing, and quality assurance', enabled: true, defaultTier: 2 },
    { id: 'd4', name: 'Compliance', description: 'HIPAA, regulatory, and accreditation management', enabled: true, defaultTier: 2 },
    { id: 'd5', name: 'Patient Experience', description: 'Patient satisfaction, feedback, and communication', enabled: true, defaultTier: 3 },
    { id: 'd6', name: 'HR', description: 'Hiring, credentialing, and employee management', enabled: true, defaultTier: 2 },
    { id: 'd7', name: 'IT', description: 'EHR systems, network, and technical support', enabled: true, defaultTier: 2 },
  ],
}

const DEFAULT_DEPTS: Department[] = [
  { id: 'd1', name: 'Operations', description: 'Core business operations', enabled: true, defaultTier: 2 },
  { id: 'd2', name: 'HR', description: 'Human resources and talent', enabled: true, defaultTier: 2 },
  { id: 'd3', name: 'Finance', description: 'Financial planning and reporting', enabled: true, defaultTier: 2 },
  { id: 'd4', name: 'IT', description: 'Technology and infrastructure', enabled: true, defaultTier: 2 },
]

const TIERS = [
  { tier: 1, label: 'Owner', color: '#e74c3c', desc: 'Full system access, org-wide configuration' },
  { tier: 2, label: 'Dept Head', color: '#f39c12', desc: 'Department-level control and reporting' },
  { tier: 3, label: 'Manager', color: '#3498db', desc: 'Team management and task oversight' },
  { tier: 4, label: 'Specialist', color: '#2ecc71', desc: 'Task execution and limited scope' },
]

const INTEGRATIONS_DATA: Integration[] = [
  { id: 'entrata', name: 'Entrata', icon: '🏢', description: 'Property management & accounting', connected: false, connecting: false, recommended: ['property'] },
  { id: 'm365', name: 'Microsoft 365', icon: '📧', description: 'Email, calendar, and collaboration', connected: false, connecting: false, recommended: ['property', 'healthcare', 'legal', 'finance', 'construction', 'education', 'hospitality', 'other'] },
  { id: 'google', name: 'Google Workspace', icon: '🔵', description: 'Gmail, Drive, and productivity', connected: false, connecting: false, recommended: ['education', 'other'] },
  { id: 'paycor', name: 'Paycor', icon: '💰', description: 'Payroll and HR management', connected: false, connecting: false, recommended: ['property', 'healthcare', 'hospitality'] },
  { id: 'egnyte', name: 'Egnyte', icon: '📁', description: 'Secure file sharing and governance', connected: false, connecting: false, recommended: ['property', 'legal', 'finance'] },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Team messaging and notifications', connected: false, connecting: false, recommended: ['property', 'healthcare', 'legal', 'finance', 'construction', 'education', 'hospitality', 'other'] },
]

const STEP_LABELS = ['Organization', 'Departments', 'Permissions', 'Integrations', 'Team', 'Review & Launch']

let _idCounter = 100
const uid = () => `id_${_idCounter++}`

/* ──────────────────────── Component ──────────────────────── */

export default function OrgSetupWizardView() {
  const [step, setStep] = useState(0)
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next')
  const [launched, setLaunched] = useState(false)
  const [launching, setLaunching] = useState(false)

  const [org, setOrg] = useState<OrgInfo>({ name: '', industry: '', size: '', contactName: '', contactEmail: '' })
  const [departments, setDepartments] = useState<Department[]>([])
  const [deptInited, setDeptInited] = useState('')
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS_DATA)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState({ name: '', email: '', department: '', tier: 3 })

  useEffect(() => {
    if (org.industry && org.industry !== deptInited) {
      setDepartments(JSON.parse(JSON.stringify(DEPT_TEMPLATES[org.industry] || DEFAULT_DEPTS)))
      setDeptInited(org.industry)
    }
  }, [org.industry, deptInited])

  const go = useCallback((dir: 'next' | 'prev') => {
    setAnimDir(dir)
    setStep(s => s + (dir === 'next' ? 1 : -1))
  }, [])

  const enabledDepts = departments.filter(d => d.enabled)
  const connectedCount = integrations.filter(i => i.connected).length

  const handleConnect = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connecting: true } : i))
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connecting: false, connected: true } : i))
    }, 1800)
  }

  const addMember = () => {
    if (!newMember.name || !newMember.email) return
    setTeamMembers(prev => [...prev, { ...newMember, id: uid() }])
    setNewMember({ name: '', email: '', department: enabledDepts[0]?.name || '', tier: 3 })
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 3000)
  }

  useEffect(() => {
    if (enabledDepts.length > 0 && !newMember.department) {
      setNewMember(m => ({ ...m, department: enabledDepts[0].name }))
    }
  }, [enabledDepts, newMember.department])

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--bg1)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
  }

  const renderProgressBar = () => (
    <div style={{ padding: '24px 32px 0', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: '100%', height: 4, borderRadius: 2,
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
            <span style={{ fontSize: 11, color: i <= step ? 'var(--text)' : 'var(--text4)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const navButtons = (nextDisabled?: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
      {step > 0 ? (
        <button onClick={() => go('prev')} className="glass-card" style={{ padding: '10px 24px', cursor: 'pointer', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>
          ← Back
        </button>
      ) : <div />}
      {step < 5 && (
        <button
          onClick={() => go('next')}
          disabled={nextDisabled}
          style={{
            padding: '10px 28px', cursor: nextDisabled ? 'not-allowed' : 'pointer',
            background: nextDisabled ? 'var(--bg3)' : 'var(--accent)', color: nextDisabled ? 'var(--text4)' : '#fff',
            border: 'none', borderRadius: 8, fontWeight: 600, opacity: nextDisabled ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      )}
    </div>
  )

  /* ──── Step renderers ──── */

  const renderStep1 = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>🏢 Your Organization</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 14 }}>Tell us about your organization so we can tailor the experience.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Organization Name</label>
          <input style={inputStyle} value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} placeholder="e.g. RISE Real Estate" />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Industry</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={org.industry} onChange={e => setOrg({ ...org, industry: e.target.value })}>
            <option value="">Select industry…</option>
            {INDUSTRIES.map(ind => <option key={ind.id} value={ind.id}>{ind.icon} {ind.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Organization Size</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => setOrg({ ...org, size: s })} style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: org.size === s ? 'var(--accent)' : 'var(--bg3)',
                color: org.size === s ? '#fff' : 'var(--text3)',
                border: org.size === s ? 'none' : '1px solid var(--border)',
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Primary Contact Name</label>
            <input style={inputStyle} value={org.contactName} onChange={e => setOrg({ ...org, contactName: e.target.value })} placeholder="Full name" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Primary Contact Email</label>
            <input style={inputStyle} value={org.contactEmail} onChange={e => setOrg({ ...org, contactEmail: e.target.value })} placeholder="email@company.com" type="email" />
          </div>
        </div>
      </div>
      {navButtons(!org.name || !org.industry || !org.size)}
    </div>
  )

  const renderStep2 = () => {
    const toggleDept = (id: string) => setDepartments(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d))
    const renameDept = (id: string, name: string) => setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d))
    const addDept = () => setDepartments(prev => [...prev, { id: uid(), name: 'New Department', description: 'Custom department', enabled: true, defaultTier: 3 }])
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>🏗️ Departments</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 14 }}>
          We&apos;ve pre-selected departments common in <strong>{INDUSTRIES.find(i => i.id === org.industry)?.label}</strong>. Customize as needed.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {departments.map(dept => (
            <div key={dept.id} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: dept.enabled ? 'var(--bg3)' : 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 10,
              opacity: dept.enabled ? 1 : 0.5, transition: 'all 0.2s',
            }}>
              <input type="checkbox" checked={dept.enabled} onChange={() => toggleDept(dept.id)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }} />
              <div style={{ flex: 1 }}>
                <input value={dept.name} onChange={e => renameDept(dept.id, e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 600, fontSize: 14, outline: 'none', width: '100%' }} />
                <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 2 }}>{dept.description}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addDept} style={{
          marginTop: 12, padding: '10px 20px', background: 'var(--bg3)', border: '1px dashed var(--border)',
          borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>+ Add Custom Department</button>
        {navButtons(enabledDepts.length === 0)}
      </div>
    )
  }

  const renderStep3 = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>🔒 Permission Tiers</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 20, fontSize: 14 }}>
        Milliebot uses a 4-tier RKBAC (Role-Knowledge-Based Access Control) system. Set defaults for each department.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TIERS.map((t, i) => (
          <div key={t.tier} style={{ flex: 1, minWidth: 140 }}>
            <div className="glass-card" style={{ padding: '14px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{['👑', '🎯', '📋', '⚡'][i]}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: t.color }}>Tier {t.tier}</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 16, fontStyle: 'italic' }}>
        You&apos;re setting defaults. Individual users and agents can be adjusted later.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {enabledDepts.map(dept => (
          <div key={dept.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
          }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{dept.name}</span>
            <select value={dept.defaultTier}
              onChange={e => setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, defaultTier: Number(e.target.value) } : d))}
              style={{ ...inputStyle, width: 'auto', minWidth: 160 }}>
              {TIERS.map(t => <option key={t.tier} value={t.tier}>Tier {t.tier} — {t.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      {navButtons()}
    </div>
  )

  const renderStep4 = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>🔌 Connect Your Systems</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 14 }}>Connect the tools your team already uses. You can always add more later.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {integrations.map(integ => {
          const recommended = integ.recommended.includes(org.industry)
          return (
            <div key={integ.id} className="glass-card" style={{
              padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg3)', position: 'relative',
            }}>
              {recommended && (
                <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Recommended</span>
              )}
              <div style={{ fontSize: 28, marginBottom: 8 }}>{integ.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{integ.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 12 }}>{integ.description}</div>
              {integ.connected ? (
                <div style={{ fontSize: 13, color: '#2ecc71', fontWeight: 600 }}>✅ Connected</div>
              ) : integ.connecting ? (
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>⟳ Connecting…</div>
              ) : (
                <button onClick={() => handleConnect(integ.id)} style={{
                  padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>Connect</button>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => go('next')} style={{
          padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
        }}>Skip for now — I&apos;ll connect later</button>
      </div>
      {navButtons()}
    </div>
  )

  const renderStep5 = () => (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>👥 Invite Your Team</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 20, fontSize: 14 }}>Add team members who will use the platform. Invitations will be sent when you complete setup.</p>
      <div className="glass-card" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg3)', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
          <input style={inputStyle} placeholder="Email" type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <select style={inputStyle} value={newMember.department} onChange={e => setNewMember({ ...newMember, department: e.target.value })}>
            {enabledDepts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select style={inputStyle} value={newMember.tier} onChange={e => setNewMember({ ...newMember, tier: Number(e.target.value) })}>
            {TIERS.map(t => <option key={t.tier} value={t.tier}>Tier {t.tier} — {t.label}</option>)}
          </select>
          <button onClick={addMember} disabled={!newMember.name || !newMember.email} style={{
            padding: '10px 20px', background: newMember.name && newMember.email ? 'var(--accent)' : 'var(--bg3)',
            color: newMember.name && newMember.email ? '#fff' : 'var(--text4)',
            border: 'none', borderRadius: 8, cursor: newMember.name && newMember.email ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 13,
          }}>+ Add</button>
        </div>
      </div>
      {teamMembers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {teamMembers.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px',
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
            }}>
              <div><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{m.name}</span><span style={{ color: 'var(--text4)', fontSize: 12, marginLeft: 8 }}>{m.email}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.department} · Tier {m.tier}</div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => go('next')} style={{
        padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
      }}>Skip — I&apos;ll do this later</button>
      {navButtons()}
    </div>
  )

  const renderStep6 = () => {
    if (launched) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Your AI command center is live!</h2>
          <p style={{ color: 'var(--text3)', fontSize: 15, marginBottom: 32 }}>
            <strong>{org.name}</strong> is set up with {enabledDepts.length} departments, {connectedCount} integrations, and {teamMembers.length} team members.
          </p>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎊✨🚀✨🎊</div>
          <button style={{
            padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>Go to Dashboard →</button>
        </div>
      )
    }
    if (launching) {
      return (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Deploying your organization…</h2>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Setting up departments, permissions, and integrations…</p>
          <div style={{ width: 200, height: 4, background: 'var(--border)', borderRadius: 2, margin: '24px auto', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--accent)', animation: 'progressFill 3s ease-in-out' }} />
          </div>
        </div>
      )
    }
    const industryLabel = INDUSTRIES.find(i => i.id === org.industry)
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>🚀 Review &amp; Launch</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 14 }}>Everything looks good? Let&apos;s launch your AI command center.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, marginBottom: 4 }}>ORGANIZATION</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{org.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{industryLabel?.icon} {industryLabel?.label} · {org.size} employees</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, marginBottom: 4 }}>DEPARTMENTS</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 24 }}>{enabledDepts.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>configured</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, marginBottom: 4 }}>INTEGRATIONS</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 24 }}>{connectedCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>connected</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, marginBottom: 4 }}>TEAM MEMBERS</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 24 }}>{teamMembers.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>invited</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => go('prev')} className="glass-card" style={{ padding: '10px 24px', cursor: 'pointer', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>← Back</button>
          <button onClick={handleLaunch} style={{
            padding: '16px 40px', background: 'linear-gradient(135deg, var(--accent), #2ecc71)',
            color: '#fff', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(85, 156, 181, 0.4)',
          }}>🚀 Launch Your Organization</button>
        </div>
      </div>
    )
  }

  const steps = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6]

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes progressFill { from { width: 0 } to { width: 100% } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>
      {!launched && !launching && renderProgressBar()}
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '24px 32px 48px',
        animation: animDir === 'next' ? 'slideInRight 0.3s ease' : 'slideInLeft 0.3s ease',
      }} key={step}>
        {steps[step]()}
      </div>
    </div>
  )
}
