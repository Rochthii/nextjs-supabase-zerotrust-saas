-- ==============================================================================
-- FILE: supabase/004_audit_worm.sql
-- PURPOSE: Immutable security audit logs ledger (WORM) setup.
-- ==============================================================================

-- 1. Immutable security audit logs ledger (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID,
    action CHARACTER VARYING NOT NULL, -- select | insert | update | delete | violation
    table_name CHARACTER VARYING,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL for system-level/global logs
    user_email CHARACTER VARYING,
    resource CHARACTER VARYING NOT NULL,
    severity TEXT DEFAULT 'INFO' NOT NULL, -- INFO | WARNING | CRITICAL
    details JSONB DEFAULT '{}'::jsonb,
    risk_score INTEGER DEFAULT 0 NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON public.audit_logs (tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- Apply WORM trigger to prevent modifications/deletions
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'MANDATORY AUDIT COMPLIANCE: Audit logs are immutable and cannot be updated or deleted.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_tampering ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_tampering
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_tampering();
