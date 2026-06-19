/**
 * GET /api/admin/backup-history
 *
 * Returns backup logs history (cron) from cron_job_logs.
 * Filters jobs where job_name LIKE '%backup%', ORDER BY executed_at DESC LIMIT 10.
 *
 * SECURITY: Only super_admin / global admins are permitted to view.
 * Uses createAdminClient to read cron_job_logs (service_role RLS bypass).
 */
import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

const GLOBAL_ADMIN_ROLES = ['super_admin', 'company_editor', 'admin', 'agency_admin'];

export async function GET() {
    try {
        // 1. Authenticate permissions
        const ctx = await getUserContext();
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!GLOBAL_ADMIN_ROLES.includes(ctx.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Query cron_job_logs with admin client (bypass RLS)
        const adminDb = await createAdminClient();
        const { data, error } = await (adminDb as any)
            .from('cron_job_logs')
            .select('id, job_name, status, message, metadata, duration_ms, executed_at')
            .ilike('job_name', '%backup%')
            .order('executed_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[backup-history] DB error:', error.message);
            return NextResponse.json({ error: 'Unable to retrieve backup history' }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        console.error('[backup-history] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
