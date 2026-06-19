/**
 * GET /api/admin/tenants-list
 * 
 * Returns list of tenants {id, name}[] for backup export filters.
 * Only super_admin is authorized to call this API.
 * 
 * SECURITY: Uses createAdminClient (service_role) after verifying JWT.
 */
import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        // 1. Validate user — only super_admin allowed
        const ctx = await getUserContext();
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (ctx.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden: Only super_admin has access' }, { status: 403 });
        }

        // 2. Use admin client to bypass RLS and fetch tenants list
        const adminDb = await createAdminClient();
        const { data, error } = await (adminDb as any)
            .from('tenants')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('[tenants-list] DB error:', error.message);
            return NextResponse.json({ error: 'Unable to fetch tenants list' }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        console.error('[tenants-list] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
