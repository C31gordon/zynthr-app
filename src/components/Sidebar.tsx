'use client'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings' | 'onboarding' | 'training' | 'healthcare' | 'setup' | 'birthcenter' | 'patientdash' | 'orgsetup'

interface SidebarProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
  collapsed: boolean
  onToggle: () => void
}

const navItems: { id: ViewType; label: string; icon: string; section?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'Main' },
  { id: 'agents', label: 'Agents & Bots', icon: '🤖', section: 'Main' },
  { id: 'chat', label: 'Chat', icon: '💬', section: 'Main' },
  { id: 'workflows', label: 'Workflows', icon: '⚡', section: 'Automation' },
  { id: 'tickets', label: 'Tickets', icon: '🎫', section: 'Operations' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡', section: 'Operations' },
  { id: 'onboarding', label: 'Onboarding', icon: '🎓', section: 'Operations' },
  { id: 'training', label: 'Training', icon: '📚', section: 'Operations' },
  { id: 'policies', label: 'RKBAC Policies', icon: '🔒', section: 'Security' },
  { id: 'audit', label: 'Audit Log', icon: '📋', section: 'Security' },
  { id: 'setup', label: 'Setup Wizard', icon: '🚀', section: 'Industry' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', section: 'Industry' },
  { id: 'birthcenter', label: 'Birth Center', icon: '🌿', section: 'Industry' },
  { id: 'patientdash', label: 'Patient View', icon: '👩‍⚕️', section: 'Industry' },
  { id: 'orgsetup', label: 'Org Setup', icon: '🏢', section: 'System' },
  { id: 'settings', label: 'Settings', icon: '⚙️', section: 'System' },
]

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle }: SidebarProps) {
  let lastSection = ''

  return (
    <div
      className="h-screen flex flex-col transition-all duration-300 no-print"
      style={{
        width: collapsed ? '64px' : '240px',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #003146, #559CB5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
            <circle cx="16" cy="16" r="3.5" fill="#003146"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text)', letterSpacing: '0.08em' }}>RISE</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text4)' }}>Command Center</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: 'var(--text3)' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          return (
            <div key={item.id}>
              {showSection && (
                <div className="text-[11px] font-bold uppercase tracking-wider mt-4 mb-1 px-3"
                  style={{ color: 'var(--text4)' }}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5"
                style={{
                  background: activeView === item.id ? 'rgba(85,156,181,0.15)' : 'transparent',
                  color: activeView === item.id ? 'var(--blue)' : 'var(--text3)',
                  borderLeft: activeView === item.id ? '3px solid var(--blue)' : '3px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0" style={{ width: '20px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Bottom - User */}
      {!collapsed && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
              CG
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>Courtney Gordon</div>
              <div className="text-[11px]" style={{ color: 'var(--text4)' }}>Owner • RISE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
