'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TourStep {
  title: string
  description: string
  selector: string
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Dashboard',
    description: 'This is your command center. See real-time KPIs, security alerts, and department health at a glance.',
    selector: '[data-tour="dashboard"]',
  },
  {
    title: 'Agents & Bots',
    description: 'Create and manage your AI workers here. Agents handle complex tasks, Bots handle single-function queries.',
    selector: '[data-tour="agents"]',
  },
  {
    title: 'Chat',
    description: "Ask anything in natural language. Start with 'I wish...' for suggestions, 'I need...' for tickets, or 'Build me...' for planning.",
    selector: '[data-tour="chat"]',
  },
  {
    title: 'Workflows',
    description: 'Automate repetitive processes. If-this-then-that logic, scheduled reports, and multi-step automations.',
    selector: '[data-tour="workflows"]',
  },
  {
    title: 'Onboarding',
    description: 'Set up training pathways for your team. Guardian Gates block capabilities until prerequisites are met.',
    selector: '[data-tour="onboarding"]',
  },
  {
    title: 'Security (RKBAC)',
    description: 'Control who can see and do what. 4-tier permissions ensure every agent respects your org boundaries.',
    selector: '[data-tour="policies"]',
  },
  {
    title: 'Settings',
    description: 'Configure departments, invite users, connect your systems, and customize the platform.',
    selector: '[data-tour="settings"]',
  },
  {
    title: 'Org Setup',
    description: 'Start here! Set up your organization, departments, and integrations in a guided wizard.',
    selector: '[data-tour="orgsetup"]',
  },
]

interface GuidedTourProps {
  active: boolean
  onComplete: () => void
  onNavigate?: (view: string) => void
}

export default function GuidedTour({ active, onComplete, onNavigate }: GuidedTourProps) {
  const [step, setStep] = useState(0)
  const [highlight, setHighlight] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const finish = useCallback(() => {
    localStorage.setItem('zynthr_tour_completed', 'true')
    onComplete()
  }, [onComplete])

  // Find and highlight element for current step
  useEffect(() => {
    if (!active) return
    const el = document.querySelector(TOUR_STEPS[step].selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      setHighlight(rect)
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      setHighlight(null)
    }
  }, [active, step])

  // ESC to dismiss
  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, finish])

  if (!active) return null

  const isLast = step === TOUR_STEPS.length - 1
  const current = TOUR_STEPS[step]
  const pad = 8

  // Position tooltip near the highlighted element
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10002,
    maxWidth: 360,
    width: '90vw',
  }

  if (highlight) {
    const centerX = highlight.left + highlight.width / 2
    const below = highlight.bottom + pad + 12
    const above = highlight.top - pad - 12

    // Prefer placing to the right of sidebar items
    if (highlight.right < window.innerWidth / 2) {
      tooltipStyle.left = Math.min(highlight.right + 12, window.innerWidth - 380)
      tooltipStyle.top = Math.max(highlight.top, 12)
    } else if (below + 200 < window.innerHeight) {
      tooltipStyle.left = Math.max(centerX - 180, 12)
      tooltipStyle.top = below
    } else {
      tooltipStyle.left = Math.max(centerX - 180, 12)
      tooltipStyle.bottom = window.innerHeight - above
    }
  } else {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  return (
    <div className="fixed inset-0" style={{ zIndex: 10000 }}>
      {/* Overlay with spotlight cutout via box-shadow */}
      <div
        className="fixed inset-0 transition-all duration-300"
        style={{
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
        onClick={finish}
      >
        {highlight ? (
          <div
            className="absolute transition-all duration-300"
            style={{
              top: highlight.top - pad,
              left: highlight.left - pad,
              width: highlight.width + pad * 2,
              height: highlight.height + pad * 2,
              borderRadius: 12,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
        )}
      </div>

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-5 transition-all duration-300"
      >
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(20, 20, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--blue, #3b82f6)' }}>
            Step {step + 1} of {TOUR_STEPS.length}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-white/70 mb-4 leading-relaxed">{current.description}</p>

          {isLast ? (
            <div className="text-center">
              <p className="text-white/80 text-sm mb-3">🎉 You&apos;re ready! Start by setting up your organization.</p>
              <button
                onClick={() => { finish(); onNavigate?.('orgsetup') }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--blue, #3b82f6), var(--purple, #8b5cf6))' }}
              >
                Go to Org Setup
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={finish}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Skip Tour
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'var(--blue, #3b82f6)' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === step ? 'var(--blue, #3b82f6)' : 'rgba(255,255,255,0.2)',
                  transform: i === step ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
