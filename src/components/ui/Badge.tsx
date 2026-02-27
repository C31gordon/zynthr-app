'use client'

type BadgeVariant = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal' | 'gold' | 'gray'

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  blue: { bg: 'rgba(85,156,181,0.15)', color: 'var(--blue)' },
  green: { bg: 'rgba(107,164,138,0.15)', color: 'var(--green)' },
  orange: { bg: 'rgba(245,158,11,0.15)', color: 'var(--orange)' },
  red: { bg: 'rgba(174,19,42,0.15)', color: 'var(--red)' },
  purple: { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  teal: { bg: 'rgba(20,184,166,0.15)', color: 'var(--teal)' },
  gold: { bg: 'rgba(245,166,35,0.15)', color: 'var(--gold)' },
  gray: { bg: 'var(--bg3)', color: 'var(--text4)' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
  size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'blue', dot = false, size = 'sm' }: BadgeProps) {
  const style = variantStyles[variant]
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: style.bg, color: style.color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />}
      {children}
    </span>
  )
}
