'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';

export async function updateBankSettings(formData: FormData) {
    try {
        // CRITICAL: Changing bank account must require admin permission
        const user = await requireAdmin();
        const supabase = await createClient();

        const updates = {
            'bank.id': formData.get('bank.id') as string,
            'bank.account_no': formData.get('bank.account_no') as string,
            'bank.account_name': formData.get('bank.account_name') as string,
            'bank.name': formData.get('bank.name') as string,
            'bank.qr_template': formData.get('bank.qr_template') as string || 'compact2',
        };

        const tenant_id = formData.get('tenant_id') as string;

        // Fetch old values for audit
        const { data: oldData } = await (supabase.from('site_settings') as any)
            .select('key, value')
            .eq('tenant_id', tenant_id)
            .in('key', Object.keys(updates));

        const promises = Object.entries(updates).map(([key, value]) =>
            supabase.from('site_settings').upsert({
                key,
                value,
                tenant_id,
                updated_at: new Date().toISOString()
            } as any, { onConflict: 'tenant_id,key' })
        );

        const results = await Promise.all(promises);
        const hasError = results.some(r => r.error);

        if (hasError) {
            return { success: false, error: 'Failed to update bank settings' };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'site_settings',
            recordId: 'bank',
            oldData: Object.fromEntries((oldData || []).map((r: any) => [r.key, r.value])),
            newData: updates,
            tenantId: tenant_id
        });

        // @ts-ignore
        revalidateTag(`site_settings-${tenant_id || 'global'}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update bank settings error:', err);
        return { success: false, error: 'An error occurred khi update settings bank' };
    }
}
