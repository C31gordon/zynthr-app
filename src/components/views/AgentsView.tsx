'use client'

import { useState, useEffect } from 'react'
import { getAgents, getBots } from '@/lib/data'

interface BotRow {
  id: string
  name: string
  status: string
  bot_type: string | null
  description: string | null
  capabilities: string[]
  agent_id: string
}

interface AgentRow {
  id: string
  name: string
  description: string | null
  status: string
  capabilities: string[]
  owner_user_id: string | null
  department?: { id: string; name: string; icon: string | null } | null
}

const deptIcons: Record<string, string> = {
  Operations: '🏢', Marketing: '📢', 'Human Resources': '👥', Finance: '💰',
  IT: '💻', Training: '📚', Maintenance: '🔧',
}

const statusColors: Record<string, string> = {
  active: 'var(--green)',
  paused: 'var(--orange)',
  configuring: 'var(--blue)',
  error: 'var(--red)',
}

const pendingDepartments = [
  { name: 'HR', icon: '👥', owner: 'Brett Johnson', planned: 'Phase 3 (Day 30-60)' },
  { name: 'Marketing', icon: '📢', owner: 'TBD', planned: 'Phase 3 (Day 30-60)' },
  { name: 'Finance', icon: '💰', owner: 'TBD', planned: 'Phase 4 (Day 60-90)' },
  { name: 'IT', icon: '💻', owner: 'Ben McClendon', planned: 'Phase 4 (Day 60-90)' },
]

export default function AgentsView() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [bots, setBots] = useState<BotRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAgents(), getBots()]).then(([a, b]) => {
      setAgents(a as AgentRow[])
      setBots(b as BotRow[])
      if (a.length > 0) setExpandedAgent(a[0].id)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading agents...</p></div>
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Agents & Bots</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {agents.length} active agents • {bots.length} bots deployed
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}>
          + Deploy Agent
        </button>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => {
          const agentBots = bots.filter(b => b.agent_id === agent.id)
          const deptName = agent.department?.name || 'Unknown'
          const icon = deptIcons[deptName] || '📁'

          return (
            <div key={agent.id} className="glass-card-static rounded-xl overflow-hidden fade-in">
              <div className="p-5 cursor-pointer transition-colors hover:bg-white/[0.02]"
                onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                      <span className="text-2xl">{icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{agent.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full font-medium"
                          style={{ background: `${statusColors[agent.status] || 'var(--text4)'}15`, color: statusColors[agent.status] || 'var(--text4)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[agent.status] || 'var(--text4)' }} />
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text3)' }}>{agent.description}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {agent.capabilities.map((cap, i) => (
                          <span key={i} className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                            {cap.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      <span style={{ color: 'var(--text4)' }}>Dept:</span>
                      <span style={{ color: 'var(--text2)' }}>{deptName}</span>
                      <span style={{ color: 'var(--text4)' }}>Bots:</span>
                      <span style={{ color: 'var(--text2)' }}>{agentBots.length}</span>
                    </div>
                    <span className="text-xs mt-2 inline-block" style={{
                      color: 'var(--text4)',
                      transform: expandedAgent === agent.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}>▼</span>
                  </div>
                </div>
              </div>

              {expandedAgent === agent.id && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between pt-4 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text4)' }}>
                      Support Bots ({agentBots.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {agentBots.map((bot) => (
                      <div key={bot.id} className="p-4 rounded-xl transition-colors hover:bg-white/[0.03]"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--bg3)' }}>
                            <span>⚙️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{bot.name}</span>
                              <span className="w-1.5 h-1.5 rounded-full"
                                style={{ background: statusColors[bot.status] || 'var(--text4)', boxShadow: bot.status === 'active' ? `0 0 4px ${statusColors[bot.status]}` : 'none' }} />
                            </div>
                            <p className="text-[11px] mb-2" style={{ color: 'var(--text4)' }}>{bot.description}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {bot.capabilities.map((cap, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                                  {cap.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="btn-ghost text-xs">+ Add Bot</button>
                    <button className="btn-ghost text-xs">⚙️ Agent Settings</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pending Departments */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>🚀 Upcoming Deployments</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>Departments pending agent deployment per 90-day rollout plan</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x" style={{ borderColor: 'var(--border)' }}>
          {pendingDepartments.map((dept, i) => (
            <div key={i} className="p-4 text-center">
              <span className="text-2xl">{dept.icon}</span>
              <div className="text-sm font-semibold mt-2" style={{ color: 'var(--text)' }}>{dept.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>{dept.owner}</div>
              <div className="text-[11px] mt-1 px-2.5 py-1 rounded-full inline-block whitespace-nowrap"
                style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                {dept.planned}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
