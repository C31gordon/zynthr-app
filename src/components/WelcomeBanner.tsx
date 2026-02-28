'use client'

import { useState, useEffect } from 'react'

interface WelcomeBannerProps {
  onNavigate: (view: string) => void
}

export default function WelcomeBanner({ onNavigate }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('zynthr_welcome_dismissed') === 'true'
    setDismissed(wasDismissed)
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem('zynthr_welcome_dismissed', 'true')
    setDismissed(true)
  }

  const steps = [
    { emoji: '🏢', label: 'Set Up Your Org', view: 'orgsetup' },
    { emoji: '🤖', label: 'Deploy Your First Agent', view: 'agents' },
    { emoji: '💬', label: 'Try the Chat', view: 'chat' },
  ]

  return (
    <div
      className="relative rounded-2xl p-6 mb-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--blue, #3b82f6), var(--purple, #8b5cf6))',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
        style={{ color: 'rgba(255,255,255,0.8)' }}
        aria-label="Dismiss welcome banner"
      >
        ✕
      </button>

      <div className="pr-8">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome to Zynthr! 🎉</h2>
        <p className="text-white/80 mb-5 text-sm">
          Your AI-powered command center is ready. Let&apos;s get you set up in 3 quick steps.
        </p>

        <div className="flex flex-wrap gap-3">
          {steps.map((step) => (
            <button
              key={step.view}
              onClick={() => onNavigate(step.view)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 hover:bg-white/25"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-lg">{step.emoji}</span>
              {step.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
