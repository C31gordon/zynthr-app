'use client'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg3)' }}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-sm max-w-md mb-4" style={{ color: 'var(--text4)' }}>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
          style={{ background: 'var(--blue)', color: 'white' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
