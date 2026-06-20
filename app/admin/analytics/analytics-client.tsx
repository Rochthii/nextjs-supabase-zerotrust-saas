'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    Legend
} from 'recharts';
import { 
    Users, 
    Database, 
    Download, 
    Search, 
    ArrowUpDown, 
    Shield,
    Activity,
    Layers,
    ShieldAlert,
    Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TenantData {
    id: string;
    name: string;
    domain: string;
    tenant_type: string;
    created_at: string;
}

interface AuditLogMetric {
    id: string;
    tenant_id: string | null;
    action: string;
    severity: string;
    created_at: string;
}

interface BlockedIpMetric {
    id: string;
    tenant_id: string | null;
    blocked_at: string;
}

interface AnalyticsClientProps {
    tenants: TenantData[];
    auditLogs: AuditLogMetric[];
    blockedIps: BlockedIpMetric[];
    totalUsers: number;
    auditCount: number;
}

// Curated Harmonic Colors for charts
const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];

// Glassmorphism Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-left">
                <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: item.color || item.fill }} 
                            />
                            <span className="text-xs font-medium text-slate-200">
                                {item.name}: <strong className="text-white font-black">
                                    {item.value}
                                </strong>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function AnalyticsClient({
    tenants = [],
    auditLogs = [],
    blockedIps = [],
    totalUsers = 0,
    auditCount = 0
}: AnalyticsClientProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortField, setSortField] = React.useState<'name' | 'logs' | 'blocked' | 'critical'>('logs');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // ─── Filter data by time ───────────────────────────────────────────
    const getFilteredData = React.useCallback(() => {
        if (timeRange === 'all') {
            return { auditLogs, blockedIps };
        }

        const now = new Date();
        let limitDate = new Date();
        if (timeRange === '7d') limitDate.setDate(now.getDate() - 7);
        else if (timeRange === '30d') limitDate.setDate(now.getDate() - 30);
        else if (timeRange === '90d') limitDate.setDate(now.getDate() - 90);

        const limitTime = limitDate.getTime();

        return {
            auditLogs: auditLogs.filter(n => new Date(n.created_at).getTime() >= limitTime),
            blockedIps: blockedIps.filter(e => new Date(e.blocked_at).getTime() >= limitTime),
        };
    }, [timeRange, auditLogs, blockedIps]);

    const filtered = getFilteredData();

    // ─── Aggregate statistics ───────────────────────────────────────────────────────
    const totalLogsCount = filtered.auditLogs.length;
    const totalBlockedCount = filtered.blockedIps.length;
    const totalCriticalCount = filtered.auditLogs.filter(l => l.severity === 'CRITICAL' || l.severity === 'WARNING').length;

    // ─── Prepare data for System Activity chart by month (last 6 months) ─────────
    const getMonthlyChartData = React.useCallback(() => {
        const monthsData: Record<string, { name: string; 'Security Logs': number; 'Blocked IPs': number; dateObj: Date }> = {};
        
        // Create last 6 months default
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
            monthsData[key] = { name: label, 'Security Logs': 0, 'Blocked IPs': 0, dateObj: d };
        }

        // Accumulate logs
        filtered.auditLogs.forEach(log => {
            const date = new Date(log.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key]['Security Logs'] += 1;
            }
        });

        // Accumulate blocked IPs
        filtered.blockedIps.forEach(ip => {
            const date = new Date(ip.blocked_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key]['Blocked IPs'] += 1;
            }
        });

        return Object.values(monthsData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [filtered]);

    const monthlyChartData = getMonthlyChartData();

    // ─── Branch type distribution data (SaaS vs Legacy) ───────────────────────────
    const tenantTypeChartData = React.useMemo(() => {
        const types: Record<string, number> = {};
        tenants.forEach(t => {
            const typeLabel = t.tenant_type !== 'tenant' ? 'Enterprise SaaS' : 'Legacy Space';
            types[typeLabel] = (types[typeLabel] || 0) + 1;
        });
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [tenants]);

    // ─── Aggregate data per branch (Tenants Metrics) ─────────────────────
    const tenantMetrics = React.useMemo(() => {
        return tenants.map(tenant => {
            const tenantLogs = filtered.auditLogs.filter(n => n.tenant_id === tenant.id);
            const tenantBlocked = filtered.blockedIps.filter(e => e.tenant_id === tenant.id);
            const criticalLogs = tenantLogs.filter(l => l.severity === 'CRITICAL' || l.severity === 'WARNING').length;

            return {
                id: tenant.id,
                name: tenant.name || 'Unknown',
                domain: tenant.domain || 'Not configured',
                type: tenant.tenant_type !== 'tenant' ? 'Enterprise' : 'Legacy',
                totalLogs: tenantLogs.length,
                blockedCount: tenantBlocked.length,
                criticalCount: criticalLogs,
            };
        });
    }, [tenants, filtered]);

    // Filter by search query
    const searchedTenants = tenantMetrics.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort table
    const sortedTenants = searchedTenants.sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortField === 'logs') {
            valA = a.totalLogs;
            valB = b.totalLogs;
        } else if (sortField === 'blocked') {
            valA = a.blockedCount;
            valB = b.blockedCount;
        } else if (sortField === 'critical') {
            valA = a.criticalCount;
            valB = b.criticalCount;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // ─── Export CSV Report (Real Side-Effect) ────────────────────────────────────
    const handleExportCSV = () => {
        const header = "Branch Name,Domain,Workspace Type,Total Audit Logs,Blocked IPs Count,Critical Events Count\n";
        const rows = tenantMetrics.map(t => 
            `"${t.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}",${t.domain},${t.type},${t.totalLogs},${t.blockedCount},${t.criticalCount}`
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8," + header + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `saas_security_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Control Panel / Filter & Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/80 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Range:</span>
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-800/80">
                        {(['all', '90d', '30d', '7d'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    "aria-checked:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    timeRange === r 
                                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                )}
                            >
                                {r === 'all' ? 'All' : r === '90d' ? '90 Days' : r === '30d' ? '30 Days' : '7 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs border border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] relative z-10"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Security Report (CSV)</span>
                </button>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Card 1: Security Logs */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Audit Actions (RLS Logs)</span>
                            <Layers className="w-4 h-4 text-indigo-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                            {totalLogsCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Total recorded events
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: Critical events */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] hover:border-rose-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Anomalies / Warnings</span>
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-rose-500 dark:group-hover:text-rose-455">
                            {totalCriticalCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            High risk alerts (CRITICAL/WARNING)
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3: Blocked IPs */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Blocked IPs (Active SOAR)</span>
                            <Ban className="w-4 h-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-emerald-500 dark:group-hover:text-emerald-405">
                            {totalBlockedCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Currently blocked IP addresses
                        </p>
                    </CardContent>
                </Card>

                {/* Card 4: Personnel */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] hover:border-purple-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Multi-system Personnel</span>
                            <Users className="w-4 h-4 text-purple-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-purple-500 dark:group-hover:text-purple-400">
                            {totalUsers.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Staff & Admins authorized
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Monthly Activity Trend Chart */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <CardHeader className="py-6 border-b border-slate-100 dark:border-slate-800/80 p-8 pb-5">
                        <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                            Security Events & Log Frequency Chart (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-80 w-full">
                            {!isMounted ? (
                                <div className="w-full h-full bg-slate-150 dark:bg-slate-850 animate-pulse rounded-2xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            yAxisId="left" 
                                            stroke="#6366f1" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false} 
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            yAxisId="right" 
                                            orientation="right" 
                                            stroke="#f43f5e" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false} 
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} 
                                            iconType="circle"
                                        />
                                        <Line yAxisId="left" type="monotone" dataKey="Security Logs" name="Logs Count" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="Blocked IPs" name="Blocked IPs" stroke="#f43f5e" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Tenant Type Distribution (SaaS vs Legacy) */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    <CardHeader className="py-6 border-b border-slate-100 dark:border-slate-800/80 p-8 pb-5">
                        <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            Workspace Classification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col justify-center items-center h-80">
                        {!isMounted ? (
                            <div className="w-44 h-44 rounded-full bg-slate-150 dark:bg-slate-850 animate-pulse" />
                        ) : tenantTypeChartData.length > 0 ? (
                            <div className="relative w-full h-full flex flex-col justify-center items-center gap-4">
                                <div className="h-52 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tenantTypeChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {tenantTypeChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {tenantTypeChartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span>{entry.name}: <strong className="text-slate-900 dark:text-white font-black">{entry.value}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No classification data yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tenant-by-Tenant Activity Breakdown Table */}
            <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <CardTitle className="text-base font-black text-slate-900 dark:text-white">Detailed Security Report by Workspace</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Monitor logs, blocked IPs, and critical events by branch</p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search workspace..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 py-3 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 rounded-xl"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-8 py-5">Workspace Name</th>
                                <th className="px-8 py-5">Domain</th>
                                <th className="px-8 py-5">Workspace Type</th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('logs')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Total Audit Logs</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('blocked')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Blocked IPs</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('critical')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Security Alerts</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                            {sortedTenants.length > 0 ? sortedTenants.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </td>
                                    <td className="px-8 py-5 font-mono text-slate-500 text-xs">
                                        {item.domain}
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider",
                                            item.type === 'Enterprise' 
                                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25' 
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                        )}>
                                            {item.type === 'Enterprise' ? 'Enterprise SaaS' : 'Legacy Space'}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-5 font-black text-indigo-600 dark:text-indigo-400">
                                        {item.totalLogs.toLocaleString()} logs
                                    </td>
                                    <td className="px-8 py-5 font-bold text-rose-600 dark:text-rose-455">
                                        {item.blockedCount} IP
                                    </td>
                                    <td className="px-8 py-5 font-bold text-amber-600 dark:text-amber-405">
                                        {item.criticalCount} alerts
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">
                                        No workspaces found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Intranet SOC Monitoring Activity Overview */}
            <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800/80 gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <ShieldAlert className="w-7 h-7 animate-pulse text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Security Monitoring & Compliance Dashboard</h4>
                        <p className="text-lg font-black text-slate-100">Audited and recorded {auditCount.toLocaleString()} RLS security events</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2.5 px-4.5 py-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Row Level Security (RLS) enforcement</span>
                </div>
            </div>
        </div>
    );
}
