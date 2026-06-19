import { createAdminClient } from '@/lib/supabase/server';
import { sendNotification as sendFCM } from '@/lib/fcm-edge';

/**
 * Get FCM tokens filtered by tenant_id.
 *
 * Logic:
 *  - Get user_id from user_roles WHERE tenant_id = tenantId (or all if global)
 *  - Join with fcm_tokens on user_id
 *  - Only submit notification to the correct admin/editor of that branch
 *
 * @param tenantId - if null → global (super_admin scope, submit all)
 */
async function fetchTokensForTenant(tenantId: string | null): Promise<string[]> {
    const supabase = await createAdminClient();

    // Get members of this tenant
    let memberQuery = (supabase as any)
        .from('tenant_members')
        .select('user_id');

    if (tenantId) {
        memberQuery = memberQuery.eq('tenant_id', tenantId);
    } else {
        memberQuery = memberQuery.is('tenant_id', null);
    }

    const { data: members, error: memberError } = await memberQuery;
    if (memberError || !members) {
        console.error('[Notifications] fetchTokensForTenant member error:', memberError?.message);
        return [];
    }

    const userIds = members.map((m: any) => m.user_id);
    if (userIds.length === 0) return [];

    // Get FCM tokens for these members
    const { data: tokens, error: tokensError } = await (supabase as any)
        .from('fcm_tokens')
        .select('token')
        .in('user_id', userIds);

    if (tokensError) {
        console.error('[Notifications] fetchTokensForTenant tokens error:', tokensError.message);
        return [];
    }

    return (tokens as any[])?.map((row: any) => row.token).filter(Boolean) ?? [];
}

/**
 * Submit push notification to all admins of a specific branch.
 *
 * IMPORTANT: tenantId is required — prevents cross-tenant broadcasting.
 */
export async function notifyTenantAdmins(
    tenantId: string,
    { title, body, url }: { title: string; body: string; url?: string }
): Promise<void> {
    try {
        const tokens = await fetchTokensForTenant(tenantId);

        if (tokens.length === 0) {
            console.info('[Notifications] No tokens found for tenant:', tenantId);
            return;
        }

        await sendFCM({ title, body, tokens, url });
    } catch (error) {
        console.error('[Notifications] notifyTenantAdmins error:', error);
    }
}

/**
 * Submit push notification to all super_admin / global admins.
 * Only used in super_admin context (backup alerts, system events, etc.)
 */
export async function notifyGlobalAdmins(
    { title, body, url }: { title: string; body: string; url?: string }
): Promise<void> {
    try {
        const supabase = await createAdminClient();

        // 1. Get global admin memberships
        const { data: globalAdmins, error: adminError } = await (supabase as any)
            .from('tenant_members')
            .select(`
                user_id,
                tenant_member_roles (
                    role_id
                )
            `)
            .is('tenant_id', null);

        if (adminError || !globalAdmins) {
            console.error('[Notifications] notifyGlobalAdmins error:', adminError?.message);
            return;
        }

        const adminUserIds = globalAdmins
            .filter((m: any) => (m.tenant_member_roles || []).some((r: any) => ['super_admin', 'company_editor'].includes(r.role_id)))
            .map((m: any) => m.user_id);

        if (adminUserIds.length === 0) return;

        // 2. Fetch FCM tokens
        const { data, error } = await (supabase as any)
            .from('fcm_tokens')
            .select('token')
            .in('user_id', adminUserIds);

        if (error) {
            console.error('[Notifications] notifyGlobalAdmins tokens error:', error.message);
            return;
        }

        const tokens = (data as any[])?.map((row: any) => row.token).filter(Boolean) ?? [];

        if (tokens.length === 0) return;

        await sendFCM({ title, body, tokens, url });
    } catch (error) {
        console.error('[Notifications] notifyGlobalAdmins error:', error);
    }
}

// ─── Legacy aliases — deprecated, will delete after migrating all callers ──────────

/** @deprecated Use notifyTenantAdmins(tenantId, ...) instead */
export async function notifyAdmins({ title, body, url }: { title: string; body: string; url?: string }): Promise<void> {
    console.warn('[Notifications] notifyAdmins() is deprecated and UNSAFE (no tenant filter). Use notifyTenantAdmins() instead.');
    await notifyGlobalAdmins({ title, body, url });
}

/** @deprecated Use notifyTenantAdmins(tenantId, ...) instead */
export async function notifyAllUsers({ title, body, url }: { title: string; body: string; url?: string }): Promise<void> {
    console.warn('[Notifications] notifyAllUsers() is deprecated and UNSAFE (no tenant filter). Use notifyTenantAdmins() instead.');
    await notifyGlobalAdmins({ title, body, url });
}
