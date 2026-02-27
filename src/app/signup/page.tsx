'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must include at least one uppercase letter')
      setLoading(false)
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must include at least one lowercase letter')
      setLoading(false)
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must include at least one number')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Store company name for onboarding
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_company', companyName)
      sessionStorage.setItem('onboarding_name', fullName)
    }
    window.location.href = '/onboarding'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: 'var(--shadow-glow-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Create Your Account</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Start free — no credit card required</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Company Name</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." required
                className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Your Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" required
                className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required
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
              style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', boxShadow: loading ? 'none' : 'var(--shadow-glow-green)' }}>
              {loading ? 'Creating account...' : '🚀 Get Started Free'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: 'var(--text4)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Sign in</Link>
            </p>
          </div>
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
