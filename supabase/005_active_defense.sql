-- ==============================================================================
-- FILE: supabase/005_active_defense.sql
-- PURPOSE: Initialize Active Defense tables and SOAR RPC blockers.
-- ==============================================================================

-- 1. Blocked IPs table (blocked_ips)
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    ip TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL for system-wide blocks
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT clock_timestamp() NOT NULL,
    blocked_until TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    created_by TEXT DEFAULT 'SOAR Active Defense Engine' NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_ips_ip_tenant ON public.blocked_ips (ip, tenant_id);

-- 2. Rate limit hits table (rate_limit_hits)
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    ip_address TEXT,
    action_type TEXT,
    hit_count INTEGER DEFAULT 1 NOT NULL,
    last_hit TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    identifier TEXT,
    action TEXT
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_ip_action ON public.rate_limit_hits (ip_address, action_type, last_hit);

-- 3. Real-time active visitors monitoring (active_visitors)
CREATE TABLE IF NOT EXISTS public.active_visitors (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_hash TEXT NOT NULL,
    path TEXT NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. User activity baseline profiles (user_activity_baselines)
CREATE TABLE IF NOT EXISTS public.user_activity_baselines (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_email TEXT NOT NULL UNIQUE,
    avg_hourly_actions DOUBLE PRECISION DEFAULT 5 NOT NULL,
    stddev_hourly_actions DOUBLE PRECISION DEFAULT 2 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT clock_timestamp() NOT NULL
);

-- 5. RPC: Check rate limit in sliding time window (Secured signature)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_action TEXT,
    p_ip TEXT,
    p_max_hits INTEGER,
    p_tenant_id UUID,
    p_user_id TEXT,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_now TIMESTAMP WITH TIME ZONE := clock_timestamp();
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_hit_count INTEGER;
    v_identifier TEXT;
BEGIN
    v_window_start := v_now - (p_window_seconds || ' seconds')::INTERVAL;
    v_identifier := COALESCE(p_user_id, p_ip);

    -- Clean expired hit records to keep db lean
    DELETE FROM public.rate_limit_hits 
    WHERE identifier = v_identifier AND action = p_action AND last_hit < v_window_start;

    -- Count hit requests in the window
    SELECT COALESCE(SUM(hit_count), 0) INTO v_hit_count
    FROM public.rate_limit_hits
    WHERE identifier = v_identifier AND action = p_action AND last_hit >= v_window_start;

    IF v_hit_count >= p_max_hits THEN
        -- Insert warning audit log
        INSERT INTO public.audit_logs (action, resource, tenant_id, severity, details, user_email)
        VALUES ('rate_limit_exceeded', 'rate_limiting', p_tenant_id, 'WARNING', json_build_object('ip', p_ip, 'action', p_action, 'hits', v_hit_count), p_user_id);
        RETURN FALSE;
    END IF;

    -- Insert new hit
    INSERT INTO public.rate_limit_hits (ip_address, action_type, hit_count, last_hit, tenant_id, identifier, action)
    VALUES (p_ip, p_action, 1, v_now, p_tenant_id, v_identifier, p_action);

    RETURN TRUE;
END;
$$;

-- 6. RPC: Block & SOAR Active Threat Blocker (Secured search path)
CREATE OR REPLACE FUNCTION public.block_ip(
    p_admin_email TEXT,
    p_duration_hours INTEGER,
    p_ip TEXT,
    p_reason TEXT,
    p_tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check permissions if executed via client API (auth.uid() is not null)
    IF auth.uid() IS NOT NULL AND NOT (
        public.is_global_admin() 
        OR (p_tenant_id IS NOT NULL AND public.has_permission_for_tenant(p_tenant_id, 'settings', 'update'))
    ) THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only administrators can perform this action.';
    END IF;

    -- Only admin or SOAR Active Defense Engine can block IP
    INSERT INTO public.blocked_ips (ip, tenant_id, blocked_until, reason, created_by)
    VALUES (p_ip, p_tenant_id, clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL, p_reason, p_admin_email)
    ON CONFLICT (ip, tenant_id) DO UPDATE
    SET blocked_until = clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL,
        reason = p_reason,
        created_by = p_admin_email;

    -- Write audit log
    INSERT INTO public.audit_logs (action, resource, tenant_id, severity, details, user_email)
    VALUES ('ip_blocked', 'security_policy', p_tenant_id, 'CRITICAL', json_build_object('ip', p_ip, 'until', clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL, 'reason', p_reason), p_admin_email);
END;
$$;

-- 7. RPC: Unblock IP (Secured search path)
CREATE OR REPLACE FUNCTION public.unblock_ip(
    p_admin_email TEXT,
    p_ip TEXT,
    p_tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check permissions if executed via client API (auth.uid() is not null)
    IF auth.uid() IS NOT NULL AND NOT (
        public.is_global_admin() 
        OR (p_tenant_id IS NOT NULL AND public.has_permission_for_tenant(p_tenant_id, 'settings', 'update'))
    ) THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only administrators can perform this action.';
    END IF;

    DELETE FROM public.blocked_ips WHERE ip = p_ip AND tenant_id = p_tenant_id;

    -- Write audit log
    INSERT INTO public.audit_logs (action, resource, tenant_id, severity, details, user_email)
    VALUES ('ip_unblocked', 'security_policy', p_tenant_id, 'INFO', json_build_object('ip', p_ip), p_admin_email);
END;
$$;
