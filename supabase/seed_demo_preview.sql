-- ==============================================================================
-- FILE: supabase/seed_demo_preview.sql
-- VERSION: 1.0.0 (B2B SaaS Security & Active Defense Live Demo Seed Data)
-- PURPOSE: Inserts comprehensive mock data to demonstrate RLS, WORM audits,
--          blocked IPs management, and real-time active defense alerts on Live Demo.
-- ==============================================================================

BEGIN;

-- 1. SEED CORPORATE TENANTS (Including standard & suspended states)
INSERT INTO public.tenants (
    id, domain, name, subdomain, layout_style, theme_colors, logo_url,
    contact_info, tenant_type, plan_type, lifecycle_status, modules_config
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'nexus.yourdomain.com', 
        'Alpha Nexus Corp (HQ)', 
        'nexus', 
        'modern_tech', 
        '{"primary":"#0F172A", "secondary":"#3B82F6", "bgStart":"#F8FAFC"}',
        null, 
        '{"phone":"+1-555-0199","email":"security@nexus.corp"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":true}'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'hanoi.yourdomain.com', 
        'Nexus Hanoi Branch', 
        'hanoi', 
        'saas_violet', 
        '{"primary":"#6D28D9", "secondary":"#10B981", "bgStart":"#F5F3FF"}',
        null, 
        '{"phone":"+84-24-39400000","email":"hanoi@nexus.corp"}', 
        'company', 
        'pro', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":false}'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'betatech.yourdomain.com', 
        'Beta Tech Corporation', 
        'betatech', 
        'modern_tech', 
        '{"primary":"#0284C7", "secondary":"#F59E0B", "bgStart":"#F0F9FF"}',
        null, 
        '{"phone":"+1-555-0144","email":"info@betatech.io"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":true}'
    ),
    (
        '44444444-4444-4444-4444-444444444444', 
        'malicious-retail.yourdomain.com', 
        'Suspended Compromised Tenant', 
        'compromised', 
        'modern_tech', 
        '{"primary":"#B91C1C", "secondary":"#F59E0B", "bgStart":"#FEF2F2"}',
        null, 
        '{"phone":"+1-555-9999","email":"hacker@compromised.com"}', 
        'company', 
        'free', 
        'suspended', -- This tenant will be blocked at edge by middleware
        '{"users":false,"analytics":false,"settings":false}'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED SYSTEM SETTINGS
INSERT INTO public.settings (key, value)
VALUES 
    ('system_name', 'NextSecure SOC Command Center'),
    ('allow_registrations', 'false'),
    ('global_mfa_required', 'true')
ON CONFLICT (key) DO NOTHING;

-- 3. SEED BLOCKED IPS (Active Threat Database)
INSERT INTO public.blocked_ips (id, ip, tenant_id, blocked_until, reason, created_by)
VALUES
    (
        'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
        '198.51.100.42',
        null,
        clock_timestamp() + INTERVAL '7 days',
        'Global block: Repeated SQL injection attempts detected on /api/auth endpoints.',
        'SOAR Active Defense Engine'
    ),
    (
        'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
        '203.0.113.88',
        '11111111-1111-1111-1111-111111111111',
        clock_timestamp() + INTERVAL '24 hours',
        'Tenant block: High-frequency API scraping request flood (>100 req/sec).',
        'SOAR Active Defense Engine'
    ),
    (
        'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
        '185.190.140.10',
        null,
        clock_timestamp() + INTERVAL '30 days',
        'IP flagged on global threat intelligence feeds (Known malicious botnet).',
        'admin@saas.core'
    )
ON CONFLICT (ip, tenant_id) DO NOTHING;

-- 4. SEED RATE LIMIT HITS
INSERT INTO public.rate_limit_hits (ip_address, action_type, hit_count, last_hit, tenant_id, identifier, action)
VALUES
    ('198.51.100.42', 'api_request', 150, clock_timestamp(), null, '198.51.100.42', 'api_request'),
    ('203.0.113.88', 'login_attempt', 45, clock_timestamp(), '11111111-1111-1111-1111-111111111111', '203.0.113.88', 'login_attempt'),
    ('185.190.140.10', 'db_query', 220, clock_timestamp(), null, '185.190.140.10', 'db_query');

-- 5. SEED IMMUTABLE AUDIT LOGS (WORM Vault)
-- Insert diverse logs with different severity levels (INFO, WARNING, CRITICAL)
INSERT INTO public.audit_logs (
    id, action, resource, severity, details, tenant_id, user_email, ip_address, risk_score
)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111',
        'user_login_success',
        'auth',
        'INFO',
        '{"status":"success", "method":"mfa_app", "user":"admin@saas.core"}',
        null,
        'admin@saas.core',
        '192.168.1.10',
        0
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'tenant_suspension_enforced',
        'tenant_policy',
        'CRITICAL',
        '{"reason":"Unpaid balance and multiple security breaches", "tenant_id":"44444444-4444-4444-4444-444444444444"}',
        '44444444-4444-4444-4444-444444444444',
        'admin@saas.core',
        '127.0.0.1',
        85
    ),
    (
        'e3333333-3333-3333-3333-333333333333',
        'cross_tenant_access_attempt',
        'database_rls',
        'CRITICAL',
        '{"target_tenant":"11111111-1111-1111-1111-111111111111", "attempted_by":"hacker@compromised.com", "query":"SELECT * FROM public.transactions"}',
        '44444444-4444-4444-4444-444444444444',
        'hacker@compromised.com',
        '198.51.100.42',
        98
    ),
    (
        'e4444444-4444-4444-4444-444444444444',
        'brute_force_blocked',
        'active_defense',
        'WARNING',
        '{"ip":"203.0.113.88", "attempts_blocked":15, "endpoint":"/api/auth/callback"}',
        '11111111-1111-1111-1111-111111111111',
        null,
        '203.0.113.88',
        60
    ),
    (
        'e5555555-5555-5555-5555-555555555555',
        'settings_modified',
        'system_config',
        'INFO',
        '{"key":"global_mfa_required", "old_value":"false", "new_value":"true"}',
        null,
        'admin@saas.core',
        '192.168.1.10',
        10
    );

-- 6. SEED ACTIVE VISITORS (Real-time Simulation)
INSERT INTO public.active_visitors (session_hash, path)
VALUES
    ('hash_visitor_1', '/admin/security-center'),
    ('hash_visitor_2', '/admin/tenants'),
    ('hash_visitor_3', '/admin/audit-logs'),
    ('hash_visitor_4', '/nexus/dashboard');

COMMIT;
