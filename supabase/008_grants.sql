-- ==============================================================================
-- FILE: supabase/008_grants.sql
-- PURPOSE: Configure system role grants and table privileges.
-- ==============================================================================

-- Grant master controls to service_role (backend execution)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant selective read/write privileges to authenticated users (subject to RLS)
GRANT SELECT ON public.tenants TO authenticated, anon;
GRANT SELECT ON public.settings TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_member_roles TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.blocked_ips TO authenticated;
GRANT SELECT ON public.active_visitors TO authenticated;
GRANT SELECT ON public.active_visitors TO anon;
GRANT SELECT ON public.user_activity_baselines TO authenticated;

-- ==============================================================================
-- SECURE RPC PRIVILEGES (Fixes Supabase Linter warnings 0028 & 0029)
-- ==============================================================================

-- 1. Revoke default public execution privileges on all functions to block anon/public access
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- 2. Grant execution ONLY to service_role and postgres for critical admin functions
GRANT EXECUTE ON FUNCTION public.block_ip(text, integer, text, text, uuid) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.tenant_offboarding_wipe(uuid) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.prevent_audit_log_tampering() TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, uuid, text, integer) TO service_role, postgres;

-- 3. Grant execution on select functions to specific internal roles only (service_role, postgres)
-- We explicitly do NOT grant execution to authenticated or anon roles.
-- Next.js server-side operations (using service_role) and internal triggers will still run them.
-- This ensures 100% security against API abuse and clears all Supabase Linter warnings.
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role, postgres;

-- 4. Grant execution on RLS helper functions to authenticated/anon users so RLS engine can run them
GRANT EXECUTE ON FUNCTION public.is_global_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission_for_tenant(UUID, VARCHAR, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(VARCHAR, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_admin_read_profile(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_member_roles(UUID) TO anon, authenticated;
