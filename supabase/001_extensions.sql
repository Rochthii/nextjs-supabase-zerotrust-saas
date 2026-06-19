-- ==============================================================================
-- FILE: supabase/001_extensions.sql
-- PURPOSE: Enable required extensions and schemas for the B2B SaaS core.
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable extension dependencies in the extensions schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Enable search extensions in the extensions schema
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
