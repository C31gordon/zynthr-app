'use client'

import { useState } from 'react'

type SettingsTab = 'general' | 'security' | 'sso' | 'notifications' | 'branding' | 'billing' | 'danger'

interface ToggleSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'security', label: 'Security', icon: '🛡️' },
    { key: 'sso', label: 'Single Sign-On', icon: '🔑' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'branding', label: 'Branding', icon: '🎨' },
    { key: 'billing', label: 'Billing', icon: '💳' },
    { key: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ]

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Configure your organization, authentication, and platform preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--bg3)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text)' : 'var(--text3)',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'sso' && <SSOSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'branding' && <BrandingSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'danger' && <DangerZone />}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 rounded-xl mb-4">
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      {description && <p className="text-xs mb-4" style={{ color: 'var(--text4)' }}>{description}</p>}
      {children}
    </div>
  )
}

function InputField({ label, value, placeholder, type = 'text', disabled = false }: {
  label: string; value: string; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-50"
        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
      />
    </div>
  )
}

function Toggle({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm" style={{ color: 'var(--text)' }}>{label}</div>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>{description}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className="w-10 h-5 rounded-full transition-all relative"
        style={{ background: checked ? 'var(--blue)' : 'var(--bg4)' }}
      >
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

function SecuritySettings() {
  const [emailVerification, setEmailVerification] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)
  const currentPlan: string = 'enterprise' // would come from tenant context

  return (
    <>
      <SectionCard title="Verification & Authentication" description="Control how users verify identity">
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-sm" style={{ color: 'var(--text)' }}>Require Email Verification</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>
              New users must verify their email before accessing the platform
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentPlan === 'free' && (
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                Coming Soon — Available in Enterprise
              </span>
            )}
            <button
              onClick={() => currentPlan !== 'free' && setEmailVerification(!emailVerification)}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: emailVerification ? 'var(--blue)' : 'var(--bg4)', opacity: currentPlan === 'free' ? 0.4 : 1 }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: emailVerification ? '22px' : '2px' }} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm" style={{ color: 'var(--text)' }}>Require Two-Factor Authentication (2FA)</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>
              All users must set up TOTP or SMS-based 2FA to access the platform
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentPlan === 'free' && (
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                Coming Soon — Available in Enterprise
              </span>
            )}
            <button
              onClick={() => currentPlan !== 'free' && setRequire2FA(!require2FA)}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: require2FA ? 'var(--blue)' : 'var(--bg4)', opacity: currentPlan === 'free' ? 0.4 : 1 }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: require2FA ? '22px' : '2px' }} />
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Password Policy" description="Enforce password strength requirements">
        <Toggle label="Minimum 8 Characters" description="Passwords must be at least 8 characters long" defaultChecked />
        <Toggle label="Require Mixed Case" description="At least one uppercase and one lowercase letter" defaultChecked />
        <Toggle label="Require Numbers" description="At least one numeric digit" defaultChecked />
        <Toggle label="Require Special Characters" description="At least one symbol (!@#$%^&*)" />
      </SectionCard>

      <SectionCard title="Session Security">
        <Toggle label="Force Logout on Password Change" description="Invalidate all sessions when a user changes their password" defaultChecked />
        <Toggle label="Single Session Only" description="Allow only one active session per user" />
      </SectionCard>
    </>
  )
}

function GeneralSettings() {
  return (
    <>
      <SectionCard title="Organization" description="Your company information">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Organization Name" value="RISE Real Estate" />
          <InputField label="Tenant ID" value="a0000000-0000-0000-0000-000000000001" disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Industry" value="Multifamily Real Estate" />
          <InputField label="Size" value="~30,000 units" />
        </div>
        <InputField label="Primary Contact" value="cgordon@risere.com" />
      </SectionCard>

      <SectionCard title="Platform Preferences">
        <Toggle label="Planning Mode Required" description="Require blueprint phase before building new agents or workflows" defaultChecked />
        <Toggle label="Source Citations" description="Show source links on all AI-generated answers" defaultChecked />
        <Toggle label="Confidence Scores" description="Display confidence percentages on complex answers" defaultChecked />
        <Toggle label="Mock Data Labels" description="Visually distinguish projected or estimated data with banners" defaultChecked />
        <Toggle label="Zero Hallucination Mode" description="Block responses when no verified source is available" defaultChecked />
      </SectionCard>

      <SectionCard title="Data Retention">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Audit Log Retention</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>90 days</option>
              <option>180 days</option>
              <option>1 year</option>
              <option>Indefinite</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Chat History Retention</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
              <option>Indefinite</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--blue)', color: 'white' }}>
          Save Changes
        </button>
      </div>
    </>
  )
}

function SSOSettings() {
  return (
    <>
      <SectionCard title="Microsoft SSO (Entra ID)" description="Allow team members to sign in with their Microsoft work accounts">
        <Toggle label="Enable Microsoft SSO" description="Users can sign in with their @risere.com accounts" defaultChecked />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Tenant ID" value="••••••••-••••-••••-••••-••••••••••••" type="password" />
          <InputField label="Client ID" value="••••••••-••••-••••-••••-••••••••••••" type="password" />
        </div>
        <InputField label="Redirect URI" value="https://nqheduewmpomsvnzjtlc.supabase.co/auth/v1/callback" disabled />
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }}></span>
          <span className="text-xs" style={{ color: 'var(--green)' }}>Connected and verified</span>
        </div>
      </SectionCard>

      <SectionCard title="Google SSO" description="Allow sign-in with Google Workspace accounts">
        <Toggle label="Enable Google SSO" description="Users can sign in with Google accounts" />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Client ID" value="" placeholder="Google OAuth Client ID" />
          <InputField label="Client Secret" value="" placeholder="Google OAuth Client Secret" type="password" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text4)' }}></span>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>Not configured</span>
        </div>
      </SectionCard>

      <SectionCard title="Email/Password" description="Fallback authentication for users without SSO">
        <Toggle label="Allow Email/Password Sign-in" description="Users can create accounts with email and password" defaultChecked />
        <Toggle label="Require Email Verification" description="New users must verify their email before accessing the platform" defaultChecked />
        <Toggle label="Enforce Strong Passwords" description="Minimum 12 characters, mixed case, numbers, and symbols" defaultChecked />
      </SectionCard>

      <SectionCard title="Session Security">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Session Timeout</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>8 hours</option>
              <option>12 hours</option>
              <option>24 hours</option>
              <option>7 days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>MFA Requirement</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>Owner only</option>
              <option>Owner + Department Heads</option>
              <option>All users</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
      </SectionCard>
    </>
  )
}

function NotificationSettings() {
  return (
    <>
      <SectionCard title="Alert Channels" description="Where should important notifications be sent?">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">📧</span>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Email</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>cgordon@risere.com</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--green)22', color: 'var(--green)' }}>Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">📱</span>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Telegram</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>@millie_bot</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--green)22', color: 'var(--green)' }}>Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">💬</span>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Slack</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>Not connected</div>
              </div>
            </div>
            <button className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
              Connect
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notification Preferences" description="Choose what triggers alerts">
        <Toggle label="Security Alerts" description="Prompt injection attempts, unusual access patterns, failed logins" defaultChecked />
        <Toggle label="Ticket Escalations" description="When tickets are escalated or SLA breached" defaultChecked />
        <Toggle label="Exception Requests" description="When team members request access exceptions" defaultChecked />
        <Toggle label="Policy Changes" description="When RKBAC policies are created or modified" defaultChecked />
        <Toggle label="Workflow Failures" description="When automated workflows encounter errors" defaultChecked />
        <Toggle label="Agent Status Changes" description="When agents go offline or encounter issues" />
        <Toggle label="Weekly Summary" description="Digest of all activity, trends, and recommendations" defaultChecked />
      </SectionCard>

      <SectionCard title="Quiet Hours" description="Suppress non-critical notifications during off-hours">
        <Toggle label="Enable Quiet Hours" description="Only critical/security alerts during quiet hours" defaultChecked />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Start" value="11:00 PM" />
          <InputField label="End" value="7:00 AM" />
        </div>
      </SectionCard>
    </>
  )
}

function BrandingSettings() {
  return (
    <>
      <SectionCard title="Custom Domain" description="Point your own domain to this platform (available after day 15)">
        <InputField label="Custom Domain" value="" placeholder="agents.risere.com" />
        <div className="p-3 rounded-lg mt-2" style={{ background: 'var(--bg)', border: '1px dashed var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text4)' }}>
            Add a CNAME record pointing to <code style={{ color: 'var(--blue)' }}>cname.vercel-dns.com</code> then verify below.
          </p>
        </div>
        <button className="mt-3 px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
          Verify Domain
        </button>
      </SectionCard>

      <SectionCard title="Logo & Colors" description="Customize the look of your platform">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Logo</label>
            <div className="w-full h-24 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--bg)', border: '2px dashed var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text4)' }}>Click to upload logo</span>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Favicon</label>
            <div className="w-full h-24 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--bg)', border: '2px dashed var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text4)' }}>Click to upload favicon</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <InputField label="Primary Color" value="#3b82f6" />
          <InputField label="Accent Color" value="#8b5cf6" />
          <InputField label="Background" value="#0a0e1a" />
        </div>
      </SectionCard>

      <SectionCard title="White Label" description="Remove Ardexa branding for your tenants">
        <Toggle label="Hide 'Powered by Ardexa'" description="Remove platform attribution from footer and login screen" />
        <Toggle label="Custom Email Templates" description="Use your branding in system-sent emails" />
      </SectionCard>
    </>
  )
}

function BillingSettings() {
  // In production, these would come from the tenant's actual data
  const currentPlan: string = 'enterprise'
  const planNames: Record<string, string> = { free: 'Starter', professional: 'Professional', enterprise: 'Enterprise' }
  const planPrices: Record<string, string> = { free: 'Free', professional: '$49', enterprise: '$499' }
  const planDesc: Record<string, string> = {
    free: '2 agents • 1 bot • 100 queries/day • Community support',
    professional: '10 agents • 5 bots • 1,000 queries/day • Email support • SSO',
    enterprise: 'Unlimited agents • Custom domain • Priority support • RKBAC™',
  }

  const usageItems = [
    { label: 'AI Agents', used: 4, limit: currentPlan === 'free' ? 2 : currentPlan === 'professional' ? 10 : 999, unit: 'agents' },
    { label: 'Bots', used: 2, limit: currentPlan === 'free' ? 1 : currentPlan === 'professional' ? 5 : 999, unit: 'bots' },
    { label: 'AI Queries Today', used: 247, limit: currentPlan === 'free' ? 100 : currentPlan === 'professional' ? 1000 : 99999, unit: 'queries' },
    { label: 'Storage', used: 2.4, limit: 50, unit: 'GB' },
  ]

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'current' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } catch { /* Stripe not configured */ }
  }

  return (
    <>
      <SectionCard title="Current Plan">
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--blue)40' }}>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{planNames[currentPlan]}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>{planDesc[currentPlan]}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>
              {planPrices[currentPlan]}{currentPlan !== 'free' && <span className="text-sm font-normal" style={{ color: 'var(--text4)' }}>/mo</span>}
            </div>
            {currentPlan !== 'free' && <div className="text-xs" style={{ color: 'var(--text4)' }}>Billed annually</div>}
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <a href="/pricing"
            className="flex-1 py-2 rounded-lg font-medium text-sm text-center transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', color: '#fff' }}>
            {currentPlan === 'enterprise' ? 'View Plans' : 'Upgrade Plan'}
          </a>
          <button onClick={handleManageBilling}
            className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
            style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
            Manage Billing
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Usage This Period">
        <div className="space-y-3">
          {usageItems.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="whitespace-nowrap" style={{ color: 'var(--text2)' }}>{item.label}</span>
                <span className="whitespace-nowrap" style={{ color: 'var(--text4)' }}>
                  {item.used.toLocaleString()} / {item.limit >= 999 ? '∞' : item.limit.toLocaleString()} {item.unit}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${item.limit >= 999 ? 5 : Math.min((item.used / item.limit) * 100, 100)}%`,
                  background: item.limit < 999 && (item.used / item.limit) > 0.8 ? 'var(--orange)' : 'var(--blue)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Invoice History">
        <div className="space-y-2">
          {[
            { date: 'Feb 1, 2026', amount: '$499.00', status: 'Paid' },
            { date: 'Jan 1, 2026', amount: '$499.00', status: 'Paid' },
            { date: 'Dec 1, 2025', amount: '$499.00', status: 'Paid' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm">📄</span>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>{inv.date}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{inv.amount}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text4)' }}>
          Payments processed securely via Stripe. Full invoice history available in the billing portal.
        </p>
      </SectionCard>
    </>
  )
}

function DangerZone() {
  return (
    <>
      <div className="p-1 rounded-xl" style={{ border: '1px solid var(--red)40' }}>
        <SectionCard title="⚠️ Danger Zone" description="These actions are irreversible. Proceed with caution.">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Reset All Agent Memory</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>Wipe all stored knowledge and conversation history for all agents</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{ background: 'var(--red)15', color: 'var(--red)' }}>
                Reset Memory
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Delete All Workflows</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>Remove all workflows including active ones. This will stop all automations.</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{ background: 'var(--red)15', color: 'var(--red)' }}>
                Delete Workflows
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>Delete Organization</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>Permanently delete this organization and all its data. Cannot be undone.</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{ background: 'var(--red)15', color: 'var(--red)' }}>
                Delete Organization
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  )
}
