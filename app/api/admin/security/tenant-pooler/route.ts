import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { tenantConnectionPooler } from '@/lib/security/tenant-pooler';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const globalAccess = await isGlobalAdmin();
        if (!globalAccess) {
            return NextResponse.json({ error: 'Unauthorized: Global Admin access required' }, { status: 403 });
        }
        
        const supabase = (await createAdminClient()) as any;
        const { data: tenants } = await supabase.from('tenants').select('id, name, tenant_type');
        
        const stats = (tenants || []).map((t: any) => {
            // Map tenant_type to plan: 'free' | 'pro' | 'enterprise'
            const plan = (t.tenant_type === 'enterprise' ? 'enterprise' : t.tenant_type === 'pro' ? 'pro' : 'free') as 'free' | 'pro' | 'enterprise';
            return tenantConnectionPooler.getTenantStats(t.id, t.name, plan);
        });
        
        return NextResponse.json({
            stats,
            limits: tenantConnectionPooler.TIER_LIMITS
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const globalAccess = await isGlobalAdmin();
        if (!globalAccess) {
            return NextResponse.json({ error: 'Unauthorized: Global Admin access required' }, { status: 403 });
        }
        
        const body = await req.json();
        const { action, tenantId, plan, count } = body;
        
        if (action === 'simulate-flood') {
            if (!tenantId || !plan) {
                return NextResponse.json({ error: 'Missing tenantId or plan' }, { status: 400 });
            }
            
            const results = await tenantConnectionPooler.simulateFlood(tenantId, plan, count || 15);
            
            // Add a log inside audit_logs if any request was blocked (Active defense)
            if (results.blockedRequests > 0) {
                const supabase = (await createAdminClient()) as any;
                await supabase.from('audit_logs').insert({
                    tenant_id: tenantId,
                    user_email: 'security-system@no-reply',
                    action: 'connection_exhaustion_attempt',
                    table_name: 'connection_pool',
                    record_id: tenantId,
                    severity: 'warning',
                    detail: `ALERT: Blocked ${results.blockedRequests} concurrent queries from tenant ${tenantId}. Protected connection pool from Noisy Neighbor exhaustion.`
                });
            }
            
            return NextResponse.json({
                message: 'Noisy Neighbor connection flood simulation complete.',
                results
            });
        }
        
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
