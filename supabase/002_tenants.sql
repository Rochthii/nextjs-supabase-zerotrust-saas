-- ==============================================================================
-- FILE: supabase/002_tenants.sql
-- PURPOSE: Initialize tenants, settings, site settings, and cron job tables.
-- ==============================================================================

-- 1. Initialize Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    domain VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    subdomain VARCHAR UNIQUE,
    layout_style VARCHAR DEFAULT 'traditional',
    theme_colors JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    layout_blocks JSONB DEFAULT '[]'::jsonb,
    modules_config JSONB DEFAULT '{}'::jsonb,
    has_web_frontend BOOLEAN DEFAULT TRUE NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address_vi TEXT,
    geog extensions.geography(Point, 4326),
    parent_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    centralized_finance BOOLEAN DEFAULT FALSE NOT NULL,
    nav_visibility JSONB DEFAULT '{}'::jsonb,
    tenant_type TEXT DEFAULT 'company' NOT NULL, -- company | tenant | ngo
    plan_type TEXT DEFAULT 'free' NOT NULL,       -- free | pro | enterprise
    lifecycle_status TEXT DEFAULT 'active' NOT NULL -- active | suspended | offboarding
);

-- Create mandatory indexes for high-speed dynamic domain routing at CDN Edge
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON public.tenants (domain);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants (subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_geog ON public.tenants USING gist (geog);

-- 2. Initialize system settings table (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Initialize tenant site settings table (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (key, tenant_id)
);

-- 4. Initialize cron job logs table (cron_job_logs)
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    duration_ms INTEGER,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_name_date ON public.cron_job_logs (job_name, executed_at DESC);
