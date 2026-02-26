'use client'

import { useState, useEffect } from 'react'

const statusCards = [
  { label: 'Active Agents', value: '3', sub: 'Ops • Training • Maintenance', color: 'var(--blue)', icon: '🤖', trend: '+2 this week', trendUp: true },
  { label: 'Support Bots', value: '12', sub: '10 active, 2 configuring', color: 'var(--green)', icon: '⚙️', trend: '3 new today', trendUp: true },
  { label: 'Open Tickets', value: '7', sub: '2 urgent, 3 high, 2 medium', color: 'var(--orange)', icon: '🎫', trend: '↓ 12% from last week', trendUp: false },
  { label: 'Suggestions', value: '15', sub: '4 under review, 2 planned', color: 'var(--purple)', icon: '💡', trend: '3 new this week', trendUp: true },
]

const recentActivity = [
  { icon: '🤖', text: 'Ops Agent completed DLR generation for Bartram Park', time: '5 min ago', type: 'agent' },
  { icon: '🎫', text: 'Ticket #TKT-0012 created: "Laptop running slow" → IT', time: '12 min ago', type: 'ticket' },
  { icon: '🔒', text: 'Access exception approved: Marketing → Ops SOPs (30 days)', time: '45 min ago', type: 'security' },
  { icon: '💡', text: 'Suggestion #SUG-0015: "Add competitor rent comps" — 4 votes', time: '2 hours ago', type: 'suggestion' },
  { icon: '⚡', text: 'Workflow "Email Cleanup" ran successfully — 8 items processed', time: '3 hours ago', type: 'workflow' },
  { icon: '🛡️', text: 'Prompt injection attempt blocked — user: jsmith@risere.com', time: '4 hours ago', type: 'security' },
  { icon: '✅', text: 'Maintenance Bot resolved work order #WO-4421 (HVAC repair)', time: '5 hours ago', type: 'agent' },
]

const departmentHealth = [
  { name: 'Operations', icon: '🏢', agents: 1, bots: 4, status: 'active' as const, memoryUsed: '2.4 GB', tickets: 2, health: 96 },
  { name: 'Training', icon: '📚', agents: 1, bots: 3, status: 'active' as const, memoryUsed: '1.1 GB', tickets: 1, health: 92 },
  { name: 'Maintenance', icon: '🔧', agents: 1, bots: 3, status: 'active' as const, memoryUsed: '0.8 GB', tickets: 3, health: 88 },
  { name: 'HR', icon: '👥', agents: 0, bots: 0, status: 'pending' as const, memoryUsed: '—', tickets: 0, health: 0 },
  { name: 'Marketing', icon: '📢', agents: 0, bots: 0, status: 'pending' as const, memoryUsed: '—', tickets: 1, health: 0 },
  { name: 'Finance', icon: '💰', agents: 0, bots: 0, status: 'pending' as const, memoryUsed: '—', tickets: 0, health: 0 },
  { name: 'IT', icon: '💻', agents: 0, bots: 0, status: 'pending' as const, memoryUsed: '—', tickets: 0, health: 0 },
]

const securityAlerts = [
  { level: 'critical' as const, text: '3 prompt injection attempts from jsmith@risere.com in 24 hours', action: 'Investigate', icon: '🔴' },
  { level: 'warning' as const, text: 'Access exception for Marketing → Ops expires in 7 days', action: 'Review', icon: '🟡' },
  { level: 'info' as const, text: 'Weekly security audit completed — no issues found', action: 'View', icon: '🟢' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Working late'
}

export default function DashboardView() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {getGreeting()}, Courtney
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            RISE Real Estate — Owner Dashboard • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map(period => (
            <button key={period} onClick={() => setSelectedPeriod(period)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedPeriod === period ? 'var(--blue)' : 'var(--bg3)',
                color: selectedPeriod === period ? 'white' : 'var(--text3)',
              }}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((card, i) => (
          <div key={i} className="glass-card p-5 rounded-xl fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text4)' }}>
                {card.label}
              </span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{card.sub}</div>
            <div className="text-[10px] font-medium" style={{ color: card.trendUp ? 'var(--green)' : 'var(--orange)' }}>
              {card.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 glass-card-static rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Activity</h3>
            <button className="text-xs" style={{ color: 'var(--blue)' }}>View All</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3 transition-colors hover:bg-white/[0.02]">
                <span className="text-base mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>{item.text}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="glass-card-static rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>🛡️ Security Alerts</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
              1 critical
            </span>
          </div>
          <div className="p-3 space-y-2">
            {securityAlerts.map((alert, i) => (
              <div key={i} className="p-3 rounded-lg" style={{
                background: 'var(--bg)',
                borderLeft: `3px solid ${alert.level === 'critical' ? 'var(--red)' : alert.level === 'warning' ? 'var(--orange)' : 'var(--green)'}`,
              }}>
                <div className="flex items-start gap-2">
                  <span className="text-xs">{alert.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{alert.text}</p>
                    <button className="text-[10px] font-medium mt-1" style={{ color: 'var(--blue)' }}>{alert.action} →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Health */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Department Health</h3>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>3 of 7 departments active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Department', 'Status', 'Agents', 'Bots', 'Memory', 'Tickets', 'Health'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentHealth.map((dept, i) => (
                <tr key={i} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span>{dept.icon}</span> {dept.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{
                        background: dept.status === 'active' ? 'var(--green)' : 'var(--text4)',
                        boxShadow: dept.status === 'active' ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
                      }} />
                      <span style={{ color: dept.status === 'active' ? 'var(--green)' : 'var(--text4)' }}>
                        {dept.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{dept.agents}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{dept.bots}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{dept.memoryUsed}</td>
                  <td className="px-5 py-3" style={{ color: dept.tickets > 2 ? 'var(--orange)' : 'var(--text2)' }}>{dept.tickets}</td>
                  <td className="px-5 py-3">
                    {dept.health > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${dept.health}%`,
                            background: dept.health >= 90 ? 'var(--green)' : dept.health >= 70 ? 'var(--orange)' : 'var(--red)',
                          }} />
                        </div>
                        <span style={{ color: 'var(--text3)' }}>{dept.health}%</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text4)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RKBAC Status Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm">🔒</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>RKBAC™ Status</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text3)' }}>
            <span>6 active policies</span>
            <span>•</span>
            <span>3 active exceptions</span>
            <span>•</span>
            <span>1 pending approval</span>
            <span>•</span>
            <span style={{ color: 'var(--green)' }}>✅ All boundaries enforced</span>
          </div>
        </div>
      </div>
    </div>
  )
}
