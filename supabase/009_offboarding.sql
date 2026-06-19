-- ==============================================================================
-- FILE: supabase/009_offboarding.sql
-- PURPOSE: Define tenant offboarding and data purging operations.
-- ==============================================================================

-- Offboarding function to wipe tenant data (Secured search path)
CREATE OR REPLACE FUNCTION public.tenant_offboarding_wipe(target_tenant_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only wipe business-specific configurations and memberships of this tenant
    DELETE FROM public.site_settings WHERE tenant_id = target_tenant_id;
    DELETE FROM public.tenant_members WHERE tenant_id = target_tenant_id;
    DELETE FROM public.user_profiles WHERE preferred_tenant_id = target_tenant_id;
    DELETE FROM public.blocked_ips WHERE tenant_id = target_tenant_id;
    DELETE FROM public.rate_limit_hits WHERE tenant_id = target_tenant_id;
    
    -- Write offboarding event audit log
    INSERT INTO public.audit_logs (action, resource, tenant_id, severity, details)
    VALUES ('tenant_offboarded_wipe', 'tenant_management', target_tenant_id, 'CRITICAL', json_build_object('wiped_tenant_id', target_tenant_id));
END;
$$;
