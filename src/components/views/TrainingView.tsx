'use client'

import { useState } from 'react'

const stats = [
  { label: 'Training Modules', value: '10', sub: 'Active in library', color: 'var(--blue)', icon: '📖' },
  { label: 'Completions This Month', value: '47', sub: '+12 from last month', color: 'var(--green)', icon: '✅' },
  { label: 'Avg Score', value: '86%', sub: 'Across all assessments', color: 'var(--purple)', icon: '🎯' },
  { label: 'Certs Expiring (30d)', value: '3', sub: 'Fair Housing (2), Safety (1)', color: 'var(--orange)', icon: '⚠️' },
]

const trainingModules = [
  { title: 'Fair Housing Fundamentals', type: 'Required' as const, duration: '45 min', completion: 94 },
  { title: 'Entrata Lease Execution', type: 'Required' as const, duration: '60 min', completion: 78 },
  { title: "Miya's Law Documentation", type: 'Required' as const, duration: '30 min', completion: 100 },
  { title: 'Work Order Triage & Priority', type: 'Required' as const, duration: '40 min', completion: 85 },
  { title: 'Resident Communication Best Practices', type: 'Recommended' as const, duration: '25 min', completion: 67 },
  { title: 'Emergency Maintenance Protocols', type: 'Required' as const, duration: '35 min', completion: 91 },
  { title: 'Yardi Financial Reporting', type: 'Required' as const, duration: '50 min', completion: 72 },
  { title: 'Resident Retention Strategies', type: 'Recommended' as const, duration: '30 min', completion: 58 },
  { title: 'Vendor Management & Procurement', type: 'Required' as const, duration: '45 min', completion: 81 },
  { title: 'ADA Compliance & Accessibility', type: 'Required' as const, duration: '35 min', completion: 90 },
]

const competencyChecks = [
  {
    title: 'Lease Execution Accuracy',
    description: 'AI reviews first 5 leases for errors, flags discrepancies against template standards.',
    howItWorks: 'Automated comparison of executed leases against approved templates. Flags missing clauses, incorrect rates, and signature gaps.',
    employees: 3,
    employeeLabel: '3 employees pending review',
    lastRun: 'Feb 24, 2026',
    passRate: 82,
    icon: '📝',
  },
  {
    title: 'Tour Conversion Assessment',
    description: 'AI analyzes tour-to-application conversion rate vs property benchmark.',
    howItWorks: 'Tracks conversion funnel from scheduled tour → completed tour → application submitted. Compares against 30% benchmark.',
    employees: 5,
    employeeLabel: 'Active monitoring',
    lastRun: 'Feb 25, 2026',
    passRate: 74,
    icon: '🏠',
  },
  {
    title: 'Work Order Triage Accuracy',
    description: 'AI checks priority assignments against SLA rules for proper categorization.',
    howItWorks: 'Compares technician priority assignments against rule-based SLA matrix. Flags mismatches that could cause SLA violations.',
    employees: 4,
    employeeLabel: '2 flags this week',
    lastRun: 'Feb 25, 2026',
    passRate: 91,
    icon: '🔧',
  },
  {
    title: 'Fair Housing Scenario Response',
    description: 'AI-powered scenario quiz testing real-world Fair Housing compliance.',
    howItWorks: 'Presents realistic prospect scenarios and evaluates responses for compliance.',
    employees: 8,
    employeeLabel: '8 employees due for recertification',
    lastRun: 'Feb 20, 2026',
    passRate: 88,
    icon: '⚖️',
  },
]

// Content Builder data
const contentItems = [
  { title: 'Q1 Safety Refresher', type: 'Video', department: 'Maintenance', status: 'Published', lastEdited: 'Feb 20, 2026' },
  { title: 'New Lease Template Guide', type: 'Document', department: 'Leasing', status: 'Draft', lastEdited: 'Feb 25, 2026' },
  { title: 'Resident Complaint Handling', type: 'Interactive', department: 'Operations', status: 'Published', lastEdited: 'Feb 18, 2026' },
  { title: 'Emergency Evacuation Procedures', type: 'Video', department: 'All Departments', status: 'Published', lastEdited: 'Jan 15, 2026' },
  { title: 'Yardi Navigation Basics', type: 'Interactive', department: 'Finance', status: 'Draft', lastEdited: 'Feb 26, 2026' },
]

const contentTypeIcon: Record<string, string> = { Video: '🎬', Document: '📄', Quiz: '❓', Interactive: '🖱️' }

// Certificates data
const certificates = [
  { employee: 'Sarah Mitchell', module: 'Fair Housing Fundamentals', score: 96, issued: 'Jan 15, 2026', expiry: 'Jan 15, 2027', status: 'Active' },
  { employee: 'James Rodriguez', module: 'Fair Housing Fundamentals', score: 88, issued: 'Dec 10, 2025', expiry: 'Dec 10, 2026', status: 'Active' },
  { employee: 'Marcus Thompson', module: 'Emergency Maintenance Protocols', score: 92, issued: 'Feb 01, 2026', expiry: 'Feb 01, 2027', status: 'Active' },
  { employee: 'Rachel Kim', module: 'Yardi Financial Reporting', score: 85, issued: 'Jan 20, 2026', expiry: 'Jan 20, 2027', status: 'Active' },
  { employee: 'Aisha Patel', module: 'Fair Housing Fundamentals', score: 91, issued: 'Mar 05, 2025', expiry: 'Mar 05, 2026', status: 'Expiring' },
  { employee: 'David Chen', module: 'Emergency Maintenance Protocols', score: 78, issued: 'Mar 12, 2025', expiry: 'Mar 12, 2026', status: 'Expiring' },
  { employee: 'Tyler Brooks', module: 'Entrata Lease Execution', score: 94, issued: 'Aug 15, 2025', expiry: 'Aug 15, 2026', status: 'Active' },
  { employee: 'Lisa Nguyen', module: 'Fair Housing Fundamentals', score: 82, issued: 'Jan 20, 2025', expiry: 'Jan 20, 2026', status: 'Expired' },
  { employee: 'Chris Johnson', module: 'Work Order Triage & Priority', score: 89, issued: 'Feb 10, 2025', expiry: 'Feb 10, 2026', status: 'Expired' },
  { employee: 'Amanda Foster', module: 'ADA Compliance & Accessibility', score: 95, issued: 'Feb 20, 2026', expiry: 'Feb 20, 2027', status: 'Active' },
]

const certStatusColor: Record<string, { bg: string; color: string }> = {
  Active: { bg: 'rgba(34,197,94,0.15)', color: 'var(--green)' },
  Expiring: { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
  Expired: { bg: 'rgba(174,19,42,0.15)', color: 'var(--red)' },
}

const typeBadge = (type: 'Required' | 'Recommended' | 'Optional') => {
  const map = {
    Required: { bg: 'rgba(174,19,42,0.15)', color: 'var(--red)' },
    Recommended: { bg: 'rgba(85,156,181,0.15)', color: 'var(--blue)' },
    Optional: { bg: 'rgba(107,114,128,0.15)', color: 'var(--text3)' },
  }
  const m = map[type]
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {type}
    </span>
  )
}

const contentStatusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Published: { bg: 'rgba(34,197,94,0.15)', color: 'var(--green)' },
    Draft: { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
    Archived: { bg: 'rgba(107,114,128,0.15)', color: 'var(--text3)' },
  }
  const m = map[status] || map.Draft
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {status}
    </span>
  )
}

export default function TrainingView() {
  const [activeTab, setActiveTab] = useState<'library' | 'competency' | 'builder' | 'certificates'>('library')
  const [certFilter, setCertFilter] = useState<'All' | 'Active' | 'Expiring' | 'Expired'>('All')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredCerts = certFilter === 'All' ? certificates : certificates.filter(c => c.status === certFilter)

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📚 Training & Competency</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
          Verify skills, not just completion — AI-powered competency assessment
        </p>
      </div>

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

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto" style={{ background: 'var(--bg3)' }}>
        {([['library', 'Training Library'], ['competency', 'Competency Checks'], ['builder', 'Content Builder'], ['certificates', 'Certificates']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: activeTab === id ? 'var(--bg2)' : 'transparent', color: activeTab === id ? 'var(--text)' : 'var(--text3)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'library' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingModules.map((mod) => (
            <div key={mod.title} className="glass-card-static p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold min-w-0" style={{ color: 'var(--text)' }}>{mod.title}</h3>
                {typeBadge(mod.type)}
              </div>
              <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: 'var(--text4)' }}>
                <span>⏱️ {mod.duration}</span>
                <span>📊 {mod.completion}% completion</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${mod.completion}%`, background: mod.completion === 100 ? 'var(--green)' : 'var(--blue)' }} />
                </div>
              </div>
              <button className="mt-auto text-[11px] px-3 py-1.5 rounded-md font-medium self-start" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>
                Assign
              </button>
            </div>
          ))}
        </div>
      ) : activeTab === 'competency' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencyChecks.map((check) => (
            <div key={check.title} className="glass-card-static p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl flex-shrink-0">{check.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{check.title}</h3>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>{check.description}</p>
                </div>
              </div>
              <div className="text-[11px] leading-relaxed p-3 rounded-lg mb-3" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                <span className="font-semibold" style={{ color: 'var(--text3)' }}>How it works:</span> {check.howItWorks}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text4)' }}>
                  <span>👥 {check.employeeLabel}</span>
                  <span>📅 {check.lastRun}</span>
                </div>
                <span className="text-[11px] font-medium" style={{ color: check.passRate >= 85 ? 'var(--green)' : 'var(--orange)' }}>
                  {check.passRate}% pass rate
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'builder' ? (
        <div className="space-y-4">
          {/* Actions bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="text-[12px] px-4 py-2 rounded-lg font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>
              + Create New Module
            </button>
            <button className="text-[11px] px-3 py-2 rounded-lg font-medium" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>📄 Upload PDF</button>
            <button className="text-[11px] px-3 py-2 rounded-lg font-medium" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>📋 Import from SOP</button>
            <button className="text-[11px] px-3 py-2 rounded-lg font-medium" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--purple)' }}>🤖 AI Generate from Description</button>
          </div>

          {showCreateForm && (
            <div className="glass-card-static p-4" style={{ borderLeft: '3px solid var(--blue)' }}>
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>New Training Module</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Module title..." className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                <select className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  <option>Video</option><option>Document</option><option>Quiz</option><option>Interactive</option>
                </select>
                <input placeholder="Department..." className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                <button className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>Save Draft</button>
              </div>
            </div>
          )}

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentItems.map(item => (
              <div key={item.title} className="glass-card-static p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{contentTypeIcon[item.type] || '📄'}</span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.title}</h3>
                  </div>
                  {contentStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text4)' }}>
                  <span>{item.type}</span>
                  <span>•</span>
                  <span>{item.department}</span>
                  <span>•</span>
                  <span>{item.lastEdited}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>Edit</button>
                  <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Certificates tab */
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            {(['All', 'Active', 'Expiring', 'Expired'] as const).map(f => (
              <button key={f} onClick={() => setCertFilter(f)} className="text-[11px] px-3 py-1.5 rounded-md font-medium transition-all"
                style={{ background: certFilter === f ? 'var(--bg2)' : 'var(--bg3)', color: certFilter === f ? 'var(--text)' : 'var(--text3)', border: certFilter === f ? '1px solid var(--border)' : '1px solid transparent' }}>
                {f}
              </button>
            ))}
          </div>

          <div className="glass-card-static overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Employee', 'Module', 'Score', 'Issued', 'Expiry', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((cert, i) => {
                    const sc = certStatusColor[cert.status] || certStatusColor.Active
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text)' }}>{cert.employee}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{cert.module}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium" style={{ color: cert.score >= 90 ? 'var(--green)' : 'var(--text3)' }}>{cert.score}%</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text4)' }}>{cert.issued}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: cert.status === 'Expired' ? 'var(--red)' : cert.status === 'Expiring' ? 'var(--orange)' : 'var(--text4)' }}>{cert.expiry}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: sc.bg, color: sc.color }}>{cert.status}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }}>Download</button>
                            {cert.status !== 'Active' && (
                              <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>Renew</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Training Analytics — visible on all tabs */}
      <div className="glass-card-static p-4 space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>📊 Training Analytics</h2>

        {/* Time-to-competency bar chart */}
        <div>
          <div className="text-[12px] font-medium mb-3" style={{ color: 'var(--text3)' }}>Avg Time-to-Competency by Pathway</div>
          <div className="space-y-2">
            {[
              { name: 'Leasing', days: 22, max: 30 },
              { name: 'Maintenance', days: 18, max: 30 },
              { name: 'Asst Manager', days: 25, max: 30 },
              { name: 'Regional', days: 14, max: 30 },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-[11px] w-24 text-right" style={{ color: 'var(--text3)' }}>{p.name}</span>
                <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-md flex items-center px-2" style={{ width: `${(p.days / p.max) * 100}%`, background: 'linear-gradient(90deg, var(--blue), var(--purple))' }}>
                    <span className="text-[10px] font-bold text-white">{p.days}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion trend + bottleneck */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg3)' }}>
            <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text3)' }}>Completion Trend</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              This Month: <span style={{ color: 'var(--green)' }}>47</span> <span className="text-[11px] font-medium" style={{ color: 'var(--green)' }}>(+12)</span>
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>Last Month: 35 &nbsp;|&nbsp; Avg: 41</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--orange)' }}>⚠️ Guardian Gate Bottleneck</div>
            <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text3)' }}>
              <strong>Lease Execution Clearance</strong> has the highest block rate (34%) — consider adding a prep module.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
