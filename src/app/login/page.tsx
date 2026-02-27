'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { window.location.href = '/' }
  }

  const handleMicrosoftSSO = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { scopes: 'openid profile email', redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleGoogleSSO = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) { setError(error.message) } else { setResetSent(true) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 float"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Milliebot Command Center</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Enterprise AI Agent Orchestration</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          {mode === 'login' ? (
            <>
              {/* Demo Mode Banner */}
              <a href="/"
                className="block w-full mb-5 px-4 py-3 rounded-lg text-center font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
                🚀 Enter Demo Mode — Explore the Full Platform
              </a>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
                <span className="text-xs font-medium" style={{ color: 'var(--text4)' }}>or sign in</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
              </div>

              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button onClick={handleMicrosoftSSO} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ background: '#2F2F2F', color: '#fff', border: '1px solid #444' }}>
                  <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Sign in with Microsoft
                </button>
                <button onClick={handleGoogleSSO} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ background: '#fff', color: '#333', border: '1px solid #ddd' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
                <span className="text-xs font-medium" style={{ color: 'var(--text4)' }}>email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
              </div>

              {/* Email/Password */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>Password</label>
                    <button type="button" onClick={() => setMode('reset')} className="text-xs font-medium hover:underline" style={{ color: 'var(--blue)' }}>
                      Forgot password?
                    </button>
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'rgba(174,19,42,0.1)', border: '1px solid rgba(174,19,42,0.3)', color: 'var(--red-light)' }}>
                    ⚠️ {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', boxShadow: loading ? 'none' : 'var(--shadow-glow-blue)' }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs" style={{ color: 'var(--text4)' }}>
                  Don&apos;t have an account?{' '}
                  <a href="/signup" className="font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Sign up</a>
                </p>
              </div>
            </>
          ) : (
            <>
              {resetSent ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">📧</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Check your email</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>
                    Reset link sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
                  </p>
                  <button onClick={() => { setMode('login'); setResetSent(false) }}
                    className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Back to sign in</button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Reset your password</h3>
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>Enter your email and we&apos;ll send you a reset link.</p>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                    className="w-full px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(174,19,42,0.1)', border: '1px solid rgba(174,19,42,0.3)', color: 'var(--red-light)' }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-lg font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => setMode('login')}
                    className="w-full text-sm font-medium hover:underline" style={{ color: 'var(--text3)' }}>Back to sign in</button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: 'var(--text4)' }}>
            Powered by <strong>RKBAC™</strong> — Roles & Knowledge-Based Access Control
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text4)' }}>© 2026 Milliebot Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
