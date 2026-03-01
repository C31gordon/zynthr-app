'use client'

import { useEffect, useState, useCallback } from 'react'
import { DEMO_MODE } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import DashboardView from '@/components/views/DashboardView'
import AgentsView from '@/components/views/AgentsView'
import ChatView from '@/components/views/ChatView'
import TicketsView from '@/components/views/TicketsView'
import SuggestionsView from '@/components/views/SuggestionsView'
import WorkflowsView from '@/components/views/WorkflowsView'
import PoliciesView from '@/components/views/PoliciesView'
import AuditView from '@/components/views/AuditView'
import SettingsView from '@/components/views/SettingsView'
import OnboardingView from '@/components/views/OnboardingView'
import TrainingView from '@/components/views/TrainingView'
import HealthcareView from '@/components/views/HealthcareView'
import SetupWizardView from '@/components/views/SetupWizardView'
import FloatingChat from '@/components/FloatingChat'
import BirthCenterView from '@/components/views/BirthCenterView'
import PatientDashboardView from '@/components/views/PatientDashboardView'
import OrgSetupWizardView from '@/components/views/OrgSetupWizardView'
import WelcomeBanner from "@/components/WelcomeBanner"
import GuidedTour from "@/components/GuidedTour"
import SessionTimeout from "@/components/SessionTimeout"
import { getTenantFromStorage } from '@/lib/tenant'

function WorkspaceBar() {
  const { orgName, isDemo } = useAuth()
  const [sub, setSub] = useState<string | null>(null)
  useEffect(() => {
    if (isDemo) {
      const t = getTenantFromStorage()
      if (t) setSub(t.subdomain)
    }
  }, [isDemo])
  const label = sub ? `${sub}.zynthr.ai` : orgName
  if (!label) return null
  return (
    <div style={{ background: 'rgba(85,156,181,0.08)', borderBottom: '1px solid var(--border)', padding: '6px 24px', fontSize: 12, color: 'var(--text4)' }}>
      Your workspace: <strong style={{ color: 'var(--text3)' }}>{sub ? `${sub}.zynthr.ai` : orgName}</strong>
    </div>
  )
}

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings' | 'onboarding' | 'training' | 'healthcare' | 'setup' | 'birthcenter' | 'patientdash' | 'orgsetup'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function Home() {
  const auth = useAuth()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!auth.isLoading) {
      const completed = localStorage.getItem("zynthr_tour_completed") === "true"
      if (!completed) setTourActive(true)
    }
  }, [auth.isLoading])

  const handleNavigate = useCallback((view: ViewType) => {
    setActiveView(view)
    if (isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  // Hard timeout — never show loading for more than 5 seconds
  const [forceLoaded, setForceLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setForceLoaded(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const isLoading = auth.isLoading && !forceLoaded

  // Redirect to login if not authenticated and not in demo mode
  useEffect(() => {
    if (isLoading) return
    if (!DEMO_MODE && !auth.isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isLoading, auth.isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 pulse-glow"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
            <div className="spin-slow">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text3)' }}>Loading Zynthr Command Center...</p>
          <div className="mt-3 flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--blue)', animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--purple)', animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--teal)', animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  // If not demo and not authenticated, show nothing (redirect happening)
  if (!DEMO_MODE && !auth.isAuthenticated) {
    return null
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <><WelcomeBanner onNavigate={(v) => handleNavigate(v as ViewType)} /><DashboardView userName={auth.userName ?? undefined} orgName={auth.orgName ?? undefined} /></>
      case 'agents': return <AgentsView />
      case 'chat': return <ChatView />
      case 'tickets': return <TicketsView />
      case 'suggestions': return <SuggestionsView />
      case 'workflows': return <WorkflowsView />
      case 'policies': return <PoliciesView />
      case 'audit': return <AuditView />
      case 'settings': return <SettingsView />
      case 'onboarding': return <OnboardingView />
      case 'training': return <TrainingView />
      case 'healthcare': return <HealthcareView />
      case 'setup': return <SetupWizardView />
      case 'birthcenter': return <BirthCenterView />
      case 'patientdash': return <PatientDashboardView />
      case 'orgsetup': return <OrgSetupWizardView />
      default: return <DashboardView userName={auth.userName ?? undefined} orgName={auth.orgName ?? undefined} />
    }
  }

  const sidebarWidth = sidebarCollapsed ? '64px' : '240px'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] bg-black/60 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className="transition-transform duration-300"
        style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 60, transform: isMobile && !mobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)' }}>
        <Sidebar activeView={activeView} onNavigate={handleNavigate} collapsed={isMobile ? false : sidebarCollapsed}
          onToggle={() => isMobile ? setMobileMenuOpen(false) : setSidebarCollapsed(!sidebarCollapsed)} orgName={auth.orgName ?? undefined} userName={auth.userName ?? undefined} />
      </div>
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
        <TopBar
          onTourStart={() => setTourActive(true)} user={auth.user} localUser={DEMO_MODE ? { name: auth.userName || '', email: auth.userEmail || '', orgName: auth.orgName || '', createdAt: '' } : null} isAuthenticated={auth.isAuthenticated} onNavigate={handleNavigate} isMobile={isMobile} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <WorkspaceBar />
        <main data-tour="dashboard" className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '24px' }}>
          <div className="max-w-full">{renderView()}</div>
        </main>
        <GuidedTour active={tourActive} onComplete={() => setTourActive(false)} onNavigate={(v) => handleNavigate(v as ViewType)} />
      </div>
    {auth.isAuthenticated && <SessionTimeout />}
    <FloatingChat /></div>
  )
}
