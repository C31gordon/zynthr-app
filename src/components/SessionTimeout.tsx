'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const TIMEOUT_MS = 15 * 60 * 1000
const WARNING_MS = 13 * 60 * 1000
const CHECK_INTERVAL = 30 * 1000

export default function SessionTimeout() {
  const lastActivity = useRef(Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(120)

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now()
    setShowWarning(false)
    setCountdown(120)
  }, [])

  const doLogout = useCallback(() => {
    localStorage.removeItem('milliebot_authenticated')
    localStorage.removeItem('milliebot_user')
    window.location.href = '/login?expired=1'
  }, [])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
    const handler = () => {
      if (!showWarning) {
        lastActivity.current = Date.now()
      }
    }
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    return () => { events.forEach(e => window.removeEventListener(e, handler)) }
  }, [showWarning])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current
      if (elapsed >= TIMEOUT_MS) {
        doLogout()
      } else if (elapsed >= WARNING_MS && !showWarning) {
        setShowWarning(true)
        setCountdown(Math.ceil((TIMEOUT_MS - elapsed) / 1000))
      }
    }, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [showWarning, doLogout])

  useEffect(() => {
    if (!showWarning) return
    const ticker = setInterval(() => {
      const remaining = Math.ceil((TIMEOUT_MS - (Date.now() - lastActivity.current)) / 1000)
      if (remaining <= 0) {
        doLogout()
      } else {
        setCountdown(remaining)
      }
    }, 1000)
    return () => clearInterval(ticker)
  }, [showWarning, doLogout])

  if (!showWarning) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div className="glass-card" style={{
        padding: '32px', borderRadius: '20px', maxWidth: '420px', width: '90%',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>⏳</div>
        <h2 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Session Expiring Soon
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          Your session will expire in <strong style={{ color: '#f59e0b' }}>{countdown} seconds</strong> due to inactivity.
          Click anywhere or press any key to stay signed in.
        </p>
        <div style={{
          fontSize: 36, fontWeight: 800, color: '#f59e0b', marginBottom: 24,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
        </div>
        <button
          onClick={resetTimer}
          style={{
            background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
            color: '#fff', border: 'none', padding: '12px 32px',
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            width: '100%',
          }}
        >
          Stay Signed In
        </button>
      </div>
    </div>
  )
}
