'use client'

import { useState, useRef, useEffect } from 'react'
import { DEMO_MODE, DEMO_USER } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@supabase/supabase-js'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings'

interface LocalUser {
  name: string
  email: string
  orgName: string
  createdAt: string
}

interface TopBarProps {
  user: User | null
  localUser?: LocalUser | null
  isAuthenticated?: boolean
  onNavigate: (view: ViewType) => void
  isMobile?: boolean
  onMenuToggle?: () => void
  onTourStart?: () => void
}

export default function TopBar({ user, localUser, isAuthenticated, onNavigate, isMobile, onMenuToggle, onTourStart }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setIsDark(false)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 80) + 'px'
    }
  }, [searchQuery])

  const { signOut } = useAuth()
  const handleLogout = () => {
    signOut()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) onNavigate('chat')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (searchQuery.trim()) onNavigate('chat')
    }
  }

  // Determine display name and email
  const displayName = localUser?.name || (DEMO_MODE ? DEMO_USER.full_name : user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User')
  const displayEmail = localUser?.email || (DEMO_MODE ? DEMO_USER.email : user?.email)
  const displayOrg = localUser?.orgName || (DEMO_MODE ? DEMO_USER.tenant : '')
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const displayRole = DEMO_MODE && !isAuthenticated ? DEMO_USER.role : (localUser ? 'Member' : '')

  const notifications = [
    { icon: '🛡️', text: 'Prompt injection attempt blocked from jsmith@risere.com', time: '2 min ago', unread: true },
    { icon: '🎫', text: 'New ticket #TKT-0012 assigned to IT', time: '12 min ago', unread: true },
    { icon: '🔒', text: 'Access exception expiring in 7 days', time: '1 hour ago', unread: false },
    { icon: '💡', text: 'Suggestion #SUG-0008 shipped!', time: '3 hours ago', unread: false },
    { icon: '⚡', text: 'Workflow "Email Cleanup" completed — 8 items', time: '4 hours ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between no-print gap-4"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 24px', minHeight: '56px' }}>

      {isMobile && (
        <button onClick={onMenuToggle}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/5"
          style={{ color: 'var(--text)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      <form onSubmit={handleSearch} className="flex-1 min-w-0" style={{ maxWidth: '640px' }}>
        <div className="relative">
          <span className="absolute left-4 top-3 text-sm pointer-events-none" style={{ color: 'var(--text4)' }}>🔍</span>
          <textarea ref={textareaRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask Millie anything... or search across your workspace" rows={1}
            className="w-full rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500/30 resize-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', lineHeight: '1.5', padding: '10px 52px 10px 44px', minHeight: '40px', maxHeight: '80px', overflow: 'hidden' }} />
          <span className="absolute right-4 top-3 text-[10px] px-1.5 py-0.5 rounded pointer-events-none"
            style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>⌘K</span>
        </div>
      </form>

      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Take a Tour */}
        <button
          onClick={onTourStart}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ color: "var(--text3)", fontSize: "16px" }}
          title="Take a Tour"
        >
          ❓
        </button>
        <button onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ color: 'var(--text3)', fontSize: '18px' }} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? '☀️' : '🌙'}
        </button>

        {DEMO_MODE && !isAuthenticated && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(245,158,11,0.13)', color: 'var(--orange)', border: '1px solid rgba(245,158,11,0.25)' }}>
            DEMO MODE
          </span>
        )}

        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 relative"
            style={{ color: 'var(--text3)' }}>
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'var(--red)', color: 'white', boxShadow: '0 0 4px rgba(174,19,42,0.6)', width: '18px', height: '18px' }}>
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-14 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '320px' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
                <button className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b transition-colors hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: 'var(--border)', background: n.unread ? 'rgba(85,156,181,0.05)' : 'transparent' }}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5 flex-shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text)' }}>{n.text}</p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>{n.time}</p>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--blue)' }} />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center border-t cursor-pointer transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:ring-2 hover:ring-blue-500/30 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
            {initials}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-14 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '260px' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{displayName}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>{displayEmail}</div>
                {displayOrg && <div className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>{displayOrg}</div>}
                {displayRole && (
                  <div className="mt-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' }}>{displayRole.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="py-2">
                <button onClick={() => { onNavigate('settings'); setShowProfile(false) }}
                  className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  📖 Help &amp; Training
                </button>
                <button onClick={handleLogout}
                  className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--red)' }}>
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
