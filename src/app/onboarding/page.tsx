'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const INDUSTRIES = [
  'Property Management',
  'Healthcare',
  'Construction',
  'Professional Services',
  'Other',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '200+']

const ALL_DEPARTMENTS = [
  'Operations', 'Leasing', 'Maintenance', 'Finance', 'HR', 'IT', 'Training', 'Marketing',
]

const INDUSTRY_DEFAULTS: Record<string, string[]> = {
  'Property Management': ['Operations', 'Leasing', 'Maintenance', 'Finance'],
  'Healthcare': ['Operations', 'HR', 'IT', 'Finance', 'Training'],
  'Construction': ['Operations', 'Finance', 'HR', 'Maintenance'],
  'Professional Services': ['Operations', 'Finance', 'HR', 'Marketing', 'IT'],
  'Other': ['Operations', 'Finance', 'HR'],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')

  // Step 2
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])

  // Step 3
  const [agentName, setAgentName] = useState('')
  const [agentDept, setAgentDept] = useState('')
  const [agentDesc, setAgentDesc] = useState('')

  // Step 4
  const [inviteEmails, setInviteEmails] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('onboarding_company')
      if (saved) setCompanyName(saved)
    }
  }, [])

  useEffect(() => {
    if (industry) {
      setSelectedDepts(INDUSTRY_DEFAULTS[industry] || INDUSTRY_DEFAULTS['Other'])
    }
  }, [industry])

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    )
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated. Please sign up again.')
        setLoading(false)
        return
      }

      const payload: Record<string, unknown> = {
        companyName,
        industry,
        companySize,
        departments: selectedDepts,
        userId: user.id,
      }

      if (agentName) {
        payload.agent = {
          name: agentName,
          departmentName: agentDept || selectedDepts[0],
          description: agentDesc,
        }
      }

      const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean)
      if (emails.length) {
        payload.inviteEmails = emails
      }

      const res = await fetch('/api/provisioning/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json() as { error?: string }

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      // Cache org info for the dashboard (RLS may block server query)
      localStorage.setItem('zynthr_org', JSON.stringify({
        name: companyName,
        industry,
        companySize,
        departments: selectedDepts,
      }))
      router.push('/')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text4)' }}>
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--blue), var(--purple))' }} />
          </div>
          <div className="flex justify-between mt-2">
            {['Organization', 'Departments', 'First Agent', 'Invite Team'].map((label, i) => (
              <span key={label} className="text-xs font-medium"
                style={{ color: i + 1 <= step ? 'var(--blue)' : 'var(--text4)' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          {/* Step 1: Organization */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Tell us about your organization</h2>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>We&apos;ll customize your workspace based on your industry.</p>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Company Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {COMPANY_SIZES.map(size => (
                    <button key={size} type="button" onClick={() => setCompanySize(size)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: companySize === size ? 'var(--blue)' : 'var(--bg)',
                        color: companySize === size ? '#fff' : 'var(--text3)',
                        border: `1px solid ${companySize === size ? 'var(--blue)' : 'var(--border)'}`,
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)}
                disabled={!companyName || !industry || !companySize}
                className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #559CB5, #3d7a94)' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Departments */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Select your departments</h2>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>We&apos;ve pre-selected departments common in {industry}. Adjust as needed.</p>

              <div className="grid grid-cols-2 gap-2">
                {ALL_DEPARTMENTS.map(dept => (
                  <button key={dept} type="button" onClick={() => toggleDept(dept)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                    style={{
                      background: selectedDepts.includes(dept) ? 'rgba(85,156,181,0.15)' : 'var(--bg)',
                      color: selectedDepts.includes(dept) ? 'var(--blue-light)' : 'var(--text3)',
                      border: `1px solid ${selectedDepts.includes(dept) ? 'var(--blue)' : 'var(--border)'}`,
                    }}>
                    <span className="text-base">{selectedDepts.includes(dept) ? '✓' : '○'}</span>
                    {dept}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                  style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  disabled={selectedDepts.length === 0}
                  className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #559CB5, #3d7a94)' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: First Agent */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Create your first AI agent</h2>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Set up an agent to handle tasks in one of your departments.</p>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Agent Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. Maintenance Bot"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Department</label>
                <select value={agentDept} onChange={e => setAgentDept(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Select department...</option>
                  {selectedDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>What should this agent do?</label>
                <textarea value={agentDesc} onChange={e => setAgentDesc(e.target.value)} rows={3}
                  placeholder="e.g. Handle maintenance requests and schedule work orders"
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                  style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                  ← Back
                </button>
                <button onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #559CB5, #3d7a94)' }}>
                  Continue →
                </button>
              </div>
              <button onClick={() => { setAgentName(''); setAgentDept(''); setAgentDesc(''); setStep(4) }}
                className="w-full text-sm font-medium hover:underline" style={{ color: 'var(--text4)' }}>
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Invite Team */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Invite your team</h2>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Add team members by email. You can always do this later.</p>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Email addresses (one per line or comma-separated)</label>
                <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows={4}
                  placeholder={"colleague@company.com\nmanager@company.com"}
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(174,19,42,0.1)', border: '1px solid rgba(174,19,42,0.3)', color: 'var(--red-text, #ff6b7a)' }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                  style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                  ← Back
                </button>
                <button onClick={handleFinish} disabled={loading}
                  className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #4ECDC4)', boxShadow: loading ? 'none' : 'var(--shadow-glow-green)' }}>
                  {loading ? 'Setting up...' : '🚀 Launch Workspace'}
                </button>
              </div>
              <button onClick={() => { setInviteEmails(''); handleFinish() }}
                disabled={loading}
                className="w-full text-sm font-medium hover:underline disabled:opacity-50" style={{ color: 'var(--text4)' }}>
                Skip — I&apos;ll do this later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
