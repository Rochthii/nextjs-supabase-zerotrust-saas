import { createClient as createStaticClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { BlockConfig } from '@/lib/types/layout-blocks';

export interface TenantConfig {
    id: string;
    domain: string;
    name: string;
    subdomain: string | null;
    tenant_type: 'tenant' | 'company' | 'ngo';
    layout_style: string;
    theme_colors: Record<string, string> | null;
    logo_url: string | null;
    parent_id: string | null;
    contact_info: Record<string, any> | null;
    layout_blocks: BlockConfig[] | null;
    modules_config?: Record<string, boolean>; // Plug-and-Play Feature
}

export const getTenantConfig = async (domain: string): Promise<TenantConfig | null> => {
    return unstable_cache(
        async () => {
            // We use the static client because this might run in a scenario without auth context (like root layout)
            const supabase = createStaticClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            try {
                // Standardize hostname (e.g. chuaphuly.localhost:3000 -> localhost:3000)
                let lookupDomain = domain.includes('localhost') ? 'localhost:3000' : domain;

                // If running locally, automatically map to Acme Corp (acme-corp.tenantshield.dev) as default fallback
                if (lookupDomain === 'localhost:3000') {
                    lookupDomain = 'acme-corp.tenantshield.dev';
                }

                // 1. Prioritize finding exact match by Domain
                let result = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('domain', lookupDomain)
                    .maybeSingle();

                // 2. If not found, attempt lookup by ID (to support tenant_id query param)
                if (!result.data) {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookupDomain);
                    if (isUuid) {
                        result = await supabase
                            .from('tenants')
                            .select('*')
                            .eq('id', lookupDomain)
                            .maybeSingle();
                    }
                }

                // 3. If still not found, attempt lookup by Subdomain
                if (!result.data) {
                    const subdomainMatch = domain.match(/^([^.]+)\.(localhost:3000|.*\.vercel\.app|vercel\.app|.*\.pages\.dev|pages\.dev)$/);
                    const extractedSubdomain = subdomainMatch ? subdomainMatch[1] : null;

                    if (extractedSubdomain && extractedSubdomain !== 'www' && extractedSubdomain !== 'localhost') {
                        result = await supabase
                            .from('tenants')
                            .select('*')
                            .eq('subdomain', extractedSubdomain)
                            .maybeSingle();
                    }
                }

                if (result.error) {
                    console.error('Database error fetching tenant:', domain, result.error);
                    throw new Error(`System Connection Error (Tenant Fetch: ${result.error.message})`);
                }

                return result.data as TenantConfig;
            } catch (e) {
                console.error('Critical crash in getTenantConfig:', e);
                throw e;
            }
        },
        ['tenant-config-final-v7', domain],
        {
            revalidate: false,
            tags: ['tenant-config', `tenant-config-${domain}`],
        }
    )();
};

