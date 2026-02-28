'use client'

import { useState } from 'react'

const todayAppts = [
  { time: '8:00 AM', patient: 'Maria Santos', type: 'Annual Physical', provider: 'Dr. Patel', status: 'checked-in', room: '3A' },
  { time: '8:30 AM', patient: 'James Wheeler', type: 'Follow-Up (Diabetes)', provider: 'Dr. Patel', status: 'in-progress', room: '2B' },
  { time: '9:00 AM', patient: 'Tamika Johnson', type: 'New Patient Intake', provider: 'Dr. Kim', status: 'scheduled', room: '—' },
  { time: '9:15 AM', patient: 'Robert Chen', type: 'Lab Review', provider: 'NP Collins', status: 'scheduled', room: '—' },
  { time: '9:30 AM', patient: 'Angela Davis', type: 'Sick Visit (Cough)', provider: 'Dr. Patel', status: 'scheduled', room: '—' },
  { time: '10:00 AM', patient: 'William Torres', type: 'Pre-Op Clearance', provider: 'Dr. Kim', status: 'scheduled', room: '—' },
  { time: '10:30 AM', patient: 'Lisa Park', type: 'Medication Management', provider: 'NP Collins', status: 'scheduled', room: '—' },
  { time: '11:00 AM', patient: 'David Mitchell', type: 'Workers Comp Eval', provider: 'Dr. Patel', status: 'scheduled', room: '—' },
]

const agents = [
  { name: 'Intake Bot', desc: 'Pre-visit forms, insurance verification, eligibility checks', status: 'active', tasks: 23, icon: '📋' },
  { name: 'Scheduling Agent', desc: 'Appointment booking, rescheduling, no-show follow-ups', status: 'active', tasks: 47, icon: '📅' },
  { name: 'Claims Processor', desc: 'CPT coding, claim submission, denial management', status: 'active', tasks: 18, icon: '💰' },
  { name: 'Prior Auth Bot', desc: 'Prior authorization requests and status tracking', status: 'active', tasks: 8, icon: '✅' },
  { name: 'Patient Comms', desc: 'Appointment reminders, follow-up messages, portal responses', status: 'active', tasks: 156, icon: '💬' },
  { name: 'Compliance Monitor', desc: 'HIPAA audit trails, consent tracking, policy enforcement', status: 'active', tasks: 5, icon: '🔒' },
]

const claimsData = [
  { id: 'CLM-4521', patient: 'R. Martinez', payer: 'Blue Cross', amount: '$1,245.00', status: 'submitted', date: '02/27' },
  { id: 'CLM-4520', patient: 'S. Williams', payer: 'Aetna', amount: '$890.00', status: 'paid', date: '02/26' },
  { id: 'CLM-4518', patient: 'K. Brown', payer: 'Medicare', amount: '$2,100.00', status: 'denied', date: '02/25' },
  { id: 'CLM-4517', patient: 'J. Lee', payer: 'UnitedHealth', amount: '$675.00', status: 'in-review', date: '02/25' },
  { id: 'CLM-4515', patient: 'M. Garcia', payer: 'Cigna', amount: '$1,580.00', status: 'paid', date: '02/24' },
]

const kpis = [
  { label: "Today's Appointments", value: '32', change: '+4 vs avg', up: true, icon: '🩺' },
  { label: 'Checked In', value: '8', sub: 'of 12 morning slots', icon: '✅', up: false, change: '' },
  { label: 'Open Claims', value: '47', change: '-6 this week', up: true, icon: '📄' },
  { label: 'Avg Wait Time', value: '11m', change: '-3m vs last month', up: true, icon: '⏱️' },
  { label: 'No-Show Rate', value: '4.2%', change: '-1.8% (AI reminders)', up: true, icon: '📉' },
  { label: 'Collections (MTD)', value: '$124.8K', change: '+8.2% vs target', up: true, icon: '💵' },
]

const priorAuths = [
  { patient: 'T. Johnson', procedure: 'MRI Lumbar Spine', payer: 'Aetna', status: 'approved', submitted: '02/25' },
  { patient: 'W. Torres', procedure: 'Knee Arthroscopy', payer: 'Blue Cross', status: 'pending', submitted: '02/26' },
  { patient: 'A. Davis', procedure: 'CT Chest w/ Contrast', payer: 'UnitedHealth', status: 'pending', submitted: '02/27' },
  { patient: 'L. Park', procedure: 'Dupixent (Rx)', payer: 'Cigna', status: 'info-requested', submitted: '02/24' },
]

const patientMessages = [
  { from: 'Maria Santos', msg: 'Can I get my lab results from last week?', time: '7:42 AM', handled: true, by: 'Patient Comms Bot' },
  { from: 'David Mitchell', msg: 'Need to reschedule my Thursday appointment', time: '7:55 AM', handled: true, by: 'Scheduling Agent' },
  { from: "Karen O'Brien", msg: 'Pharmacy says they need a new prior auth for my medication', time: '8:10 AM', handled: false, by: '—' },
]

function Badge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'checked-in': { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
    'in-progress': { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
    'scheduled': { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8' },
    'active': { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
    'submitted': { bg: 'rgba(250,204,21,0.15)', text: '#facc15' },
    'paid': { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
    'denied': { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
    'in-review': { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
    'approved': { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
    'pending': { bg: 'rgba(250,204,21,0.15)', text: '#facc15' },
    'info-requested': { bg: 'rgba(251,146,60,0.15)', text: '#fb923c' },
  }
  const c = colors[status] || { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8' }
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text }}>
      {status.replace('-', ' ')}
    </span>
  )
}

export default function HealthcareView() {
  const [tab, setTab] = useState<'overview' | 'schedule' | 'claims' | 'agents'>('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🏥 Healthcare Command Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>AI-powered practice management — Friday, February 28, 2026</p>
        </div>
        <div className="flex gap-2">
          {(['overview', 'schedule', 'claims', 'agents'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'var(--bg2)',
                color: tab === t ? '#fff' : 'var(--text3)',
                border: tab === t ? 'none' : '1px solid var(--border)',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'claims' && <ClaimsTab />}
      {tab === 'agents' && <AgentsTab />}
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{k.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text4)' }}>{k.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{k.value}</div>
            {k.change && <div className="text-xs mt-1 font-medium" style={{ color: k.up ? '#4ade80' : '#f87171' }}>{k.change}</div>}
            {k.sub && <div className="text-xs mt-1" style={{ color: 'var(--text4)' }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📅 Today&apos;s Schedule</h3>
          <div className="space-y-2">
            {todayAppts.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-white/5">
                <span className="text-xs font-mono w-16 shrink-0" style={{ color: 'var(--text3)' }}>{a.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{a.patient}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{a.type} · {a.provider}</div>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>+26 more today →</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>💰 Recent Claims</h3>
          <div className="space-y-2">
            {claimsData.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5">
                <span className="text-xs font-mono w-20 shrink-0" style={{ color: 'var(--text3)' }}>{c.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.patient}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{c.payer} · {c.date}</div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text)' }}>{c.amount}</span>
                <Badge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>✅ Prior Authorizations</h3>
          <div className="space-y-2">
            {priorAuths.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.patient}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{p.procedure} · {p.payer}</div>
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>💬 Patient Messages</h3>
          <div className="space-y-2">
            {patientMessages.map((m, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.from}</span>
                  <span className="text-xs" style={{ color: 'var(--text4)' }}>{m.time}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{m.msg}</p>
                <div className="flex items-center gap-2">
                  {m.handled ? (
                    <span className="text-[11px] font-medium" style={{ color: '#4ade80' }}>✓ Handled by {m.by}</span>
                  ) : (
                    <span className="text-[11px] font-medium" style={{ color: '#facc15' }}>⏳ Awaiting triage</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>🧠 AI Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="text-sm font-bold mb-1" style={{ color: '#4ade80' }}>Revenue Opportunity</div>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>12 patients overdue for annual wellness visits. Auto-outreach could generate ~$4,800 in preventive care revenue.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <div className="text-sm font-bold mb-1" style={{ color: '#facc15' }}>Denial Pattern Detected</div>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>3 Medicare claims denied for modifier -25 this month. Recommend documentation template update for E/M + procedure visits.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div className="text-sm font-bold mb-1" style={{ color: '#60a5fa' }}>Staffing Prediction</div>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Next Tuesday projected 40+ appointments (flu season trend). Consider adding a float MA or opening telehealth overflow slots.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleTab() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>📅 Full Day Schedule — Friday, Feb 28</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>32 Appointments</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>3 Providers</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Time', 'Patient', 'Visit Type', 'Provider', 'Room', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayAppts.map((a, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text3)' }}>{a.time}</td>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>{a.patient}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{a.type}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{a.provider}</td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text3)' }}>{a.room}</td>
                  <td className="py-2.5 px-3"><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Dr. Patel', slots: 14, filled: 12, specialty: 'Internal Medicine' },
          { name: 'Dr. Kim', slots: 12, filled: 11, specialty: 'Family Medicine' },
          { name: 'NP Collins', slots: 10, filled: 9, specialty: 'Primary Care' },
        ].map(p => (
          <div key={p.name} className="glass-card p-4">
            <div className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{p.name}</div>
            <div className="text-xs mb-3" style={{ color: 'var(--text4)' }}>{p.specialty}</div>
            <div className="w-full h-2 rounded-full mb-2" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full" style={{
                width: `${(p.filled / p.slots) * 100}%`,
                background: p.filled / p.slots > 0.9 ? 'linear-gradient(90deg, #facc15, #fb923c)' : 'linear-gradient(90deg, var(--blue), var(--teal))',
              }} />
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>
              {p.filled}/{p.slots} slots filled ({Math.round((p.filled / p.slots) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClaimsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Submitted (MTD)', value: '142', icon: '📤' },
          { label: 'Paid', value: '118', icon: '✅' },
          { label: 'Denied', value: '8', icon: '❌' },
          { label: 'Clean Claim Rate', value: '94.4%', icon: '⭐' },
        ].map(k => (
          <div key={k.label} className="glass-card p-4 text-center">
            <span className="text-lg">{k.icon}</span>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{k.value}</div>
            <div className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text4)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📄 Claims Pipeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Claim ID', 'Patient', 'Payer', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claimsData.map(c => (
                <tr key={c.id} className="hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5 px-3 font-mono font-bold" style={{ color: 'var(--blue)' }}>{c.id}</td>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>{c.patient}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{c.payer}</td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--text)' }}>{c.amount}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{c.date}</td>
                  <td className="py-2.5 px-3"><Badge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>🔄 AI Denial Management</h3>
        <div className="p-4 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-sm font-bold mb-1" style={{ color: '#f87171' }}>CLM-4518 — Medicare Denial (CO-4)</div>
              <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                Claim denied for &quot;procedure code inconsistent with modifier.&quot; AI analysis: Modifier -25 was applied to E/M 99214 with same-day 11721.
                Documentation supports medical necessity but operative note lacks separate diagnosis linkage.
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', color: '#fff' }}>
                  Auto-Generate Appeal
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                  Review Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentsTab() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(a => (
          <div key={a.name} className="glass-card p-5 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                {a.icon}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{a.name}</div>
                <Badge status={a.status} />
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{a.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--text4)' }}>{a.tasks} tasks today</span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📡 Live Agent Activity</h3>
        <div className="space-y-3">
          {[
            { time: '8:22 AM', agent: 'Intake Bot', action: 'Verified insurance for Maria Santos — Blue Cross PPO, $30 copay, deductible met', icon: '📋' },
            { time: '8:18 AM', agent: 'Patient Comms', action: 'Sent appointment reminder to 14 patients for Monday (2 confirmed via text)', icon: '💬' },
            { time: '8:15 AM', agent: 'Claims Processor', action: 'Submitted 3 claims to clearinghouse — CLM-4522, CLM-4523, CLM-4524', icon: '💰' },
            { time: '8:10 AM', agent: 'Scheduling Agent', action: 'Rescheduled David Mitchell from Thu to next Mon 10:30 AM (patient request)', icon: '📅' },
            { time: '8:05 AM', agent: 'Prior Auth Bot', action: 'Received approval for T. Johnson MRI Lumbar Spine (auth #PA-88291)', icon: '✅' },
            { time: '8:01 AM', agent: 'Compliance Monitor', action: 'Daily HIPAA audit: 0 violations, 4 access logs reviewed, all compliant', icon: '🔒' },
          ].map((e, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5">
              <span className="text-lg mt-0.5">{e.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{e.agent}</span>
                  <span className="text-xs" style={{ color: 'var(--text4)' }}>{e.time}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{e.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
