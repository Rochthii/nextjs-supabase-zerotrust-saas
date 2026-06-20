'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission, requireTenantAccess, requireSuperAdmin, getUserContext, getUserPermissions } from '@/lib/permissions';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { TenantSchema, formatZodError } from '@/lib/validations/admin';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { addDomainToVercel } from '@/lib/vercel';
import { DEFAULT_LAYOUT_BLOCKS, DEFAULT_COMPANY_BLOCKS, DEFAULT_TECH_BLOCKS } from '@/lib/types/layout-blocks';
import { getDefaultBlocksForStyle } from '@/lib/layout-presets';

export interface Tenant {
    id: string;
    name: string;
    domain: string;
    subdomain: string | null;
    layout_style: string | null;
    theme_colors: Record<string, string> | null;
    logo_url: string | null;
    contact_info: Record<string, any> | null;
    tenant_type: 'tenant' | 'company' | 'ngo';
    has_web_frontend: boolean;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    plan_type?: string | null;
    lifecycle_status?: string | null;
    modules_config?: Record<string, any> | null;
}

// ------- READ -------

export async function getTenants(): Promise<{ tenants: Tenant[]; error?: string }> {
    await requirePermission('tenants', 'read');
    const supabase = await createClient() as any;

    const userCtx = await getUserPermissions();
    const { getUserRole } = await import('@/lib/permissions');
    const role = await getUserRole();

    let query = supabase
        .from('tenants')
        .select('id, name, domain, subdomain, layout_style, layout_blocks, theme_colors, logo_url, contact_info, tenant_type, has_web_frontend, latitude, longitude, created_at, plan_type, lifecycle_status, modules_config');

    // Filter for agency_admin and company_editor: only see tenants with web frontend
    if (role === 'agency_admin' || role === 'company_editor') {
        query = query.eq('has_web_frontend', true);
    }

    const { data, error } = await query.order('name');

    if (error) return { tenants: [], error: error.message };
    return { tenants: (data as Tenant[]) || [] };
}

export async function getTenant(id: string): Promise<{ tenant: Tenant | null; error?: string }> {
    // Only require read tenants permission OR the user is admin of this specific tenant
    // However in admin context, if entering the page then middleware/requireTenantAccess has already blocked it
    const supabase = await createClient() as any;

    const { data, error } = await supabase
        .from('tenants')
        .select('id, name, domain, subdomain, layout_style, layout_blocks, theme_colors, logo_url, contact_info, tenant_type, has_web_frontend, latitude, longitude, created_at, plan_type, lifecycle_status, modules_config')
        .eq('id', id)
        .single();

    if (error) return { tenant: null, error: error.message };
    return { tenant: data as Tenant };
}

// ------- CREATE -------

export async function createTenant(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('users', 'create');

        const isAiPortal = formData.get('layout_style') === 'ai_portal';
        if (isAiPortal) {
            const ctx = await getUserContext();
            if (ctx?.role !== 'super_admin') {
                return { success: false, error: 'Only Super Admin is authorized to create an AI Portal.' };
            }
        }

        let cleanDomain = (formData.get('domain') as string || '').trim().toLowerCase();
        cleanDomain = cleanDomain.replace(/^(https?:\/\/)/, '');
        cleanDomain = cleanDomain.replace(/\/.*$/, '');

        const raw = {
            name: (formData.get('name') as string || '').trim(),
            domain: cleanDomain,
            subdomain: (formData.get('subdomain') as string) || null,
            layout_style: (formData.get('layout_style') as string) || 'saas_violet',
            logo_url: (formData.get('logo_url') as string) || null,
            tenant_type: (formData.get('tenant_type') as string) || 'tenant',
            has_web_frontend: formData.get('has_web_frontend') === 'true',
            latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
            longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
            plan_type: (formData.get('plan_type') as string) || 'free',
            lifecycle_status: (formData.get('lifecycle_status') as string) || 'active',
            modules_config: {
                news: formData.get('module_news') === 'true',
                events: formData.get('module_events') === 'true',
                library: formData.get('module_library') === 'true',
                transactions: formData.get('module_transactions') === 'true',
                jobs: formData.get('module_jobs') === 'true',
                security_settings: {
                    telegram_chat_id: (formData.get('telegram_chat_id') as string) || '',
                }
            }
        };

        const parsed = (await import('@/lib/validations/admin')).TenantSchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
        }

        const supabase = await createClient() as any;

        // --- DYNAMIC DEFAULT BLOCKS ROUTING ON CREATION ---
        const defaultBlocks = getDefaultBlocksForStyle(parsed.data.layout_style ? parsed.data.layout_style : 'saas_violet', parsed.data.tenant_type || 'tenant');

        // Prepare contact_info with abbot and history
        const abbot = formData.get('abbot') as string;
        const history = formData.get('history') as string;
        const contactInfo = {
            abbot: abbot || undefined,
            history: history || undefined,
        };

        const insertData = {
            ...parsed.data,
            layout_blocks: defaultBlocks,
            theme_colors: null, // Will fallback to theme preset
            has_web_frontend: parsed.data.has_web_frontend ?? true,
            contact_info: contactInfo,
        };

        const { data, error } = await supabase.from('tenants').insert(insertData).select().single();

        if (error) {
            if (error.code === '23505') return { success: false, error: 'This domain name already exists on the system.' };
            return { success: false, error: 'Error creating Workspace: ' + error.message };
        }

        // --- CONTENT SYNC: MCAARON -> NEW TENANT ---
        const syncNews = formData.get('sync_news') === 'true';
        const syncDharma = formData.get('sync_dharma') === 'true';
        if (syncNews || syncDharma) {
            const syncModules = [];
            if (syncNews) syncModules.push('news');
            if (syncDharma) syncModules.push('learning_resources');
            await syncGlobalContent(data.id, syncModules);
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'tenants',
            recordId: data.id,
            newData: data,
        });
        
        let warningMessage: string | undefined = undefined;
        // --- VERCEL API: AUTO MAP CUSTOM DOMAIN ---
        const vercelResult = await addDomainToVercel(data.domain);
        if (!vercelResult.success) {
            console.warn(`[VercelAPI] Warning: Could not automatically map domain to Vercel: ${vercelResult.error}`);
            warningMessage = `Domain name has been saved to the database, but edge routing could not be automatically configured on Vercel: ${vercelResult.error}. You need to point the domain's DNS records to Vercel for verification to succeed.`;
        }

        revalidatePath('/admin/tenants');
        revalidatePath('/admin/users');
        return { success: true, ...(warningMessage ? { warning: warningMessage } : {}) };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error creating Workspace' };
    }
}

// ------- UPDATE -------

export async function updateTenant(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('tenants', 'update');

        const isAiPortal = formData.get('layout_style') === 'ai_portal';
        if (isAiPortal) {
            const ctx = await getUserContext();
            if (ctx?.role !== 'super_admin') {
                return { success: false, error: 'Only Super Admin is authorized to configure an AI Portal.' };
            }
        }

        let cleanDomain = (formData.get('domain') as string || '').trim().toLowerCase();
        cleanDomain = cleanDomain.replace(/^(https?:\/\/)/, '');
        cleanDomain = cleanDomain.replace(/\/.*$/, '');

        const raw = {
            name: (formData.get('name') as string || '').trim(),
            domain: cleanDomain,
            subdomain: (formData.get('subdomain') as string) || null,
            layout_style: (formData.get('layout_style') as string) || 'saas_violet',
            logo_url: (formData.get('logo_url') as string) || null,
            tenant_type: (formData.get('tenant_type') as string) || 'tenant',
            has_web_frontend: formData.get('has_web_frontend') === 'true',
            latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
            longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
            plan_type: (formData.get('plan_type') as string) || 'free',
            lifecycle_status: (formData.get('lifecycle_status') as string) || 'active',
            modules_config: {
                news: formData.get('module_news') === 'true',
                events: formData.get('module_events') === 'true',
                library: formData.get('module_library') === 'true',
                transactions: formData.get('module_transactions') === 'true',
                jobs: formData.get('module_jobs') === 'true',
                security_settings: {
                    telegram_chat_id: (formData.get('telegram_chat_id') as string) || '',
                }
            }
        };

        const parsed = (await import('@/lib/validations/admin')).TenantSchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: (await import('@/lib/validations/admin')).formatZodError(parsed.error) };
        }

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase.from('tenants').select('*').eq('id', id).single();

        // Prepare contact_info with abbot and history
        const abbot = formData.get('abbot') as string;
        const history = formData.get('history') as string;
        const contactInfo = {
            ...(oldData?.contact_info || {}),
            abbot: abbot || undefined,
            history: history || undefined,
        };

        // --- DYNAMIC DEFAULT BLOCKS RESET ON DEMAND ---
        const resetDefaultBlocks = formData.get('reset_default_blocks') === 'true';
        let layoutBlocksToUpdate = undefined;
        if (resetDefaultBlocks) {
            layoutBlocksToUpdate = getDefaultBlocksForStyle(parsed.data.layout_style ? parsed.data.layout_style : 'saas_violet', parsed.data.tenant_type || 'tenant');
        }

        const { error: updateError } = await supabase
            .from('tenants')
            .update({
                ...parsed.data,
                contact_info: contactInfo,
                has_web_frontend: parsed.data.has_web_frontend ?? oldData?.has_web_frontend ?? true,
                ...(layoutBlocksToUpdate ? { layout_blocks: layoutBlocksToUpdate } : {})
            })
            .eq('id', id);

        if (updateError) {
            if (updateError.code === '23505') return { success: false, error: 'This domain name is already a duplicate.' };
            return { success: false, error: 'Error updating: ' + updateError.message };
        }

        // --- CONTENT SYNC: ON UPDATE ---
        const syncNews = formData.get('sync_news') === 'true';
        const syncDharma = formData.get('sync_dharma') === 'true';
        if (syncNews || syncDharma) {
            const syncModules = [];
            if (syncNews) syncModules.push('news');
            if (syncDharma) syncModules.push('learning_resources');
            await syncGlobalContent(id, syncModules);
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: id,
            oldData,
            newData: parsed.data,
        });

        let warningMessage: string | undefined = undefined;
        // --- VERCEL API: AUTO MAP CUSTOM DOMAIN IF CHANGED ---
        if (oldData?.domain !== parsed.data.domain) {
            const vercelResult = await addDomainToVercel(parsed.data.domain);
            if (!vercelResult.success) {
                console.warn(`[VercelAPI] Warning: Could not automatically update new domain on Vercel: ${vercelResult.error}`);
                warningMessage = `Domain name saved to database, but edge routing could not be automatically configured on Vercel: ${vercelResult.error}. Please ensure you pointed the DNS to Vercel for verification to succeed.`;
            }
        }

        // Revalidate tenant-config cache on the frontend for both old and new domains
        if (oldData?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(oldData.domain));
        }

        // Query domain để có đúng cache tag key
        const { data: tenantData } = await supabase.from('tenants').select('domain').eq('id', id).single();
        if (tenantData?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(tenantData.domain));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        }

        revalidatePath('/admin/tenants');
        revalidatePath(`/admin/tenants/${id}`);
        revalidatePath('/admin/users');
        return { success: true, ...(warningMessage ? { warning: warningMessage } : {}) };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error updating Workspace' };
    }
}

// ------- CONTENT SYNC HELPER -------

/**
 * Bulk broadcasts global content (McAaron) to a specific tenant
 */
export async function syncGlobalContent(tenantId: string, modules: string[]): Promise<{ success: boolean; count: number }> {
    try {
        const rootTenantId = '55555555-5555-5555-5555-555555555555';
        const supabase = await createClient() as any;
        let totalUpdated = 0;

        for (const moduleName of modules) {
            // Fetch all global posts for this module
            const { data: posts, error: fetchError } = await supabase
                .from(moduleName)
                .select('id, published_to')
                .eq('tenant_id', rootTenantId);

            if (fetchError || !posts) continue;

            // Prepare updates
            for (const post of posts) {
                const currentPublishedTo = post.published_to || [];
                if (!currentPublishedTo.includes(tenantId)) {
                    const newPublishedTo = [...currentPublishedTo, tenantId];
                    await supabase
                        .from(moduleName)
                        .update({ published_to: newPublishedTo })
                        .eq('id', post.id);
                    totalUpdated++;
                }
            }
            
            // Revalidate module cache for the target tenant
            if (moduleName === 'news') {
                // @ts-ignore
                revalidateTag(`news-${tenantId}`);
            }
            if (moduleName === 'learning_resources') {
                // @ts-ignore
                revalidateTag(`learning-resources-${tenantId}`);
            }
        }

        return { success: true, count: totalUpdated };
    } catch (err) {
        console.error('[Sync] Error syncing global content:', err);
        return { success: false, count: 0 };
    }
}

// ------- DOMAIN MANAGEMENT -------

export async function updateTenantDomain(tenantId: string, domain: string): Promise<{ success: boolean; error?: string }> {
    // 1. Check permissions (must be tenant admin)
    const { requireTenantAccess } = await import('@/lib/permissions');
    await requireTenantAccess(tenantId);

    // 2. Validate domain format (strip http://, https://, trailing slashes)
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)/, '');
    cleanDomain = cleanDomain.replace(/\/.*$/, ''); // Strip remaining path

    if (!cleanDomain) {
        return { success: false, error: 'Domain name is invalid.' };
    }
    if (cleanDomain.length < 3) {
        return { success: false, error: 'Domain name is too short.' };
    }

    const supabase = await createClient() as any;

    // 3. Check if this domain is duplicated with another branch
    const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('domain', cleanDomain)
        .neq('id', tenantId);

    if (existing && existing.length > 0) {
        return { success: false, error: 'This domain name is already used by another Workspace on the system.' };
    }

    const ctx = await getUserContext();
    if (!ctx) return { success: false, error: 'Unauthorized' };
    const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

    const { data: oldData } = await supabase.from('tenants').select('domain').eq('id', tenantId).single();
    const { error, count } = await supabase
        .from('tenants')
        .update({ domain: cleanDomain })
        .eq('id', tenantId)
        .select('*', { count: 'exact', head: true });

    if (error) return { success: false, error: error.message };
    if (count === 0) return { success: false, error: 'Unauthorized update (RLS)' };

    await createAuditLog({
        user,
        action: 'update',
        tableName: 'tenants',
        recordId: tenantId,
        oldData,
        newData: { domain: cleanDomain },
    });

    // --- VERCEL API: AUTO MAP CUSTOM DOMAIN ---
    const vercelResult = await addDomainToVercel(cleanDomain);
    if (!vercelResult.success) {
        console.warn(`[VercelAPI] Warning: Could not automatically update domain on Vercel: ${vercelResult.error}`);
    }

    revalidatePath('/admin/tenants');
    revalidatePath(`/admin/t/${tenantId}/settings/domain`);

    return { success: true };
}

export async function updateTenantTheme(
    tenantId: string,
    themeColors: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireSuperAdmin();
        await requireTenantAccess(tenantId);

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        const { data: oldData } = await supabase
            .from('tenants')
            .select('theme_colors')
            .eq('id', tenantId)
            .single();

        const { error, count } = await supabase
            .from('tenants')
            .update({ theme_colors: themeColors })
            .eq('id', tenantId)
            .select('*', { count: 'exact', head: true });

        if (error) return { success: false, error: error.message };
        if (count === 0) return { success: false, error: 'Unauthorized update (RLS)' };

        // ── SYNC TO SITE_SETTINGS (For backward compatibility) ──────────────
        const settingsBatch = [
            { key: 'theme_color_primary', value: themeColors.primary, tenant_id: tenantId },
            { key: 'theme_color_secondary', value: themeColors.secondary, tenant_id: tenantId },
            { key: 'theme_color_accent', value: themeColors.accent, tenant_id: tenantId },
            { key: 'theme_color_text', value: themeColors.text, tenant_id: tenantId },
            { key: 'theme_background_start', value: themeColors.bgStart, tenant_id: tenantId },
            { key: 'theme_background_end', value: themeColors.bgEnd, tenant_id: tenantId },
            { key: 'theme_pattern_opacity', value: themeColors.opacity || '0.05', tenant_id: tenantId },
            { key: 'theme_hero', value: themeColors.hero, tenant_id: tenantId },
            { key: 'theme_surface', value: themeColors.surface, tenant_id: tenantId },
        ].filter(s => s.value !== undefined);

        if (settingsBatch.length > 0) {
            await supabase.from('site_settings').upsert(
                settingsBatch.map(s => ({ ...s, updated_at: new Date().toISOString(), updated_by: user.id })),
                { onConflict: 'tenant_id,key' }
            );
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: tenantId,
            oldData,
            newData: { theme_colors: themeColors },
        });

        // Revalidate related pages (Save CPU using targeted revalidation)
        const { data: t } = await supabase.from('tenants').select('domain').eq('id', tenantId).single();
        if (t?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(t.domain));
        }
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.SITE_SETTINGS);
        // @ts-ignore
        revalidateTag(`site_settings-${tenantId}`);
        revalidatePath(`/admin/t/${tenantId}/homepage`);
        // revalidatePath('/', 'layout'); // REMOVED: Extreme resource hog. Replaced by targeted revalidateTag above.

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateTenantLayoutStyle(
    tenantId: string,
    layoutStyle: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireTenantAccess(tenantId);

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        const { data: oldData } = await supabase
            .from('tenants')
            .select('layout_style, domain')
            .eq('id', tenantId)
            .single();

        const { error, count } = await supabase
            .from('tenants')
            .update({ layout_style: layoutStyle })
            .eq('id', tenantId)
            .select('*', { count: 'exact', head: true });

        if (error) return { success: false, error: error.message };
        if (count === 0) return { success: false, error: 'Unauthorized update (RLS)' };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: tenantId,
            oldData: { layout_style: oldData?.layout_style },
            newData: { layout_style: layoutStyle },
        });

        // Revalidate cache
        if (oldData?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(oldData.domain));
        }
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        revalidatePath(`/admin/t/${tenantId}/homepage`);

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Update configuration enabling/disabling header menu items (nav_visibility).
 * Each key is a menu item name (home, about, news, dharma, documents, transaction, contact).
 * Value is a boolean: true = display, false = hidden.
 */
export async function updateNavVisibility(
    tenantId: string,
    navVisibility: Record<string, boolean>
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireTenantAccess(tenantId);

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        const { data: oldData } = await supabase
            .from('tenants')
            .select('nav_visibility')
            .eq('id', tenantId)
            .single();

        const { error } = await supabase
            .from('tenants')
            .update({ nav_visibility: navVisibility })
            .eq('id', tenantId);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: tenantId,
            oldData: { nav_visibility: oldData?.nav_visibility },
            newData: { nav_visibility: navVisibility },
        });

        // Revalidate tenant config cache to update header immediately
        const { data: t } = await supabase.from('tenants').select('domain').eq('id', tenantId).single();
        if (t?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(t.domain));
        }
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        revalidatePath(`/admin/t/${tenantId}/homepage`);

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error' };
    }
}

/**
 * Update modules_config cho tenant (Feature Toggles)
 */
export async function updateTenantConfig(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const id = formData.get('id') as string;
        const modulesConfigStr = formData.get('modules_config') as string;
        
        if (!id || !modulesConfigStr) return { success: false, error: 'Missing data' };

        await requireTenantAccess(id);
        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const modulesConfig = JSON.parse(modulesConfigStr);

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase
            .from('tenants')
            .select('modules_config, domain')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('tenants')
            .update({ modules_config: modulesConfig })
            .eq('id', id);

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: id,
            oldData: { modules_config: oldData?.modules_config },
            newData: { modules_config: modulesConfig },
        });

        if (oldData?.domain) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfig(oldData.domain));
        }
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error saving modules config' };
    }
}

// ------- TENANT LIFECYCLE -------

export async function suspendTenant(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireSuperAdmin();

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        const { data: oldData, error: fetchError } = await supabase
            .from('tenants')
            .select('modules_config')
            .eq('id', id)
            .single();

        if (fetchError) return { success: false, error: fetchError.message };

        const existingConfig = oldData?.modules_config || {};
        const newConfig = { ...existingConfig, lifecycle_status: 'suspended' };

        const { error } = await supabase
            .from('tenants')
            .update({ modules_config: newConfig })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: id,
            oldData: { modules_config: oldData?.modules_config },
            newData: { modules_config: newConfig, lifecycle_action: 'suspend' },
        });

        revalidatePath('/admin/tenants');
        revalidatePath(`/admin/tenants/${id}`);
        revalidatePath(`/admin/tenants/${id}/lifecycle`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error suspending tenant' };
    }
}

export async function reactivateTenant(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireSuperAdmin();

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        const { data: oldData, error: fetchError } = await supabase
            .from('tenants')
            .select('modules_config')
            .eq('id', id)
            .single();

        if (fetchError) return { success: false, error: fetchError.message };

        const existingConfig = oldData?.modules_config || {};
        const newConfig = { ...existingConfig, lifecycle_status: 'active' };

        const { error } = await supabase
            .from('tenants')
            .update({ modules_config: newConfig })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: id,
            oldData: { modules_config: oldData?.modules_config },
            newData: { modules_config: newConfig, lifecycle_action: 'reactivate' },
        });

        revalidatePath('/admin/tenants');
        revalidatePath(`/admin/tenants/${id}`);
        revalidatePath(`/admin/tenants/${id}/lifecycle`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error reactivating tenant' };
    }
}

/**
 * Update security configuration (2FA, IP Whitelist) of a specific Tenant
 */
export async function updateTenantSecuritySettings(
    tenantId: string,
    settings: { require_2fa: boolean; ip_whitelist?: string; telegram_chat_id?: string }
): Promise<{ success: boolean; error?: string }> {
    try {
        // Enforce tenant isolation check
        await requireTenantAccess(tenantId);

        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;

        const supabase = await createClient() as any;

        // Fetch old config
        const { data: oldData, error: fetchError } = await supabase
            .from('tenants')
            .select('modules_config')
            .eq('id', tenantId)
            .single();

        if (fetchError) return { success: false, error: fetchError.message };

        const existingConfig = oldData?.modules_config || {};
        
        // Update the security_settings field inside the modules_config JSON
        const securitySettings = {
            require_2fa: settings.require_2fa,
            ip_whitelist: settings.ip_whitelist || '',
            telegram_chat_id: settings.telegram_chat_id || '',
            last_updated: new Date().toISOString(),
            updated_by: ctx.email,
        };

        const newConfig = {
            ...existingConfig,
            security_settings: securitySettings
        };

        // Write to database
        const { error } = await supabase
            .from('tenants')
            .update({ modules_config: newConfig })
            .eq('id', tenantId);

        if (error) return { success: false, error: error.message };

        // Record audit log for security configuration change
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: tenantId,
            oldData: { modules_config: oldData?.modules_config },
            newData: { modules_config: newConfig, security_action: 'update_settings' },
        });

        // Clear cache and refresh the security page
        revalidatePath(`/admin/t/${tenantId}/security`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error updating security settings' };
    }
}

