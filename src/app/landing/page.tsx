'use client'

import Link from 'next/link'

const colors = {
  teal: '#003146',
  blue: '#559CB5',
  gold: '#FCB53B',
  green: '#6BA48A',
  red: '#AE132A',
}

const problems = [
  { before: 'Manual Reports', after: 'Automated DLR', icon: '📋', desc: 'Daily Leasing Reports generated automatically from live data — no more spreadsheets.' },
  { before: 'Training Bottleneck', after: 'Guardian Gates', icon: '🎓', desc: 'AI-powered onboarding ensures competency before access. New hires ramp 3× faster.' },
  { before: 'Tool Sprawl', after: 'Unified Command Center', icon: '🔧', desc: 'One platform for agents, bots, tickets, chat, and analytics. Replace 5+ tools.' },
]

const features = [
  { icon: '🤖', title: 'AI Agent Orchestration', desc: 'Deploy purpose-built agents for every department' },
  { icon: '🔒', title: 'RKBAC™ Access Control', desc: 'Role & Knowledge-Based permissions that adapt' },
  { icon: '🎓', title: 'Training & Digital Adoption', desc: 'AI-powered onboarding with Guardian Gates' },
  { icon: '📊', title: 'Real-Time Dashboards', desc: 'Portfolio insights at every level' },
  { icon: '🔗', title: 'M365 + Google Integration', desc: 'Connect your existing tools seamlessly' },
  { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC 2 & HIPAA ready architecture' },
]

const tiers = [
  { name: 'Starter', price: 'Free', period: 'forever', features: ['Up to 3 agents', '100 tickets/mo', 'Community support', 'Basic dashboards'], cta: 'Start Free', highlight: false },
  { name: 'Professional', price: '$49', period: '/mo', features: ['Unlimited agents', 'Unlimited tickets', 'RKBAC™ access control', 'M365 + Google integration', 'Priority support'], cta: 'Start Trial', highlight: true },
  { name: 'Enterprise', price: '$499', period: '/mo', features: ['Everything in Pro', 'White-label option', 'Custom integrations', 'Dedicated CSM', 'SSO + audit logs', 'SLA guarantee'], cta: 'Contact Sales', highlight: false },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0f1a', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.blue}, ${colors.teal})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16 }}>M</div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>Milliebot</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Pricing</Link>
          <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
          <Link href="/signup" style={{ padding: '8px 20px', borderRadius: 8, background: colors.gold, color: '#000', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(85,156,181,0.15)', color: colors.blue, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          Built for Property Management Teams
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, background: `linear-gradient(135deg, #fff 0%, ${colors.blue} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI-Powered Operations Command Center
        </h1>
        <p style={{ fontSize: 20, color: '#94a3b8', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Eliminate manual workflows, unify your tools, and deploy intelligent agents across every department — from leasing to maintenance to accounting.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ padding: '14px 32px', borderRadius: 10, background: colors.gold, color: '#000', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>Start Free →</Link>
          <Link href="/pricing" style={{ padding: '14px 32px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>See Pricing</Link>
        </div>
      </section>

      {/* Problem / Solution */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>The Old Way vs. The Milliebot Way</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>Property management is ready for an upgrade.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {problems.map((p, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ color: colors.red, fontWeight: 600, fontSize: 14, textDecoration: 'line-through' }}>{p.before}</span>
                <span style={{ color: '#475569' }}>→</span>
                <span style={{ color: colors.green, fontWeight: 600, fontSize: 14 }}>{p.after}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>One platform to orchestrate your entire operation.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color: '#475569', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>Trusted by property management teams nationwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.3 }}>
          {['RISE Real Estate', 'Greystar', 'Lincoln Property', 'Cushman & Wakefield', 'CBRE'].map((name, i) => (
            <div key={i} style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>{name}</div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>Start free. Scale as you grow. <Link href="/pricing" style={{ color: colors.blue, textDecoration: 'underline' }}>See full pricing →</Link></p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {tiers.map((t, i) => (
            <div key={i} style={{ background: t.highlight ? 'rgba(85,156,181,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 32, border: `1px solid ${t.highlight ? 'rgba(85,156,181,0.3)' : 'rgba(255,255,255,0.06)'}`, position: 'relative' }}>
              {t.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: colors.gold, color: '#000', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>MOST POPULAR</div>}
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{t.name}</h3>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>{t.price}</span>
                <span style={{ color: '#64748b', fontSize: 14 }}>{t.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                {t.features.map((f, j) => (
                  <li key={j} style={{ color: '#94a3b8', fontSize: 14, padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: colors.green }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={t.name === 'Enterprise' ? '/signup' : '/signup'} style={{ display: 'block', textAlign: 'center', padding: '12px 24px', borderRadius: 10, background: t.highlight ? colors.gold : 'rgba(255,255,255,0.06)', color: t.highlight ? '#000' : '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: t.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>{t.cta}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 24 }}>
          🎓 Training & Digital Adoption add-on: <strong style={{ color: '#e2e8f0' }}>$12/seat/mo</strong> — AI-powered onboarding with Guardian Gates
        </p>
      </section>

      {/* CTA Footer */}
      <section style={{ textAlign: 'center', padding: '100px 20px', background: `linear-gradient(180deg, transparent, rgba(0,49,70,0.3))` }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Modernize Operations?</h2>
        <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 32 }}>Join property management teams already using AI to work smarter.</p>
        <Link href="/signup" style={{ padding: '16px 40px', borderRadius: 12, background: colors.gold, color: '#000', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'inline-block' }}>Get Started Free →</Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 13 }}>© 2026 Milliebot. All rights reserved. Built by Courtney Gordon.</p>
      </footer>
    </div>
  )
}
