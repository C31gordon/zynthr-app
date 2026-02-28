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
  permissionTier?: string
  connectedSystems?: string[]
  aiModel?: string
  emoji?: string
}

interface LocalBot {
  id: string
  name: string
  status: string
  bot_type: string | null
  description: string | null
  capabilities: string[]
  agent_id: string
}

const deptIcons: Record<string, string> = {
  Operations: '🏢', Marketing: '📢', 'Human Resources': '👥', Finance: '💰',
  IT: '💻', Training: '📚', Maintenance: '🔧', Leasing: '🔑', HR: '👥',
  Compliance: '📋',
}

const statusColors: Record<string, string> = {
  active: 'var(--green)',
  Online: 'var(--green)',
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

const DEPARTMENTS = ['Operations', 'Leasing', 'Maintenance', 'Training', 'HR', 'Marketing', 'Finance', 'Compliance', 'IT']
const PERMISSION_TIERS = ['Tier 1 Owner/Executive', 'Tier 2 Dept Head', 'Tier 3 Manager', 'Tier 4 Specialist']
const EMOJI_OPTIONS = ['🤖', '🧠', '📊', '🔍', '📋', '💬', '⚡', '🛡️', '📈', '🎯', '🔧', '📝', '🚀', '💡', '🏢', '📢', '👥', '💰', '💻', '📚']

const CAPABILITIES = [
  { key: 'read_data', label: 'Read data', desc: 'Access and query data from connected systems' },
  { key: 'write_records', label: 'Write/update records', desc: 'Create and modify records in databases and systems' },
  { key: 'generate_reports', label: 'Generate reports', desc: 'Produce formatted reports and analytics summaries' },
  { key: 'send_notifications', label: 'Send notifications', desc: 'Send alerts via email, Slack, or other channels' },
  { key: 'create_tickets', label: 'Create tickets', desc: 'Open work orders, support tickets, or tasks' },
  { key: 'trigger_workflows', label: 'Trigger workflows', desc: 'Initiate automated workflows in n8n or other tools' },
  { key: 'execute_actions', label: 'Execute actions in connected systems', desc: 'Perform operations in integrated third-party platforms' },
]

const SYSTEMS = [
  { key: 'entrata', label: 'Entrata', connected: true },
  { key: 'microsoft365', label: 'Microsoft 365', connected: true },
  { key: 'google_workspace', label: 'Google Workspace', connected: false },
  { key: 'paycor', label: 'Paycor', connected: false },
  { key: 'egnyte', label: 'Egnyte', connected: true },
  { key: 'slack', label: 'Slack', connected: false },
  { key: 'custom_api', label: 'Custom API', connected: false },
]

const AI_MODELS = [
  { key: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', tag: 'Recommended', speed: '⚡⚡⚡⚡', cost: '$$', desc: 'Best balance of speed, quality, and cost' },
  { key: 'gpt-4o', label: 'GPT-4o', tag: '', speed: '⚡⚡⚡⚡', cost: '$$', desc: 'Fast multimodal model, great for general tasks' },
  { key: 'gpt-4-turbo', label: 'GPT-4 Turbo', tag: '', speed: '⚡⚡⚡', cost: '$$$', desc: 'Strong reasoning with larger context window' },
  { key: 'claude-3-opus', label: 'Claude 3 Opus', tag: 'Advanced', speed: '⚡⚡', cost: '$$$$', desc: 'Highest quality for complex analysis and writing' },
]

const STEP_LABELS = ['Basics', 'Capabilities', 'Systems', 'AI Model', 'Review']

interface NewAgentForm {
  name: string
  department: string
  description: string
  permissionTier: string
  emoji: string
  capabilities: string[]
  systems: string[]
  aiModel: string
}

const defaultForm: NewAgentForm = {
  name: '',
  department: DEPARTMENTS[0],
  description: '',
  permissionTier: PERMISSION_TIERS[2],
  emoji: '🤖',
  capabilities: [],
  systems: [],
  aiModel: 'claude-3.5-sonnet',
}

interface BotForm {
  name: string
  description: string
  capabilities: string[]
  agentId: string
}

export default function AgentsView() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [bots, setBots] = useState<BotRow[]>([])
  const [localAgents, setLocalAgents] = useState<AgentRow[]>([])
  const [localBots, setLocalBots] = useState<LocalBot[]>([])
  const [loading, setLoading] = useState(true)

  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [form, setForm] = useState<NewAgentForm>({ ...defaultForm })
  const [deploying, setDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)

  const [showBotForm, setShowBotForm] = useState(false)
  const [botForm, setBotForm] = useState<BotForm>({ name: '', description: '', capabilities: [], agentId: '' })

  useEffect(() => {
    Promise.all([getAgents(), getBots()]).then(([a, b]) => {
      setAgents(a as AgentRow[])
      setBots(b as BotRow[])
      if (a.length > 0) setExpandedAgent(a[0].id)
      setLoading(false)
    })
  }, [])

  const allAgents = [...agents, ...localAgents]
  const allBots = [...bots, ...localBots]

  function openWizard() {
    setForm({ ...defaultForm })
    setWizardStep(0)
    setDeploying(false)
    setDeploySuccess(false)
    setShowWizard(true)
  }

  function closeWizard() {
    setShowWizard(false)
  }

  function toggleCapability(key: string) {
    setForm(f => ({
      ...f,
      capabilities: f.capabilities.includes(key)
        ? f.capabilities.filter(c => c !== key)
        : [...f.capabilities, key],
    }))
  }

  function toggleSystem(key: string) {
    setForm(f => ({
      ...f,
      systems: f.systems.includes(key)
        ? f.systems.filter(s => s !== key)
        : [...f.systems, key],
    }))
  }

  function handleDeploy() {
    setDeploying(true)
    setTimeout(() => {
      const newAgent: AgentRow = {
        id: 'local-' + Date.now().toString(),
        name: form.name,
        description: form.description,
        status: 'Online',
        capabilities: form.capabilities,
        owner_user_id: null,
        department: { id: form.department.toLowerCase(), name: form.department, icon: deptIcons[form.department] || '📁' },
        permissionTier: form.permissionTier,
        connectedSystems: form.systems,
        aiModel: form.aiModel,
        emoji: form.emoji,
      }
      setLocalAgents(prev => [...prev, newAgent])
      setExpandedAgent(newAgent.id)
      setDeploying(false)
      setDeploySuccess(true)
    }, 2000)
  }

  function handleCreateBot() {
    const newBot: LocalBot = {
      id: 'bot-' + Date.now().toString(),
      name: botForm.name,
      description: botForm.description,
      status: 'active',
      bot_type: 'support',
      capabilities: botForm.capabilities,
      agent_id: botForm.agentId,
    }
    setLocalBots(prev => [...prev, newBot])
    setShowBotForm(false)
    setBotForm({ name: '', description: '', capabilities: [], agentId: '' })
  }

  function toggleBotCap(key: string) {
    setBotForm(f => ({
      ...f,
      capabilities: f.capabilities.includes(key)
        ? f.capabilities.filter(c => c !== key)
        : [...f.capabilities, key],
    }))
  }

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading agents...</p></div>
  }

  const wizardStepContent = () => {
    if (deploySuccess) {
      return (
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{form.name} is Online!</div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Your agent has been deployed and is ready to work.</p>
          <button onClick={closeWizard} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--blue)', color: 'white', fontSize: 14, fontWeight: 600,
          }}>View Agent</button>
        </div>
      )
    }

    if (deploying) {
      return (
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'deployPulse 1s infinite' }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Deploying {form.name}...</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Initializing agent, connecting systems, loading model...</div>
          <div style={{ width: 200, height: 4, borderRadius: 2, background: 'var(--bg3)', margin: '24px auto', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', borderRadius: 2, background: 'var(--blue)', animation: 'deployPulse 1s infinite' }} />
          </div>
        </div>
      )
    }

    if (wizardStep === 0) {
      return (
        <div className="space-y-4" style={{ paddingTop: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Agent Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Ops Commander"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Department</label>
            <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Description / Role</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this agent does in plain language"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Permission Tier</label>
            <select value={form.permissionTier} onChange={e => setForm(f => ({ ...f, permissionTier: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}>
              {PERMISSION_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJI_OPTIONS.map(em => (
                <button key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))}
                  style={{
                    width: 40, height: 40, borderRadius: 8, fontSize: 20, cursor: 'pointer',
                    border: form.emoji === em ? '2px solid var(--blue)' : '1px solid var(--border)',
                    background: form.emoji === em ? 'rgba(59,130,246,0.1)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (wizardStep === 1) {
      return (
        <div className="space-y-3" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Select what this agent can do:</p>
          {CAPABILITIES.map(cap => (
            <label key={cap.key} style={{
              display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
              border: '1px solid var(--border)', background: form.capabilities.includes(cap.key) ? 'rgba(59,130,246,0.08)' : 'var(--bg)',
              transition: 'background 0.15s',
            }}>
              <input type="checkbox" checked={form.capabilities.includes(cap.key)} onChange={() => toggleCapability(cap.key)}
                style={{ marginTop: 2, accentColor: 'var(--blue)' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{cap.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 2 }}>{cap.desc}</div>
              </div>
            </label>
          ))}
        </div>
      )
    }

    if (wizardStep === 2) {
      return (
        <div className="space-y-3" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Toggle systems this agent can access:</p>
          {SYSTEMS.map(sys => (
            <div key={sys.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{sys.label}</div>
                <div style={{ fontSize: 11, color: sys.connected ? 'var(--green)' : 'var(--orange)', marginTop: 2 }}>
                  {sys.connected ? '✅ Connected' : '⚠️ Not Connected'}
                  {!sys.connected && <span style={{ color: 'var(--blue)', marginLeft: 8, fontSize: 10, cursor: 'pointer' }}>Configure in Settings →</span>}
                </div>
              </div>
              <button onClick={() => toggleSystem(sys.key)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                background: form.systems.includes(sys.key) ? 'var(--blue)' : 'var(--bg3)',
                transition: 'background 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white',
                  left: form.systems.includes(sys.key) ? 22 : 2, transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
      )
    }

    if (wizardStep === 3) {
      return (
        <div className="space-y-3" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Choose the AI model powering this agent:</p>
          {AI_MODELS.map(m => (
            <label key={m.key} style={{
              display: 'flex', gap: 12, padding: '14px 14px', borderRadius: 10, cursor: 'pointer',
              border: form.aiModel === m.key ? '2px solid var(--blue)' : '1px solid var(--border)',
              background: form.aiModel === m.key ? 'rgba(59,130,246,0.08)' : 'var(--bg)',
              transition: 'all 0.15s',
            }}>
              <input type="radio" name="aiModel" checked={form.aiModel === m.key} onChange={() => setForm(f => ({ ...f, aiModel: m.key }))}
                style={{ marginTop: 4, accentColor: 'var(--blue)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
                  {m.tag && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: m.tag === 'Recommended' ? 'var(--blue)' : 'var(--purple)', color: 'white', fontWeight: 600 }}>{m.tag}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4 }}>{m.desc}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11 }}>
                  <span style={{ color: 'var(--text3)' }}>Speed: {m.speed}</span>
                  <span style={{ color: 'var(--text3)' }}>Cost: {m.cost}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      )
    }

    if (wizardStep === 4) {
      return (
        <div style={{ paddingTop: 8 }}>
          <div style={{ padding: 20, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--blue), var(--purple))', fontSize: 24 }}>{form.emoji}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{form.name || 'Unnamed Agent'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{form.department} • {form.permissionTier}</div>
              </div>
            </div>
            {form.description && <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>{form.description}</p>}

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase' as const, marginBottom: 6 }}>Capabilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.capabilities.length === 0 && <span style={{ fontSize: 12, color: 'var(--text4)' }}>None selected</span>}
                {form.capabilities.map(c => <span key={c} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 9999, background: 'var(--bg3)', color: 'var(--text3)' }}>{c.replace(/_/g, ' ')}</span>)}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase' as const, marginBottom: 6 }}>Connected Systems</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.systems.length === 0 && <span style={{ fontSize: 12, color: 'var(--text4)' }}>None selected</span>}
                {form.systems.map(s => {
                  const found = SYSTEMS.find(x => x.key === s)
                  return <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 9999, background: 'var(--bg3)', color: 'var(--text3)' }}>{found ? found.label : s}</span>
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase' as const, marginBottom: 6 }}>AI Model</div>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{AI_MODELS.find(m => m.key === form.aiModel)?.label}</span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Agents &amp; Bots</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {allAgents.length} active agents • {allBots.length} bots deployed
          </p>
        </div>
        <button onClick={openWizard} className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}>
          + Create New Agent
        </button>
      </div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {allAgents.map((agent) => {
          const agentBots = allBots.filter(b => b.agent_id === agent.id)
          const deptName = agent.department?.name || 'Unknown'
          const icon = agent.emoji || deptIcons[deptName] || '📁'
          const st = agent.status

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
                          style={{ background: (statusColors[st] || 'var(--text4)') + '15', color: statusColors[st] || 'var(--text4)' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[st] || 'var(--text4)' }} />
                          {st.charAt(0).toUpperCase() + st.slice(1)}
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
                      {agent.aiModel ? (
                        <>
                          <span style={{ color: 'var(--text4)' }}>Model:</span>
                          <span style={{ color: 'var(--text2)' }}>{agent.aiModel}</span>
                        </>
                      ) : null}
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
                  {agentBots.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                  style={{ background: statusColors[bot.status] || 'var(--text4)', boxShadow: bot.status === 'active' ? '0 0 4px ' + (statusColors[bot.status] || '') : 'none' }} />
                              </div>
                              <p className="text-[11px] mb-2" style={{ color: 'var(--text4)' }}>{bot.description}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {bot.capabilities.map((cap, ci) => (
                                  <span key={ci} className="text-[10px] px-2 py-0.5 rounded-full"
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
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); setBotForm({ name: '', description: '', capabilities: [], agentId: agent.id }); setShowBotForm(true) }}
                      className="btn-ghost text-xs">+ Add Support Bot</button>
                    <button className="btn-ghost text-xs">⚙️ Agent Settings</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {allAgents.length === 0 && (
        <div className="glass-card-static rounded-xl p-12 text-center fade-in">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>No agents deployed yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>Create your first AI agent to start automating operations.</p>
          <button onClick={openWizard} className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--blue)', color: 'white' }}>
            + Create New Agent
          </button>
        </div>
      )}

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

      {/* ===== CREATION WIZARD OVERLAY ===== */}
      {showWizard && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={closeWizard} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 560, height: '100%', overflowY: 'auto',
            background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
            animation: 'slideInRight 0.3s ease-out',
          }}>
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes deployPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, margin: 0 }}>Create New Agent</h2>
              <button onClick={closeWizard} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Step progress */}
            {!deploySuccess && !deploying && (
              <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
                {STEP_LABELS.map((label, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: 4, borderRadius: 2, marginBottom: 6,
                      background: i <= wizardStep ? 'var(--blue)' : 'var(--bg3)',
                      transition: 'background 0.2s',
                    }} />
                    <span style={{ fontSize: 11, color: i <= wizardStep ? 'var(--blue)' : 'var(--text4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '0 24px 24px' }}>
              {wizardStepContent()}

              {/* Navigation buttons */}
              {!deploySuccess && !deploying && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => { if (wizardStep === 0) { closeWizard() } else { setWizardStep(s => s - 1) } }}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>
                    {wizardStep === 0 ? 'Cancel' : '← Back'}
                  </button>
                  {wizardStep < 4 ? (
                    <button onClick={() => setWizardStep(s => s + 1)}
                      disabled={wizardStep === 0 && !form.name.trim()}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: (wizardStep === 0 && !form.name.trim()) ? 'var(--bg3)' : 'var(--blue)',
                        color: 'white', fontSize: 13, fontWeight: 600,
                        opacity: (wizardStep === 0 && !form.name.trim()) ? 0.5 : 1,
                      }}>
                      Next →
                    </button>
                  ) : (
                    <button onClick={handleDeploy}
                      disabled={!form.name.trim()}
                      style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: 'white', fontSize: 14, fontWeight: 700,
                      }}>
                      🚀 Deploy Agent
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== BOT CREATION MODAL ===== */}
      {showBotForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowBotForm(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: 16, padding: 24, borderRadius: 16, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Add Support Bot</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Bot Name</label>
              <input value={botForm.name} onChange={e => setBotForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Report Generator"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Description</label>
              <textarea value={botForm.description} onChange={e => setBotForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What does this bot do?"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Assign to Agent</label>
              <select value={botForm.agentId} onChange={e => setBotForm(f => ({ ...f, agentId: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}>
                <option value="">Select an agent...</option>
                {allAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Capabilities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CAPABILITIES.map(cap => (
                  <label key={cap.key} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                    border: '1px solid var(--border)', background: botForm.capabilities.includes(cap.key) ? 'rgba(59,130,246,0.08)' : 'var(--bg)',
                    color: 'var(--text)',
                  }}>
                    <input type="checkbox" checked={botForm.capabilities.includes(cap.key)} onChange={() => toggleBotCap(cap.key)}
                      style={{ accentColor: 'var(--blue)' }} />
                    {cap.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowBotForm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateBot} disabled={!botForm.name.trim() || !botForm.agentId}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: (!botForm.name.trim() || !botForm.agentId) ? 'var(--bg3)' : 'var(--blue)',
                  color: 'white', fontSize: 13, fontWeight: 600,
                  opacity: (!botForm.name.trim() || !botForm.agentId) ? 0.5 : 1,
                }}>Create Bot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
