'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase, DEMO_MODE, DEMO_USER } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings'

interface TopBarProps {
  user: User | null
  onNavigate: (view: ViewType) => void
  isMobile?: boolean
  onMenuToggle?: () => void
}

export default function TopBar({ user, onNavigate, isMobile, onMenuToggle }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    if (DEMO_MODE) { window.location.href = '/login'; return }
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) onNavigate('chat')
  }

  const displayEmail = DEMO_MODE ? DEMO_USER.email : user?.email

  const notifications = [
    { icon: '🛡️', text: 'Prompt injection attempt blocked from jsmith@risere.com', time: '2 min ago', unread: true },
    { icon: '🎫', text: 'New ticket #TKT-0012 assigned to IT', time: '12 min ago', unread: true },
    { icon: '🔒', text: 'Access exception expiring in 7 days', time: '1 hour ago', unread: false },
    { icon: '💡', text: 'Suggestion #SUG-0008 shipped!', time: '3 hours ago', unread: false },
    { icon: '⚡', text: 'Workflow "Email Cleanup" completed — 8 items', time: '4 hours ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between px-6 py-3 no-print"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>

      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={onMenuToggle}
          className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors hover:bg-white/10"
          style={{ color: 'var(--text)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text4)' }}>🔍</span>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask Millie anything... or search across your workspace"
            className="w-full pl-9 pr-12 py-2.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500/30"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>⌘K</span>
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Demo badge */}
        {DEMO_MODE && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full mr-2"
            style={{ background: 'var(--orange)22', color: 'var(--orange)', border: '1px solid var(--orange)40' }}>
            DEMO MODE
          </span>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 relative"
            style={{ color: 'var(--text3)' }}>
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'var(--red)', color: 'white', boxShadow: '0 0 4px rgba(239,68,68,0.6)' }}>
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
                <button className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b transition-colors hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: 'var(--border)', background: n.unread ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{n.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{n.text}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>{n.time}</p>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--blue)' }} />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t cursor-pointer transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:ring-2 hover:ring-blue-500/30"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
            CG
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-56 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Courtney Gordon</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>{displayEmail}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' }}>OWNER</span>
                </div>
              </div>
              <div className="py-1">
                <button onClick={() => { onNavigate('settings'); setShowProfile(false) }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  📖 Help & Training
                </button>
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5" style={{ color: 'var(--red)' }}>
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
