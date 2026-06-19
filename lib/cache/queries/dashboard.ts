import { createClient } from '@/lib/supabase/server';

export const getAdminDashboardStats = async (tenantId: string) => {
    const supabase = await createClient();

    const [
        { count: memberCount },
        { count: auditLogsCount },
        { count: blockedIpsCount },
        { data: recentAuditLogs },
    ] = await Promise.all([
        (supabase as any).from('tenant_members').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        (supabase as any).from('blocked_ips').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('audit_logs')
            .select('id, action, table_name, user_email, created_at, ip_address')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    return {
        newsCount: 0,
        eventsCount: 0,
        pendingRegistrations: 0,
        auditLogsCount: auditLogsCount || 0,
        recentNews: [],
        recentRegistrations: [],
        recentAuditLogs: recentAuditLogs || [],
        projectsCount: 0,
        totalTransactions: 0,
        recentTransactions: [],
        transactions: [],
        transactionSummary: null,
        memberCount: memberCount || 0,
        blockedIpsCount: blockedIpsCount || 0,
    };
};

export const getGlobalDashboardStats = async () => {
    const supabase = await createClient();
    
    const [
        { data: tenantsAll },
        { count: totalMembersCount },
        { count: totalBlockedIpsCount },
        { data: recentTenants },
        { data: recentAuditLogs }
    ] = await Promise.all([
        (supabase as any).from('tenants').select('id, name, domain, plan_type, lifecycle_status, tenant_type, modules_config, created_at'),
        (supabase as any).from('tenant_members').select('*', { count: 'exact', head: true }),
        (supabase as any).from('blocked_ips').select('*', { count: 'exact', head: true }),
        (supabase as any).from('tenants').select('id, name, domain, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('audit_logs').select('id, action, table_name, user_email, created_at, ip_address').order('created_at', { ascending: false }).limit(5),
    ]);

    const planDistribution = {
        free: { active: 0, trial: 0, suspended: 0 },
        pro: { active: 0, trial: 0, suspended: 0 },
        enterprise: { active: 0, trial: 0, suspended: 0 }
    };

    (tenantsAll || []).forEach((t: any) => {
        const plan = (t.plan_type || 'free').toLowerCase() as 'free' | 'pro' | 'enterprise';
        const status = (t.lifecycle_status || 'active').toLowerCase() as 'active' | 'trial' | 'suspended';
        
        if (planDistribution[plan]) {
            if (status === 'active') planDistribution[plan].active++;
            else if (status === 'trial') planDistribution[plan].trial++;
            else if (status === 'suspended') planDistribution[plan].suspended++;
        }
    });

    const planChartData = [
        { name: 'Free Plan', active: planDistribution.free.active, trial: planDistribution.free.trial, suspended: planDistribution.free.suspended },
        { name: 'Pro Plan', active: planDistribution.pro.active, trial: planDistribution.pro.trial, suspended: planDistribution.pro.suspended },
        { name: 'Enterprise Plan', active: planDistribution.enterprise.active, trial: planDistribution.enterprise.trial, suspended: planDistribution.enterprise.suspended },
    ];

    const totalTenantsCount = tenantsAll?.length || 0;
    const featureChartData = [
        { name: 'Custom Domains', value: (tenantsAll || []).filter((t: any) => t.domain && !t.domain.includes('vercel.app') && !t.domain.includes('localhost')).length, percentage: totalTenantsCount > 0 ? Math.round(((tenantsAll || []).filter((t: any) => t.domain && !t.domain.includes('vercel.app') && !t.domain.includes('localhost')).length / totalTenantsCount) * 100) : 0 },
    ];

    const resourceChartData = (tenantsAll || []).map((t: any) => {
        return {
            name: t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name,
            'Security Logs': 0,
            'Blocked IPs': 0,
            total: 0
        };
    }).slice(0, 5);

    const typeBreakdown = {
        enterprise: (tenantsAll || []).filter((t: any) => t.tenant_type !== 'tenant').length,
        legacy: (tenantsAll || []).filter((t: any) => t.tenant_type === 'tenant').length,
    };

    return {
        newsCount: 0,
        eventsCount: 0,
        tenantsCount: totalTenantsCount,
        totalVolume: 0,
        pendingRegistrations: 0,
        recentTenants: recentTenants || [],
        tenantStats: {},
        recentTransactions: [],
        planChartData,
        featureChartData,
        resourceChartData,
        typeBreakdown,
        totalMembersCount: totalMembersCount || 0,
        totalBlockedIpsCount: totalBlockedIpsCount || 0,
        recentAuditLogs: recentAuditLogs || []
    };
};
