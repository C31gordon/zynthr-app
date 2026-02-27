'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PLANS, TRAINING_ADDON, getTrainingCost, type PlanType } from '@/lib/plans'

const STRIPE_CONFIGURED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [trainingSeats, setTrainingSeats] = useState(50)
  const [trainingPlan, setTrainingPlan] = useState<'professional' | 'enterprise'>('professional')

  const planKeys: PlanType[] = ['free', 'professional', 'enterprise']

  const trainingCost = useMemo(() => getTrainingCost(trainingSeats, trainingPlan, annual), [trainingSeats, trainingPlan, annual])
  const baseCost = annual ? PLANS[trainingPlan].annualPrice : PLANS[trainingPlan].price
  const totalCost = baseCost + trainingCost
  const includedSeats = PLANS[trainingPlan].trainingSeatsIncluded
  const billableSeats = Math.max(0, trainingSeats - includedSeats)
  const effectivePerSeat = trainingSeats > 0 ? (trainingCost / Math.max(1, billableSeats)).toFixed(2) : '0.00'

  const handleSubscribe = async (planKey: PlanType) => {
    if (planKey === 'free') {
      window.location.href = '/signup'
      return
    }
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:sales@milliebot.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }
    if (!STRIPE_CONFIGURED) return
    window.location.href = '/signup'
  }

  return (
    <div className="min-h-screen p-4 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 pt-16">
        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline" style={{ color: 'var(--blue)' }}>
            ← Back to Milliebot
          </Link>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-lg" style={{ color: 'var(--text3)' }}>
            Start free. Scale as you grow. No surprises.
          </p>
        </div>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="text-sm font-medium" style={{ color: annual ? 'var(--text4)' : 'var(--text)' }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full transition-all"
            style={{ background: annual ? 'var(--blue)' : 'var(--bg3)' }}>
            <div className="absolute top-1 w-5 h-5 rounded-full transition-all"
              style={{ background: '#fff', left: annual ? '30px' : '4px' }} />
          </button>
          <span className="text-sm font-medium" style={{ color: annual ? 'var(--text)' : 'var(--text4)' }}>
            Annual <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(107,164,138,0.15)', color: 'var(--green)' }}>Save 20%</span>
          </span>
        </div>

        {/* ─── PLATFORM PLANS ─── */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🤖 Platform Plans</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>AI agent orchestration with RKBAC™ access control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {planKeys.map(key => {
            const plan = PLANS[key]
            const price = annual ? plan.annualPrice : plan.price
            const isHighlight = plan.highlight

            return (
              <div key={key}
                className="glass-card p-6 flex flex-col relative"
                style={{
                  border: isHighlight ? '2px solid var(--blue)' : undefined,
                  boxShadow: isHighlight ? 'var(--shadow-glow-blue)' : undefined,
                }}>
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'var(--blue)', color: '#fff' }}>
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                <div className="mb-4">
                  {price === 0 ? (
                    <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>${price}</span>
                      <span className="text-sm" style={{ color: 'var(--text4)' }}>/mo</span>
                      {annual && <div className="text-xs mt-1" style={{ color: 'var(--green)' }}>Billed annually</div>}
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text3)' }}>
                      <span style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleSubscribe(key)}
                  disabled={key !== 'free' && key !== 'enterprise' && !STRIPE_CONFIGURED}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isHighlight
                      ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))'
                      : key === 'free'
                        ? 'linear-gradient(135deg, var(--green), var(--teal))'
                        : 'var(--bg3)',
                    color: key === 'enterprise' && !isHighlight ? 'var(--text)' : '#fff',
                    boxShadow: isHighlight ? 'var(--shadow-glow-blue)' : 'none',
                  }}>
                  {key !== 'free' && key !== 'enterprise' && !STRIPE_CONFIGURED
                    ? '🔒 Coming Soon'
                    : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* ─── TRAINING ADD-ON ─── */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🎓 Training & Digital Adoption</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Add-on module — requires Professional or Enterprise plan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Features + Pricing Table */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))' }}>
                🎓
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{TRAINING_ADDON.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text4)' }}>Per-seat add-on pricing</p>
              </div>
            </div>

            <p className="text-sm mb-5" style={{ color: 'var(--text3)' }}>
              {TRAINING_ADDON.description}
            </p>

            <ul className="space-y-2 mb-6">
              {TRAINING_ADDON.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text3)' }}>
                  <span style={{ color: 'var(--purple)' }}>✓</span> {f}
                </li>
              ))}
            </ul>

            {/* Pricing breakdown table */}
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg2)' }}>
                    <th className="text-left py-2.5 px-4" style={{ color: 'var(--text3)' }}>Tier</th>
                    <th className="text-center py-2.5 px-3" style={{ color: 'var(--text3)' }}>Monthly</th>
                    <th className="text-center py-2.5 px-3" style={{ color: 'var(--text3)' }}>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-4" style={{ color: 'var(--text)' }}>
                      <div className="font-medium">Professional</div>
                      <div className="text-xs" style={{ color: 'var(--text4)' }}>3 seats included free</div>
                    </td>
                    <td className="text-center py-2.5 px-3" style={{ color: 'var(--green)' }}>Free</td>
                    <td className="text-center py-2.5 px-3" style={{ color: 'var(--green)' }}>Free</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-4" style={{ color: 'var(--text)' }}>
                      <div className="font-medium">Enterprise</div>
                      <div className="text-xs" style={{ color: 'var(--text4)' }}>25 seats included free</div>
                    </td>
                    <td className="text-center py-2.5 px-3" style={{ color: 'var(--green)' }}>Free</td>
                    <td className="text-center py-2.5 px-3" style={{ color: 'var(--green)' }}>Free</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-4" style={{ color: 'var(--text)' }}>
                      <div className="font-medium">Additional Seats</div>
                      <div className="text-xs" style={{ color: 'var(--text4)' }}>10 seat minimum</div>
                    </td>
                    <td className="text-center py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>$12<span className="text-xs font-normal" style={{ color: 'var(--text4)' }}>/seat</span></td>
                    <td className="text-center py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>$10<span className="text-xs font-normal" style={{ color: 'var(--text4)' }}>/seat</span></td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-4" style={{ color: 'var(--text)' }}>
                      <div className="font-medium">Volume (250+ seats)</div>
                      <div className="text-xs" style={{ color: 'var(--text4)' }}>Enterprise volume pricing</div>
                    </td>
                    <td className="text-center py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>$10<span className="text-xs font-normal" style={{ color: 'var(--text4)' }}>/seat</span></td>
                    <td className="text-center py-2.5 px-3 font-semibold" style={{ color: 'var(--text)' }}>$8<span className="text-xs font-normal" style={{ color: 'var(--text4)' }}>/seat</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* WalkMe comparison callout */}
            <div className="mt-4 px-4 py-3 rounded-lg text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <span className="font-semibold" style={{ color: 'var(--purple)' }}>40% less than legacy DAPs</span>
              <span style={{ color: 'var(--text3)' }}> — AI-native training without the DOM scraping, browser extensions, or vendor lock-in.</span>
            </div>
          </div>

          {/* Right: Interactive Calculator */}
          <div className="glass-card p-6" style={{ border: '2px solid var(--purple)', boxShadow: '0 0 20px rgba(139,92,246,0.15)' }}>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>💰 Cost Calculator</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text4)' }}>See exactly what you&apos;ll pay</p>

            {/* Plan selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Base Plan</label>
              <div className="flex gap-2">
                {(['professional', 'enterprise'] as const).map(p => (
                  <button key={p} onClick={() => setTrainingPlan(p)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: trainingPlan === p ? 'var(--blue)' : 'var(--bg2)',
                      color: trainingPlan === p ? '#fff' : 'var(--text3)',
                      border: `1px solid ${trainingPlan === p ? 'var(--blue)' : 'var(--border)'}`,
                    }}>
                    {PLANS[p].name} — ${annual ? PLANS[p].annualPrice : PLANS[p].price}/mo
                  </button>
                ))}
              </div>
            </div>

            {/* Seat slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>Training Seats</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={trainingSeats} onChange={e => setTrainingSeats(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-right px-2 py-1 rounded text-sm font-mono"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <span className="text-xs" style={{ color: 'var(--text4)' }}>seats</span>
                </div>
              </div>
              <input type="range" min="0" max="500" step="5" value={trainingSeats}
                onChange={e => setTrainingSeats(parseInt(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text4)' }}>
                <span>0</span>
                <span>100</span>
                <span>250</span>
                <span>500</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm" style={{ color: 'var(--text3)' }}>
                <span>{PLANS[trainingPlan].name} plan</span>
                <span style={{ color: 'var(--text)' }}>${baseCost}/mo</span>
              </div>
              {trainingSeats <= includedSeats && trainingSeats > 0 && (
                <div className="flex justify-between text-sm" style={{ color: 'var(--text3)' }}>
                  <span>Training ({trainingSeats} seats)</span>
                  <span style={{ color: 'var(--green)' }}>Included free</span>
                </div>
              )}
              {billableSeats > 0 && (
                <>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text3)' }}>
                    <span>Included training seats</span>
                    <span style={{ color: 'var(--green)' }}>{includedSeats} free</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text3)' }}>
                    <span>Additional seats ({billableSeats} × ${effectivePerSeat})</span>
                    <span style={{ color: 'var(--text)' }}>${trainingCost}/mo</span>
                  </div>
                </>
              )}
              {trainingSeats >= TRAINING_ADDON.volumeThreshold && (
                <div className="flex items-center gap-2 text-xs px-2 py-1.5 rounded" style={{ background: 'rgba(107,164,138,0.1)' }}>
                  <span style={{ color: 'var(--green)' }}>🏷️ Volume pricing applied</span>
                </div>
              )}
              <div className="pt-3 flex justify-between font-bold text-lg" style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
                <span>Total</span>
                <div className="text-right">
                  <div>${totalCost}<span className="text-sm font-normal" style={{ color: 'var(--text4)' }}>/mo</span></div>
                  {annual && <div className="text-xs font-normal" style={{ color: 'var(--green)' }}>Billed annually (${totalCost * 12}/yr)</div>}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
              onClick={() => { window.location.href = '/signup' }}>
              Get Started with Training
            </button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--text4)' }}>
              14-day free trial • No credit card required
            </p>
          </div>
        </div>

        {/* ─── FEATURE COMPARISON ─── */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 pr-4" style={{ color: 'var(--text3)' }}>Feature</th>
                  {planKeys.map(k => (
                    <th key={k} className="text-center py-3 px-4" style={{ color: 'var(--text)' }}>{PLANS[k].name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Agents', '2', '10', 'Unlimited'],
                  ['Bots', '1', '5', 'Unlimited'],
                  ['AI Queries/Day', '100', '1,000', 'Unlimited'],
                  ['Training Seats', '—', '3 included', '25 included'],
                  ['Training Add-On', '—', '$12/seat/mo', '$10/seat/mo'],
                  ['SSO', '—', '✓', '✓'],
                  ['White-label', '—', '—', '✓'],
                  ['Custom RKBAC™', '—', '—', '✓'],
                  ['API Access', '—', '✓', '✓'],
                  ['Support', 'Community', 'Email', 'Dedicated'],
                  ['SLA', '—', '—', '99.9%'],
                ].map(([feature, ...values]) => (
                  <tr key={feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 pr-4" style={{ color: 'var(--text3)' }}>{feature}</td>
                    {values.map((v, i) => (
                      <td key={i} className="text-center py-3 px-4"
                        style={{ color: v === '✓' ? 'var(--green)' : v === '—' ? 'var(--text4)' : 'var(--text)' }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-xs" style={{ color: 'var(--text4)' }}>© 2026 Milliebot Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
