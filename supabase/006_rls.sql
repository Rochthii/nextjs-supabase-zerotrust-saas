-- ==============================================================================
-- FILE: supabase/006_rls.sql
-- PURPOSE: Enable and FORCE RLS, establish the dynamic permission engine, and write policies.
-- ==============================================================================

-- 1. Helper: Check if current user is member of a specific tenant
CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE user_id = auth.uid() AND tenant_id = p_tenant_id
    );
$$;

-- 2. Dynamic Permission Engine (Security Definer with locked search path)
CREATE OR REPLACE FUNCTION public.has_permission_for_tenant(p_tenant_id UUID, p_resource VARCHAR, p_action VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    v_can_act BOOLEAN := FALSE;
BEGIN
    -- Super Admin gets all permissions automatically (system-wide bypass)
    IF EXISTS (
        SELECT 1
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        WHERE m.user_id = auth.uid() 
          AND m.tenant_id IS NULL 
          AND r.role_id = 'super_admin'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Query permissions matrix for the roles associated with the specific tenant (or global company_editor)
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        JOIN public.role_permissions rp ON r.role_id = rp.role_id
        WHERE m.user_id = auth.uid()
          AND (m.tenant_id = p_tenant_id OR (m.tenant_id IS NULL AND r.role_id = 'company_editor'))
          AND rp.resource = p_resource
          AND (
              (p_action = 'create' AND rp.can_create) OR
              (p_action = 'read' AND rp.can_read) OR
              (p_action = 'update' AND rp.can_update) OR
              (p_action = 'delete' AND rp.can_delete)
          )
    ) INTO v_can_act;

    RETURN v_can_act;
END;
$$;

-- Generic fallback permission engine (checks across all active memberships)
CREATE OR REPLACE FUNCTION public.has_permission(p_resource VARCHAR, p_action VARCHAR)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    v_can_act BOOLEAN := FALSE;
BEGIN
    -- Super Admin gets all permissions automatically
    IF EXISTS (
        SELECT 1
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        WHERE m.user_id = auth.uid() AND r.role_id = 'super_admin'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Query role_permissions matrix across all roles held by the current user
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        JOIN public.role_permissions rp ON r.role_id = rp.role_id
        WHERE m.user_id = auth.uid()
          AND rp.resource = p_resource
          AND (
              (p_action = 'create' AND rp.can_create) OR
              (p_action = 'read' AND rp.can_read) OR
              (p_action = 'update' AND rp.can_update) OR
              (p_action = 'delete' AND rp.can_delete)
          )
    ) INTO v_can_act;

    RETURN v_can_act;
END;
$$;

-- Helper to check if a tenant admin can read a target user profile
CREATE OR REPLACE FUNCTION public.can_admin_read_profile(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_members am -- admin's membership
        JOIN public.tenant_member_roles ar ON am.id = ar.member_id
        JOIN public.tenant_members um ON am.tenant_id = um.tenant_id -- shared tenant
        WHERE am.user_id = auth.uid()
          AND um.user_id = p_user_id
          AND ar.role_id = 'tenant_admin'
          AND am.tenant_id IS NOT NULL
    );
$$;

-- Helper to check if a user can view a membership row
CREATE OR REPLACE FUNCTION public.can_view_member(p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members m
        WHERE m.id = p_member_id
          AND (
              m.user_id = auth.uid()
              OR public.is_global_admin()
              OR (m.tenant_id IS NOT NULL AND public.has_permission_for_tenant(m.tenant_id, 'users', 'read'))
          )
    );
$$;

-- Helper to check if a user can manage member roles
CREATE OR REPLACE FUNCTION public.can_manage_member_roles(p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members m
        WHERE m.id = p_member_id
          AND (
              public.is_global_admin()
              OR (m.tenant_id IS NOT NULL AND public.has_permission_for_tenant(m.tenant_id, 'users', 'update'))
          )
    );
$$;

-- 3. Measure Row-Level Security (RLS) Coverage (Secured search path)
CREATE OR REPLACE FUNCTION public.get_rls_coverage()
RETURNS TABLE (protected bigint, total bigint, percentage numeric)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total bigint;
    v_protected bigint;
BEGIN
    SELECT count(*) INTO v_total FROM pg_tables WHERE schemaname = 'public';
    SELECT count(*) INTO v_protected
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = TRUE;
    
    IF v_total = 0 THEN
        RETURN QUERY SELECT 0::bigint, 0::bigint, 0.0::numeric;
    ELSE
        RETURN QUERY SELECT v_protected, v_total, ROUND((v_protected::numeric / v_total::numeric) * 100, 2);
    END IF;
END;
$$;

-- 4. Enable and FORCE RLS on All Tables (100% Core Coverage)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings FORCE ROW LEVEL SECURITY;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;

ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.tenant_member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_member_roles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips FORCE ROW LEVEL SECURITY;

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_hits FORCE ROW LEVEL SECURITY;

ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_visitors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_activity_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_baselines FORCE ROW LEVEL SECURITY;

-- 5. Setup core RLS Policies

-- tenants
CREATE POLICY "Public read tenants" ON public.tenants
    FOR SELECT USING (lifecycle_status = 'active');

CREATE POLICY "Super admin manage tenants" ON public.tenants
    FOR ALL USING (public.is_global_admin());

-- settings
CREATE POLICY "Public read settings" ON public.settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Super admin manage settings" ON public.settings
    FOR ALL USING (public.is_global_admin());

-- site_settings
CREATE POLICY "Tenant members read site_settings" ON public.site_settings
    FOR SELECT USING (public.is_tenant_member(tenant_id) OR public.is_global_admin());

CREATE POLICY "Tenant staff modify site_settings" ON public.site_settings
    FOR ALL USING (
        public.has_permission_for_tenant(tenant_id, 'settings', 'update')
    );

-- cron_job_logs
CREATE POLICY "Super admin read cron_job_logs" ON public.cron_job_logs
    FOR SELECT USING (public.is_global_admin());

-- Allow system insert cron_job_logs: No public insert policy needed. System execution (service_role) bypasses RLS automatically.

-- user_profiles
CREATE POLICY "Users read own profile" ON public.user_profiles
    FOR SELECT USING (
        id = auth.uid() 
        OR public.is_global_admin()
        OR public.can_admin_read_profile(id)
    );

CREATE POLICY "Users update own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Super admin manage profiles" ON public.user_profiles
    FOR ALL USING (public.is_global_admin());

-- roles
CREATE POLICY "Allow read roles" ON public.roles
    FOR SELECT USING (TRUE);

CREATE POLICY "Super admin manage roles" ON public.roles
    FOR ALL USING (public.is_global_admin());

-- tenant_members
CREATE POLICY "Read tenant_members" ON public.tenant_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.is_global_admin()
        OR (tenant_id IS NOT NULL AND public.has_permission_for_tenant(tenant_id, 'users', 'read'))
    );

CREATE POLICY "Manage tenant_members" ON public.tenant_members
    FOR ALL USING (
        public.is_global_admin()
        OR (tenant_id IS NOT NULL AND public.has_permission_for_tenant(tenant_id, 'users', 'update'))
    );

-- tenant_member_roles
CREATE POLICY "Read tenant_member_roles" ON public.tenant_member_roles
    FOR SELECT USING (public.can_view_member(member_id));

CREATE POLICY "Manage tenant_member_roles" ON public.tenant_member_roles
    FOR ALL USING (public.can_manage_member_roles(member_id));

-- role_permissions
CREATE POLICY "Allow read role_permissions" ON public.role_permissions
    FOR SELECT USING (TRUE);

CREATE POLICY "Super admin manage role_permissions" ON public.role_permissions
    FOR ALL USING (public.is_global_admin());

-- audit_logs
CREATE POLICY "Admins view audit logs of own tenant" ON public.audit_logs
    FOR SELECT USING (
        public.is_global_admin() 
        OR (tenant_id IS NOT NULL AND public.has_permission_for_tenant(tenant_id, 'analytics', 'read'))
    );

-- Allow system insert logs: No public insert policy needed. System execution (service_role) and database triggers bypass RLS automatically.

-- blocked_ips
CREATE POLICY "Read blocked_ips" ON public.blocked_ips
    FOR SELECT USING (
        public.is_global_admin()
        OR (tenant_id IS NOT NULL AND public.is_tenant_member(tenant_id))
    );

CREATE POLICY "Manage blocked_ips" ON public.blocked_ips
    FOR ALL USING (
        public.is_global_admin()
        OR (tenant_id IS NOT NULL AND public.has_permission_for_tenant(tenant_id, 'settings', 'update'))
    );

-- rate_limit_hits
CREATE POLICY "Read write rate_limit_hits" ON public.rate_limit_hits
    FOR ALL USING (
        public.is_global_admin()
        OR (tenant_id IS NOT NULL AND public.is_tenant_member(tenant_id))
    );

-- active_visitors
CREATE POLICY "Read active_visitors" ON public.active_visitors
    FOR SELECT USING (public.is_global_admin());

CREATE POLICY "Manage active_visitors" ON public.active_visitors
    FOR ALL TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());

-- user_activity_baselines
CREATE POLICY "Read user_activity_baselines" ON public.user_activity_baselines
    FOR SELECT USING (
        public.is_global_admin()
        OR EXISTS (
            SELECT 1 
            FROM public.tenant_member_roles r
            JOIN public.tenant_members m ON r.member_id = m.id
            WHERE m.user_id = auth.uid() AND r.role_id = 'tenant_admin'
        )
    );

CREATE POLICY "Manage user_activity_baselines" ON public.user_activity_baselines
    FOR ALL USING (public.is_global_admin());
