-- ============================================================
-- MIGRATION 001: Shared Agents (Template + Instance Pattern)
-- Date: 2026-02-26
-- Purpose: Support tenant-level shared agents that serve
--          multiple departments with RKBAC-scoped memory
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add agent_scope to distinguish shared vs department agents
-- ------------------------------------------------------------
CREATE TYPE agent_scope AS ENUM ('department', 'shared');

ALTER TABLE agents 
  ADD COLUMN scope agent_scope NOT NULL DEFAULT 'department',
  ADD COLUMN agent_type TEXT;  -- 'research', 'compliance', 'security', 'reporting', etc.

-- Drop the one-agent-per-department constraint (shared agents don't belong to one dept)
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tenant_id_department_id_key;

-- Make department_id nullable (shared agents have no home department)
ALTER TABLE agents ALTER COLUMN department_id DROP NOT NULL;

-- Add new constraint: department agents still unique per department
CREATE UNIQUE INDEX idx_agents_dept_unique 
  ON agents(tenant_id, department_id) 
  WHERE scope = 'department' AND department_id IS NOT NULL;

-- Add constraint: shared agents unique by type per tenant
CREATE UNIQUE INDEX idx_agents_shared_unique 
  ON agents(tenant_id, agent_type) 
  WHERE scope = 'shared';

-- ------------------------------------------------------------
-- 2. Agent Templates (owner-configured blueprints)
-- ------------------------------------------------------------
CREATE TABLE agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "Research Agent", "Compliance Agent"
  agent_type TEXT NOT NULL,               -- 'research', 'compliance', 'security', 'reporting'
  description TEXT,
  system_prompt TEXT NOT NULL,            -- Base instructions all instances inherit
  model TEXT DEFAULT 'anthropic/claude-opus-4-6',
  capabilities JSONB DEFAULT '[]',        -- What this agent type can do
  default_settings JSONB DEFAULT '{}',    -- Default config for instances
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),   -- Owner who configured it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, agent_type)
);

ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_agent_templates ON agent_templates
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE TRIGGER tr_agent_templates_updated 
  BEFORE UPDATE ON agent_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- 3. Agent Instances (department-scoped copies of templates)
-- ------------------------------------------------------------
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,  -- Links to actual running agent
  status agent_status DEFAULT 'configuring',
  
  -- Instance overrides (NULL = inherit from template)
  system_prompt_override TEXT,            -- Appended to template prompt
  model_override TEXT,
  capabilities_override JSONB,
  settings_override JSONB DEFAULT '{}',
  
  -- Usage tracking
  query_count INT DEFAULT 0,
  last_query_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, template_id, department_id)  -- One instance per template per department
);

ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_agent_instances ON agent_instances
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE TRIGGER tr_agent_instances_updated 
  BEFORE UPDATE ON agent_instances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_agent_instances_dept ON agent_instances(tenant_id, department_id);
CREATE INDEX idx_agent_instances_template ON agent_instances(template_id);

-- ------------------------------------------------------------
-- 4. Shared Agent Access Control
-- Who can use which shared agents
-- ------------------------------------------------------------
CREATE TABLE shared_agent_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,  -- NULL = all departments
  role_tier role_tier,                    -- NULL = all tiers in department
  can_query BOOLEAN DEFAULT true,         -- Can ask the agent questions
  can_configure BOOLEAN DEFAULT false,    -- Can modify instance settings
  can_view_memory BOOLEAN DEFAULT false,  -- Can see agent's cross-dept memory
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, template_id, department_id)
);

ALTER TABLE shared_agent_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_shared_agent_access ON shared_agent_access
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- ------------------------------------------------------------
-- 5. Extend memory table for shared agent scoping
-- ------------------------------------------------------------
ALTER TYPE memory_scope ADD VALUE IF NOT EXISTS 'shared';

-- Add template reference to memory for shared agent memory
ALTER TABLE memory 
  ADD COLUMN template_id UUID REFERENCES agent_templates(id) ON DELETE CASCADE,
  ADD COLUMN requesting_department_id UUID REFERENCES departments(id);
  -- requesting_department_id = which dept's context produced this memory
  -- template_id = which shared agent owns this memory

CREATE INDEX idx_memory_template ON memory(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_memory_requesting_dept ON memory(requesting_department_id) WHERE requesting_department_id IS NOT NULL;

-- ------------------------------------------------------------
-- 6. Update memory RLS for shared agent access
-- ------------------------------------------------------------
DROP POLICY IF EXISTS memory_access ON memory;

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
      -- Shared agent memory: visible if user's dept has access AND
      -- either it's their department's memory OR they have cross-dept view permission
      OR (scope = 'shared' AND template_id IS NOT NULL AND (
        -- User's own department's shared memory
        requesting_department_id = get_user_department_id()
        -- Or user has can_view_memory on this shared agent
        OR EXISTS (
          SELECT 1 FROM shared_agent_access saa
          WHERE saa.template_id = memory.template_id
            AND saa.tenant_id = memory.tenant_id
            AND (saa.department_id = get_user_department_id() OR saa.department_id IS NULL)
            AND saa.can_view_memory = true
        )
      ))
    )
  );

-- ------------------------------------------------------------
-- 7. Update chat_sessions for shared agent routing
-- ------------------------------------------------------------
ALTER TABLE chat_sessions
  ADD COLUMN template_id UUID REFERENCES agent_templates(id),
  ADD COLUMN instance_id UUID REFERENCES agent_instances(id),
  ADD COLUMN requesting_department_id UUID REFERENCES departments(id);

-- ------------------------------------------------------------
-- 8. Add new audit actions for shared agents
-- ------------------------------------------------------------
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'template_created';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'template_updated';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'instance_created';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'instance_query';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'shared_access_granted';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'shared_access_revoked';

-- ------------------------------------------------------------
-- 9. Helper: resolve effective config for an instance
-- Returns merged template + instance overrides
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_instance_config(p_instance_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_template RECORD;
  v_instance RECORD;
BEGIN
  SELECT t.*, i.system_prompt_override, i.model_override, 
         i.capabilities_override, i.settings_override
  INTO v_template
  FROM agent_instances i
  JOIN agent_templates t ON i.template_id = t.id
  WHERE i.id = p_instance_id;

  RETURN jsonb_build_object(
    'system_prompt', COALESCE(
      v_template.system_prompt || E'\n\n--- Department Context ---\n' || v_template.system_prompt_override,
      v_template.system_prompt
    ),
    'model', COALESCE(v_template.model_override, v_template.model),
    'capabilities', COALESCE(v_template.capabilities_override, v_template.capabilities),
    'settings', v_template.default_settings || COALESCE(v_template.settings_override, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 10. Seed: Default shared agent templates for RISE
-- ------------------------------------------------------------
INSERT INTO agent_templates (tenant_id, name, agent_type, description, system_prompt, capabilities) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Research Agent',
    'research',
    'Cross-department research assistant. Searches internal docs, web, and knowledge bases. Respects RKBAC — only returns data the requesting department is authorized to see.',
    'You are a research agent for RISE Real Estate. When answering questions:
1. Identify the requesting department and user role
2. Only reference data the requester is authorized to access per RKBAC policies
3. Cite sources explicitly (document name, date, system)
4. Flag when results are partial due to access restrictions
5. Never synthesize restricted data into summaries visible to lower tiers',
    '["web_search", "document_search", "knowledge_base", "report_generation"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Compliance Agent',
    'compliance',
    'Organization-wide compliance monitoring. Ensures consistent policy interpretation across all departments. Flags violations, tracks regulatory changes.',
    'You are the compliance agent for RISE Real Estate. Your role:
1. Maintain ONE authoritative interpretation of all policies
2. Monitor department activities for compliance violations
3. Track regulatory changes (Fair Housing, OSHA, state landlord-tenant laws)
4. Escalate violations to the appropriate department head AND owner
5. Never allow departments to create conflicting compliance interpretations
6. Log every compliance check in the audit trail',
    '["policy_check", "regulation_monitor", "violation_alert", "audit_trail"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Security Agent',
    'security',
    'Centralized security monitoring. Watches for prompt injection, data exfiltration attempts, unauthorized access patterns, and anomalous behavior across all departments.',
    'You are the security agent for RISE Real Estate. You operate at the tenant level with visibility into all departments. Your role:
1. Monitor all agent interactions for prompt injection attempts
2. Detect data access patterns that suggest exfiltration
3. Flag anomalous user behavior (unusual hours, bulk exports, privilege escalation)
4. Report directly to the owner tier — never to department heads
5. Maintain strict confidentiality of security findings',
    '["threat_detection", "access_monitoring", "anomaly_detection", "incident_response"]'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Reporting Agent',
    'reporting',
    'Standardized reporting across departments. Generates consistent formats, metrics definitions, and scheduled reports. Ensures all departments use the same KPI calculations.',
    'You are the reporting agent for RISE Real Estate. Your role:
1. Generate reports using standardized metric definitions (never let departments redefine KPIs)
2. Pull data only from authorized sources per RKBAC
3. Apply consistent formatting across all department reports
4. Flag data quality issues before they reach reports
5. Support scheduled and ad-hoc report generation
6. Maintain report templates that the owner has approved',
    '["report_generation", "data_aggregation", "scheduled_delivery", "template_management"]'::jsonb
  );

-- Grant all departments access to Research and Reporting agents
INSERT INTO shared_agent_access (tenant_id, template_id, department_id, can_query, can_configure, can_view_memory)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  t.id,
  d.id,
  true,   -- can_query
  false,  -- can_configure (only dept heads)
  false   -- can_view_memory (only own dept's memory)
FROM agent_templates t
CROSS JOIN departments d
WHERE t.tenant_id = 'a0000000-0000-0000-0000-000000000001'
  AND t.agent_type IN ('research', 'reporting')
  AND d.tenant_id = 'a0000000-0000-0000-0000-000000000001';

-- Compliance: all departments can query, only owner sees cross-dept memory
INSERT INTO shared_agent_access (tenant_id, template_id, department_id, can_query, can_configure, can_view_memory)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  t.id,
  d.id,
  true,   -- can_query
  false,  -- can_configure
  false   -- can_view_memory (compliance findings are sensitive)
FROM agent_templates t
CROSS JOIN departments d
WHERE t.tenant_id = 'a0000000-0000-0000-0000-000000000001'
  AND t.agent_type = 'compliance'
  AND d.tenant_id = 'a0000000-0000-0000-0000-000000000001';

-- Security: only IT and Owner can query
INSERT INTO shared_agent_access (tenant_id, template_id, department_id, can_query, can_configure, can_view_memory)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  t.id,
  'd0000000-0000-0000-0000-000000000005',  -- IT only
  true,
  false,
  true   -- IT can see security findings
FROM agent_templates t
WHERE t.tenant_id = 'a0000000-0000-0000-0000-000000000001'
  AND t.agent_type = 'security';

-- ============================================================
-- MIGRATION COMPLETE
-- 
-- Architecture: Template + Instance Pattern
-- 
-- Owner configures shared agent TEMPLATES (tenant-level)
-- Departments get INSTANCES that inherit template config
-- RKBAC controls what data each instance can access
-- Memory is scoped: each dept's interactions stay in their partition
-- Owner sees all memory; departments see only their own
-- At scale: instances auto-spawn per department on first query
-- ============================================================
