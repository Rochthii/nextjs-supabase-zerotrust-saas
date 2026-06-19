-- ==============================================================================
-- FILE: supabase/007_seed_permissions.sql
-- PURPOSE: Seed initial roles and permissions matrix in role_permissions table.
-- ==============================================================================

-- 1. Seed roles table
INSERT INTO public.roles (id, name, description)
VALUES 
    ('super_admin', '⚡ System Admin (Board of Directors)', 'Global system administration'),
    ('company_editor', '📢 Head of PR & Media', 'Global communications manager'),
    ('tenant_admin', '🏛️ Branch Director', 'Tenant-level owner and director'),
    ('tenant_editor', '✍️ Head of Content', 'Tenant content manager'),
    ('tenant_accountant', '💰 Chief Financial Officer (CFO)', 'Tenant financial administrator'),
    ('viewer', '👤 Staff Member', 'Read-only viewer')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. Seed role_permissions table
INSERT INTO public.role_permissions (role_id, resource, can_create, can_read, can_update, can_delete)
VALUES 
    -- super_admin: can do everything on all resources
    ('super_admin', 'users', true, true, true, true),
    ('super_admin', 'analytics', true, true, true, true),
    ('super_admin', 'tenants', true, true, true, true),
    ('super_admin', 'settings', true, true, true, true),

    -- company_editor: can read analytics and edit settings/media
    ('company_editor', 'users', false, true, false, false),
    ('company_editor', 'analytics', true, true, true, false),
    ('company_editor', 'tenants', false, true, false, false),
    ('company_editor', 'settings', true, true, true, false),

    -- tenant_admin: can manage users, analytics, and settings of their own tenant
    ('tenant_admin', 'users', true, true, true, true),
    ('tenant_admin', 'analytics', true, true, true, true),
    ('tenant_admin', 'tenants', false, true, false, false),
    ('tenant_admin', 'settings', true, true, true, false),

    -- tenant_editor: can read users/analytics and update settings
    ('tenant_editor', 'users', false, true, false, false),
    ('tenant_editor', 'analytics', false, true, false, false),
    ('tenant_editor', 'tenants', false, true, false, false),
    ('tenant_editor', 'settings', false, true, true, false),

    -- tenant_accountant: read-only access to users/settings, manage analytics (finance metrics)
    ('tenant_accountant', 'users', false, true, false, false),
    ('tenant_accountant', 'analytics', true, true, true, false),
    ('tenant_accountant', 'tenants', false, true, false, false),
    ('tenant_accountant', 'settings', false, true, false, false),

    -- viewer: read-only access to basic resources
    ('viewer', 'users', false, true, false, false),
    ('viewer', 'analytics', false, false, false, false),
    ('viewer', 'tenants', false, true, false, false),
    ('viewer', 'settings', false, true, false, false)
ON CONFLICT (role_id, resource) DO UPDATE
SET can_create = EXCLUDED.can_create,
    can_read = EXCLUDED.can_read,
    can_update = EXCLUDED.can_update,
    can_delete = EXCLUDED.can_delete;
