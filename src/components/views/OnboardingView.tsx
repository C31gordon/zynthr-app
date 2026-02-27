'use client'

import { useState, useRef } from 'react'

const stats = [
  { label: 'Active Pathways', value: '4', sub: 'Leasing Agent, Maintenance, Asst Manager, Regional Mgr', color: 'var(--blue)', icon: '🛤️' },
  { label: 'Employees In Progress', value: '13', sub: 'Across all pathways', color: 'var(--green)', icon: '👥' },
  { label: 'Completion Rate', value: '78%', sub: 'Last 90 days', color: 'var(--purple)', icon: '📈' },
  { label: 'Avg Time to Competency', value: '18 days', sub: 'Target: 21 days', color: 'var(--gold)', icon: '⏱️' },
]

interface PathwayStep {
  name: string
  timeline: string
  status: 'complete' | 'in-progress' | 'locked' | 'pending'
  requires?: string
  detail?: string
  isGate?: boolean
  gateBlocks?: string[]
  gatePrereqs?: { label: string; met: boolean }[]
}

interface PathwayEmployee {
  name: string
  day: number
  status: 'on-track' | 'behind' | 'blocked'
  note?: string
}

interface Pathway {
  title: string
  steps: PathwayStep[]
  employees: PathwayEmployee[]
  progress: number
}

const pathways: Pathway[] = [
  {
    title: 'New Leasing Agent — 30 Day Onboarding',
    progress: 50,
    steps: [
      { name: 'Company Orientation', timeline: 'Day 1', status: 'complete' },
      { name: 'Fair Housing Certification', timeline: 'Day 1-3', status: 'complete' },
      { name: 'Entrata System Training', timeline: 'Day 2-5', status: 'complete' },
      { name: 'Shadow 3 Live Tours', timeline: 'Day 3-7', status: 'complete', requires: 'Step 2' },
      { name: 'Conduct 3 Observed Tours', timeline: 'Day 7-14', status: 'in-progress', requires: 'Step 4', detail: '1/3 completed' },
      { name: 'Guardian Gate: Lease Execution Clearance', timeline: '', status: 'locked', requires: 'Steps 2, 4, 5 + Manager Sign-off', isGate: true, gateBlocks: ['Independent lease execution', 'Access to lease templates', 'Resident move-in processing'], gatePrereqs: [{ label: 'Fair Housing Certification', met: true }, { label: 'Shadow 3 Live Tours', met: true }, { label: 'Conduct 3 Observed Tours', met: false }, { label: 'Manager Sign-off', met: false }] },
      { name: 'Independent Leasing', timeline: 'Day 14-21', status: 'pending', requires: 'Step 6' },
      { name: '30-Day Competency Review', timeline: 'Day 30', status: 'pending', requires: 'All previous' },
    ],
    employees: [
      { name: 'Sarah Mitchell', day: 12, status: 'on-track' },
      { name: 'James Rodriguez', day: 8, status: 'behind', note: 'Stuck on Step 5' },
      { name: 'Aisha Patel', day: 3, status: 'on-track' },
    ],
  },
  {
    title: 'Maintenance Technician Onboarding',
    progress: 35,
    steps: [
      { name: 'Safety Orientation', timeline: 'Day 1', status: 'complete' },
      { name: 'Tool & Equipment Check', timeline: 'Day 1-2', status: 'complete' },
      { name: 'Work Order System Training', timeline: 'Day 2-5', status: 'in-progress' },
      { name: 'Shadow 5 Work Orders', timeline: 'Day 5-10', status: 'pending', requires: 'Step 3' },
      { name: 'Guardian Gate: Solo Work Order Clearance', timeline: '', status: 'locked', requires: 'Steps 1-4 + Supervisor Sign-off', isGate: true, gateBlocks: ['Solo work order execution', 'After-hours on-call eligibility'], gatePrereqs: [{ label: 'Safety Orientation', met: true }, { label: 'Tool & Equipment Check', met: true }, { label: 'Work Order System Training', met: false }, { label: 'Shadow 5 Work Orders', met: false }, { label: 'Supervisor Sign-off', met: false }] },
      { name: '30-Day Review', timeline: 'Day 30', status: 'pending', requires: 'Step 5' },
    ],
    employees: [
      { name: 'Marcus Thompson', day: 5, status: 'on-track' },
      { name: 'David Chen', day: 2, status: 'on-track' },
    ],
  },
  {
    title: 'Assistant Manager Fast Track',
    progress: 28,
    steps: [
      { name: 'Management Orientation & Systems Access', timeline: 'Day 1-2', status: 'complete' },
      { name: 'Financial Systems Training (Yardi/Entrata)', timeline: 'Day 2-5', status: 'complete' },
      { name: 'Vendor Management & Procurement', timeline: 'Day 5-8', status: 'in-progress' },
      { name: 'Lease Audit Training', timeline: 'Day 8-12', status: 'pending', requires: 'Step 2' },
      { name: 'Resident Escalation Protocols', timeline: 'Day 10-14', status: 'pending', requires: 'Step 3' },
      { name: 'Guardian Gate: Financial Authorization Clearance', timeline: '', status: 'locked', requires: 'Steps 1-5 + Director Sign-off', isGate: true, gateBlocks: ['Invoice approval up to $5,000', 'Vendor payment authorization', 'Budget variance reporting'], gatePrereqs: [{ label: 'Financial Systems Training', met: true }, { label: 'Vendor Management', met: false }, { label: 'Lease Audit Training', met: false }, { label: 'Resident Escalation Protocols', met: false }, { label: 'Director Sign-off', met: false }] },
      { name: '30-Day Competency Review', timeline: 'Day 30', status: 'pending', requires: 'Step 6' },
    ],
    employees: [
      { name: 'Rachel Kim', day: 6, status: 'on-track' },
    ],
  },
  {
    title: 'Regional Manager Pathway',
    progress: 20,
    steps: [
      { name: 'Portfolio Analytics Orientation', timeline: 'Day 1-2', status: 'complete' },
      { name: 'Cross-Property Benchmarking', timeline: 'Day 2-5', status: 'in-progress' },
      { name: 'Strategic Planning Workshop', timeline: 'Day 5-8', status: 'pending' },
      { name: 'Budget & NOI Deep Dive', timeline: 'Day 8-12', status: 'pending' },
      { name: 'Guardian Gate: Portfolio Decision Authority', timeline: '', status: 'locked', requires: 'Steps 1-4 + VP Sign-off', isGate: true, gateBlocks: ['Portfolio-level budget changes', 'Regional staffing decisions', 'Capital expenditure approvals over $25K'], gatePrereqs: [{ label: 'Portfolio Analytics Orientation', met: true }, { label: 'Cross-Property Benchmarking', met: false }, { label: 'Strategic Planning Workshop', met: false }, { label: 'Budget & NOI Deep Dive', met: false }, { label: 'VP Sign-off', met: false }] },
      { name: '30-Day Executive Review', timeline: 'Day 30', status: 'pending', requires: 'Step 5' },
    ],
    employees: [
      { name: 'Jennifer Adams', day: 4, status: 'on-track' },
    ],
  },
]

const allEmployees = [
  { name: 'Sarah Mitchell', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 62, currentStep: 'Conduct 3 Observed Tours', status: 'on-track' as const, daysIn: 12 },
  { name: 'James Rodriguez', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 50, currentStep: 'Conduct 3 Observed Tours', status: 'behind' as const, daysIn: 8 },
  { name: 'Aisha Patel', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 25, currentStep: 'Fair Housing Certification', status: 'on-track' as const, daysIn: 3 },
  { name: 'Marcus Thompson', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 40, currentStep: 'Work Order System Training', status: 'on-track' as const, daysIn: 5 },
  { name: 'David Chen', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 20, currentStep: 'Tool & Equipment Check', status: 'on-track' as const, daysIn: 2 },
  { name: 'Rachel Kim', role: 'Asst Manager', pathway: 'Asst Manager Fast Track', progress: 28, currentStep: 'Vendor Management', status: 'on-track' as const, daysIn: 6 },
  { name: 'Tyler Brooks', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 100, currentStep: 'Complete', status: 'complete' as const, daysIn: 28 },
  { name: 'Maria Santos', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 75, currentStep: 'Independent Leasing', status: 'on-track' as const, daysIn: 18 },
  { name: 'Kevin Wright', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 100, currentStep: 'Complete', status: 'complete' as const, daysIn: 26 },
  { name: 'Lisa Nguyen', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 50, currentStep: 'Guardian Gate', status: 'blocked' as const, daysIn: 15 },
  { name: 'Chris Johnson', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 65, currentStep: 'Shadow 5 Work Orders', status: 'behind' as const, daysIn: 12 },
  { name: 'Amanda Foster', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 38, currentStep: 'Shadow 3 Live Tours', status: 'on-track' as const, daysIn: 5 },
  { name: 'Jennifer Adams', role: 'Regional Manager', pathway: 'Regional Manager', progress: 20, currentStep: 'Cross-Property Benchmarking', status: 'on-track' as const, daysIn: 4 },
]

// Sarah Mitchell's checklist items for demo
const sarahChecklist = [
  { step: 'Company Orientation', done: true },
  { step: 'Fair Housing Certification', done: true },
  { step: 'Entrata System Training', done: true },
  { step: 'Shadow 3 Live Tours', done: true },
  { step: 'Conduct 3 Observed Tours', done: false },
  { step: 'Guardian Gate: Lease Execution', done: false },
  { step: 'Independent Leasing', done: false },
  { step: '30-Day Competency Review', done: false },
]
const sarahComplete = sarahChecklist.filter(c => c.done).length

// Feature adoption heat map data
const featureAdoption = [
  { name: 'DLR Reports', pct: 92, users: 184 },
  { name: 'Work Orders', pct: 88, users: 176 },
  { name: 'Lease Management', pct: 85, users: 170 },
  { name: 'Resident Portal', pct: 72, users: 144 },
  { name: 'Budget Tools', pct: 65, users: 130 },
  { name: 'Vendor Management', pct: 54, users: 108 },
  { name: 'Maintenance Scheduling', pct: 78, users: 156 },
  { name: 'Compliance Tracking', pct: 46, users: 92 },
  { name: 'Reporting Dashboard', pct: 83, users: 166 },
  { name: 'Staff Scheduling', pct: 38, users: 76 },
  { name: 'Resident Screening', pct: 91, users: 182 },
  { name: 'Capital Projects', pct: 32, users: 64 },
]

const heatColor = (pct: number) => pct > 80 ? 'var(--green)' : pct >= 40 ? 'var(--gold)' : 'var(--red)'

// Tooltip component
const Tooltip = ({ term, explanation }: { term: string; explanation: string }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
    <span
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'rgba(85,156,181,0.2)', color: 'var(--blue)', fontSize: 10, fontWeight: 700, cursor: 'help', marginLeft: 4, flexShrink: 0 }}
      className="tooltip-trigger"
      title={`${term}: ${explanation}`}
    >?</span>
    <style>{`
      .tooltip-trigger { position: relative; }
      .tooltip-trigger:hover::after {
        content: attr(title);
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 400;
        white-space: normal;
        width: 220px;
        z-index: 50;
        line-height: 1.4;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
    `}</style>
  </span>
)

const statusIcon = (s: PathwayStep['status']) => {
  switch (s) {
    case 'complete': return '✅'
    case 'in-progress': return '🔵'
    case 'locked': return '🔒'
    case 'pending': return '⏳'
  }
}

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'on-track': { bg: 'rgba(34,197,94,0.15)', color: 'var(--green)', label: 'On Track' },
    'behind': { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)', label: 'Behind' },
    'blocked': { bg: 'rgba(174,19,42,0.15)', color: 'var(--red)', label: 'Blocked' },
    'complete': { bg: 'rgba(85,156,181,0.15)', color: 'var(--blue)', label: 'Complete' },
  }
  const m = map[s] || map['on-track']
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

export default function OnboardingView() {
  const [expandedPathway, setExpandedPathway] = useState<number>(0)
  const [expandedGate, setExpandedGate] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showChecklist, setShowChecklist] = useState(true)
  const [activeTab, setActiveTab] = useState<'pathways' | 'heatmap'>('pathways')
  const pathwayRefs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="glass-card-static p-4 fade-in" style={{ borderLeft: '3px solid var(--blue)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                👋 Welcome, Sarah Mitchell!
              </div>
              <div className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
                Based on your role as <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Leasing Agent</span>, we&apos;ve prepared a personalized onboarding pathway. Your top priority: <span style={{ color: 'var(--orange)', fontWeight: 600 }}>Conduct 3 Observed Tours</span> (1/3 completed).
              </div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-[11px] px-3 py-1.5 rounded-md font-medium flex-shrink-0" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          🎓 Onboarding & Training
          <Tooltip term="Digital Adoption Platform" explanation="Userpilot-inspired system that guides employees through role-specific onboarding with enforced competency gates." />
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
          Digital adoption pathways — track, enforce, and verify employee competency
        </p>
      </div>

      {/* Main content with optional checklist sidebar */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass-card-static p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `color-mix(in srgb, ${s.color} 15%, transparent)`, color: s.color }}>{s.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs: Pathways vs Heat Map */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg3)' }}>
            {([['pathways', 'Onboarding Pathways'], ['heatmap', 'Feature Adoption Heat Map']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{ background: activeTab === id ? 'var(--bg2)' : 'transparent', color: activeTab === id ? 'var(--text)' : 'var(--text3)' }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'pathways' ? (
            <>
              {/* Pathway Cards */}
              <div className="space-y-4">
                {pathways.map((p, pi) => {
                  const isExpanded = expandedPathway === pi
                  return (
                    <div key={pi} className="glass-card-static overflow-hidden" ref={el => { pathwayRefs.current[pi] = el }}>
                      {/* Pathway Header */}
                      <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedPathway(isExpanded ? -1 : pi)}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.title}</h3>
                            <span className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>
                              {p.employees.length} assigned
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: 'var(--blue)' }} />
                            </div>
                            <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--text3)' }}>{p.progress}%</span>
                          </div>
                        </div>
                        <span className="ml-3 text-sm flex-shrink-0" style={{ color: 'var(--text3)' }}>{isExpanded ? '▾' : '▸'}</span>
                      </button>

                      {isExpanded && (
                        <div className="border-t px-4 pb-4" style={{ borderColor: 'var(--border)' }}>
                          {/* Steps */}
                          <div className="mt-4 space-y-2">
                            {p.steps.map((step, si) => (
                              <div key={si}>
                                <div className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: step.isGate ? 'rgba(249,115,22,0.08)' : 'transparent' }}>
                                  <span className="flex-shrink-0 mt-0.5">{statusIcon(step.status)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium" style={{ color: step.status === 'complete' ? 'var(--text3)' : 'var(--text)' }}>
                                        {si + 1}. {step.name}
                                      </span>
                                      {step.timeline && (
                                        <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text4)' }}>({step.timeline})</span>
                                      )}
                                      {step.isGate && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>
                                          Guardian Gate
                                          <Tooltip term="Guardian Gate" explanation="A competency checkpoint that blocks access to critical permissions until all prerequisites are verified and signed off by a supervisor." />
                                        </span>
                                      )}
                                    </div>
                                    {step.requires && (
                                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>Requires: {step.requires}</div>
                                    )}
                                    {step.detail && (
                                      <div className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--blue)' }}>{step.detail}</div>
                                    )}
                                  </div>
                                  {step.isGate && (
                                    <button className="flex-shrink-0 text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'var(--bg3)', color: 'var(--text3)' }} onClick={() => setExpandedGate(expandedGate === `${pi}-${si}` ? null : `${pi}-${si}`)}>
                                      {expandedGate === `${pi}-${si}` ? 'Hide' : 'Details'}
                                    </button>
                                  )}
                                </div>
                                {/* Gate Detail Panel */}
                                {step.isGate && expandedGate === `${pi}-${si}` && (
                                  <div className="ml-9 mt-2 p-4 rounded-lg" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-xl">🔒</span>
                                      <span className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>Guardian Gate — {step.status === 'locked' ? 'LOCKED' : 'UNLOCKED'}</span>
                                    </div>
                                    <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text2)' }}>Prerequisites:</div>
                                    <div className="space-y-1 mb-3">
                                      {step.gatePrereqs?.map((pr, pri) => (
                                        <div key={pri} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text3)' }}>
                                          <span>{pr.met ? '✅' : '❌'}</span>
                                          <span>{pr.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-[11px] mb-1" style={{ color: 'var(--text2)' }}>
                                      <span className="font-semibold">This gate blocks:</span>
                                    </div>
                                    <ul className="list-disc list-inside text-[11px] mb-3 space-y-0.5" style={{ color: 'var(--text3)' }}>
                                      {step.gateBlocks?.map((b, bi) => <li key={bi}>{b}</li>)}
                                    </ul>
                                    <div className="text-[11px] px-3 py-2 rounded-md" style={{ background: 'rgba(174,19,42,0.1)', color: 'var(--red)' }}>
                                      🛡️ Override requires: Department Head approval
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Assigned Employees */}
                          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                            <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text2)' }}>Assigned Employees</div>
                            <div className="space-y-2">
                              {p.employees.map((emp, ei) => (
                                <div key={ei} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff' }}>
                                      {emp.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{emp.name}</div>
                                      <div className="text-[11px]" style={{ color: 'var(--text4)' }}>Day {emp.day}{emp.note ? ` • ${emp.note}` : ''}</div>
                                    </div>
                                  </div>
                                  {statusBadge(emp.status)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* Feature Adoption Heat Map */
            <div className="glass-card-static p-4">
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Feature Adoption Heat Map</h2>
              <p className="text-[11px] mb-4" style={{ color: 'var(--text4)' }}>Platform feature usage across all onboarded employees (200 total)</p>
              <div className="flex items-center gap-4 mb-4 text-[11px]" style={{ color: 'var(--text4)' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--green)', marginRight: 4 }} />{'>'}80% Adopted</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', marginRight: 4 }} />40-80%</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--red)', marginRight: 4 }} />{'<'}40%</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {featureAdoption.map(f => (
                  <div key={f.name} className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${heatColor(f.pct)} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${heatColor(f.pct)} 25%, transparent)` }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{f.name}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: heatColor(f.pct) }}>{f.pct}%</div>
                    <div className="text-[11px]" style={{ color: 'var(--text4)' }}>{f.users} users</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee Progress Table */}
          <div className="glass-card-static overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Employee Progress</h2>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>All employees across active onboarding pathways</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Employee', 'Role', 'Pathway', 'Progress', 'Current Step', 'Status', 'Days In', 'Action'].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEmployees.map((emp, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{emp.name}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.role}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.pathway}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                            <div className="h-full rounded-full" style={{ width: `${emp.progress}%`, background: emp.progress === 100 ? 'var(--green)' : 'var(--blue)' }} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>{emp.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.currentStep}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{statusBadge(emp.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.daysIn}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>View</button>
                          <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>Nudge</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Persistent Progress Checklist — Sidebar */}
        {showChecklist && (
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-4">
            <div className="glass-card-static p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>My Checklist</div>
                <button onClick={() => setShowChecklist(false)} className="text-[11px]" style={{ color: 'var(--text4)' }}>✕</button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                {/* Progress ring */}
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg3)" strokeWidth="4" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="var(--blue)" strokeWidth="4" strokeDasharray={`${(sarahComplete / sarahChecklist.length) * 113} 113`} strokeLinecap="round" transform="rotate(-90 22 22)" />
                  <text x="22" y="26" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="700">{sarahComplete}/{sarahChecklist.length}</text>
                </svg>
                <div>
                  <div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>Sarah Mitchell</div>
                  <div className="text-[11px]" style={{ color: 'var(--text4)' }}>{sarahComplete} of {sarahChecklist.length} steps complete</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {sarahChecklist.map((item, i) => (
                  <button key={i} className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md transition-colors hover:bg-white/[0.03]"
                    onClick={() => { setActiveTab('pathways'); setExpandedPathway(0); }}
                  >
                    <span className="text-[12px] flex-shrink-0">{item.done ? '✅' : '○'}</span>
                    <span className="text-[11px] truncate" style={{ color: item.done ? 'var(--text4)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.step}</span>
                    {!item.done && i === sarahComplete && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>Next</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
