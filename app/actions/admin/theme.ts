'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { revalidateTenantLayout } from '@/lib/cache/revalidate';

const THEME_KEYS = [
    'theme_color_primary',
    'theme_color_secondary',
    'theme_color_text',
    'theme_color_accent',
    'theme_background_start',
    'theme_background_end',
    'theme_pattern_opacity',
    'theme_hero',
    'theme_surface',
    'theme_header_bg',
    'theme_footer_bg',
    'custom_theme_presets',
];

/**
 * Update theme of a specific branch.
 * SECURITY: Only super_admin or company_editor can invoke this action.
 * Specific branch admins do NOT have permission to change the theme.
 */
export async function updateThemeSettings(formData: FormData) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        const { getUserRole } = await import('@/lib/permissions');
        const role = await getUserRole();
        const allowedRoles = ['super_admin', 'company_editor'];
        if (!role || !allowedRoles.includes(role)) {
            return { success: false, error: 'You are not authorized to modify the theme. Only Super Admin and Company Editor roles are allowed.' };
        }

        const tenant_id = formData.get('tenant_id') as string;
        if (!tenant_id) {
            return { success: false, error: 'Missing Tenant ID.' };
        }

        // Batch upsert theme keys
        const updates: Record<string, string> = {};
        const settingsBatch = THEME_KEYS.map(key => {
            const value = formData.get(key) as string | null;
            if (value === null || value === undefined) return null;
            updates[key] = value;
            return {
                key,
                value,
                tenant_id,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            };
        }).filter((s): s is NonNullable<typeof s> => s !== null);

        if (settingsBatch.length > 0) {
            const { error: batchError } = await (supabase as any)
                .from('site_settings')
                .upsert(settingsBatch, { onConflict: 'tenant_id,key' });
            if (batchError) {
                return { success: false, error: `Error saving theme: ${batchError.message}` };
            }
        }

        // Sync theme colors → tenants.theme_colors JSONB
        const { data: tenant } = await (supabase as any)
            .from('tenants')
            .select('theme_colors')
            .eq('id', tenant_id)
            .single();

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
            headerBg: updates['theme_header_bg'] ?? currentColors.headerBg,
            footerBg: updates['theme_footer_bg'] ?? currentColors.footerBg,
        };

        await (supabase as any)
            .from('tenants')
            .update({ theme_colors: themeColors })
            .eq('id', tenant_id);

        // Audit log
        await createAuditLog({
            user,
            action: 'settings_change',
            tableName: 'site_settings',
            newData: { ...updates, _context: 'theme_update', tenant_id },
        });

        // Invalidate cache for this tenant
        // By calling revalidateTenantLayout, we clear ADVANCED cache
        // for all domains and subdomains of this branch.
        await revalidateTenantLayout(tenant_id, ['site_settings']);

        return { success: true };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
            return { success: false, error: 'Unauthorized access.' };
        }
        console.error('updateThemeSettings error:', error);
        return { success: false, error: error.message || 'An error occurred' };
    }
}
