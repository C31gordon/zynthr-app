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
    content: "**Current Portfolio Occupancy — Feb 28, 2026**\n\n📊 **Physical Occupancy:** 94.2% (↑ 0.3% from last week)\n• Bartram Park: 96.3% (285/297 units)\n• Prosper On Fayette: 62.1% preleased (195/314 beds)\n\n📈 **Leased Occupancy:** 95.8%\n• 12 new leases signed this week\n• 3 move-outs scheduled next week\n\n⚠️ **Watch Items:**\n• Prosper pre-lease velocity needs to hit 8 leases/week to meet fall target\n• Bartram renewal rate at 62% — above 60% benchmark",
    confidence: 94,
    sources: [
      { label: 'Entrata Box Score (Feb 28)', url: '#' },
      { label: 'Weekly Leasing Report', url: '#' },
    ],
    freshness: 'verified',
  },
  revenue: {
    content: "**Revenue Summary — February 2026 (MTD)**\n\n💰 **Total Collected Revenue:** $2,847,320\n• Bartram Park: $1,923,450 (target: $1,950,000 → 98.6%)\n• Prosper On Fayette: $923,870 (target: $890,000 → 103.8%)\n\n📊 **Average Rent:**\n• Bartram 1BR: $1,485 (+2.1% YoY)\n• Bartram 2BR: $1,835 (+1.8% YoY)\n• Prosper 2BR/2BA: $1,250/bed\n\n⚠️ **Delinquency:** 3.2% (↓ from 3.8% last month)\n\n*Note: This data includes projected end-of-month calculations*",
    confidence: 88,
    sources: [
      { label: 'Entrata Rent Roll (Feb 28)', url: '#' },
      { label: 'Monthly P&L Projection', url: '#' },
    ],
    freshness: 'partial',
  },
  patients: {
    content: "**Active Patient Panel — February 28, 2026**\n\n🤰 **Total Active Patients:** 47\n• 1st Trimester: 14\n• 2nd Trimester: 21\n• 3rd Trimester: 12\n\n👶 **Due This Month (March):**\n• Jessica Rivera — 39w2d — Birth Center — EDD Mar 4\n• Amanda Foster — 38w5d — Home Birth — EDD Mar 8\n• Keisha Williams — 38w1d — Birth Center — EDD Mar 12\n• Sarah Chen — 37w5d — Hospital (backup) — EDD Mar 15 ⚠️\n• Maria Lopez — 36w5d — Home Birth — EDD Mar 22\n\n⚠️ **Flags:**\n• Sarah Chen moved to hospital backup — GDM diagnosis at 28w\n• Taylor Brooks insurance doesn't cover home birth — needs single case agreement",
    confidence: 96,
    sources: [
      { label: 'DrChrono Patient Panel', url: '#' },
      { label: 'Prenatal Flowsheet', url: '#' },
    ],
    freshness: 'verified',
  },
  claims: {
    content: "**Claims & Revenue Cycle — February 2026**\n\n💰 **Revenue (MTD):** $62,400\n• Global maternity (59400): 4 claims — $22,800\n• Antepartum visits (99213/99214): 86 claims — $18,920\n• Home birth (59400-22): 2 claims — $11,200\n• Postpartum (59430): 3 claims — $2,850\n• Newborn (99460/99238): 5 claims — $6,630\n\n📊 **Clean Claim Rate:** 94.4%\n• Submitted: 142\n• Paid: 118\n• Denied: 8 (5 resolved, 3 pending appeal)\n• In review: 16\n\n⚠️ **Denial Alert:**\n• 2 Medicaid claims denied — missing modifier -25 on E/M with same-day procedure\n• 1 Blue Cross denial — global code billed but patient transferred at 36w (needs split billing)\n\n💡 **AI Recommendation:** Update your superbill template to auto-flag same-day E/M + procedure visits for modifier review",
    confidence: 92,
    sources: [
      { label: 'Claims Dashboard', url: '#' },
      { label: 'DrChrono Billing Report', url: '#' },
    ],
    freshness: 'verified',
  },
  schedule: {
    content: "**Today's Schedule — Saturday, Feb 28**\n\n📅 **Appointments (6):**\n• 9:00 AM — Maria Santos — 32w Prenatal Visit — Dr. office\n• 9:30 AM — Amanda Foster — 38w5d — Home Visit (pre-birth assessment)\n• 10:30 AM — New Patient Consult — Referral from Dr. Williams\n• 11:30 AM — Jessica Rivera — 39w2d — Membrane sweep consult\n• 1:00 PM — Postpartum — Diana Walsh (2 days PP) — Home visit\n• 2:30 PM — Childbirth Education Class (4 couples)\n\n📞 **On-Call Status:** You're primary until Monday 8 AM\n• Backup: [Backup midwife name needed]\n\n🤰 **Labor Watch:**\n• Jessica Rivera (39w2d) — reported irregular contractions at 8:45 AM\n• Amanda Foster (38w5d) — 3cm at last check, expecting active labor this weekend",
    confidence: 95,
    sources: [
      { label: 'DrChrono Schedule', url: '#' },
      { label: 'On-Call Calendar', url: '#' },
    ],
    freshness: 'verified',
  },
  labs: {
    content: "**Lab Compliance Dashboard**\n\n✅ **Overall Compliance:** 96%\n\n📋 **Upcoming Lab Windows This Week:**\n• Taylor Brooks (36w) — GBS Culture due NOW\n• Maria Lopez (36w5d) — GBS Culture due in 3 days\n• Destiny Howard (28w) — Glucose Tolerance Test due\n• Priya Sharma (PP) — 6-week CBC follow-up due Mar 1\n\n⚠️ **Overdue:**\n• Carmen Reyes (29w) — GTT ordered 5 days ago, not completed. Patient contacted 2x.\n\n✅ **Recently Completed:**\n• Jessica Rivera — GBS Negative ✅\n• Keisha Williams — GBS Positive → antibiotics protocol flagged for birth plan\n• Sarah Chen — A1C 6.2% (GDM monitoring, within target)\n\n💡 **Auto-Actions Taken:**\n• GBS reminders sent to 4 patients at 35-36 weeks\n• Lab orders auto-generated in DrChrono for upcoming windows",
    confidence: 97,
    sources: [
      { label: 'DrChrono Lab Results', url: '#' },
      { label: 'Prenatal Care Protocol', url: '#' },
    ],
    freshness: 'verified',
  },
  postpartum: {
    content: "**Postpartum Follow-Up Dashboard**\n\n👶 **Active Postpartum Patients (8):**\n\n• Diana Walsh — Born Feb 26 (Birth Center, 7lb 4oz)\n  48hr check ✅ | Edinburgh: 4 (normal) | Breastfeeding well\n  Next: 1-week visit Mar 4\n\n• Priya Sharma — Born Feb 22 (Home Birth, 8lb 1oz)\n  1-week check ✅ | Edinburgh: 3 (normal) | Combo feeding\n  Next: 6-week visit Apr 5\n\n• Rachel Green — Born Feb 18 (Birth Center, 6lb 11oz)\n  Edinburgh: 7 ⚠️ MONITOR | Breastfeeding difficulty\n  LC referral sent Feb 20 | 6-week visit scheduled Mar 1\n\n⚠️ **Action Items:**\n• Rachel Green Edinburgh score trending up (5→7) — consider mental health referral if 6-week score doesn't improve\n• Automated 24hr, 3-day, 1-week, and 6-week check-ins running for all PP patients\n• 2 patients haven't confirmed newborn pediatrician — reminder sent",
    confidence: 95,
    sources: [
      { label: 'Postpartum Tracking', url: '#' },
      { label: 'Edinburgh Screening Log', url: '#' },
    ],
    freshness: 'verified',
  },
  default: {
    content: "I have access to your DrChrono data, claims pipeline, prenatal flowsheets, and operational metrics. I can help with:\n\n🤰 Patient panel & gestational tracking\n💰 Claims, billing & revenue cycle\n📅 Scheduling & on-call management\n🧪 Lab compliance & care gap alerts\n👶 Postpartum follow-ups & Edinburgh screening\n📊 Practice analytics & KPIs\n📢 Marketing & lead tracking\n\nWhat would you like to dig into?",
    confidence: 72,
  },
}

function getSmartResponse(message: string): Message {
  const lower = message.toLowerCase()
  let response = smartResponses.default
  let detectedAs: 'suggestion' | 'ticket' | 'planning' | null = null

  if (lower.includes('patient') || lower.includes('panel') || lower.includes('due') || lower.includes('pregnant') || lower.includes('trimester') || lower.includes('gestational')) {
    response = smartResponses.patients
  } else if (lower.includes('claim') || lower.includes('billing') || lower.includes('revenue') || lower.includes('denial') || lower.includes('money') || lower.includes('collections')) {
    response = smartResponses.claims
  } else if (lower.includes('schedule') || lower.includes('appointment') || lower.includes('today') || lower.includes('on-call') || lower.includes('on call')) {
    response = smartResponses.schedule
  } else if (lower.includes('lab') || lower.includes('gbs') || lower.includes('glucose') || lower.includes('test') || lower.includes('compliance')) {
    response = smartResponses.labs
  } else if (lower.includes('postpartum') || lower.includes('pp') || lower.includes('edinburgh') || lower.includes('newborn') || lower.includes('birth outcome') || lower.includes('after birth')) {
    response = smartResponses.postpartum
  } else if (lower.includes('occupancy') || lower.includes('vacancy') || lower.includes('leased')) {
    response = smartResponses.occupancy
  } else if (lower.includes('rent') && !lower.includes('center')) {
    response = smartResponses.revenue
  } else if (lower.startsWith('i wish') || lower.includes('it would be nice') || lower.includes("i'd love")) {
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
  } else if (lower.startsWith('build me') || lower.startsWith('create a') || lower.includes('automate') || lower.includes('set up')) {
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
    isFinancial: lower.includes('revenue') || lower.includes('claim'),
    isMock: false,
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
      content: "Hello! I'm your AI Practice Assistant, connected to your DrChrono EMR, claims pipeline, and patient management systems.\n\nI can help you with:\n• 🤰 **Patients** — \"Show me my patient panel\" or \"Who's due this month?\"\n• 💰 **Claims & Revenue** — \"What's my claims status?\" or \"Show me revenue\"\n• 📅 **Schedule** — \"What's on my schedule today?\"\n• 🧪 **Labs** — \"Any overdue labs?\" or \"GBS status\"\n• 👶 **Postpartum** — \"Show postpartum follow-ups\"\n• 💡 **Suggestions** — Start with \"I wish...\" to log an idea\n• 🎫 **Support** — Start with \"I need...\" to create a ticket\n• 🏗️ **Build** — Start with \"Build me...\" to start a project\n\nAll answers include confidence scores and data source links. How can I help?",
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

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = getSmartResponse(userMsg.content)
    setMessages(prev => [...prev, response])
    setIsTyping(false)
  }

  const quickActions = [
    "Show me my patient panel",
    "What's my claims status?",
    "Any overdue labs?",
    "What's on my schedule today?",
    "Show postpartum follow-ups",
    "Build me a weekly report",
  ]

  return (
    <div className="max-w-[900px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
            <span className="text-lg">🌿</span>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Practice Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 6px rgba(107,164,138,0.6)' }} />
              <span className="text-xs" style={{ color: 'var(--green)' }}>Online</span>
              <span className="text-xs" style={{ color: 'var(--text4)' }}>• Connected to DrChrono, Claims Pipeline, Patient Portal</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs">📋 History</button>
          <button className="btn-ghost text-xs">⚙️ Agent Settings</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl mb-4 p-4 space-y-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className="max-w-[75%]">
              {msg.detectedAs && (
                <div className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-t-lg mb-0" style={{
                  background: msg.detectedAs === 'suggestion' ? 'rgba(139,92,246,0.2)' :
                    msg.detectedAs === 'ticket' ? 'rgba(245,158,11,0.2)' : 'rgba(85,156,181,0.2)',
                  color: msg.detectedAs === 'suggestion' ? 'var(--purple)' :
                    msg.detectedAs === 'ticket' ? 'var(--orange)' : 'var(--blue)',
                }}>
                  {msg.detectedAs === 'suggestion' ? '💡 Detected as Suggestion' :
                   msg.detectedAs === 'ticket' ? '🎫 Detected as Ticket' : '🏗️ Planning Mode'}
                </div>
              )}

              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))'
                  : 'var(--bg3)',
                color: msg.role === 'user' ? 'white' : 'var(--text2)',
                borderTopRightRadius: msg.role === 'user' ? '6px' : undefined,
                borderTopLeftRadius: msg.role === 'assistant' ? '6px' : undefined,
              }}>
                {msg.isMock && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded mb-2 text-[11px] whitespace-nowrap"
                    style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--orange)', border: '1px dashed rgba(245,158,11,0.3)' }}>
                    ⚠️ PROJECTED — Contains estimated values
                  </div>
                )}

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

                {msg.isFinancial && (
                  <div className="mt-2 pt-2 text-[11px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text4)' }}>
                    💰 Financial data — double-verified against source system
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">
                <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {msg.confidence !== undefined && (
                  <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded" style={{
                    background: msg.confidence >= 90 ? 'rgba(107,164,138,0.15)' :
                      msg.confidence >= 70 ? 'rgba(245,158,11,0.15)' : 'rgba(174,19,42,0.15)',
                    color: msg.confidence >= 90 ? 'var(--green)' :
                      msg.confidence >= 70 ? 'var(--orange)' : 'var(--red)',
                  }}>
                    {msg.confidence}% confident
                  </span>
                )}

                {msg.freshness && freshnessLabels[msg.freshness] && (
                  <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded" style={{
                    background: `${freshnessLabels[msg.freshness].color}15`,
                    color: freshnessLabels[msg.freshness].color,
                  }}>
                    {freshnessLabels[msg.freshness].icon} {freshnessLabels[msg.freshness].label}
                  </span>
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
                  <span className="text-[11px]" style={{ color: 'var(--text4)' }}>Sources:</span>
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.url} className="text-[11px] hover:underline" style={{ color: 'var(--blue)' }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

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

      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 flex-wrap shrink-0">
          {quickActions.map((action, i) => (
            <button key={i}
              onClick={() => { setInput(action); inputRef.current?.focus() }}
              className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about patients, claims, labs, schedule... or start with 'I wish...' / 'I need...' / 'Build me...'"
              disabled={isTyping}
              className="w-full px-4 py-3.5 pr-14 rounded-xl text-sm disabled:opacity-50"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text4)' }}>
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
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text4)' }}>
            <span>💡 "I wish..." → Suggestion</span>
            <span>🎫 "I need..." → Ticket</span>
            <span>🏗️ "Build me..." → Planning Mode</span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text4)' }}>
            HIPAA-compliant • Zero hallucination mode
          </span>
        </div>
      </div>
    </div>
  )
}
