'use client'

import { useState, useEffect } from 'react'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  orgName?: string
  general?: string
}

export default function LoginPage() {
  const [showExpired, setShowExpired] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("expired") === "1") {
      setShowExpired(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('milliebot_authenticated') === 'true') {
      window.location.href = '/'
    }
  }, [])

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const errs: FormErrors = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const storedUsers = JSON.parse(localStorage.getItem('milliebot_users') || '[]')
    const found = storedUsers.find((u: { email: string; password: string }) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found && storedUsers.length > 0) {
      setErrors({ general: 'Invalid email or password' })
      setLoading(false)
      return
    }
    const userData = found
      ? { name: found.name, email: found.email, orgName: found.orgName, createdAt: found.createdAt }
      : { name: email.split('@')[0], email, orgName: '', createdAt: new Date().toISOString() }
    if (!found) {
      storedUsers.push({ ...userData, password })
      localStorage.setItem('milliebot_users', JSON.stringify(storedUsers))
    }
    localStorage.setItem('milliebot_user', JSON.stringify(userData))
    localStorage.setItem('milliebot_authenticated', 'true')
    setTimeout(() => { window.location.href = '/' }, 400)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const errs: FormErrors = {}
    if (!firstName.trim()) errs.name = 'First name is required'
    if (!lastName.trim()) errs.name = 'Last name is required'
    if (!signupEmail.trim()) errs.email = 'Email is required'
    else if (!validateEmail(signupEmail)) errs.email = 'Invalid email format'
    if (!signupPassword) errs.password = 'Password is required'
    else if (signupPassword.length < 6) errs.password = 'Password must be at least 6 characters'
    if (signupPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!orgName.trim()) errs.orgName = 'Organization name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const storedUsers = JSON.parse(localStorage.getItem('milliebot_users') || '[]')
    if (storedUsers.find((u: { email: string }) => u.email.toLowerCase() === signupEmail.toLowerCase())) {
      setErrors({ general: 'An account with this email already exists' })
      setLoading(false)
      return
    }
    const userData = { firstName: firstName.trim(), lastName: lastName.trim(), name: firstName.trim() + ' ' + lastName.trim(), email: signupEmail.trim(), orgName: orgName.trim(), createdAt: new Date().toISOString() }
    storedUsers.push({ ...userData, password: signupPassword })
    localStorage.setItem('milliebot_users', JSON.stringify(storedUsers))
    localStorage.setItem('milliebot_user', JSON.stringify(userData))
    localStorage.setItem('milliebot_authenticated', 'true')
    setTimeout(() => { window.location.href = '/' }, 400)
  }

  const handleDemoMode = () => { window.location.href = '/' }

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 float"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome to Milliebot</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Your AI-powered command center</p>
        </div>

        <div className="glass-card p-8">
          {showExpired && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs mb-4"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              🔒 Your session expired for security. Please sign in again.
            </div>
          )}
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <button onClick={() => { setMode('signin'); setErrors({}) }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{ background: mode === 'signin' ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'transparent', color: mode === 'signin' ? '#fff' : 'var(--text3)' }}>
              Sign In
            </button>
            <button onClick={() => { setMode('signup'); setErrors({}) }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{ background: mode === 'signup' ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'transparent', color: mode === 'signup' ? '#fff' : 'var(--text3)' }}>
              Sign Up
            </button>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
              style={{ background: 'rgba(174,19,42,0.1)', border: '1px solid rgba(174,19,42,0.3)', color: 'var(--red-light)' }}>
              ⚠️ {errors.general}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.password}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', boxShadow: loading ? 'none' : 'var(--shadow-glow-blue)' }}>
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                  </div>
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Email</label>
                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Password</label>
                <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.confirmPassword}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Organization Name</label>
                <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Inc."
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.orgName && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.orgName}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', boxShadow: loading ? 'none' : 'var(--shadow-glow-blue)' }}>
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text4)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            <button onClick={handleDemoMode}
              className="w-full px-4 py-2.5 rounded-lg text-center text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
              🚀 Explore Demo Mode
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/landing" style={{ color: 'var(--blue)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Learn more about Milliebot</a>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: 'var(--text4)' }}>Powered by <strong>RKBAC™</strong> — Roles & Knowledge-Based Access Control</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text4)' }}>© 2026 Milliebot Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
