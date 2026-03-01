'use client'

import { useState, useEffect, useCallback } from 'react'
import SubdomainPicker from '@/components/SubdomainPicker'
import LegalModal from '@/components/LegalModal'
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/lib/legal-docs'
import { supabase, DEMO_MODE } from '@/lib/supabase'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  orgName?: string
  general?: string
  tos?: string
  subdomain?: string
}

export default function LoginPage() {
  const [showExpired, setShowExpired] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [oauthToast, setOauthToast] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [tosAccepted, setTosAccepted] = useState(false)
  const [showTosModal, setShowTosModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [subdomain, setSubdomain] = useState('')
  const [subdomainValid, setSubdomainValid] = useState(false)
  const handleSubdomainValid = useCallback((v: boolean) => setSubdomainValid(v), [])

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("expired") === "1") {
      setShowExpired(true)
    }
  }, [])

  useEffect(() => {
    if (DEMO_MODE) {
      if (typeof window !== 'undefined' && localStorage.getItem('zynthr_authenticated') === 'true') {
        window.location.href = '/'
      }
      return
    }
    // Real auth: check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/'
      }
    })
  }, [])

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleOAuth = async (provider: 'google' | 'azure' | 'apple') => {
    if (DEMO_MODE) {
      setOauthToast(true)
      setTimeout(() => setOauthToast(false), 3000)
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/',
      },
    })
    if (error) {
      setErrors({ general: error.message })
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const errs: FormErrors = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    if (DEMO_MODE) {
      // Legacy localStorage flow
      const storedUsers = JSON.parse(localStorage.getItem('zynthr_users') || '[]')
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
        localStorage.setItem('zynthr_users', JSON.stringify(storedUsers))
      }
      localStorage.setItem('zynthr_user', JSON.stringify(userData))
      localStorage.setItem('zynthr_authenticated', 'true')
      setTimeout(() => { window.location.href = '/' }, 400)
      return
    }

    // Real Supabase auth
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrors({ general: error.message })
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  const handleSignUp = async (e: React.FormEvent) => {
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
    if (!tosAccepted) errs.tos = 'You must agree to the Terms of Service and Privacy Policy'
    if (!subdomainValid) errs.subdomain = 'Please choose a valid workspace URL'
    if (Object.keys(errs).length) { setErrors(errs); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    setLoading(true)

    if (DEMO_MODE) {
      // Legacy localStorage flow
      const storedUsers = JSON.parse(localStorage.getItem('zynthr_users') || '[]')
      if (storedUsers.find((u: { email: string }) => u.email.toLowerCase() === signupEmail.toLowerCase())) {
        setErrors({ general: 'An account with this email already exists' })
        setLoading(false)
        return
      }
      const userData = { firstName: firstName.trim(), lastName: lastName.trim(), name: firstName.trim() + ' ' + lastName.trim(), email: signupEmail.trim(), orgName: orgName.trim(), subdomain: subdomain.trim(), createdAt: new Date().toISOString() }
      storedUsers.push({ ...userData, password: signupPassword })
      localStorage.setItem('zynthr_users', JSON.stringify(storedUsers))
      localStorage.setItem('zynthr_user', JSON.stringify(userData))
      localStorage.setItem('zynthr_authenticated', 'true')
      setTimeout(() => { window.location.href = '/' }, 400)
      return
    }

    // Real Supabase auth: sign up
    const fullName = firstName.trim() + ' ' + lastName.trim()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          org_name: orgName.trim(),
        },
      },
    })

    if (signUpError) {
      setErrors({ general: signUpError.message })
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id
    const gotSession = signUpData.session

    if (!userId) {
      setErrors({ general: 'Sign-up failed. Please try again.' })
      setLoading(false)
      return
    }

    // If no session (email confirmation required), auto-sign-in immediately
    if (!gotSession) {
      const { error: autoSignInErr } = await supabase.auth.signInWithPassword({
        email: signupEmail.trim(),
        password: signupPassword,
      })
      if (autoSignInErr) {
        console.warn('Auto-sign-in after signup failed:', autoSignInErr.message)
      }
    }

    // Create organization
    const slug = subdomain.trim().toLowerCase()
    const { data: orgData, error: orgError } = await (supabase as any)
      .from('organizations')
      .insert({
        name: orgName.trim(),
        slug,
        owner_id: userId,
        plan: 'free',
      })
      .select()
      .single()

    if (orgError) {
      console.error('Org creation error:', orgError)
      // Don't block — user was created. Redirect anyway.
    }

    // Create org_member record
    if (orgData) {
      const { error: memberError } = await (supabase as any)
        .from('org_members')
        .insert({
          org_id: orgData.id,
          user_id: userId,
          role: 'owner',
          permission_tier: 100,
          status: 'active',
          joined_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error('Member creation error:', memberError)
      }
    }

    window.location.href = '/'
  }

  const handleDemoMode = () => {
    if (DEMO_MODE) {
      localStorage.setItem('zynthr_authenticated', 'true')
      localStorage.setItem('zynthr_user', JSON.stringify({
        name: 'Demo User',
        email: 'demo@zynthr.ai',
        orgName: 'Demo Organization',
        createdAt: new Date().toISOString(),
      }))
    }
    window.location.href = '/'
  }

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }

  const oauthBtnStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

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

      {/* OAuth Toast */}
      {oauthToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          Google & Microsoft sign-in available soon — please use email for now
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 float"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome to Zynthr</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Your AI-powered command center</p>
        </div>

        <div className="glass-card p-8">
          {showExpired && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs mb-4"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              🔒 Your session expired for security. Please sign in again.
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={oauthBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button onClick={() => handleOAuth('azure')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={oauthBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#00A4EF"/></svg>
              Continue with Microsoft
            </button>
            <button onClick={() => handleOAuth('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={oauthBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.53-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text4)' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

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
                <input type="text" value={orgName} onChange={(e) => {
                  setOrgName(e.target.value)
                  if (!subdomain || subdomain === orgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
                    const auto = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    setSubdomain(auto)
                  }
                }} placeholder="Acme Inc."
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
                {errors.orgName && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.orgName}</p>}
              </div>
              <SubdomainPicker value={subdomain} onChange={setSubdomain} onValidChange={handleSubdomainValid} />
              {errors.subdomain && <p className="text-xs mt-1" style={{ color: 'var(--red-light)' }}>{errors.subdomain}</p>}
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded" style={{ accentColor: 'var(--blue)' }} />
                <label className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTosModal(true)} style={{ color: 'var(--blue)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => setShowPrivacyModal(true)} style={{ color: 'var(--blue)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Privacy Policy</button>
                </label>
              </div>
              {errors.tos && <p className="text-xs" style={{ color: 'var(--red-light)' }}>{errors.tos}</p>}
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
          <a href="/landing" style={{ color: 'var(--blue)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Learn more about Zynthr</a>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: 'var(--text4)' }}>Powered by <strong>RKBAC™</strong> — Roles & Knowledge-Based Access Control</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text4)' }}>© 2026 Zynthr Inc. All rights reserved.</p>
        </div>
      </div>
      <LegalModal title="Terms of Service" content={TERMS_OF_SERVICE} isOpen={showTosModal} onClose={() => setShowTosModal(false)} />
      <LegalModal title="Privacy Policy" content={PRIVACY_POLICY} isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}
