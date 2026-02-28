'use client'

import { useEffect, useState, useCallback } from 'react'
import { DEMO_MODE } from '@/lib/supabase'
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

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings' | 'onboarding' | 'training' | 'healthcare' | 'setup' | 'birthcenter' | 'patientdash' | 'orgsetup'

interface LocalUser {
  name: string
  email: string
  orgName: string
  createdAt: string
}

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
  const [localUser, setLocalUser] = useState<LocalUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!loading) {
      const completed = localStorage.getItem("milliebot_tour_completed") === "true"
      if (!completed) setTourActive(true)
    }
  }, [loading])

  const handleNavigate = useCallback((view: ViewType) => {
    setActiveView(view)
    if (isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, still check if user is authenticated for personalization
      const auth = localStorage.getItem('milliebot_authenticated')
      if (auth === 'true') {
        try {
          const userData = JSON.parse(localStorage.getItem('milliebot_user') || '{}')
          if (userData.name) setLocalUser(userData)
          setIsAuthenticated(true)
        } catch { /* ignore */ }
      }
      setLoading(false)
      return
    }

    // Non-demo mode: require authentication
    const auth = localStorage.getItem('milliebot_authenticated')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }

    try {
      const userData = JSON.parse(localStorage.getItem('milliebot_user') || '{}')
      if (userData.name) setLocalUser(userData)
      setIsAuthenticated(true)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 pulse-glow"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Loading Milliebot Command Center...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <><WelcomeBanner onNavigate={(v) => handleNavigate(v as ViewType)} /><DashboardView userName={localUser?.name} orgName={localUser?.orgName} /></>
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
      default: return <DashboardView userName={localUser?.name} orgName={localUser?.orgName} />
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
          onToggle={() => isMobile ? setMobileMenuOpen(false) : setSidebarCollapsed(!sidebarCollapsed)} orgName={localUser?.orgName} userName={localUser?.name} />
      </div>
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
        <TopBar
          onTourStart={() => setTourActive(true)} user={null} localUser={localUser} isAuthenticated={isAuthenticated} onNavigate={handleNavigate} isMobile={isMobile} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main data-tour="dashboard" className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '24px' }}>
          <div className="max-w-full">{renderView()}</div>
        </main>
        <GuidedTour active={tourActive} onComplete={() => setTourActive(false)} onNavigate={(v) => handleNavigate(v as ViewType)} />
      </div>
    {isAuthenticated && <SessionTimeout />}
    <FloatingChat /></div>
  )
}
