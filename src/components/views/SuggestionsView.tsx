'use client'

import { useState, useEffect } from 'react'
import { getSuggestions } from '@/lib/data'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'New', bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  under_review: { label: 'Under Review', bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  planned: { label: 'Planned', bg: 'rgba(245,158,11,0.15)', color: 'var(--orange-light)' },
  building: { label: 'Building', bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  shipped: { label: '✅ Shipped', bg: 'rgba(16,185,129,0.15)', color: 'var(--green-light)' },
  declined: { label: 'Declined', bg: 'rgba(100,116,139,0.15)', color: 'var(--text4)' },
}

interface SuggestionRow {
  id: string
  suggestion_number: number
  title: string
  description: string
  status: string
  vote_count: number
  created_at: string
  submitter?: { full_name: string } | null
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

export default function SuggestionsView() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuggestions().then((data) => { setSuggestions(data as SuggestionRow[]); setLoading(false) })
  }, [])

  if (loading) {
    return <div className="w-full mx-auto flex items-center justify-center py-20"><p className="text-sm animate-pulse" style={{ color: 'var(--text3)' }}>Loading suggestions...</p></div>
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Suggestions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            User-submitted ideas, sorted by votes. Say &quot;I wish...&quot; in chat to submit.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => (
          <div key={s.id} className="glass-card p-4 flex items-center gap-4 cursor-pointer">
            <div className="flex flex-col items-center gap-1 px-3 min-w-[60px]">
              <button className="text-xs" style={{ color: 'var(--text4)' }}>▲</button>
              <span className="text-lg font-extrabold" style={{ color: s.vote_count >= 5 ? 'var(--blue)' : 'var(--text3)' }}>
                {s.vote_count}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text4)' }}>votes</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--text4)' }}>
                  SUG-{String(s.suggestion_number).padStart(4, '0')}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-full"
                  style={{ background: statusConfig[s.status]?.bg || 'var(--bg3)', color: statusConfig[s.status]?.color || 'var(--text3)' }}>
                  {statusConfig[s.status]?.label || s.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>{s.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs" style={{ color: 'var(--text4)' }}>{s.submitter?.full_name || 'Anonymous'}</span>
                <span className="text-xs" style={{ color: 'var(--text4)' }}>{getTimeAgo(s.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
