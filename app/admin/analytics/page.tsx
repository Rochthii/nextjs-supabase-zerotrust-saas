import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { AnalyticsClient } from './analytics-client';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    // SECURITY: Only Super Admin or high-level system roles can view global Analytics
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const supabase = await createClient();

    // Execute parallel queries for actual data from database
    const [
        tenantsRes,
        usersRes,
        auditLogsCountRes,
        auditLogsListRes,
        blockedIpsRes
    ] = await Promise.all([
        (supabase as any).from('tenants').select('id, name, domain, tenant_type, created_at'),
        (supabase as any).from('tenant_members').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id, tenant_id, action, severity, created_at'),
        (supabase as any).from('blocked_ips').select('id, tenant_id, blocked_at')
    ]);

    const tenants = (tenantsRes.data || []).map((t: any) => ({
        id: t.id,
        name: t.name || 'Unknown',
        domain: t.domain || 'Not configured',
        tenant_type: t.tenant_type || 'tenant',
        created_at: t.created_at || ''
    }));

    const auditLogs = (auditLogsListRes.data || []).map((log: any) => ({
        id: log.id,
        tenant_id: log.tenant_id || '',
        action: log.action || '',
        severity: log.severity || 'INFO',
        created_at: log.created_at || ''
    }));

    const blockedIps = (blockedIpsRes.data || []).map((ip: any) => ({
        id: ip.id,
        tenant_id: ip.tenant_id || '',
        blocked_at: ip.blocked_at || ''
    }));

    const totalUsers = usersRes.count || 0;
    const auditCount = auditLogsCountRes.count || 0;

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Command Center Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-955 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 bg-clip-text text-transparent tracking-tight">Security & Performance Analytics</h1>
                            <p className="text-slate-400 mt-2 text-xs italic">
                                * Số liệu statistics on security events and tenant usage from system core.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client analytics client logic */}
            <AnalyticsClient
                tenants={tenants}
                auditLogs={auditLogs}
                blockedIps={blockedIps}
                totalUsers={totalUsers}
                auditCount={auditCount}
            />
        </div>
    );
}


