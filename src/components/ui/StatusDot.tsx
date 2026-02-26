'use client'

type Status = 'active' | 'paused' | 'error' | 'configuring' | 'pending' | 'offline'

const statusColors: Record<Status, string> = {
  active: 'var(--green)',
  paused: 'var(--orange)',
  error: 'var(--red)',
  configuring: 'var(--blue)',
  pending: 'var(--text4)',
  offline: 'var(--text4)',
}

interface StatusDotProps {
  status: Status
  label?: string
  pulse?: boolean
}

export default function StatusDot({ status, label, pulse = false }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: statusColors[status],
          boxShadow: pulse && status === 'active' ? `0 0 6px ${statusColors[status]}` : 'none',
        }}
      />
      {label && <span className="text-xs" style={{ color: 'var(--text3)' }}>{label}</span>}
    </span>
  )
}
