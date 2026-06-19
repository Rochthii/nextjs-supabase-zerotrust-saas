'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { revalidateTenantLayout } from '@/lib/cache/revalidate';
import { CACHE_TAGS } from '@/lib/cache/tags';

export async function updateSettings(formData: FormData) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');
        const supabase = await createClient();

        const context = await getUserContext();
        let tenant_id = formData.get('tenant_id') as string;

        // SECURITY: Prevent cross-tenant setting modification
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            tenant_id = context.tenantId;
        }

        if (!tenant_id) {
            return { success: false, error: 'Missing Tenant ID. Cannot save settings.' };
        }

        const settingsToUpdate = [
            'site_name_vi',
            'site_name_en',
            'site_description',
            'contact_email',
            'contact_phone',
            'address',
            'facebook_url',
            'youtube_url',
            // Bank Info
            'bank.id',
            'bank.account_no',
            'bank.account_name',
            'bank.name',
            'bank.qr_template',
            // Brand
            'site_logo',
            'site_name_km',
            'site_subtitle_vi',
            // Theme
            'theme_color_primary',
            'theme_color_secondary',
            'theme_color_text',
            'theme_color_accent',
            'theme_background_start',
            'theme_background_end',
            'theme_pattern_opacity',
            'theme_hero',
            'theme_surface',
            'custom_theme_presets',
            'map_embed_url',
            'map_direction_url',
        ];

        const updates: Record<string, string> = {};

        // --- PRE-VALIDATION ---
        const rawSettings: Record<string, any> = {};
        for (const key of settingsToUpdate) {
            rawSettings[key] = formData.get(key);
        }

        const parsed = (await import('@/lib/validations/admin')).SiteSettingsSchema.safeParse(rawSettings);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') };
        }
        // ----------------------

        // --- BATCH UPDATE SITE SETTINGS ---
        const settingsBatch = settingsToUpdate
            .map(key => {
                const value = formData.get(key);
                if (value === null || value === undefined) return null;
                updates[key] = value as string;
                return {
                    key,
                    value: value as string,
                    tenant_id,
                    updated_at: new Date().toISOString(),
                    updated_by: user.id
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

        if (settingsBatch.length > 0) {
            const { error: batchError } = await (supabase as any).from('site_settings').upsert(settingsBatch, { onConflict: 'tenant_id,key' });
            if (batchError) {
                console.error('Batch update settings error:', batchError);
                return { success: false, error: `Error khi save configuration: ${batchError.message}` };
            }
        }

        // ── Sync theme colors → tenants.theme_colors JSONB ──────────────────
        if (tenant_id) {
            // Fetch old data to avoid overwriting JSONB
            const { data: tenant } = await (supabase as any).from('tenants').select('theme_colors, logo_url').eq('id', tenant_id).single();

            const currentColors = (tenant as any)?.theme_colors || {};
            const themeColors = {
                ...currentColors,
                primary: updates['theme_color_primary'] ?? currentColors.primary,
                secondary: updates['theme_color_secondary'] ?? currentColors.secondary,
                text: updates['theme_color_text'] ?? currentColors.text,
                accent: updates['theme_color_accent'] ?? currentColors.accent,
                bgStart: updates['theme_background_start'] ?? currentColors.bgStart,
                bgEnd: updates['theme_background_end'] ?? currentColors.bgEnd,
                hero: updates['theme_hero'] ?? currentColors.hero,
                surface: updates['theme_surface'] ?? currentColors.surface,
                opacity: updates['theme_pattern_opacity'] ?? currentColors.opacity,
            };

            const updatePayload: any = { theme_colors: themeColors };
            if (updates['site_logo']) {
                updatePayload.logo_url = updates['site_logo'];
            }

            const { error: tenantError } = await (supabase as any)
                .from('tenants')
                .update(updatePayload)
                .eq('id', tenant_id);

            if (tenantError) {
                console.error('Error syncing branding to tenants:', tenantError);
            }
        }

        await createAuditLog({
            user,
            action: 'settings_change',
            tableName: 'site_settings',
            newData: updates,
            tenantId: tenant_id
        });

        // ── ADVANCED: Delete all related caches using centralized Utility ──
        if (tenant_id) {
            await revalidateTenantLayout(tenant_id, [CACHE_TAGS.SITE_SETTINGS, `site_settings-${tenant_id}`]);
        } else {
            // Fallback for cases without tenant id (rare)
            // @ts-ignore
            revalidateTag(CACHE_TAGS.SITE_SETTINGS);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.tenantConfigGlobal);
        }

        revalidatePath('/admin/settings');


        return { success: true };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
            return { success: false, error: 'You are not authorized to change settings.' };
        }
        console.error('Update settings error:', error);
        return { success: false, error: error.message || 'An error occurred khi save settings' };
    }
}

export async function unblockIpAction(ip: string, tenantId: string | null) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');
        const supabase = await createAdminClient();

        const { error } = await (supabase as any).rpc('unblock_ip', {
            p_ip: ip,
            p_tenant_id: tenantId || null,
            p_admin_email: user.email || 'admin@cyber.soc'
        });

        if (error) throw error;

        revalidatePath('/admin/security-center');
        return { success: true };
    } catch (error: any) {
        console.error('Unblock IP action error:', error);
        return { success: false, error: error.message || 'Error on unblocking IP' };
    }
}
