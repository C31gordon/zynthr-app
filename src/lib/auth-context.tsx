'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, DEMO_MODE, DEMO_USER } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Organization, OrgMember } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  organization: Organization | null
  membership: OrgMember | null
  isDemo: boolean
  isLoading: boolean
  isAuthenticated: boolean
  userName: string | null
  userEmail: string | null
  orgName: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  organization: null,
  membership: null,
  isDemo: DEMO_MODE,
  isLoading: true,
  isAuthenticated: false,
  userName: null,
  userEmail: null,
  orgName: null,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

async function loadOrgContext(userId: string): Promise<{ org: Organization | null; member: OrgMember | null }> {
  // Get the user's org membership
  const { data: memberData } = await (supabase as any)
    .from('org_members')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!memberData) return { org: null, member: null }

  const { data: orgData } = await (supabase as any)
    .from('organizations')
    .select('*')
    .eq('id', memberData.org_id)
    .single()

  return { org: orgData as Organization | null, member: memberData as OrgMember | null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [membership, setMembership] = useState<OrgMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleSignOut = useCallback(async () => {
    if (DEMO_MODE) {
      localStorage.removeItem('zynthr_user')
      localStorage.removeItem('zynthr_authenticated')
      localStorage.removeItem('zynthr_welcome_dismissed')
      localStorage.removeItem('zynthr_tour_completed')
      window.location.href = '/login'
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setOrganization(null)
    setMembership(null)
    window.location.href = '/login'
  }, [])

  useEffect(() => {
    if (DEMO_MODE) {
      setIsLoading(false)
      return
    }

    // Get initial session with timeout protection
    const loadTimeout = setTimeout(() => {
      console.warn('Auth loading timed out after 5s — forcing load complete')
      setIsLoading(false)
    }, 5000)

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        try {
          const { org, member } = await loadOrgContext(s.user.id)
          setOrganization(org)
          setMembership(member)
        } catch (e) {
          console.error('Failed to load org context:', e)
        }
      }
      clearTimeout(loadTimeout)
      setIsLoading(false)
    }).catch((e) => {
      console.error('getSession failed:', e)
      clearTimeout(loadTimeout)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)

        if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const { org, member } = await loadOrgContext(s.user.id)
          setOrganization(org)
          setMembership(member)
        }

        if (event === 'SIGNED_OUT') {
          setOrganization(null)
          setMembership(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Derived values
  const isAuthenticated = DEMO_MODE
    ? (typeof window !== 'undefined' && localStorage.getItem('zynthr_authenticated') === 'true')
    : !!session

  const userName = DEMO_MODE
    ? (() => {
        if (typeof window === 'undefined') return DEMO_USER.full_name
        try {
          const u = JSON.parse(localStorage.getItem('zynthr_user') || '{}')
          return u.name || DEMO_USER.full_name
        } catch { return DEMO_USER.full_name }
      })()
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || null

  const userEmail = DEMO_MODE
    ? DEMO_USER.email
    : user?.email || null

  const orgName = DEMO_MODE
    ? (() => {
        if (typeof window === 'undefined') return DEMO_USER.tenant
        try {
          const u = JSON.parse(localStorage.getItem('zynthr_user') || '{}')
          return u.orgName || DEMO_USER.tenant
        } catch { return DEMO_USER.tenant }
      })()
    : organization?.name || null

  return (
    <AuthContext.Provider value={{
      user,
      session,
      organization,
      membership,
      isDemo: DEMO_MODE,
      isLoading,
      isAuthenticated,
      userName,
      userEmail,
      orgName,
      signOut: handleSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
