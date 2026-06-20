-- ==============================================================================
-- FILE: supabase/seed_demo_preview.sql
-- VERSION: 3.0.0 (TenantShield Enterprise Security & Live Sandbox Demo Seed Data)
-- PURPOSE: Inserts comprehensive, highly realistic mock data to demonstrate RLS,
--          WORM immutable audits, RBAC permissions, and SOAR Edge Active Defense.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- CLEAN OLD DEMO DATA
-- ------------------------------------------------------------------------------
DELETE FROM public.blocked_ips WHERE ip IN ('198.51.100.42', '203.0.113.88', '185.220.101.44', '103.88.22.19', '45.143.203.111', '192.0.2.1', '198.51.100.7', '203.0.113.12', '82.102.23.4', '91.240.118.22', '109.244.12.89', '145.224.12.33', '178.12.98.55', '195.22.44.88', '210.14.88.99', '220.24.12.11');
DELETE FROM public.rate_limit_hits;
DELETE FROM public.active_visitors;
DELETE FROM public.site_settings WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
DELETE FROM public.audit_logs;
DELETE FROM public.tenant_members WHERE user_id IN (
    'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3',
    'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a1', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a1', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a2'
);
DELETE FROM auth.users WHERE email IN (
    'superadmin@tenantshield.dev',
    'admin@acme.com', 'editor@acme.com', 'viewer@acme.com',
    'admin@legalcorp.com', 'viewer@legalcorp.com',
    'admin@fintrust.com', 'accountant@fintrust.com'
);
DELETE FROM public.tenants WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');

-- ------------------------------------------------------------------------------
-- 1. SEED COMPLIANCE-GRADE TENANTS (3 Tenants matching target markets)
-- ------------------------------------------------------------------------------
INSERT INTO public.tenants (
    id, domain, name, subdomain, layout_style, theme_colors, logo_url,
    contact_info, tenant_type, plan_type, lifecycle_status, modules_config
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'acme.tenantshield.dev', 
        'Acme Healthcare Inc.', 
        'acme', 
        'modern_tech', 
        '{"primary":"#0F172A", "secondary":"#3B82F6", "bgStart":"#F8FAFC"}',
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=128&h=128&fit=crop', 
        '{"phone":"+1-800-555-0144","email":"security@acme-healthcare.com"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":true}'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'legalcorp.tenantshield.dev', 
        'LegalCorp LLP', 
        'legalcorp', 
        'saas_violet', 
        '{"primary":"#1E3A8A", "secondary":"#10B981", "bgStart":"#F3F4F6"}',
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=128&h=128&fit=crop', 
        '{"phone":"+1-800-555-0211","email":"compliance@legalcorp.com"}', 
        'company', 
        'pro', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":false}'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'fintrust.tenantshield.dev', 
        'FinTrust Bank & Trust', 
        'fintrust', 
        'modern_tech', 
        '{"primary":"#022C22", "secondary":"#F59E0B", "bgStart":"#ECFDF5"}',
        'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=128&h=128&fit=crop', 
        '{"phone":"+1-800-555-9000","email":"cybersec@fintrustbank.com"}', 
        'company', 
        'enterprise', 
        'active',
        '{"users":true,"analytics":true,"settings":true,"ai_chat":true}'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SEED SYSTEM & TENANT SETTINGS
-- ------------------------------------------------------------------------------
INSERT INTO public.settings (key, value)
VALUES 
    ('system_name', 'TenantShield Security Command Center'),
    ('allow_registrations', 'false'),
    ('global_mfa_required', 'true')
ON CONFLICT (key) DO NOTHING;

-- Tenant Specific Site Settings (Demonstrating configuration whitelisting & RLS)
INSERT INTO public.site_settings (key, tenant_id, value, description)
VALUES
    ('ip_lockdown_enabled', '11111111-1111-1111-1111-111111111111', 'false', 'Restrict application access to office IP range.'),
    ('compliance_level', '11111111-1111-1111-1111-111111111111', 'HIPAA', 'Active regulation standards governing this tenant.'),
    ('ip_lockdown_enabled', '22222222-2222-2222-2222-222222222222', 'false', 'Restrict application access to office IP range.'),
    ('compliance_level', '22222222-2222-2222-2222-222222222222', 'SOC2_TYPE_II', 'Active regulation standards governing this tenant.'),
    ('ip_lockdown_enabled', '33333333-3333-3333-3333-333333333333', 'true', 'Restrict banking dashboard to corporate office IP range.'),
    ('office_ip_whitelist', '33333333-3333-3333-3333-333333333333', '192.168.10.0/24,203.0.113.0/24', 'Allowed IP list for corporate access.'),
    ('compliance_level', '33333333-3333-3333-3333-333333333333', 'PCI-DSS_LEVEL_1', 'Active regulation standards governing this tenant.')
ON CONFLICT (key, tenant_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SEED AUTH USERS, USER PROFILES, TENANT MEMBERS & ROLES
-- ------------------------------------------------------------------------------

-- Insert into auth.users (Using extensions.crypt for secure, real passwords)
-- password 'SuperAdmin@123' for global admin, 'Member@123' for tenant users.
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    role, aud, confirmation_token
)
VALUES
    ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'superadmin@tenantshield.dev', extensions.crypt('SuperAdmin@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "CSO Global Administrator"}', now(), now(), 'authenticated', 'authenticated', ''),
    
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'admin@acme.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Sarah Jenkins (Acme Admin)"}', now(), now(), 'authenticated', 'authenticated', ''),
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2', 'editor@acme.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "James Cole (Acme Health Editor)"}', now(), now(), 'authenticated', 'authenticated', ''),
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3', 'viewer@acme.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Nurse Kelly (Acme Healthcare Reader)"}', now(), now(), 'authenticated', 'authenticated', ''),
    
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a1', 'admin@legalcorp.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Harvey Specter (LegalCorp Partner)"}', now(), now(), 'authenticated', 'authenticated', ''),
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'viewer@legalcorp.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Mike Ross (Legal Associate)"}', now(), now(), 'authenticated', 'authenticated', ''),
    
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a1', 'admin@fintrust.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Alexander Hamilton (FinTrust CISO)"}', now(), now(), 'authenticated', 'authenticated', ''),
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a2', 'accountant@fintrust.com', extensions.crypt('Member@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Elizabeth Schuyler (FinTrust Lead Accountant)"}', now(), now(), 'authenticated', 'authenticated', '')
ON CONFLICT (id) DO NOTHING;

-- Synchronize User Profiles
INSERT INTO public.user_profiles (id, full_name, preferred_tenant_id)
VALUES
    ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'CSO Global Administrator', NULL),
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Dr. Sarah Jenkins', '11111111-1111-1111-1111-111111111111'),
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2', 'James Cole', '11111111-1111-1111-1111-111111111111'),
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3', 'Nurse Kelly', '11111111-1111-1111-1111-111111111111'),
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a1', 'Harvey Specter', '22222222-2222-2222-2222-222222222222'),
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Mike Ross', '22222222-2222-2222-2222-222222222222'),
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a1', 'Alexander Hamilton', '33333333-3333-3333-3333-333333333333'),
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a2', 'Elizabeth Schuyler', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, preferred_tenant_id = EXCLUDED.preferred_tenant_id;

-- Tenant Members (Split logic - links user to isolated tenant space)
INSERT INTO public.tenant_members (id, user_id, tenant_id)
VALUES
    ('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', NULL), -- Global SuperAdmin
    
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111'),
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2', '11111111-1111-1111-1111-111111111111'),
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e3', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3', '11111111-1111-1111-1111-111111111111'),
    
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e1', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a1', '22222222-2222-2222-2222-222222222222'),
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', '22222222-2222-2222-2222-222222222222'),
    
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e1', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a1', '33333333-3333-3333-3333-333333333333'),
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e2', 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a2', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Tenant Member Roles (Assign RBAC system roles)
INSERT INTO public.tenant_member_roles (member_id, role_id)
VALUES
    ('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', 'super_admin'),
    
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'tenant_admin'),
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e2', 'tenant_editor'),
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e3', 'viewer'),
    
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e1', 'tenant_admin'),
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'viewer'),
    
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e1', 'tenant_admin'),
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e2', 'tenant_accountant')
ON CONFLICT (member_id, role_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. SEED ACTIVE DEFENSE & BLOCKED IPS (15 IPs)
-- ------------------------------------------------------------------------------
INSERT INTO public.blocked_ips (id, ip, tenant_id, blocked_until, reason, created_by)
VALUES
    (extensions.uuid_generate_v4(), '185.220.101.44', null, clock_timestamp() + INTERVAL '7 days', 'Global block: Brute-force scanning matching Tor exit node signature.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '103.88.22.19', null, clock_timestamp() + INTERVAL '24 hours', 'Global block: Host scanning/SQL Injection probes on public endpoints.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '45.143.203.111', null, clock_timestamp() + INTERVAL '30 days', 'Global block: Botnet DDoS agent identified on system-wide API paths.', 'superadmin@tenantshield.dev'),
    
    (extensions.uuid_generate_v4(), '192.0.2.1', '11111111-1111-1111-1111-111111111111', clock_timestamp() + INTERVAL '2 hours', 'Tenant block: High-frequency scraping requests exceeding rate limits.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '198.51.100.7', '11111111-1111-1111-1111-111111111111', clock_timestamp() + INTERVAL '12 hours', 'Tenant block: Unauthorized XSS payload injected in patient settings form.', 'SOAR Active Defense Engine'),
    
    (extensions.uuid_generate_v4(), '203.0.113.12', '22222222-2222-2222-2222-222222222222', clock_timestamp() + INTERVAL '3 hours', 'Tenant block: IP address whitelisting enforcement mismatch.', 'admin@legalcorp.com'),
    (extensions.uuid_generate_v4(), '82.102.23.4', '22222222-2222-2222-2222-222222222222', clock_timestamp() + INTERVAL '1 day', 'Tenant block: Host scanning attempt targeting court documents schema.', 'SOAR Active Defense Engine'),
    
    (extensions.uuid_generate_v4(), '91.240.118.22', '33333333-3333-3333-3333-333333333333', clock_timestamp() + INTERVAL '60 days', 'Tenant block: Repeated failed transaction authorization requests.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '109.244.12.89', '33333333-3333-3333-3333-333333333333', clock_timestamp() + INTERVAL '5 days', 'Tenant block: Mismatching MFA token flood on audit log views.', 'SOAR Active Defense Engine'),
    
    (extensions.uuid_generate_v4(), '145.224.12.33', null, clock_timestamp() + INTERVAL '15 days', 'Global block: Credential stuffing attempt on admin login path.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '178.12.98.55', null, clock_timestamp() + INTERVAL '3 days', 'Global block: SQL injection patterns caught in path parameter.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '195.22.44.88', '11111111-1111-1111-1111-111111111111', clock_timestamp() + INTERVAL '4 hours', 'Tenant block: Excessive session initiation attempts.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '210.14.88.99', '33333333-3333-3333-3333-333333333333', clock_timestamp() + INTERVAL '6 hours', 'Tenant block: Non-whitelisted subnet accessing banking backend.', 'SOAR Active Defense Engine'),
    (extensions.uuid_generate_v4(), '220.24.12.11', null, clock_timestamp() + INTERVAL '12 hours', 'Global block: Anomalous crawler scraping developer docs.', 'superadmin@tenantshield.dev')
ON CONFLICT DO NOTHING;

-- Seed Rate Limit Hits (For realistic graph/dashboard visualization)
INSERT INTO public.rate_limit_hits (ip_address, action_type, hit_count, last_hit, tenant_id, identifier, action)
VALUES
    ('185.220.101.44', 'api_request', 150, clock_timestamp(), null, '185.220.101.44', 'api_request'),
    ('103.88.22.19', 'login_attempt', 45, clock_timestamp(), null, '103.88.22.19', 'login_attempt'),
    ('45.143.203.111', 'db_query', 220, clock_timestamp(), null, '45.143.203.111', 'db_query'),
    ('192.0.2.1', 'api_request', 80, clock_timestamp(), '11111111-1111-1111-1111-111111111111', '192.0.2.1', 'api_request'),
    ('203.0.113.12', 'api_request', 95, clock_timestamp(), '22222222-2222-2222-2222-222222222222', '203.0.113.12', 'api_request');

-- Seed Real-time active visitors monitoring
INSERT INTO public.active_visitors (session_hash, path)
VALUES
    ('hash_visitor_1', '/admin/security-center'),
    ('hash_visitor_2', '/admin/tenants'),
    ('hash_visitor_3', '/admin/audit-logs'),
    ('hash_visitor_4', '/acme/dashboard');

-- ------------------------------------------------------------------------------
-- 5. IMMUTABLE SECURITY AUDIT LOGS LEDGER (WORM) (100 Logs)
--    Injects structured, timeline-spaced records with various risk scores.
-- ------------------------------------------------------------------------------

-- We write explicit audit logs spanning the last 24 hours to generate stunning charts
INSERT INTO public.audit_logs (id, user_email, action, resource, severity, details, tenant_id, ip_address, risk_score, created_at)
VALUES
    -- Hour -24 to Hour -20 (Routine logins and admin operations)
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'user_login_success', 'auth', 'INFO', '{"status":"success", "method":"mfa_app", "details":"Secure CISO session active."}', null, '192.168.1.10', 0, clock_timestamp() - INTERVAL '24 hours'),
    (extensions.uuid_generate_v4(), 'admin@acme.com', 'user_login_success', 'auth', 'INFO', '{"status":"success", "details":"Acme Admin console loaded."}', '11111111-1111-1111-1111-111111111111', '192.168.10.4', 0, clock_timestamp() - INTERVAL '23 hours'),
    (extensions.uuid_generate_v4(), 'admin@acme.com', 'user_created', 'team_management', 'INFO', '{"status":"success", "created_email":"editor@acme.com"}', '11111111-1111-1111-1111-111111111111', '192.168.10.4', 5, clock_timestamp() - INTERVAL '22 hours'),
    (extensions.uuid_generate_v4(), 'admin@acme.com', 'role_changed', 'rbac_permissions', 'INFO', '{"email":"editor@acme.com", "new_role":"tenant_editor"}', '11111111-1111-1111-1111-111111111111', '192.168.10.4', 15, clock_timestamp() - INTERVAL '22 hours'),
    (extensions.uuid_generate_v4(), 'admin@legalcorp.com', 'user_login_success', 'auth', 'INFO', '{"status":"success", "details":"LegalCorp Admin console loaded."}', '22222222-2222-2222-2222-222222222222', '10.0.1.44', 0, clock_timestamp() - INTERVAL '21 hours'),
    (extensions.uuid_generate_v4(), 'admin@fintrust.com', 'user_login_success', 'auth', 'INFO', '{"status":"success", "details":"FinTrust Admin console loaded."}', '33333333-3333-3333-3333-333333333333', '10.200.1.2', 0, clock_timestamp() - INTERVAL '20 hours'),
    
    -- Hour -19 to Hour -16 (Threat actions: blocks, violations, rate limits)
    (extensions.uuid_generate_v4(), null, 'brute_force_detected', 'active_defense', 'WARNING', '{"ip":"185.220.101.44", "attempts":25, "endpoint":"/login"}', null, '185.220.101.44', 55, clock_timestamp() - INTERVAL '19 hours'),
    (extensions.uuid_generate_v4(), null, 'ip_blocked', 'active_defense', 'CRITICAL', '{"ip":"185.220.101.44", "reason":"Repeated brute force auth attempts.", "duration":"7 days"}', null, '185.220.101.44', 85, clock_timestamp() - INTERVAL '19 hours'),
    (extensions.uuid_generate_v4(), 'editor@acme.com', 'user_login_success', 'auth', 'INFO', '{"status":"success"}', '11111111-1111-1111-1111-111111111111', '192.168.10.15', 0, clock_timestamp() - INTERVAL '18 hours'),
    (extensions.uuid_generate_v4(), 'editor@acme.com', 'document_created', 'patient_records', 'INFO', '{"status":"success", "patient_id":"pat-902", "schema":"medical_records"}', '11111111-1111-1111-1111-111111111111', '192.168.10.15', 5, clock_timestamp() - INTERVAL '17 hours'),
    (extensions.uuid_generate_v4(), 'viewer@legalcorp.com', 'user_login_success', 'auth', 'INFO', '{"status":"success"}', '22222222-2222-2222-2222-222222222222', '10.0.1.92', 0, clock_timestamp() - INTERVAL '16 hours'),
    (extensions.uuid_generate_v4(), 'viewer@legalcorp.com', 'document_read', 'legal_briefs', 'INFO', '{"status":"success", "brief_id":"brief-001"}', '22222222-2222-2222-2222-222222222222', '10.0.1.92', 0, clock_timestamp() - INTERVAL '16 hours'),
    
    -- Hour -15 to Hour -12 (WORM violations and Active defense alerts)
    (extensions.uuid_generate_v4(), 'viewer@legalcorp.com', 'tamper_attempt_worm', 'database_worm', 'CRITICAL', '{"attempt":"UPDATE audit_logs", "error":"MANDATORY AUDIT COMPLIANCE: Audit logs are immutable and cannot be updated or deleted."}', '22222222-2222-2222-2222-222222222222', '10.0.1.92', 95, clock_timestamp() - INTERVAL '15 hours'),
    (extensions.uuid_generate_v4(), null, 'rate_limit_exceeded', 'rate_limiting', 'WARNING', '{"ip":"192.0.2.1", "action":"api_request", "hits":80}', '11111111-1111-1111-1111-111111111111', '192.0.2.1', 40, clock_timestamp() - INTERVAL '14 hours'),
    (extensions.uuid_generate_v4(), null, 'ip_blocked', 'active_defense', 'WARNING', '{"ip":"192.0.2.1", "reason":"Rate limit exceeded.", "duration":"2 hours"}', '11111111-1111-1111-1111-111111111111', '192.0.2.1', 50, clock_timestamp() - INTERVAL '14 hours'),
    (extensions.uuid_generate_v4(), 'admin@fintrust.com', 'settings_updated', 'system_config', 'WARNING', '{"key":"ip_lockdown_enabled", "value":"true", "reason":"Strict compliance configuration"}', '33333333-3333-3333-3333-333333333333', '10.200.1.2', 30, clock_timestamp() - INTERVAL '13 hours'),
    (extensions.uuid_generate_v4(), 'admin@fintrust.com', 'whitelist_updated', 'system_config', 'WARNING', '{"whitelist":"192.168.10.0/24,203.0.113.0/24"}', '33333333-3333-3333-3333-333333333333', '10.200.1.2', 30, clock_timestamp() - INTERVAL '12 hours'),
    
    -- Hour -11 to Hour -8 (Cross-tenant RLS isolation attacks blocked by RLS)
    (extensions.uuid_generate_v4(), 'viewer@legalcorp.com', 'cross_tenant_access_attempt', 'database_rls', 'CRITICAL', '{"target_tenant_id":"11111111-1111-1111-1111-111111111111", "query":"SELECT * FROM public.patient_records", "verdict":"BLOCKED_BY_RLS"}', '22222222-2222-2222-2222-222222222222', '10.0.1.92', 98, clock_timestamp() - INTERVAL '10 hours'),
    (extensions.uuid_generate_v4(), 'accountant@fintrust.com', 'user_login_success', 'auth', 'INFO', '{"status":"success"}', '33333333-3333-3333-3333-333333333333', '203.0.113.8', 0, clock_timestamp() - INTERVAL '9 hours'),
    (extensions.uuid_generate_v4(), 'accountant@fintrust.com', 'ledger_read', 'financials', 'INFO', '{"status":"success", "total_records":250}', '33333333-3333-3333-3333-333333333333', '203.0.113.8', 0, clock_timestamp() - INTERVAL '8 hours'),
    
    -- Hour -7 to Hour -4 (XSS payloads & Web Application Firewall edge blocks)
    (extensions.uuid_generate_v4(), null, 'malicious_payload_detected', 'waf_firewall', 'CRITICAL', '{"ip":"198.51.100.7", "parameter":"username", "payload":"<script>alert(document.cookie)</script>"}', '11111111-1111-1111-1111-111111111111', '198.51.100.7', 90, clock_timestamp() - INTERVAL '7 hours'),
    (extensions.uuid_generate_v4(), null, 'ip_blocked', 'active_defense', 'CRITICAL', '{"ip":"198.51.100.7", "reason":"XSS injection signature detected.", "duration":"12 hours"}', '11111111-1111-1111-1111-111111111111', '198.51.100.7', 85, clock_timestamp() - INTERVAL '7 hours'),
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'backup_initiated', 'database_ops', 'INFO', '{"status":"success", "destination":"worm_bucket_asia"}', null, '192.168.1.10', 10, clock_timestamp() - INTERVAL '6 hours'),
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'hash_ledger_validated', 'database_compliance', 'INFO', '{"status":"success", "total_blocks":1580, "hash_chain_matched":true}', null, '192.168.1.10', 0, clock_timestamp() - INTERVAL '5 hours'),
    
    -- Hour -3 to clock_timestamp() (Recent activities)
    (extensions.uuid_generate_v4(), 'admin@acme.com', 'user_login_success', 'auth', 'INFO', '{"status":"success"}', '11111111-1111-1111-1111-111111111111', '192.168.10.4', 0, clock_timestamp() - INTERVAL '3 hours'),
    (extensions.uuid_generate_v4(), 'admin@acme.com', 'site_config_updated', 'tenant_settings', 'INFO', '{"theme_colors":{"primary":"#0F172A"}}', '11111111-1111-1111-1111-111111111111', '192.168.10.4', 5, clock_timestamp() - INTERVAL '2 hours'),
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'user_login_success', 'auth', 'INFO', '{"status":"success", "details":"Routine security check."}', null, '192.168.1.10', 0, clock_timestamp() - INTERVAL '1 hour'),
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'threat_simulator_fired', 'soc_sandbox', 'WARNING', '{"triggered_by":"superadmin@tenantshield.dev", "attack_signature":"SQLi Probes"}', null, '192.168.1.10', 50, clock_timestamp() - INTERVAL '30 minutes'),
    (extensions.uuid_generate_v4(), 'superadmin@tenantshield.dev', 'ciso_pdf_report_generated', 'compliance_reporting', 'INFO', '{"status":"success", "pages":3}', null, '192.168.1.10', 0, clock_timestamp() - INTERVAL '10 minutes');

-- Bulk insert extra logs to hit the ~80-100 target and populate charts nicely
-- We use loops or recursive SELECT to insert bulk variations of standard transactions
INSERT INTO public.audit_logs (user_email, action, resource, severity, details, tenant_id, ip_address, risk_score, created_at)
SELECT
    CASE (g.i % 3)
        WHEN 0 THEN 'viewer@acme.com'
        WHEN 1 THEN 'viewer@legalcorp.com'
        ELSE 'accountant@fintrust.com'
    END as user_email,
    'document_read' as action,
    'data_records' as resource,
    'INFO' as severity,
    json_build_object('record_index', g.i, 'status', 'success') as details,
    CASE (g.i % 3)
        WHEN 0 THEN '11111111-1111-1111-1111-111111111111'::UUID
        WHEN 1 THEN '22222222-2222-2222-2222-222222222222'::UUID
        ELSE '33333333-3333-3333-3333-333333333333'::UUID
    END as tenant_id,
    ('192.168.1.' || (g.i % 250))::INET as ip_address,
    0 as risk_score,
    clock_timestamp() - (g.i || ' minutes')::INTERVAL as created_at
FROM generate_series(1, 60) g(i);

-- Bulk insert security alerts to ensure SOC charts are beautiful (WARNING and CRITICAL)
INSERT INTO public.audit_logs (user_email, action, resource, severity, details, tenant_id, ip_address, risk_score, created_at)
SELECT
    null as user_email,
    CASE (g.i % 5)
        WHEN 0 THEN 'brute_force_attempt'
        WHEN 1 THEN 'rate_limit_violation'
        WHEN 2 THEN 'suspicious_login_attempt'
        WHEN 3 THEN 'blocked_ip_activity'
        ELSE 'tenant_access_denied'
    END as action,
    'active_defense' as resource,
    CASE (g.i % 3)
        WHEN 0 THEN 'WARNING'
        ELSE 'CRITICAL'
    END as severity,
    json_build_object(
        'ip', '198.51.100.' || (g.i * 5),
        'reason', 'Suspicious security threat footprint detected.',
        'severity_score', g.i * 3
    ) as details,
    CASE (g.i % 4)
        WHEN 0 THEN '11111111-1111-1111-1111-111111111111'::UUID
        WHEN 1 THEN '22222222-2222-2222-2222-222222222222'::UUID
        WHEN 2 THEN '33333333-3333-3333-3333-333333333333'::UUID
        ELSE null -- Global Security Center Alerts
    END as tenant_id,
    ('198.51.100.' || (g.i * 5))::INET as ip_address,
    30 + (g.i * 2) as risk_score,
    clock_timestamp() - (g.i * 15 || ' minutes')::INTERVAL as created_at
FROM generate_series(1, 25) g(i);

COMMIT;
