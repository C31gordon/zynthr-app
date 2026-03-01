'use client'

import { useState, useEffect } from 'react'
import { getAgents, getBots, getTickets, getSuggestions, getDepartments, getAuditLog } from '@/lib/data'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Working late'
}

const actionLabels: Record<string, { icon: string; label: string }> = {
  login: { icon: '🔑', label: 'logged in' },
  agent_created: { icon: '🤖', label: 'deployed agent' },
  workflow_triggered: { icon: '⚡', label: 'workflow triggered' },
  bot_updated: { icon: '⚙️', label: 'updated bot' },
  prompt_injection_detected: { icon: '🛡️', label: 'Prompt injection blocked' },
  policy_updated: { icon: '🔒', label: 'updated policy' },
  ticket_resolved: { icon: '✅', label: 'ticket resolved' },
  exception_requested: { icon: '⚠️', label: 'exception requested' },
  export_data: { icon: '💾', label: 'data exported' },
}

const deptIcons: Record<string, string> = {
  Operations: '🏢', Marketing: '📢', 'Human Resources': '👥', Finance: '💰',
  IT: '💻', Training: '📚', Maintenance: '🔧',
}

export default function DashboardView({ userName, orgName }: { userName?: string; orgName?: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ agents: any[]; bots: any[]; tickets: any[]; suggestions: any[]; departments: any[]; audit: any[] }>({
    agents: [], bots: [], tickets: [], suggestions: [], departments: [], audit: [],
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([getAgents(), getBots(), getTickets(), getSuggestions(), getDepartments(), getAuditLog(10)])
      .then(([agents, bots, tickets, suggestions, departments, audit]) => {
        setData({ agents, bots, tickets, suggestions, departments, audit })
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  // Period filtering
  const periodStart = (() => {
    const now = new Date()
    if (selectedPeriod === 'today') {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d
    }
    if (selectedPeriod === 'week') return new Date(now.getTime() - 7 * 86400000)
    return new Date(now.getTime() - 30 * 86400000) // month
  })()

  const inPeriod = (dateStr: string) => new Date(dateStr) >= periodStart
  const periodTickets = data.tickets.filter((t: { created_at: string }) => inPeriod(t.created_at))
  const periodSuggestions = data.suggestions.filter((s: { created_at: string }) => inPeriod(s.created_at))
  const periodAudit = data.audit.filter((a: { created_at: string }) => inPeriod(a.created_at))

  const openTickets = periodTickets.filter((t: { status: string }) => !['resolved', 'closed'].includes(t.status))
  const urgentCount = openTickets.filter((t: { priority: string }) => t.priority === 'urgent').length
  const highCount = openTickets.filter((t: { priority: string }) => t.priority === 'high').length
  const medCount = openTickets.filter((t: { priority: string }) => t.priority === 'medium').length

  const statusCards = [
    { label: 'Active Agents', value: String(data.agents.filter((a: { status: string }) => a.status === 'active').length), sub: data.agents.map((a: { name: string }) => a.name.replace(' Agent', '')).join(' • ') || 'None deployed', color: 'var(--blue)', icon: '🤖', trend: '', trendUp: true },
    { label: 'Support Bots', value: String(data.bots.length), sub: `${data.bots.filter((b: { status: string }) => b.status === 'active').length} active`, color: 'var(--green)', icon: '⚙️', trend: '', trendUp: true },
    { label: 'Open Tickets', value: String(openTickets.length), sub: `${urgentCount} urgent, ${highCount} high, ${medCount} medium`, color: 'var(--orange)', icon: '🎫', trend: '', trendUp: false },
    { label: 'Suggestions', value: String(periodSuggestions.length), sub: `${periodSuggestions.filter((s: { status: string }) => s.status === 'under_review').length} under review`, color: 'var(--purple)', icon: '💡', trend: '', trendUp: true },
  ]

  // Build department health from real data
  const departmentHealth = data.departments.map((dept: { id: string; name: string }) => {
    const deptAgents = data.agents.filter((a: { department_id: string }) => a.department_id === dept.id)
    const deptBots = data.bots.filter((b: { department_id: string }) => b.department_id === dept.id)
    const deptTickets = data.tickets.filter((t: { target_department_id: string }) => t.target_department_id === dept.id)
    const isActive = deptAgents.length > 0
    return {
      name: dept.name, icon: deptIcons[dept.name] || '📁', agents: deptAgents.length, bots: deptBots.length,
      status: isActive ? 'active' as const : 'pending' as const,
      tickets: deptTickets.filter((t: { status: string }) => !['resolved', 'closed'].includes(t.status)).length,
      health: isActive ? Math.max(70, 100 - deptTickets.filter((t: { priority: string }) => t.priority === 'urgent').length * 10) : 0,
    }
  })

  const securityAlerts = [
    { level: 'critical' as const, text: '3 prompt injection attempts from jsmith@risere.com in 24 hours', action: 'Investigate', icon: '🔴' },
    { level: 'warning' as const, text: 'Access exception for Marketing → Ops expires in 7 days', action: 'Review', icon: '🟡' },
    { level: 'info' as const, text: 'Weekly security audit completed — no issues found', action: 'View', icon: '🟢' },
  ]

  if (loading) {
    return (
      <div className="w-full mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-2xl mb-2 animate-pulse">🔷</div>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap fade-in">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {getGreeting()}, {userName || 'Courtney'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {orgName || 'Zynthr'} — Owner Dashboard • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card-static rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Activity</h3>
            <button className="text-xs" style={{ color: 'var(--blue)' }}>View All</button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {periodAudit.map((entry: { id: string; action: string; details: Record<string, unknown>; user?: { full_name: string } | null; created_at: string }, i: number) => {
              const meta = actionLabels[entry.action] || { icon: '📋', label: entry.action.replace(/_/g, ' ') }
              const actor = entry.user?.full_name || 'System'
              const ago = getTimeAgo(entry.created_at)
              return (
                <div key={entry.id || i} className="px-5 py-3 flex items-start gap-3 transition-colors hover:bg-white/[0.02]">
                  <span className="text-base mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                      {actor} — {meta.label}
                      {entry.details && typeof entry.details === 'object' && Object.keys(entry.details).length > 0 && (
                        <span style={{ color: 'var(--text4)' }}> ({Object.values(entry.details).slice(0, 2).join(', ')})</span>
                      )}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>{ago}</p>
                  </div>
                </div>
              )
            })}
            {periodAudit.length === 0 && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text4)' }}>No recent activity</div>
            )}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="glass-card-static rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>🛡️ Security Alerts</h3>
            <span className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: 'rgba(174,19,42,0.15)', color: 'var(--red)' }}>
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
                  <span className="text-xs flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{alert.text}</p>
                    <button className="text-[11px] font-medium mt-1" style={{ color: 'var(--blue)' }}>{alert.action} →</button>
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
          <span className="text-xs" style={{ color: 'var(--text4)' }}>
            {departmentHealth.filter((d: { status: string }) => d.status === 'active').length} of {departmentHealth.length} departments active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Department', 'Status', 'Agents', 'Bots', 'Open Tickets', 'Health'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentHealth.map((dept: { name: string; icon: string; agents: number; bots: number; status: 'active' | 'pending'; tickets: number; health: number }, i: number) => (
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
                        boxShadow: dept.status === 'active' ? '0 0 6px rgba(107,164,138,0.6)' : 'none',
                      }} />
                      <span style={{ color: dept.status === 'active' ? 'var(--green)' : 'var(--text4)' }}>
                        {dept.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{dept.agents}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{dept.bots}</td>
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
          <div className="flex items-center gap-4 flex-wrap text-[11px]" style={{ color: 'var(--text3)' }}>
            <span>4 active policies</span>
            <span>•</span>
            <span style={{ color: 'var(--green)' }}>✅ All boundaries enforced</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
