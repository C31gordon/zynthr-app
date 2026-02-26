'use client'

import { useState } from 'react'

interface BotData {
  id: string
  name: string
  icon: string
  status: 'active' | 'paused' | 'configuring'
  type: string
  description: string
  queriesHandled: number
  successRate: number
}

interface AgentData {
  id: string
  name: string
  department: string
  departmentIcon: string
  status: 'active' | 'paused' | 'configuring' | 'error'
  model: string
  owner: string
  description: string
  capabilities: string[]
  bots: BotData[]
  memorySize: string
  uptime: string
  totalQueries: number
  connectedSystems: string[]
}

const agents: AgentData[] = [
  {
    id: 'agent-ops',
    name: 'Operations Agent',
    department: 'Operations',
    departmentIcon: '🏢',
    status: 'active',
    model: 'claude-opus-4',
    owner: 'Courtney Gordon',
    description: 'Manages daily operations — leasing reports, occupancy tracking, SOP enforcement, and operational data across all properties.',
    capabilities: ['DLR Generation', 'Occupancy Tracking', 'Lease Analysis', 'SOP Compliance', 'Data Retrieval'],
    bots: [
      { id: 'bot-1', name: 'Leasing Agent', icon: '📋', status: 'active', type: 'leasing', description: 'Generates and distributes daily leasing reports', queriesHandled: 1247, successRate: 98.2 },
      { id: 'bot-2', name: 'Occupancy Tracker', icon: '📊', status: 'active', type: 'analytics', description: 'Monitors real-time occupancy and alerts on anomalies', queriesHandled: 3892, successRate: 99.1 },
      { id: 'bot-3', name: 'SOP Enforcer', icon: '📑', status: 'active', type: 'compliance', description: 'Answers SOP questions and flags non-compliance', queriesHandled: 562, successRate: 94.5 },
      { id: 'bot-4', name: 'Data Analyst', icon: '🔍', status: 'configuring', type: 'analytics', description: 'Runs custom queries across operational data', queriesHandled: 0, successRate: 0 },
    ],
    memorySize: '2.4 GB',
    uptime: '99.7%',
    totalQueries: 5701,
    connectedSystems: ['Entrata', 'M365', 'Egnyte', 'MoonRISE'],
  },
  {
    id: 'agent-training',
    name: 'Training Agent',
    department: 'Training',
    departmentIcon: '📚',
    status: 'active',
    model: 'claude-opus-4',
    owner: 'Mona Vogele',
    description: 'Creates, distributes, and tracks training materials. Monitors completion and sends reminders for overdue assignments.',
    capabilities: ['Content Creation', 'Assignment Tracking', 'Quiz Generation', 'Completion Reports', 'Onboarding Flows'],
    bots: [
      { id: 'bot-5', name: 'Content Builder', icon: '📝', status: 'active', type: 'content', description: 'Generates training modules from SOPs and docs', queriesHandled: 834, successRate: 96.3 },
      { id: 'bot-6', name: 'Assignment Tracker', icon: '✅', status: 'active', type: 'tracking', description: 'Monitors training deadlines and sends reminders', queriesHandled: 2156, successRate: 97.8 },
      { id: 'bot-7', name: 'Quiz Master', icon: '🎯', status: 'paused', type: 'assessment', description: 'Creates and scores knowledge assessments', queriesHandled: 421, successRate: 93.1 },
    ],
    memorySize: '1.1 GB',
    uptime: '98.9%',
    totalQueries: 3411,
    connectedSystems: ['M365', 'Egnyte'],
  },
  {
    id: 'agent-maintenance',
    name: 'Maintenance Agent',
    department: 'Maintenance',
    departmentIcon: '🔧',
    status: 'active',
    model: 'claude-opus-4',
    owner: 'Chris Jackson',
    description: 'Manages work orders, tracks SLA compliance, dispatches vendors, and monitors maintenance budgets.',
    capabilities: ['Work Order Management', 'SLA Monitoring', 'Vendor Dispatch', 'Budget Tracking', 'Escalation'],
    bots: [
      { id: 'bot-8', name: 'WO Manager', icon: '🔧', status: 'active', type: 'operations', description: 'Creates, assigns, and tracks work orders', queriesHandled: 4521, successRate: 97.4 },
      { id: 'bot-9', name: 'SLA Monitor', icon: '⏱️', status: 'active', type: 'compliance', description: 'Tracks SLA thresholds and escalates overdue items', queriesHandled: 1876, successRate: 99.5 },
      { id: 'bot-10', name: 'Vendor Coordinator', icon: '🤝', status: 'active', type: 'coordination', description: 'Dispatches vendors and tracks completion', queriesHandled: 923, successRate: 95.2 },
    ],
    memorySize: '0.8 GB',
    uptime: '99.2%',
    totalQueries: 7320,
    connectedSystems: ['MoonRISE', 'Entrata', 'M365'],
  },
]

const pendingDepartments = [
  { name: 'HR', icon: '👥', owner: 'Brett Johnson', planned: 'Phase 3 (Day 30-60)' },
  { name: 'Marketing', icon: '📢', owner: 'TBD', planned: 'Phase 3 (Day 30-60)' },
  { name: 'Finance', icon: '💰', owner: 'TBD', planned: 'Phase 4 (Day 60-90)' },
  { name: 'IT', icon: '💻', owner: 'Ben McClendon', planned: 'Phase 4 (Day 60-90)' },
]

const statusColors: Record<string, string> = {
  active: 'var(--green)',
  paused: 'var(--orange)',
  configuring: 'var(--blue)',
  error: 'var(--red)',
}

export default function AgentsView() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>('agent-ops')
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Agents & Bots</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {agents.length} active agents • {agents.reduce((s, a) => s + a.bots.length, 0)} bots deployed • {agents.reduce((s, a) => s + a.totalQueries, 0).toLocaleString()} total queries
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}>
          + Deploy Agent
        </button>
      </div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-card-static rounded-xl overflow-hidden fade-in">
            {/* Agent Header */}
            <div className="p-5 cursor-pointer transition-colors hover:bg-white/[0.02]"
              onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                    <span className="text-2xl">{agent.departmentIcon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{agent.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${statusColors[agent.status]}15`, color: statusColors[agent.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[agent.status] }} />
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                        {agent.model}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>{agent.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {agent.capabilities.map((cap, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <span style={{ color: 'var(--text4)' }}>Queries:</span>
                    <span style={{ color: 'var(--text2)' }}>{agent.totalQueries.toLocaleString()}</span>
                    <span style={{ color: 'var(--text4)' }}>Memory:</span>
                    <span style={{ color: 'var(--text2)' }}>{agent.memorySize}</span>
                    <span style={{ color: 'var(--text4)' }}>Uptime:</span>
                    <span style={{ color: 'var(--green)' }}>{agent.uptime}</span>
                    <span style={{ color: 'var(--text4)' }}>Owner:</span>
                    <span style={{ color: 'var(--text2)' }}>{agent.owner}</span>
                  </div>
                  <span className="text-xs mt-2 inline-block" style={{
                    color: 'var(--text4)',
                    transform: expandedAgent === agent.id ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                </div>
              </div>
            </div>

            {/* Expanded: Bot List */}
            {expandedAgent === agent.id && (
              <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between pt-4 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text4)' }}>
                    Support Bots ({agent.bots.length})
                  </span>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text4)' }}>
                    Connected: {agent.connectedSystems.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {agent.bots.map((bot) => (
                    <div key={bot.id} className="p-4 rounded-xl transition-colors hover:bg-white/[0.03]"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--bg3)' }}>
                          <span>{bot.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{bot.name}</span>
                            <span className="w-1.5 h-1.5 rounded-full"
                              style={{ background: statusColors[bot.status], boxShadow: bot.status === 'active' ? `0 0 4px ${statusColors[bot.status]}` : 'none' }} />
                          </div>
                          <p className="text-[11px] mb-2" style={{ color: 'var(--text4)' }}>{bot.description}</p>
                          <div className="flex items-center gap-3 text-[10px]">
                            {bot.queriesHandled > 0 ? (
                              <>
                                <span style={{ color: 'var(--text3)' }}>{bot.queriesHandled.toLocaleString()} queries</span>
                                <span style={{ color: bot.successRate >= 95 ? 'var(--green)' : 'var(--orange)' }}>
                                  {bot.successRate}% success
                                </span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--text4)' }}>Setting up...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn-ghost text-xs">+ Add Bot</button>
                  <button className="btn-ghost text-xs">⚙️ Agent Settings</button>
                  <button className="btn-ghost text-xs">📊 Performance Report</button>
                  <button className="btn-ghost text-xs">🧠 View Memory</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pending Departments */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>🚀 Upcoming Deployments</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>Departments pending agent deployment per 90-day rollout plan</p>
        </div>
        <div className="grid grid-cols-4 divide-x" style={{ borderColor: 'var(--border)' }}>
          {pendingDepartments.map((dept, i) => (
            <div key={i} className="p-4 text-center">
              <span className="text-2xl">{dept.icon}</span>
              <div className="text-sm font-semibold mt-2" style={{ color: 'var(--text)' }}>{dept.name}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>{dept.owner}</div>
              <div className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block"
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
