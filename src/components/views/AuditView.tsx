'use client'

import { useState, useEffect } from 'react'
import { getAuditLog } from '@/lib/data'

type EventType = 'auth' | 'data_access' | 'policy_change' | 'agent_action' | 'security' | 'workflow' | 'exception' | 'system'
type Severity = 'info' | 'warning' | 'critical'

interface AuditEntry {
  id: string
  created_at: string
  action: string
  severity: string
  resource_type: string | null
  details: Record<string, unknown>
  user?: { id: string; full_name: string } | null
}

// Map DB actions to display categories
function getEventType(action: string): EventType {
  if (['login', 'logout'].includes(action)) return 'auth'
  if (action.startsWith('data_access')) return 'data_access'
  if (action.startsWith('policy_')) return 'policy_change'
  if (['agent_created', 'agent_updated', 'bot_created', 'bot_updated'].includes(action)) return 'agent_action'
  if (['prompt_injection_detected', 'suspicious_activity'].includes(action)) return 'security'
  if (['workflow_created', 'workflow_triggered'].includes(action)) return 'workflow'
  if (action.startsWith('exception_')) return 'exception'
  return 'system'
}

const eventTypeColors: Record<EventType, string> = {
  auth: 'var(--blue)', data_access: 'var(--teal)', policy_change: 'var(--orange)',
  agent_action: 'var(--green)', security: 'var(--red)', workflow: 'var(--purple)',
  exception: 'var(--orange)', system: 'var(--text4)',
}

const eventTypeLabels: Record<EventType, string> = {
  auth: 'Authentication', data_access: 'Data Access', policy_change: 'Policy Change',
  agent_action: 'Agent Action', security: 'Security', workflow: 'Workflow',
  exception: 'Exception', system: 'System',
}

const eventTypeIcons: Record<EventType, string> = {
  auth: '🔑', data_access: '📂', policy_change: '📋', agent_action: '🤖',
  security: '🛡️', workflow: '⚡', exception: '⚠️', system: '💻',
}

const severityColors: Record<string, string> = {
  info: 'var(--blue)', warning: 'var(--orange)', critical: 'var(--red)',
}

export default function AuditView() {
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLog(50).then((data) => { setAuditLog(data as AuditEntry[]); setLoading(false) })
  }, [])

  const filtered = auditLog.filter(entry => {
    const et = getEventType(entry.action)
    if (typeFilter !== 'all' && et !== typeFilter) return false
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return entry.action.toLowerCase().includes(q) ||
        (entry.user?.full_name || '').toLowerCase().includes(q) ||
        JSON.stringify(entry.details).toLowerCase().includes(q)
    }
    return true
  })

  const stats = {
    total: auditLog.length,
    critical: auditLog.filter(e => e.severity === 'critical').length,
    warnings: auditLog.filter(e => e.severity === 'warning').length,
    security: auditLog.filter(e => getEventType(e.action) === 'security').length,
  }

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading audit log...</p></div>
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Audit Log</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Complete activity trail — every action, access, and change recorded
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
          📥 Export Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, icon: '📊', color: 'var(--blue)' },
          { label: 'Critical', value: stats.critical, icon: '🔴', color: 'var(--red)' },
          { label: 'Warnings', value: stats.warnings, icon: '🟡', color: 'var(--orange)' },
          { label: 'Security Events', value: stats.security, icon: '🛡️', color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input type="text" placeholder="Search audit log..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | EventType)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
          <option value="all">All Types</option>
          {Object.entries(eventTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as 'all' | Severity)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filtered.map(entry => {
          const et = getEventType(entry.action)
          return (
            <div key={entry.id}
              className="glass-card rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-all"
              style={{ borderLeft: `3px solid ${severityColors[entry.severity] || 'var(--blue)'}` }}
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
              <div className="p-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${eventTypeColors[et]}15` }}>
                  <span className="text-sm">{eventTypeIcons[et]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {entry.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded shrink-0"
                      style={{ background: `${eventTypeColors[et]}22`, color: eventTypeColors[et] }}>
                      {eventTypeLabels[et]}
                    </span>
                    {entry.severity !== 'info' && (
                      <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded shrink-0"
                        style={{ background: `${severityColors[entry.severity]}22`, color: severityColors[entry.severity] }}>
                        {entry.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text4)' }}>
                    {entry.user?.full_name || 'System'} • {entry.resource_type || '—'}
                  </div>
                </div>
                <div className="text-xs shrink-0" style={{ color: 'var(--text4)' }}>
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>

              {expandedId === entry.id && (
                <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs space-y-1">
                    <div><span style={{ color: 'var(--text4)' }}>Actor:</span> <span style={{ color: 'var(--text2)' }}>{entry.user?.full_name || 'System'}</span></div>
                    <div><span style={{ color: 'var(--text4)' }}>Resource:</span> <span style={{ color: 'var(--text2)' }}>{entry.resource_type || '—'}</span></div>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <div><span style={{ color: 'var(--text4)' }}>Details:</span> <span style={{ color: 'var(--text2)' }}>{JSON.stringify(entry.details)}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text4)' }}>
        <span>Showing {filtered.length} of {auditLog.length} entries</span>
        <span>Logs retained for 90 days • Encrypted at rest • Tamper-proof</span>
      </div>
    </div>
  )
}
