-- ==============================================================================
-- FILE: supabase/003_auth_rbac.sql
-- PURPOSE: User Profiles, Roles, Permissions setup (RBAC v2 with Membership split)
-- ==============================================================================

-- 1. Extended user profiles table (user_profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    preferred_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred ON public.user_profiles (preferred_tenant_id) WHERE preferred_tenant_id IS NOT NULL;

-- 2. Roles lookup table (roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Tenant Members table (tenant_members) - Splits membership from roles
CREATE TABLE IF NOT EXISTS public.tenant_members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL for global/system-level memberships
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON public.tenant_members (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON public.tenant_members (tenant_id) WHERE tenant_id IS NOT NULL;

-- Ensure a user can only have one membership per tenant branch
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_members_user_tenant ON public.tenant_members (user_id, tenant_id) WHERE tenant_id IS NOT NULL;
-- Ensure a user can only have one global admin membership (where tenant_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_members_user_global ON public.tenant_members (user_id) WHERE tenant_id IS NULL;

-- 4. Tenant Member Roles junction table (tenant_member_roles)
CREATE TABLE IF NOT EXISTS public.tenant_member_roles (
    member_id UUID REFERENCES public.tenant_members(id) ON DELETE CASCADE NOT NULL,
    role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (member_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_member_roles_role ON public.tenant_member_roles (role_id);

-- 5. Role permissions lookup table (role_permissions)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    can_create BOOLEAN DEFAULT FALSE NOT NULL,
    can_read BOOLEAN DEFAULT TRUE NOT NULL,
    can_update BOOLEAN DEFAULT FALSE NOT NULL,
    can_delete BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (role_id, resource)
);

-- 6. Helper Functions to support RLS Policies (Security Definers secured against search_path hijack)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT r.role_id 
    FROM public.tenant_member_roles r
    JOIN public.tenant_members m ON r.member_id = m.id
    WHERE m.user_id = auth.uid() 
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id 
    FROM public.tenant_members
    WHERE user_id = auth.uid() AND tenant_id IS NOT NULL
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        WHERE m.user_id = auth.uid() 
          AND m.tenant_id IS NULL
          AND r.role_id IN ('super_admin', 'company_editor')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_authorized_admin(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        WHERE m.user_id = auth.uid() 
          AND (
              (m.tenant_id IS NULL AND r.role_id IN ('super_admin', 'company_editor'))
              OR (m.tenant_id = target_tenant_id AND r.role_id = 'tenant_admin')
          )
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_member_roles r
        JOIN public.tenant_members m ON r.member_id = m.id
        WHERE m.user_id = auth.uid() 
          AND r.role_id IN ('super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 7. Automatically sync newly created auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
    v_tenant_id UUID;
    v_member_id UUID;
BEGIN
    IF NEW.raw_user_meta_data ->> 'preferred_tenant_id' IS NOT NULL THEN
        v_tenant_id := (NEW.raw_user_meta_data ->> 'preferred_tenant_id')::UUID;
    END IF;

    INSERT INTO public.user_profiles (id, full_name, preferred_tenant_id)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        v_tenant_id
    )
    ON CONFLICT (id) DO NOTHING;

    -- If a tenant is associated, assign membership and default viewer role
    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO public.tenant_members (user_id, tenant_id)
        VALUES (NEW.id, v_tenant_id)
        RETURNING id INTO v_member_id;

        INSERT INTO public.tenant_member_roles (member_id, role_id)
        VALUES (v_member_id, 'viewer')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
