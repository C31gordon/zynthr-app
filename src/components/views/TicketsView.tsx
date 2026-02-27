'use client'

import { useState, useEffect } from 'react'
import { getTickets } from '@/lib/data'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'New', bg: 'rgba(85,156,181,0.15)', color: 'var(--blue-light)' },
  assigned: { label: 'Assigned', bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  in_progress: { label: 'In Progress', bg: 'rgba(245,158,11,0.15)', color: 'var(--orange-light)' },
  waiting_on_requester: { label: 'Waiting', bg: 'rgba(100,116,139,0.15)', color: 'var(--text3)' },
  resolved: { label: 'Resolved', bg: 'rgba(107,164,138,0.15)', color: 'var(--green-light)' },
  closed: { label: 'Closed', bg: 'rgba(100,116,139,0.15)', color: 'var(--text4)' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--text4)' },
  medium: { label: 'Medium', color: 'var(--blue)' },
  high: { label: 'High', color: 'var(--orange)' },
  urgent: { label: 'Urgent', color: 'var(--red)' },
}

interface TicketRow {
  id: string
  ticket_number: number
  title: string
  status: string
  priority: string
  category: string | null
  created_at: string
  requester?: { full_name: string } | null
  target_department?: { name: string } | null
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function TicketsView() {
  const [filter, setFilter] = useState<string>('all')
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTickets().then((data) => { setTickets(data as TicketRow[]); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const openCount = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading tickets...</p></div>
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Tickets</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {tickets.length} total • {openCount} open
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'new', 'assigned', 'in_progress', 'waiting_on_requester', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
            style={{
              background: filter === f ? 'var(--blue)' : 'var(--bg2)',
              color: filter === f ? '#fff' : 'var(--text3)',
              border: filter === f ? 'none' : '1px solid var(--border)',
            }}>
            {f === 'all' ? 'All' : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="glass-card overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Ticket', 'Title', 'Requester', 'Department', 'Priority', 'Status', 'Created'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: 'var(--text4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="transition-colors hover:bg-white/5 cursor-pointer"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-3 text-xs font-mono font-bold whitespace-nowrap" style={{ color: 'var(--blue-light)' }}>
                  TKT-{String(ticket.ticket_number).padStart(4, '0')}
                </td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{ticket.title}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text3)' }}>
                  {ticket.requester?.full_name || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text3)' }}>
                  {ticket.target_department?.name || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: priorityConfig[ticket.priority]?.color || 'var(--text3)' }}>
                    {ticket.priority === 'urgent' ? '🔴 ' : ''}{priorityConfig[ticket.priority]?.label || ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-full"
                    style={{ background: statusConfig[ticket.status]?.bg || 'var(--bg3)', color: statusConfig[ticket.status]?.color || 'var(--text3)' }}>
                    {statusConfig[ticket.status]?.label || ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text4)' }}>
                  {getTimeAgo(ticket.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
