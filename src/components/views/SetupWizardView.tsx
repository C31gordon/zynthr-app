'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────

interface BotConfig {
  name: string
  description: string
  icon: string
  capabilities: string[]
  status: 'active' | 'paused'
}

interface AgentConfig {
  name: string
  description: string
  icon: string
  capabilities: string[]
  bots: BotConfig[]
}

interface DeptConfig {
  name: string
  icon: string
  industry: string
  agent: AgentConfig | null
}

// ── Industry Templates ──────────────────────────────────

const industryTemplates: Record<string, { departments: { name: string; icon: string; agentName: string; agentDesc: string; agentCaps: string[]; bots: Omit<BotConfig, 'status'>[] }[] }> = {
  'Healthcare': {
    departments: [
      {
        name: 'Front Office', icon: '🏥', agentName: 'Front Office Agent', agentDesc: 'Patient intake, scheduling, insurance verification, and front desk operations',
        agentCaps: ['scheduling', 'insurance_verify', 'patient_intake', 'phone_triage'],
        bots: [
          { name: 'Intake Bot', description: 'Digital patient intake forms, insurance card scanning, eligibility checks', icon: '📋', capabilities: ['form_processing', 'ocr', 'eligibility_check'] },
          { name: 'Scheduling Bot', description: 'Appointment booking, rescheduling, waitlist management, no-show follow-ups', icon: '📅', capabilities: ['calendar_mgmt', 'sms_reminders', 'waitlist'] },
          { name: 'Phone Triage Bot', description: 'After-hours call routing, symptom screening, urgent care direction', icon: '📞', capabilities: ['ivr', 'symptom_screening', 'routing'] },
        ],
      },
      {
        name: 'Billing & Claims', icon: '💰', agentName: 'Revenue Cycle Agent', agentDesc: 'Claims processing, denial management, patient billing, collections',
        agentCaps: ['claim_submission', 'denial_mgmt', 'coding_assist', 'collections'],
        bots: [
          { name: 'Claims Processor', description: 'CPT/ICD-10 coding assistance, claim scrubbing, electronic submission', icon: '📄', capabilities: ['cpt_coding', 'claim_scrub', 'clearinghouse'] },
          { name: 'Prior Auth Bot', description: 'Prior authorization requests, status tracking, appeal generation', icon: '✅', capabilities: ['prior_auth', 'appeal_letters', 'status_track'] },
          { name: 'Patient Billing Bot', description: 'Statement generation, payment plans, balance inquiries', icon: '💳', capabilities: ['statements', 'payment_plans', 'balance_inquiry'] },
        ],
      },
      {
        name: 'Clinical Operations', icon: '🩺', agentName: 'Clinical Ops Agent', agentDesc: 'Clinical workflow support, lab management, referral coordination',
        agentCaps: ['lab_mgmt', 'referral_coord', 'clinical_alerts', 'quality_measures'],
        bots: [
          { name: 'Lab Results Bot', description: 'Lab result routing, critical value alerts, patient notification', icon: '🧪', capabilities: ['lab_routing', 'critical_alerts', 'patient_notify'] },
          { name: 'Referral Bot', description: 'Specialist referral coordination, records transfer, follow-up tracking', icon: '🔄', capabilities: ['referral_mgmt', 'records_transfer', 'followup'] },
        ],
      },
      {
        name: 'Compliance', icon: '🔒', agentName: 'Compliance Agent', agentDesc: 'HIPAA compliance monitoring, audit trails, policy enforcement',
        agentCaps: ['hipaa_audit', 'consent_tracking', 'breach_detection', 'policy_enforce'],
        bots: [
          { name: 'HIPAA Monitor', description: 'Access log monitoring, PHI exposure detection, compliance reporting', icon: '🛡️', capabilities: ['access_monitor', 'phi_detection', 'compliance_report'] },
          { name: 'Consent Tracker', description: 'Patient consent management, form versioning, expiration alerts', icon: '📝', capabilities: ['consent_mgmt', 'form_version', 'expiry_alert'] },
        ],
      },
      {
        name: 'Patient Experience', icon: '💬', agentName: 'Patient Experience Agent', agentDesc: 'Patient communication, satisfaction surveys, portal management',
        agentCaps: ['patient_comms', 'surveys', 'portal_mgmt', 'reviews'],
        bots: [
          { name: 'Patient Comms Bot', description: 'Appointment reminders, follow-up messages, birthday greetings', icon: '💬', capabilities: ['sms', 'email', 'reminders'] },
          { name: 'Survey Bot', description: 'Post-visit satisfaction surveys, NPS tracking, review solicitation', icon: '⭐', capabilities: ['surveys', 'nps', 'review_request'] },
        ],
      },
    ],
  },
  'Property Management': {
    departments: [
      {
        name: 'Leasing', icon: '🏠', agentName: 'Leasing Agent', agentDesc: 'Lead management, tours, applications, lease execution',
        agentCaps: ['lead_mgmt', 'tour_scheduling', 'application_processing', 'lease_execution'],
        bots: [
          { name: 'Lead Response Bot', description: 'Instant lead response, qualification, tour scheduling', icon: '📧', capabilities: ['lead_response', 'qualification', 'scheduling'] },
          { name: 'Application Bot', description: 'Application processing, background checks, approval workflows', icon: '📋', capabilities: ['app_processing', 'screening', 'approval'] },
        ],
      },
      {
        name: 'Maintenance', icon: '🔧', agentName: 'Maintenance Agent', agentDesc: 'Work order management, vendor coordination, preventive maintenance',
        agentCaps: ['work_orders', 'vendor_mgmt', 'preventive_maint', 'inventory'],
        bots: [
          { name: 'Work Order Bot', description: 'Work order intake, prioritization, technician dispatch', icon: '🎫', capabilities: ['intake', 'priority', 'dispatch'] },
          { name: 'Vendor Bot', description: 'Vendor scheduling, invoice processing, performance tracking', icon: '🏗️', capabilities: ['vendor_schedule', 'invoicing', 'performance'] },
        ],
      },
    ],
  },
}

// ── Main Component ──────────────────────────────────

export default function SetupWizardView() {
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState('')
  const [selectedDepts, setSelectedDepts] = useState<number[]>([])
  const [configuredDepts, setConfiguredDepts] = useState<DeptConfig[]>([])
  const [currentDeptIdx, setCurrentDeptIdx] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [showActivity, setShowActivity] = useState(false)

  const template = industryTemplates[industry]
  const totalSteps = 5

  const handleSelectIndustry = (ind: string) => {
    setIndustry(ind)
    setSelectedDepts([])
    setStep(2)
  }

  const toggleDept = (idx: number) => {
    setSelectedDepts(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
  }

  const handleConfirmDepts = () => {
    if (!template || selectedDepts.length === 0) return
    const depts = selectedDepts.sort().map(idx => {
      const d = template.departments[idx]
      return {
        name: d.name,
        icon: d.icon,
        industry,
        agent: {
          name: d.agentName,
          description: d.agentDesc,
          icon: d.icon,
          capabilities: d.agentCaps,
          bots: d.bots.map(b => ({ ...b, status: 'active' as const })),
        },
      }
    })
    setConfiguredDepts(depts)
    setCurrentDeptIdx(0)
    setStep(3)
  }

  const handleDeploy = () => {
    setStep(5)
    setDeploying(true)
    setTimeout(() => { setDeploying(false); setDeployed(true) }, 3000)
    setTimeout(() => setShowActivity(true), 4000)
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🚀 Department & Agent Setup</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Configure your AI-powered departments in minutes
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step >= s ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'var(--bg3)',
                  color: step >= s ? '#fff' : 'var(--text4)',
                }}>
                {step > s ? '✓' : s}
              </div>
              {s < totalSteps && (
                <div className="flex-1 h-1 rounded-full" style={{ background: step > s ? 'var(--blue)' : 'var(--bg3)' }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-medium" style={{ color: 'var(--text4)' }}>
          <span>Industry</span><span>Departments</span><span>Agent Config</span><span>Review</span><span>Deploy</span>
        </div>
      </div>

      {/* Step 1: Industry Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Select Your Industry</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Choose an industry to load pre-configured department templates with AI agents and bots.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Healthcare', icon: '🏥', desc: '5 departments, 12 bots — HIPAA-compliant', available: true },
                { name: 'Property Management', icon: '🏠', desc: '2 departments, 4 bots — Leasing & Maintenance', available: true },
                { name: 'Legal', icon: '⚖️', desc: 'Coming soon', available: false },
                { name: 'Finance', icon: '🏦', desc: 'Coming soon', available: false },
                { name: 'Construction', icon: '🏗️', desc: 'Coming soon', available: false },
                { name: 'Custom', icon: '⚙️', desc: 'Build from scratch', available: false },
              ].map(ind => (
                <button key={ind.name} onClick={() => ind.available && handleSelectIndustry(ind.name)}
                  disabled={!ind.available}
                  className="p-5 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <span className="text-3xl">{ind.icon}</span>
                  <div className="text-base font-bold mt-2" style={{ color: 'var(--text)' }}>{ind.name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text4)' }}>{ind.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Department Selection */}
      {step === 2 && template && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Select Departments</h2>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Choose which departments to deploy for your {industry} practice.</p>
              </div>
              <button onClick={() => setSelectedDepts(template.departments.map((_, i) => i))}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>
                Select All
              </button>
            </div>
            <div className="space-y-3">
              {template.departments.map((dept, idx) => (
                <button key={idx} onClick={() => toggleDept(idx)}
                  className="w-full p-4 rounded-xl text-left transition-all hover:bg-white/5"
                  style={{
                    background: selectedDepts.includes(idx) ? 'rgba(85,156,181,0.1)' : 'var(--bg)',
                    border: selectedDepts.includes(idx) ? '2px solid var(--blue)' : '1px solid var(--border)',
                  }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #559CB5, #7c3aed)' }}>
                      {dept.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold" style={{ color: 'var(--text)' }}>{dept.name}</span>
                        {selectedDepts.includes(idx) && <span style={{ color: 'var(--blue)' }}>✓</span>}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{dept.agentDesc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                          1 Agent
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                          {dept.bots.length} Bots
                        </span>
                        {dept.agentCaps.slice(0, 3).map(c => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                            {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>← Back</button>
              <button onClick={handleConfirmDepts} disabled={selectedDepts.length === 0}
                className="px-6 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))' }}>
                Configure Agents ({selectedDepts.length}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Agent & Bot Configuration */}
      {step === 3 && configuredDepts.length > 0 && (
        <div className="space-y-4">
          {/* Dept tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {configuredDepts.map((d, i) => (
              <button key={i} onClick={() => setCurrentDeptIdx(i)}
                className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: currentDeptIdx === i ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'var(--bg2)',
                  color: currentDeptIdx === i ? '#fff' : 'var(--text3)',
                  border: currentDeptIdx === i ? 'none' : '1px solid var(--border)',
                }}>
                {d.icon} {d.name}
              </button>
            ))}
          </div>

          {(() => {
            const dept = configuredDepts[currentDeptIdx]
            const agent = dept.agent!
            return (
              <div className="glass-card p-5 space-y-5">
                {/* Agent Config */}
                <div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{dept.icon} {dept.name} — Agent Configuration</h2>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Review and customize the department agent and its bots.</p>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #559CB5, #7c3aed)' }}>
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{agent.name}</div>
                      <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{agent.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.capabilities.map(c => (
                          <span key={c} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                            style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>
                            {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Support Bots ({agent.bots.length})</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {agent.bots.map((bot, bi) => (
                      <div key={bi} className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ background: 'var(--bg3)' }}>
                            {bot.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{bot.name}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                                <span className="text-[10px] font-medium" style={{ color: '#4ade80' }}>Active</span>
                              </div>
                            </div>
                            <p className="text-[11px] mb-2" style={{ color: 'var(--text4)' }}>{bot.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {bot.capabilities.map(c => (
                                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                                  {c.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => currentDeptIdx > 0 ? setCurrentDeptIdx(currentDeptIdx - 1) : setStep(2)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>← Back</button>
                  <button onClick={() => {
                    if (currentDeptIdx < configuredDepts.length - 1) setCurrentDeptIdx(currentDeptIdx + 1)
                    else setStep(4)
                  }}
                    className="px-6 py-2 rounded-lg text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))' }}>
                    {currentDeptIdx < configuredDepts.length - 1 ? 'Next Department →' : 'Review & Deploy →'}
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>📋 Deployment Review</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Review your configuration before deploying.</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(85,156,181,0.1)', border: '1px solid rgba(85,156,181,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>{configuredDepts.length}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>Departments</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: '#a855f7' }}>{configuredDepts.length}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>Agents</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>{configuredDepts.reduce((sum, d) => sum + (d.agent?.bots.length || 0), 0)}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>Bots</div>
              </div>
            </div>

            <div className="space-y-3">
              {configuredDepts.map((dept, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{dept.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{dept.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text4)' }}>{dept.agent?.name} · {dept.agent?.bots.length} bots</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-9">
                    {dept.agent?.bots.map(b => (
                      <span key={b.name} className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                        {b.icon} {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => { setStep(3); setCurrentDeptIdx(configuredDepts.length - 1) }}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>← Back</button>
              <button onClick={handleDeploy}
                className="px-8 py-3 rounded-lg text-base font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #22c55e, #4ECDC4)', boxShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
                🚀 Deploy All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Deploying / Deployed */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="glass-card p-8 text-center">
            {deploying ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #559CB5, #7c3aed)' }}>
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Deploying Your AI Team...</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>
                  Setting up {configuredDepts.length} departments, {configuredDepts.length} agents, and {configuredDepts.reduce((s, d) => s + (d.agent?.bots.length || 0), 0)} bots
                </p>
                <div className="w-64 mx-auto h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full animate-pulse" style={{ width: '60%', background: 'linear-gradient(90deg, var(--blue), var(--purple))' }} />
                </div>
              </>
            ) : deployed ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #4ECDC4)', boxShadow: '0 0 40px rgba(74,222,128,0.3)' }}>
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Deployment Complete!</h2>
                <p className="text-sm mb-2" style={{ color: 'var(--text3)' }}>
                  Your AI team is live and processing.
                </p>
                <div className="flex justify-center gap-3 mb-6">
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>
                    {configuredDepts.length} Departments
                  </span>
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                    {configuredDepts.length} Agents
                  </span>
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                    {configuredDepts.reduce((s, d) => s + (d.agent?.bots.length || 0), 0)} Bots
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* Live Activity Feed after deploy */}
          {showActivity && (
            <div className="glass-card p-5">
              <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📡 Live Agent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: 'Just now', agent: 'Compliance Agent', action: 'HIPAA compliance scan initiated — monitoring all access points', icon: '🔒' },
                  { time: '2s ago', agent: 'Front Office Agent', action: 'Connected to scheduling system — syncing 47 appointments for Monday', icon: '🏥' },
                  { time: '5s ago', agent: 'Revenue Cycle Agent', action: 'Claims queue loaded — 12 pending submissions ready for review', icon: '💰' },
                  { time: '8s ago', agent: 'Patient Experience Agent', action: 'Reminder batch queued — 23 appointment reminders for tomorrow', icon: '💬' },
                  { time: '10s ago', agent: 'Clinical Ops Agent', action: 'Lab interface connected — monitoring for critical values', icon: '🩺' },
                ].map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 fade-in"
                    style={{ animationDelay: `${i * 200}ms` }}>
                    <span className="text-lg mt-0.5">{e.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{e.agent}</span>
                        <span className="text-xs" style={{ color: 'var(--text4)' }}>{e.time}</span>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{e.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
