-- RLS DISABLED DURING DEMO PHASE — enable with ALTER TABLE ... ENABLE ROW LEVEL SECURITY
-- 
-- To activate, run for each table:
--   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE <table> FORCE ROW LEVEL SECURITY;
--
-- Helper: get current user's tenant_id from the users table
CREATE OR REPLACE FUNCTION auth.tenant_id() RETURNS uuid AS $$
  SELECT tenant_id FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.user_role_tier() RETURNS text AS $$
  SELECT r.tier FROM public.users u JOIN public.roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS
-- ============================================================
CREATE POLICY users_select ON public.users FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY users_insert ON public.users FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY users_update ON public.users FOR UPDATE
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY users_delete ON public.users FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- AGENTS
-- ============================================================
CREATE POLICY agents_select ON public.agents FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY agents_insert ON public.agents FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY agents_update ON public.agents FOR UPDATE
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY agents_delete ON public.agents FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() IN ('owner', 'department_head'));

-- ============================================================
-- BOTS
-- ============================================================
CREATE POLICY bots_select ON public.bots FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY bots_insert ON public.bots FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY bots_update ON public.bots FOR UPDATE
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY bots_delete ON public.bots FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() IN ('owner', 'department_head'));

-- ============================================================
-- TICKETS
-- ============================================================
CREATE POLICY tickets_select ON public.tickets FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY tickets_insert ON public.tickets FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY tickets_update ON public.tickets FOR UPDATE
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY tickets_delete ON public.tickets FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() IN ('owner', 'department_head'));

-- ============================================================
-- SUGGESTIONS
-- ============================================================
CREATE POLICY suggestions_select ON public.suggestions FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY suggestions_insert ON public.suggestions FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY suggestions_update ON public.suggestions FOR UPDATE
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY suggestions_delete ON public.suggestions FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- RKBAC_POLICIES
-- ============================================================
CREATE POLICY rkbac_policies_select ON public.rkbac_policies FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY rkbac_policies_insert ON public.rkbac_policies FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

CREATE POLICY rkbac_policies_update ON public.rkbac_policies FOR UPDATE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner')
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY rkbac_policies_delete ON public.rkbac_policies FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- AUDIT_LOG (read-only for non-admins)
-- ============================================================
CREATE POLICY audit_log_select ON public.audit_log FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY audit_log_insert ON public.audit_log FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id());

-- Only owner can update/delete audit entries
CREATE POLICY audit_log_update ON public.audit_log FOR UPDATE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

CREATE POLICY audit_log_delete ON public.audit_log FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE POLICY departments_select ON public.departments FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY departments_insert ON public.departments FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

CREATE POLICY departments_update ON public.departments FOR UPDATE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() IN ('owner', 'department_head'))
  WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY departments_delete ON public.departments FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- ROLES
-- ============================================================
CREATE POLICY roles_select ON public.roles FOR SELECT
  USING (tenant_id = auth.tenant_id());

CREATE POLICY roles_insert ON public.roles FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

CREATE POLICY roles_update ON public.roles FOR UPDATE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

CREATE POLICY roles_delete ON public.roles FOR DELETE
  USING (tenant_id = auth.tenant_id() AND auth.user_role_tier() = 'owner');

-- ============================================================
-- TENANTS (only owner can update)
-- ============================================================
CREATE POLICY tenants_select ON public.tenants FOR SELECT
  USING (id = auth.tenant_id());

CREATE POLICY tenants_update ON public.tenants FOR UPDATE
  USING (id = auth.tenant_id() AND auth.user_role_tier() = 'owner')
  WITH CHECK (id = auth.tenant_id());
