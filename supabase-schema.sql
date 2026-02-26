-- ============================================================
-- MILLIEBOT ARCHITECTURE — Full RKBAC Schema
-- Supabase Project: Milliebot Architecture
-- Version: 1.1
-- Date: 2026-02-26
-- Changes: Added shared agents (Template + Instance pattern)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TENANTS (Multi-tenant from day one)
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- "RISE Real Estate"
  slug TEXT UNIQUE NOT NULL,             -- "rise" (used in URLs)
  domain TEXT,                           -- "risere.com" (for SSO matching)
  logo_url TEXT,
  brand_primary TEXT DEFAULT '#3B82F6',  -- White-label color
  brand_secondary TEXT DEFAULT '#1E293B',
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial','starter','professional','enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Operations", "Marketing", "HR"
  slug TEXT NOT NULL,                    -- "ops", "marketing", "hr"
  icon TEXT,                             -- Emoji or icon name
  sort_order INT DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ============================================================
-- 3. ROLES (Four-tier RKBAC hierarchy)
-- ============================================================
CREATE TYPE role_tier AS ENUM ('owner', 'department_head', 'manager', 'specialist');

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "COO", "Marketing Director", "Property Manager"
  tier role_tier NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,  -- NULL for owner (cross-dept)
  permissions JSONB DEFAULT '{}',        -- Additional granular permissions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- ============================================================
-- 4. USERS (People who use the platform)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,                   -- Links to Supabase Auth
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  dashboard_config JSONB DEFAULT '{}',   -- Persisted dashboard layout
  settings JSONB DEFAULT '{}',           -- User preferences
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- ============================================================
-- 5. AGENTS (Department-level AI agents — the "Millies")
-- ============================================================
CREATE TYPE agent_status AS ENUM ('active', 'paused', 'configuring', 'error');

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Operations Agent", "Marketing Agent"
  description TEXT,
  avatar_url TEXT,
  status agent_status DEFAULT 'configuring',
  owner_user_id UUID REFERENCES users(id),  -- Department head who owns this agent
  system_prompt TEXT,                    -- Agent's base instructions
  model TEXT DEFAULT 'anthropic/claude-opus-4-6',
  capabilities JSONB DEFAULT '[]',       -- What this agent can do
  source_identity JSONB DEFAULT '{}',    -- Which employee identity it inherits per system
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, department_id)       -- One primary agent per department
);

-- ============================================================
-- 6. BOTS (Supporting bots under agents)
-- ============================================================
CREATE TYPE bot_status AS ENUM ('active', 'paused', 'configuring', 'error');

CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Leasing Agent", "Social Scheduler"
  description TEXT,
  icon TEXT,
  status bot_status DEFAULT 'configuring',
  bot_type TEXT,                         -- "leasing", "maintenance", "content", etc.
  system_prompt TEXT,
  model TEXT,                            -- Inherits from agent if NULL
  capabilities JSONB DEFAULT '[]',
  source_identity JSONB DEFAULT '{}',    -- Can inherit from agent or have own
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. MEMORY (Hierarchical — core, department, private)
-- ============================================================
CREATE TYPE memory_scope AS ENUM ('core', 'department', 'agent', 'bot');

CREATE TABLE memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope memory_scope NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,  -- NULL for core
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,            -- For agent-private
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,                -- For bot-private
  key TEXT NOT NULL,                     -- Memory key/topic
  content TEXT NOT NULL,                 -- The actual memory content
  metadata JSONB DEFAULT '{}',
  source TEXT,                           -- Where this memory came from
  created_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ,               -- Optional TTL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_tenant_scope ON memory(tenant_id, scope);
CREATE INDEX idx_memory_department ON memory(department_id);
CREATE INDEX idx_memory_agent ON memory(agent_id);
CREATE INDEX idx_memory_bot ON memory(bot_id);

-- ============================================================
-- 8. SOURCE SYSTEMS (Connected external systems)
-- ============================================================
CREATE TABLE source_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Egnyte", "Entrata", "Paycor", "M365"
  system_type TEXT NOT NULL,             -- "file_storage", "pms", "hris", "email"
  connection_config JSONB DEFAULT '{}',  -- Encrypted connection details
  is_connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- ============================================================
-- 9. DATA CATEGORIES & SENSITIVITY
-- ============================================================
CREATE TYPE sensitivity_level AS ENUM ('public', 'internal', 'confidential', 'restricted');

CREATE TABLE data_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Employee PII", "Financial Records", "SOPs"
  sensitivity sensitivity_level NOT NULL DEFAULT 'internal',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- Path-level sensitivity within source systems
CREATE TABLE source_path_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_system_id UUID NOT NULL REFERENCES source_systems(id) ON DELETE CASCADE,
  path TEXT NOT NULL,                    -- "Shared/HR/Employee Records/"
  data_category_id UUID REFERENCES data_categories(id),
  sensitivity sensitivity_level NOT NULL DEFAULT 'internal',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_system_id, path)
);

-- ============================================================
-- 10. RKBAC POLICIES (Owner-set rules)
-- ============================================================
CREATE TYPE policy_type AS ENUM ('allow', 'deny', 'owner_only');

CREATE TABLE rkbac_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "HR PII stays in HR"
  description TEXT,
  from_department_id UUID REFERENCES departments(id),  -- NULL = all departments
  to_department_id UUID REFERENCES departments(id),    -- NULL = all departments
  data_category_id UUID REFERENCES data_categories(id),-- NULL = all categories
  policy_type policy_type NOT NULL,
  is_locked BOOLEAN DEFAULT true,        -- Owner-locked = immutable by lower tiers
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rkbac_tenant ON rkbac_policies(tenant_id, active);

-- ============================================================
-- 11. CROSS-DEPARTMENT ACCESS MATRIX
-- ============================================================
CREATE TABLE department_access_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_department_id UUID NOT NULL REFERENCES departments(id),
  to_department_id UUID NOT NULL REFERENCES departments(id),
  access_type policy_type NOT NULL DEFAULT 'deny',  -- allow, deny, owner_only
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_share BOOLEAN DEFAULT false,
  set_by UUID REFERENCES users(id),      -- Who configured this
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, from_department_id, to_department_id)
);

-- ============================================================
-- 12. EXCEPTIONS (Time-limited policy waivers)
-- ============================================================
CREATE TYPE exception_status AS ENUM ('pending', 'approved', 'denied', 'expired', 'revoked');
CREATE TYPE exception_duration AS ENUM ('one_time', '30_days', '60_days', '90_days', 'custom', 'permanent');

CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES rkbac_policies(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_for_agent UUID REFERENCES agents(id),
  requested_for_bot UUID REFERENCES bots(id),
  reason TEXT NOT NULL,                  -- Auto-generated context
  duration exception_duration NOT NULL,
  status exception_status DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  denied_reason TEXT,
  expires_at TIMESTAMPTZ,               -- NULL for permanent (requires owner)
  notified_7day BOOLEAN DEFAULT false,   -- 7-day warning sent
  notified_1day BOOLEAN DEFAULT false,   -- 1-day warning sent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exceptions_active ON exceptions(tenant_id, status) WHERE status IN ('pending', 'approved');
CREATE INDEX idx_exceptions_expiring ON exceptions(expires_at) WHERE status = 'approved' AND expires_at IS NOT NULL;

-- ============================================================
-- 13. TICKETS (Cross-department service requests)
-- ============================================================
CREATE TYPE ticket_status AS ENUM ('new', 'assigned', 'in_progress', 'waiting_on_requester', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ticket_number SERIAL,                  -- Human-readable #TKT-0001
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requester_id UUID NOT NULL REFERENCES users(id),
  requester_department_id UUID REFERENCES departments(id),
  target_department_id UUID NOT NULL REFERENCES departments(id),  -- Where it's routed
  assigned_to UUID REFERENCES users(id),
  status ticket_status DEFAULT 'new',
  priority ticket_priority DEFAULT 'medium',
  category TEXT,                         -- "hardware", "access", "maintenance", etc.
  resolution TEXT,
  source TEXT DEFAULT 'chat',            -- 'chat', 'dashboard', 'auto'
  related_ticket_group UUID,             -- Groups similar tickets for bubbling
  sla_response_by TIMESTAMPTZ,
  sla_resolve_by TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant_status ON tickets(tenant_id, status);
CREATE INDEX idx_tickets_department ON tickets(target_department_id, status);
CREATE INDEX idx_tickets_requester ON tickets(requester_id);
CREATE INDEX idx_tickets_group ON tickets(related_ticket_group) WHERE related_ticket_group IS NOT NULL;

-- Ticket comments/updates
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,     -- Internal notes (requester can't see)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. SUGGESTIONS (Feature requests from users)
-- ============================================================
CREATE TYPE suggestion_status AS ENUM ('new', 'under_review', 'planned', 'building', 'shipped', 'declined');

CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  suggestion_number SERIAL,              -- Human-readable #SUG-0001
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  status suggestion_status DEFAULT 'new',
  vote_count INT DEFAULT 1,
  target_department_id UUID REFERENCES departments(id),  -- Where suggestion routes
  reviewed_by UUID REFERENCES users(id),
  response TEXT,                         -- Official response when reviewed
  related_suggestion_group UUID,         -- Groups similar suggestions
  shipped_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suggestions_tenant ON suggestions(tenant_id, status);
CREATE INDEX idx_suggestions_votes ON suggestions(tenant_id, vote_count DESC) WHERE status NOT IN ('shipped', 'declined');

-- Suggestion votes (dedup)
CREATE TABLE suggestion_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- ============================================================
-- 15. WORKFLOWS (Simple trigger-action chains)
-- ============================================================
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived');

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_config JSONB NOT NULL,         -- What kicks it off
  steps JSONB NOT NULL DEFAULT '[]',     -- Array of action steps
  status workflow_status DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  last_run TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  escalated_to_n8n BOOLEAN DEFAULT false,-- Handed off to IT/N8N
  n8n_ticket_id UUID REFERENCES tickets(id),  -- The handoff ticket
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. AUDIT LOG (Everything is tracked)
-- ============================================================
CREATE TYPE audit_action AS ENUM (
  'login', 'logout',
  'data_access', 'data_access_denied',
  'policy_created', 'policy_updated', 'policy_deleted',
  'exception_requested', 'exception_approved', 'exception_denied', 'exception_expired',
  'ticket_created', 'ticket_updated', 'ticket_resolved',
  'suggestion_created', 'suggestion_voted',
  'agent_created', 'agent_updated',
  'bot_created', 'bot_updated',
  'workflow_created', 'workflow_triggered',
  'memory_created', 'memory_updated', 'memory_deleted',
  'prompt_injection_detected', 'suspicious_activity',
  'setting_changed', 'export_data'
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  bot_id UUID REFERENCES bots(id),
  action audit_action NOT NULL,
  resource_type TEXT,                    -- "ticket", "memory", "policy", etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',            -- Action-specific context
  ip_address INET,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_time ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_severity ON audit_log(tenant_id, severity, created_at DESC) WHERE severity IN ('warning', 'critical');

-- ============================================================
-- 17. PROMPT INJECTION LOG (Separate for security team)
-- ============================================================
CREATE TABLE prompt_injection_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  session_id TEXT,
  raw_input TEXT NOT NULL,               -- Exact text the user typed
  detection_type TEXT NOT NULL,           -- "role_play", "system_override", "privilege_escalation", "encoded"
  target_data TEXT,                       -- What they were trying to access
  blocked BOOLEAN DEFAULT true,
  flagged_to_owner BOOLEAN DEFAULT false,
  attempt_count INT DEFAULT 1,           -- Running count for this user
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_injection_tenant ON prompt_injection_log(tenant_id, created_at DESC);
CREATE INDEX idx_injection_user ON prompt_injection_log(user_id, attempt_count DESC);

-- ============================================================
-- 18. CHAT SESSIONS & MESSAGES
-- ============================================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  bot_id UUID REFERENCES bots(id),       -- If chatting directly with a bot
  title TEXT,
  is_planning_mode BOOLEAN DEFAULT false,-- Planning mode interview active
  planning_spec JSONB,                   -- Built spec from planning interview
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(5,2),         -- NULL for simple responses, 0-100 for complex
  confidence_reason TEXT,
  sources JSONB DEFAULT '[]',            -- Array of {label, url, type, timestamp}
  data_freshness TEXT,                   -- "verified", "stale", "partial", "unknown"
  is_financial BOOLEAN DEFAULT false,    -- Triggers financial data notice
  is_mock BOOLEAN DEFAULT false,         -- Mock/projected data flag
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- ============================================================
-- 19. DASHBOARD WIDGETS & TEMPLATES
-- ============================================================
CREATE TABLE dashboard_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id), -- NULL = system-wide template
  name TEXT NOT NULL,                    -- "Property Management — Ops Director"
  description TEXT,
  role_tier role_tier,                   -- Which tier this template is for
  department_type TEXT,                  -- "ops", "marketing", "hr", etc.
  widget_layout JSONB NOT NULL,          -- Full layout config
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,                    -- "Occupancy Card", "Bot Status"
  widget_type TEXT NOT NULL,             -- "metric", "chart", "feed", "queue", "embed"
  description TEXT,
  default_config JSONB DEFAULT '{}',
  min_tier role_tier DEFAULT 'specialist',-- Minimum tier to use this widget
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner-pushed mandatory widgets
CREATE TABLE mandatory_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),     -- NULL = all roles in tenant
  department_id UUID REFERENCES departments(id), -- NULL = all departments
  widget_id UUID NOT NULL REFERENCES dashboard_widgets(id),
  position JSONB NOT NULL,               -- Where it must appear
  locked BOOLEAN DEFAULT true,           -- Can't be removed by user
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 20. NOTIFICATION PREFERENCES & APPROVAL ROUTING
-- ============================================================
CREATE TABLE approval_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sensitivity sensitivity_level NOT NULL,
  approver_user_id UUID REFERENCES users(id),      -- Specific approver
  approver_role_tier role_tier,                     -- Or by tier
  requires_second_approver BOOLEAN DEFAULT false,
  second_approver_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, sensitivity)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL,                    -- "exception_request", "ticket_update", "suggestion_shipped", etc.
  resource_type TEXT,
  resource_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- 21. ONBOARDING / TRAINING TRACKING
-- ============================================================
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trust_contract_accepted BOOLEAN DEFAULT false,
  trust_contract_accepted_at TIMESTAMPTZ,
  walkthrough_completed BOOLEAN DEFAULT false,
  walkthrough_completed_at TIMESTAMPTZ,
  walkthrough_step INT DEFAULT 0,        -- Current step if in progress
  reference_card_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 22. RLS POLICIES (Row Level Security)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_path_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rkbac_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_access_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_injection_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatory_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's tenant
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's role tier
CREATE OR REPLACE FUNCTION get_user_role_tier()
RETURNS role_tier AS $$
  SELECT r.tier FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's department
CREATE OR REPLACE FUNCTION get_user_department_id()
RETURNS UUID AS $$
  SELECT department_id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Tenant isolation: users can only see their own tenant's data
-- (Applied to all tables — showing key examples)

CREATE POLICY tenant_isolation_departments ON departments
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_agents ON agents
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_bots ON bots
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_tickets ON tickets
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_suggestions ON suggestions
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_audit ON audit_log
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_memory ON memory
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_policies ON rkbac_policies
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_exceptions ON exceptions
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_notifications ON notifications
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_workflows ON workflows
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY tenant_isolation_chat_sessions ON chat_sessions
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Memory: hierarchical access
-- Owner sees all, department head sees department + core, 
-- manager sees own + subordinate, specialist sees own + shared
CREATE POLICY memory_access ON memory
  FOR SELECT USING (
    tenant_id = get_user_tenant_id()
    AND (
      -- Owner sees everything
      get_user_role_tier() = 'owner'
      -- Core memory visible to all
      OR scope = 'core'
      -- Department shared visible to department members
      OR (scope = 'department' AND department_id = get_user_department_id())
      -- Agent/bot private visible to department heads of that department
      OR (scope IN ('agent', 'bot') AND department_id = get_user_department_id() 
          AND get_user_role_tier() IN ('owner', 'department_head', 'manager'))
    )
  );

-- Tickets: requester sees own, target department sees theirs, owner sees all
CREATE POLICY ticket_access ON tickets
  FOR SELECT USING (
    tenant_id = get_user_tenant_id()
    AND (
      get_user_role_tier() = 'owner'
      OR requester_id = (SELECT id FROM users WHERE auth_id = auth.uid())
      OR target_department_id = get_user_department_id()
    )
  );

-- Notifications: users see only their own
CREATE POLICY notification_access ON notifications
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Prompt injection log: only owner and IT see this
CREATE POLICY injection_log_access ON prompt_injection_log
  FOR SELECT USING (
    get_user_role_tier() = 'owner'
  );

-- ============================================================
-- 23. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER tr_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_departments_updated BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_agents_updated BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_bots_updated BEFORE UPDATE ON bots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_memory_updated BEFORE UPDATE ON memory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tickets_updated BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_suggestions_updated BEFORE UPDATE ON suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workflows_updated BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_exceptions_updated BEFORE UPDATE ON exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_chat_sessions_updated BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-expire exceptions
CREATE OR REPLACE FUNCTION expire_exceptions()
RETURNS void AS $$
BEGIN
  UPDATE exceptions 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'approved' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit log helper
CREATE OR REPLACE FUNCTION log_audit(
  p_tenant_id UUID,
  p_user_id UUID,
  p_action audit_action,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (tenant_id, user_id, action, resource_type, resource_id, details, severity)
  VALUES (p_tenant_id, p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_severity)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suggestion vote counter
CREATE OR REPLACE FUNCTION update_suggestion_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE suggestions SET vote_count = vote_count + 1 WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE suggestions SET vote_count = vote_count - 1 WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_suggestion_vote_count
  AFTER INSERT OR DELETE ON suggestion_votes
  FOR EACH ROW EXECUTE FUNCTION update_suggestion_vote_count();

-- Ticket similar grouping (basic — groups by similar title within department)
CREATE OR REPLACE FUNCTION check_ticket_bubbling()
RETURNS TRIGGER AS $$
DECLARE
  v_similar_count INT;
  v_group_id UUID;
BEGIN
  -- Find similar tickets in same department from last 30 days
  SELECT related_ticket_group, COUNT(*) INTO v_group_id, v_similar_count
  FROM tickets 
  WHERE tenant_id = NEW.tenant_id
    AND target_department_id = NEW.target_department_id
    AND created_at > NOW() - INTERVAL '30 days'
    AND status NOT IN ('closed', 'resolved')
    AND similarity(title, NEW.title) > 0.3  -- Requires pg_trgm
  GROUP BY related_ticket_group
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  IF v_similar_count >= 2 THEN
    IF v_group_id IS NULL THEN
      v_group_id = uuid_generate_v4();
    END IF;
    NEW.related_ticket_group = v_group_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Enable pg_trgm extension for ticket similarity
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 24. SEED DATA — RISE as first tenant
-- ============================================================

-- Create RISE tenant
INSERT INTO tenants (id, name, slug, domain, brand_primary, brand_secondary, plan)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'RISE Real Estate',
  'rise',
  'risere.com',
  '#2E86AB',
  '#1E293B',
  'enterprise'
);

-- Create departments
INSERT INTO departments (id, tenant_id, name, slug, icon, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Operations', 'ops', '🏢', 1),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Marketing', 'marketing', '📢', 2),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Human Resources', 'hr', '👥', 3),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Finance', 'finance', '💰', 4),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'IT', 'it', '💻', 5),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Training', 'training', '📚', 6),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Maintenance', 'maintenance', '🔧', 7);

-- Create roles
INSERT INTO roles (id, tenant_id, name, tier, department_id) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'COO', 'owner', NULL),
  ('r0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Ops Director', 'department_head', 'd0000000-0000-0000-0000-000000000001'),
  ('r0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Marketing Director', 'department_head', 'd0000000-0000-0000-0000-000000000002'),
  ('r0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'HR Director', 'department_head', 'd0000000-0000-0000-0000-000000000003'),
  ('r0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Finance Director', 'department_head', 'd0000000-0000-0000-0000-000000000004'),
  ('r0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'IT Manager', 'department_head', 'd0000000-0000-0000-0000-000000000005'),
  ('r0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Training Director', 'department_head', 'd0000000-0000-0000-0000-000000000006'),
  ('r0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Maintenance Director', 'department_head', 'd0000000-0000-0000-0000-000000000007'),
  ('r0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Regional VP', 'manager', 'd0000000-0000-0000-0000-000000000001'),
  ('r0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Property Manager', 'specialist', 'd0000000-0000-0000-0000-000000000001'),
  ('r0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Leasing Specialist', 'specialist', 'd0000000-0000-0000-0000-000000000001'),
  ('r0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Maintenance Tech', 'specialist', 'd0000000-0000-0000-0000-000000000007');

-- Create data categories
INSERT INTO data_categories (tenant_id, name, sensitivity, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Employee PII', 'restricted', 'SSN, salary, disciplinary records, personal info'),
  ('a0000000-0000-0000-0000-000000000001', 'Resident Data', 'confidential', 'Lease details, payment history, screening results'),
  ('a0000000-0000-0000-0000-000000000001', 'Financial Records', 'restricted', 'NOI, budgets, board reports, investor data'),
  ('a0000000-0000-0000-0000-000000000001', 'Operational SOPs', 'internal', 'Standard procedures, checklists, training materials'),
  ('a0000000-0000-0000-0000-000000000001', 'Marketing Assets', 'internal', 'Brand guidelines, campaigns, collateral'),
  ('a0000000-0000-0000-0000-000000000001', 'Vendor Information', 'confidential', 'Contracts, pricing, performance scores'),
  ('a0000000-0000-0000-0000-000000000001', 'Legal Documents', 'restricted', 'Contracts, litigation, compliance'),
  ('a0000000-0000-0000-0000-000000000001', 'Property Data', 'internal', 'Unit mix, amenities, physical attributes');

-- Default RKBAC policies
INSERT INTO rkbac_policies (tenant_id, name, description, from_department_id, to_department_id, policy_type, is_locked) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'HR PII Isolation', 'Employee PII never leaves HR department', NULL, 'd0000000-0000-0000-0000-000000000003', 'deny', true),
  ('a0000000-0000-0000-0000-000000000001', 'Finance Restricted', 'Financial records require Owner approval for cross-dept access', NULL, 'd0000000-0000-0000-0000-000000000004', 'owner_only', true),
  ('a0000000-0000-0000-0000-000000000001', 'Ops SOPs Readable', 'Operations SOPs readable by all departments', 'd0000000-0000-0000-0000-000000000001', NULL, 'allow', true),
  ('a0000000-0000-0000-0000-000000000001', 'Marketing No Ops Access', 'Marketing assets do not flow to Operations', 'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'deny', true);

-- Default approval routing
INSERT INTO approval_routes (tenant_id, sensitivity) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'public'),
  ('a0000000-0000-0000-0000-000000000001', 'internal'),
  ('a0000000-0000-0000-0000-000000000001', 'confidential'),
  ('a0000000-0000-0000-0000-000000000001', 'restricted');

-- ============================================================
-- DONE. Schema ready for Milliebot Architecture.
-- ============================================================
