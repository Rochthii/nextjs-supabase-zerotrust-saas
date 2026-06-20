-- ==============================================================================
-- FILE: supabase/seed_saas_core.sql
-- VERSION: 2.0.0 (B2B SaaS Security & Tenant Isolation Core Seed Data)
-- PURPOSE: Inserts standard B2B mock data for tenant isolation and routing tests.
-- ==============================================================================

BEGIN;

-- 1. SEED CORPORATE TENANTS (Without deleted columns like province_id)
INSERT INTO public.tenants (
    id, domain, name, subdomain, layout_style, theme_colors, logo_url,
    contact_info, tenant_type, plan_type, lifecycle_status, modules_config
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'acme-corp.tenantshield.dev', 
        'Acme Corporation Headquarters', 
        'acme-hq', 
        'modern_tech', 
        '{"primary":"#0F172A", "secondary":"#3B82F6", "bgStart":"#F8FAFC"}',
        null, 
        '{"phone":"028-39300000","email":"contact@acme-corp.com"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true}'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'chicago.acme.com', 
        'Acme Corp - Chicago Branch', 
        'acme-chicago', 
        'saas_violet', 
        '{"primary":"#6D28D9", "secondary":"#10B981", "bgStart":"#F5F3FF"}',
        null, 
        '{"phone":"024-39400000","email":"chicago@acme-corp.com"}', 
        'company', 
        'pro', 
        'active',
        '{"users":true,"analytics":true,"settings":true}'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'globex.tenantshield.dev', 
        'Globex Corporation', 
        'globex', 
        'modern_tech', 
        '{"primary":"#0284C7", "secondary":"#F59E0B", "bgStart":"#F0F9FF"}',
        null, 
        '{"phone":"028-39500000","email":"contact@globex.io"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true}'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED INITIAL SYSTEM SETTINGS
INSERT INTO public.settings (key, value)
VALUES 
    ('system_name', 'B2B SaaS Secure Core'),
    ('allow_registrations', 'true'),
    ('global_mfa_required', 'false')
ON CONFLICT (key) DO NOTHING;

COMMIT;
