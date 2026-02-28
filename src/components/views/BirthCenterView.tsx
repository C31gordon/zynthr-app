'use client'

import { useState } from 'react'

// ── Demo Data ──────────────────────────────────────────

const kpis = [
  { label: 'Active Patients', value: '47', change: '12 in 3rd trimester', icon: '🤰', up: true },
  { label: 'Births (MTD)', value: '8', sub: '5 center · 2 home · 1 hospital', icon: '👶', up: true, change: '' },
  { label: 'Pending Claims', value: '14', change: '-3 this week', up: true, icon: '📄' },
  { label: 'Revenue (MTD)', value: '$62.4K', change: '+11% vs last month', up: true, icon: '💵' },
  { label: 'Prenatal Compliance', value: '96%', change: 'All labs on schedule', up: true, icon: '✅' },
  { label: 'Patient Satisfaction', value: '4.9/5', change: '22 reviews this quarter', up: true, icon: '⭐' },
]

const departments = [
  {
    name: 'Operations',
    icon: '🏥',
    color: '#60a5fa',
    agent: 'Operations Agent',
    desc: 'Day-to-day birth center operations, scheduling, supply chain, facility management',
    bots: [
      { name: 'Scheduling Bot', desc: 'Prenatal visit cadence (monthly→biweekly→weekly), birth center room booking, hospital backup coordination', icon: '📅', tasks: 34 },
      { name: 'Supply & Inventory Bot', desc: 'Birth kit tracking, medical supply reorder alerts, equipment maintenance schedules', icon: '📦', tasks: 12 },
      { name: 'On-Call Triage Bot', desc: '24/7 contraction timing assessment, urgency scoring, midwife escalation with patient summary', icon: '📞', tasks: 8 },
      { name: 'Transfer Coordinator Bot', desc: 'Hospital transfer protocols, backup OB notification, records transfer, insurance pre-auth for facility', icon: '🚑', tasks: 3 },
    ],
  },
  {
    name: 'Financial Management',
    icon: '💰',
    color: '#4ade80',
    agent: 'Revenue Cycle Agent',
    desc: 'Claims processing, billing, collections, insurance verification, financial counseling',
    bots: [
      { name: 'Claims Processor', desc: 'Global maternity codes (59400/59610), split billing for center vs. home vs. hospital, modifier logic', icon: '📄', tasks: 18 },
      { name: 'Insurance Verification Bot', desc: 'Coverage checks for birth center & home birth, out-of-network benefits, single case agreements', icon: '🔍', tasks: 23 },
      { name: 'Prior Auth Bot', desc: 'Payer-specific auth forms, status polling, appeal generation for denials', icon: '✅', tasks: 6 },
      { name: 'Patient Billing Bot', desc: 'Payment plans for self-pay/concierge packages, statement generation, HSA/FSA guidance', icon: '💳', tasks: 15 },
    ],
  },
  {
    name: 'Practice Management',
    icon: '🩺',
    color: '#a855f7',
    agent: 'Clinical Practice Agent',
    desc: 'Prenatal care coordination, clinical protocols, lab tracking, postpartum follow-up',
    bots: [
      { name: 'Prenatal Care Bot', desc: 'Gestational-age-based visit scheduling, lab windows (GBS, glucose, blood type), care gap alerts', icon: '🤰', tasks: 41 },
      { name: 'Postpartum Bot', desc: 'Automated check-ins (24hr, 3-day, 1-week, 6-week), Edinburgh depression screening, lactation referrals', icon: '👶', tasks: 27 },
      { name: 'Birth Plan Bot', desc: 'Collaborative birth plan builder, preference documentation, doula/photographer coordination', icon: '📋', tasks: 19 },
      { name: 'Compliance & Charting Bot', desc: 'Documentation completeness checks, ACNM standards tracking, credential renewal alerts', icon: '📝', tasks: 9 },
    ],
  },
  {
    name: 'Program Development',
    icon: '🎓',
    color: '#facc15',
    agent: 'Program Development Agent',
    desc: 'Childbirth education, training programs, new service development, quality improvement',
    bots: [
      { name: 'Education Content Bot', desc: 'Trimester-based content drip (nutrition, birth prep, postpartum), class scheduling, attendance tracking', icon: '📚', tasks: 33 },
      { name: 'Student/Preceptor Bot', desc: 'Midwifery student clinical hours tracking, preceptor scheduling, competency documentation', icon: '🎓', tasks: 7 },
      { name: 'Quality Metrics Bot', desc: 'Birth outcomes tracking, C-section transfer rates, MANA stats submission, accreditation prep', icon: '📊', tasks: 11 },
    ],
  },
  {
    name: 'Community Outreach & Marketing',
    icon: '📢',
    color: '#fb923c',
    agent: 'Community & Marketing Agent',
    desc: 'Patient acquisition, community education, social media, referral network management',
    bots: [
      { name: 'Lead Nurture Bot', desc: 'Inquiry response, consultation scheduling, drip campaigns for prospective families', icon: '💌', tasks: 29 },
      { name: 'Social Media Bot', desc: 'Content calendar, birth story features (with consent), educational posts, engagement tracking', icon: '📱', tasks: 44 },
      { name: 'Referral Network Bot', desc: 'OB/doula/pediatrician referral tracking, thank-you automation, partnership outreach', icon: '🤝', tasks: 16 },
      { name: 'Community Events Bot', desc: 'Open house scheduling, childbirth class promotion, birth circle coordination, RSVP management', icon: '🎉', tasks: 21 },
    ],
  },
]

const upcomingPatients = [
  { name: 'Jessica Rivera', edd: 'Mar 4', weeks: '39w2d', type: 'Birth Center', status: 'active', flag: '🟢' },
  { name: 'Amanda Foster', edd: 'Mar 8', weeks: '38w5d', type: 'Home Birth', status: 'active', flag: '🟢' },
  { name: 'Keisha Williams', edd: 'Mar 12', weeks: '38w1d', type: 'Birth Center', status: 'active', flag: '🟡' },
  { name: 'Sarah Chen', edd: 'Mar 15', weeks: '37w5d', type: 'Hospital (backup)', status: 'monitoring', flag: '🟡' },
  { name: 'Maria Lopez', edd: 'Mar 22', weeks: '36w5d', type: 'Home Birth', status: 'active', flag: '🟢' },
  { name: 'Taylor Brooks', edd: 'Apr 1', weeks: '35w2d', type: 'Birth Center', status: 'active', flag: '🟢' },
]

const recentActivity = [
  { time: '8:45 AM', agent: 'On-Call Triage Bot', action: 'Contraction assessment for Jessica Rivera — 7 min apart, not yet active. Sent comfort measures guide.', icon: '📞' },
  { time: '8:30 AM', agent: 'Claims Processor', action: 'Submitted 3 global maternity claims (59400) to Blue Cross — $12,600 total billed', icon: '💰' },
  { time: '8:22 AM', agent: 'Prenatal Care Bot', action: 'GBS culture reminder sent to 4 patients at 36 weeks. Lab orders auto-generated.', icon: '🤰' },
  { time: '8:15 AM', agent: 'Lead Nurture Bot', action: '3 new consultation requests overnight — auto-responded with availability for next week', icon: '💌' },
  { time: '8:10 AM', agent: 'Insurance Verification Bot', action: 'Flagged: Taylor Brooks Cigna plan does NOT cover home birth. Recommending single case agreement.', icon: '⚠️' },
  { time: '8:05 AM', agent: 'Education Content Bot', action: 'Week 36 content package sent to 6 patients: birth plan finalization, hospital bag checklist, signs of labor', icon: '📚' },
  { time: '8:01 AM', agent: 'Postpartum Bot', action: '48-hour check-in completed for Diana Walsh (born 2/26). Edinburgh score: 4 (normal). Breastfeeding going well.', icon: '👶' },
]

function Badge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'active': { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
    'monitoring': { bg: 'rgba(250,204,21,0.15)', text: '#facc15' },
  }
  const c = colors[status] || { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8' }
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  )
}

// ── Main View ──────────────────────────────────────────

export default function BirthCenterView() {
  const [tab, setTab] = useState<'overview' | 'departments' | 'patients' | 'activity'>('overview')
  const [expandedDept, setExpandedDept] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🌿 Birth Center Command Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Certified Nurse Midwife Practice — AI-Powered Operations
          </p>
        </div>
        <div className="flex gap-2">
          {(['overview', 'departments', 'patients', 'activity'] as const).map(t => (
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

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
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

          {/* Two column: Upcoming + Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Due Soon */}
            <div className="glass-card p-5">
              <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>🤰 Patients Due Soon</h3>
              <div className="space-y-2">
                {upcomingPatients.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5">
                    <span>{p.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text4)' }}>EDD {p.edd} · {p.weeks} · {p.type}</div>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5">
              <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📡 Agent Activity</h3>
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                    <span className="text-lg mt-0.5">{e.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{e.agent}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text4)' }}>{e.time}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{e.action}</p>
                    </div>
                  </div>
                ))}
            </div>
            </div>
          </div>

          {/* 5 Pillars Overview */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>🌿 Your 5 Pillars — AI Agent Coverage</h3>
            <div className="grid md:grid-cols-5 gap-3">
              {departments.map((d, i) => (
                <div key={i} className="p-4 rounded-xl text-center cursor-pointer hover:scale-[1.02] transition-all"
                  onClick={() => { setTab('departments'); setExpandedDept(i) }}
                  style={{ background: `${d.color}10`, border: `1px solid ${d.color}30` }}>
                  <span className="text-2xl">{d.icon}</span>
                  <div className="text-sm font-bold mt-2" style={{ color: 'var(--text)' }}>{d.name}</div>
                  <div className="text-xs mt-1" style={{ color: d.color }}>{d.bots.length} bots · {d.bots.reduce((s, b) => s + b.tasks, 0)} tasks/day</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>🧠 AI Insights</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <div className="text-sm font-bold mb-1" style={{ color: '#facc15' }}>Insurance Alert</div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Taylor Brooks (35w) — Cigna plan excludes home birth. Recommend initiating single case agreement NOW or discussing birth center option at next visit.</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div className="text-sm font-bold mb-1" style={{ color: '#4ade80' }}>Revenue Opportunity</div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>6 claims from January still pending at Medicaid. Auto-follow-up could recover ~$8,400. Claims Processor ready to submit status inquiries.</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <div className="text-sm font-bold mb-1" style={{ color: '#60a5fa' }}>Growth Signal</div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Consultation requests up 40% this month. 8 of 12 inquiries cited &quot;home birth&quot; — consider a dedicated home birth info session or landing page.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-4">
          {departments.map((dept, di) => (
            <div key={di} className="glass-card overflow-hidden">
              <button className="w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedDept(expandedDept === di ? null : di)}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `linear-gradient(135deg, ${dept.color}, ${dept.color}80)` }}>
                    {dept.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{dept.name}</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${dept.color}20`, color: dept.color }}>
                        {dept.bots.length} bots · {dept.bots.reduce((s, b) => s + b.tasks, 0)} tasks/day
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{dept.desc}</p>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text3)', transform: expandedDept === di ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>
              </button>

              {expandedDept === di && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                  {/* Agent */}
                  <div className="mt-4 mb-4 p-4 rounded-xl" style={{ background: `${dept.color}08`, border: `1px solid ${dept.color}20` }}>
                    <div className="text-sm font-bold mb-1" style={{ color: dept.color }}>🤖 {dept.agent}</div>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>{dept.desc}</p>
                  </div>

                  {/* Bots */}
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text4)' }}>
                    Support Bots ({dept.bots.length})
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {dept.bots.map((bot, bi) => (
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
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                                <span className="text-[10px]" style={{ color: '#4ade80' }}>Active</span>
                              </div>
                            </div>
                            <p className="text-[11px] mb-2" style={{ color: 'var(--text4)' }}>{bot.desc}</p>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text4)' }}>{bot.tasks} tasks today</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'patients' && (
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>🤰 Active Patient Panel</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['', 'Patient', 'EDD', 'Gestational Age', 'Birth Plan', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase" style={{ color: 'var(--text4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingPatients.map((p, i) => (
                    <tr key={i} className="hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 px-3">{p.flag}</td>
                      <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>{p.name}</td>
                      <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{p.edd}</td>
                      <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text3)' }}>{p.weeks}</td>
                      <td className="py-2.5 px-3" style={{ color: 'var(--text3)' }}>{p.type}</td>
                      <td className="py-2.5 px-3"><Badge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Postpartum Tracking */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>👶 Recent Births & Postpartum</h3>
            <div className="space-y-2">
              {[
                { name: 'Diana Walsh', born: 'Feb 26', type: 'Birth Center', weight: '7 lb 4 oz', pp: '48hr check ✅', edinburgh: '4 (normal)', feeding: 'Breastfeeding well' },
                { name: 'Priya Sharma', born: 'Feb 22', type: 'Home Birth', weight: '8 lb 1 oz', pp: '1-week check ✅', edinburgh: '3 (normal)', feeding: 'Combo feeding' },
                { name: 'Rachel Green', born: 'Feb 18', type: 'Birth Center', weight: '6 lb 11 oz', pp: '6-week scheduled Mar 1', edinburgh: '7 (monitor)', feeding: 'Breastfeeding — LC referral sent' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <span className="text-xl">👶</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{b.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text4)' }}>Born {b.born} · {b.type} · {b.weight}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>{b.pp}</div>
                    <div className="text-[11px]" style={{ color: b.edinburgh.includes('monitor') ? '#facc15' : '#4ade80' }}>Edinburgh: {b.edinburgh}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📡 Full Agent Activity Feed</h3>
          <div className="space-y-3">
            {recentActivity.map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5">
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
  )
}
