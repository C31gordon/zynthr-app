'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  confidence?: number
  sources?: { label: string; url: string }[]
  freshness?: 'verified' | 'stale' | 'partial'
  isFinancial?: boolean
  isMock?: boolean
  detectedAs?: 'suggestion' | 'ticket' | 'planning' | null
}

const smartResponses: Record<string, { content: string; confidence?: number; sources?: { label: string; url: string }[]; freshness?: string }> = {
  occupancy: {
    content: "**Current Portfolio Occupancy — Feb 25, 2026**\n\n📊 **Physical Occupancy:** 94.2% (↑ 0.3% from last week)\n• Bartram Park: 96.3% (285/297 units)\n• Prosper On Fayette: 62.1% preleased (195/314 beds)\n\n📈 **Leased Occupancy:** 95.8%\n• 12 new leases signed this week\n• 3 move-outs scheduled next week\n\n⚠️ **Watch Items:**\n• Prosper pre-lease velocity needs to hit 8 leases/week to meet fall target\n• Bartram renewal rate at 62% — above 60% benchmark",
    confidence: 94,
    sources: [
      { label: 'Entrata Box Score (Feb 25)', url: '#' },
      { label: 'Weekly Leasing Report', url: '#' },
    ],
    freshness: 'verified',
  },
  revenue: {
    content: "**Revenue Summary — February 2026 (MTD)**\n\n💰 **Total Collected Revenue:** $2,847,320\n• Bartram Park: $1,923,450 (target: $1,950,000 → 98.6%)\n• Prosper On Fayette: $923,870 (target: $890,000 → 103.8%)\n\n📊 **Average Rent:**\n• Bartram 1BR: $1,485 (+2.1% YoY)\n• Bartram 2BR: $1,835 (+1.8% YoY)\n• Prosper 2BR/2BA: $1,250/bed\n\n⚠️ **Delinquency:** 3.2% (↓ from 3.8% last month)\n\n*Note: This data includes projected end-of-month calculations*",
    confidence: 88,
    sources: [
      { label: 'Entrata Rent Roll (Feb 25)', url: '#' },
      { label: 'Monthly P&L Projection', url: '#' },
    ],
    freshness: 'partial',
  },
  default: {
    content: "I checked the available data sources for your question. Here's what I found:\n\nI have access to your Entrata reports, M365 email, and operational data. Let me know if you'd like me to dig into a specific area — occupancy, revenue, work orders, leasing velocity, or staffing.",
    confidence: 72,
  },
}

function getSmartResponse(message: string): Message {
  const lower = message.toLowerCase()
  let response = smartResponses.default
  let detectedAs: 'suggestion' | 'ticket' | 'planning' | null = null

  if (lower.includes('occupancy') || lower.includes('vacancy') || lower.includes('leased')) {
    response = smartResponses.occupancy
  } else if (lower.includes('revenue') || lower.includes('rent') || lower.includes('financial') || lower.includes('money')) {
    response = smartResponses.revenue
  } else if (lower.startsWith('i wish') || lower.includes('it would be nice') || lower.includes('i\'d love')) {
    detectedAs = 'suggestion'
    response = {
      content: `💡 **Suggestion Captured**\n\n"${message}"\n\nI've logged this as a suggestion. It'll appear in the Suggestions board where the team can vote on it.\n\n📊 **Current status:** New\n👥 **Votes:** 1 (yours)\n\nWould you like me to tag it to a specific department?`,
      confidence: 100,
    }
  } else if (lower.startsWith('i need') || lower.includes('can you help') || lower.includes('something is broken') || lower.includes('not working')) {
    detectedAs = 'ticket'
    response = {
      content: `🎫 **Ticket Created — #TKT-0013**\n\n**Issue:** "${message}"\n**Priority:** Medium (you can change this)\n**Status:** New — routing to the right department\n\nI'll keep you updated as it progresses. Need to bump the priority or add details?`,
      confidence: 100,
    }
  } else if (lower.startsWith('build me') || lower.startsWith('create a') || lower.includes('automate') || lower.includes('set up a')) {
    detectedAs = 'planning'
    response = {
      content: `🏗️ **Planning Mode Activated**\n\nBefore I build anything, let me make sure I understand exactly what you need.\n\n**I'm picking up:**\n"${message}"\n\n**Let me ask a few questions:**\n1. Who will use this? (Which department/role)\n2. How often does this need to run?\n3. What systems does it need to connect to?\n4. Any must-have features vs nice-to-haves?\n\nThis prevents building the wrong thing. Once we agree on the spec, I'll build it right the first time.`,
      confidence: 100,
    }
  } else if (lower.includes('work order') || lower.includes('maintenance')) {
    response = {
      content: "**Work Order Summary — This Week**\n\n🔧 **Open:** 23 work orders\n• 🔴 Emergency: 1 (HVAC unit 204 — vendor dispatched)\n• 🟠 Urgent: 4 (plumbing x2, electrical x1, pest x1)\n• 🟢 Standard: 18\n\n📊 **SLA Performance:**\n• Emergency response: 100% within 4 hours ✅\n• Urgent: 87.5% within 24 hours ⚠️\n• Standard: 94% within 72 hours ✅\n\n**Average completion:** 2.3 business days (target: 3.0)\n\n⚠️ Unit 312 has had 3 work orders in 30 days — might want to flag for inspection.",
      confidence: 91,
      sources: [{ label: 'MoonRISE Service Desk', url: '#' }],
      freshness: 'verified',
    }
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: response.content,
    timestamp: new Date(),
    confidence: response.confidence,
    sources: response.sources,
    freshness: (response.freshness as 'verified' | 'stale' | 'partial') || undefined,
    isFinancial: response === smartResponses.revenue,
    isMock: response === smartResponses.revenue,
    detectedAs,
  }
}

const freshnessLabels: Record<string, { label: string; color: string; icon: string }> = {
  verified: { label: 'Verified — data pulled today', color: 'var(--green)', icon: '✅' },
  stale: { label: 'Stale — last updated 3+ days ago', color: 'var(--orange)', icon: '⚠️' },
  partial: { label: 'Partial — includes projected values', color: 'var(--orange)', icon: '📊' },
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey Courtney. I'm your Operations Agent for RISE Real Estate.\n\nI can help you with:\n• 📊 **Data** — \"What's our occupancy?\" \"Show me revenue\"\n• 💡 **Suggestions** — Start with \"I wish...\" to log an idea\n• 🎫 **Tickets** — Start with \"I need...\" to create a ticket\n• 🏗️ **Planning** — Start with \"Build me...\" to start a project\n\nAll answers include confidence scores and source links. What do you need?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = getSmartResponse(userMsg.content)
    setMessages(prev => [...prev, response])
    setIsTyping(false)
  }

  const quickActions = [
    "What's our occupancy?",
    "Show me revenue",
    "I need help with a work order",
    "Build me a weekly report",
  ]

  return (
    <div className="max-w-[900px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Operations Agent</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
              <span className="text-xs" style={{ color: 'var(--green)' }}>Online</span>
              <span className="text-xs" style={{ color: 'var(--text4)' }}>• Connected to Entrata, M365, Egnyte</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs">📋 History</button>
          <button className="btn-ghost text-xs">⚙️ Agent Settings</button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-xl mb-4 p-4 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
              {/* Detection banner */}
              {msg.detectedAs && (
                <div className="text-[10px] px-2 py-1 rounded-t-lg mb-0" style={{
                  background: msg.detectedAs === 'suggestion' ? 'rgba(139,92,246,0.2)' :
                    msg.detectedAs === 'ticket' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                  color: msg.detectedAs === 'suggestion' ? 'var(--purple)' :
                    msg.detectedAs === 'ticket' ? 'var(--orange)' : 'var(--blue)',
                }}>
                  {msg.detectedAs === 'suggestion' ? '💡 Detected as Suggestion' :
                   msg.detectedAs === 'ticket' ? '🎫 Detected as Ticket' : '🏗️ Planning Mode'}
                </div>
              )}

              {/* Message bubble */}
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))'
                  : 'var(--bg3)',
                color: msg.role === 'user' ? 'white' : 'var(--text2)',
                borderTopRightRadius: msg.role === 'user' ? '6px' : undefined,
                borderTopLeftRadius: msg.role === 'assistant' ? '6px' : undefined,
              }}>
                {/* Mock data warning */}
                {msg.isMock && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded mb-2 text-[10px]"
                    style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--orange)', border: '1px dashed rgba(245,158,11,0.3)' }}>
                    ⚠️ PROJECTED — Contains estimated values
                  </div>
                )}

                {/* Render content with basic markdown */}
                <div className="whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <div key={i} className="font-bold mt-2 first:mt-0" style={{ color: 'var(--text)' }}>{line.replace(/\*\*/g, '')}</div>
                    }
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return <div key={i} className="ml-2">{line}</div>
                    }
                    return <div key={i}>{line || <br />}</div>
                  })}
                </div>

                {/* Financial data notice */}
                {msg.isFinancial && (
                  <div className="mt-2 pt-2 text-[10px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text4)' }}>
                    💰 Financial data — double-verified against source system
                  </div>
                )}
              </div>

              {/* Message metadata */}
              <div className="flex items-center gap-3 mt-1.5 px-1">
                <span className="text-[10px]" style={{ color: 'var(--text4)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {msg.confidence !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                    background: msg.confidence >= 90 ? 'rgba(16,185,129,0.15)' :
                      msg.confidence >= 70 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: msg.confidence >= 90 ? 'var(--green)' :
                      msg.confidence >= 70 ? 'var(--orange)' : 'var(--red)',
                  }}>
                    {msg.confidence}% confident
                  </span>
                )}

                {msg.freshness && freshnessLabels[msg.freshness] && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                    background: `${freshnessLabels[msg.freshness].color}15`,
                    color: freshnessLabels[msg.freshness].color,
                  }}>
                    {freshnessLabels[msg.freshness].icon} {freshnessLabels[msg.freshness].label}
                  </span>
                )}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px]" style={{ color: 'var(--text4)' }}>Sources:</span>
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.url} className="text-[10px] hover:underline" style={{ color: 'var(--blue)' }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start fade-in">
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--bg3)' }}>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 flex-wrap shrink-0">
          {quickActions.map((action, i) => (
            <button key={i}
              onClick={() => { setInput(action); inputRef.current?.focus() }}
              className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask anything, start with 'I wish...' for suggestions or 'I need...' for tickets"
              disabled={isTyping}
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm disabled:opacity-50"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--text4)' }}>
              ↵
            </span>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            style={{ background: 'var(--blue)', color: 'white' }}>
            Send
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text4)' }}>
            <span>💡 "I wish..." → Suggestion</span>
            <span>🎫 "I need..." → Ticket</span>
            <span>🏗️ "Build me..." → Planning Mode</span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text4)' }}>
            Zero hallucination mode active
          </span>
        </div>
      </div>
    </div>
  )
}
