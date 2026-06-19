import { NextResponse } from 'next/server';
import { getSecurityStats } from '@/lib/audit/security-stats';
import { isGlobalAdmin } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check admin permission
        const hasAccess = await isGlobalAdmin();
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized. Access denied.' }, { status: 401 });
        }

        // 2. Fetch data statistics from database (Actual SOC statistics)
        const stats = await getSecurityStats();

        // 3. Get the 10 most recent security logs
        const supabase = await createAdminClient();
        const { data: recentLogs } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        // 4. Get 5 recent simulated attack events from rag_telemetry if any
        const { data: anomalyDetections } = await (supabase as any)
            .from('rag_telemetry')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                totalAuditLogs: stats.totalAuditLogs,
                last24hLogs: stats.last24hLogs,
                deleteCount24h: stats.deleteCount24h,
                loginCount24h: stats.loginCount24h,
                activeUsers24h: stats.activeUsers24h,
                rlsCoverage: stats.rlsCoverage,
                anomalyCount: stats.anomalyAlerts.length,
                anomalies: stats.anomalyAlerts,
                rateLimitHits: stats.rateLimitHits.slice(0, 5),
            },
            recentLogs: recentLogs || [],
            anomalyDetections: anomalyDetections || []
        });

    } catch (error: any) {
        console.error('[Copilot Context API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
