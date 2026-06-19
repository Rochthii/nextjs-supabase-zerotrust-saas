import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, Settings, Shield, Globe, ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { requireTenantAccess } from '@/lib/permissions';
import { getTenantConfig } from '@/lib/tenant';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function AdminDashboard({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    // SECURITY: Verify user has access to this specific tenant
    await requireTenantAccess(tenant_id);

    const base = `/admin/t/${tenant_id}`;
    
    // Get tenant type and config
    const tenantConfig = await getTenantConfig(tenant_id);
    const tenantName = (tenantConfig as any)?.name ?? 'Workspace';
    const tenantType: string = (tenantConfig as any)?.tenant_type ?? 'company';
    const tenantDomain = (tenantConfig as any)?.domain ?? 'N/A';
    const tenantSubdomain = (tenantConfig as any)?.subdomain ?? 'N/A';
    const tenantStatus = (tenantConfig as any)?.lifecycle_status ?? 'active';

    const supabase = await createClient();

    // Fetch tenant core metrics
    const { count: userCount } = await (supabase as any)
        .from('tenant_members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id);

    const { count: auditCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id);

    // Fetch recent audit logs for this tenant
    const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('created_at', { ascending: false })
        .limit(5);

    const stats = [
        {
            title: 'Tổng Nhân Sự',
            value: userCount ?? 0,
            icon: Users,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            title: 'Nhật Ký Audit',
            value: auditCount ?? 0,
            icon: FileText,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20'
        },
        {
            title: 'Custom Domain',
            value: tenantDomain !== 'N/A' ? 'Đã gán' : 'Chưa gán',
            icon: Globe,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Infrastructure Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {tenantName}
                            </h1>
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-black rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-widest border border-white/10">
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${tenantStatus === 'active' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-red-400'}`} />
                                {tenantStatus === 'active' ? 'Active Workspace' : 'Suspended'}
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-xl text-xs sm:text-sm leading-relaxed">
                            Cơ sở hạ tầng B2B cô lập dữ liệu. Giám sát các sự kiện an ninh, nhật ký truy cập và cấu hình phân quyền tenant theo thời gian thực.
                        </p>
                    </div>
                    
                    <div className="flex flex-col px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Hạ Tầng Lõi</span>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 tracking-wide">Zero Trust Tenant Isolation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className={`group border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-md ${stat.border}`}>
                            <CardContent className="p-6 relative">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${stat.bg} ${stat.border}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Security Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
                        <CardHeader className="border-b border-slate-800/80 bg-slate-900/30 p-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-100">
                                        <Activity className="w-4.5 h-4.5 text-violet-400" />
                                        Hoạt động An ninh Gần đây
                                    </CardTitle>
                                    <CardDescription className="text-[11px] text-slate-400 mt-1">5 hoạt động log audit gần nhất của workspace này</CardDescription>
                                </div>
                                <Link href={`${base}/audit-logs`} className="text-[10px] text-violet-400 hover:text-violet-300 font-bold border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 rounded-xl transition-all">
                                    Xem tất cả
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-950/20 text-slate-400 border-b border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">Thời gian</th>
                                            <th className="px-5 py-3">Nhân sự</th>
                                            <th className="px-5 py-3">Hành động</th>
                                            <th className="px-5 py-3">Bảng dữ liệu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {(recentLogs || []).map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="px-5 py-3 text-[10px] font-mono text-slate-450">
                                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-5 py-3 font-semibold text-slate-200">
                                                    {log.user_email || 'System'}
                                                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{log.ip_address}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${
                                                        log.action === 'delete' ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' :
                                                        log.action === 'insert' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-slate-300 font-mono text-[10px]">
                                                    {log.table_name}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!recentLogs || recentLogs.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                                                    Không có hoạt động logs nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Infrastructure Actions */}
                <div className="space-y-6">
                    <Card className="border border-slate-800 rounded-[2rem] overflow-hidden bg-slate-950 text-white relative shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 pointer-events-none" />
                        <CardHeader className="py-5 px-6 border-b border-slate-800/80 bg-slate-900/50 relative z-10">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <ShieldAlert className="w-4.5 h-4.5 text-blue-400" />
                                Cấu hình & Vận hành
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 relative z-10">
                            <ul className="grid gap-3">
                                {[
                                    {
                                        href: `${base}/security`,
                                        title: 'Security Center',
                                        desc: 'Giám sát và gỡ block IP',
                                        icon: Shield
                                    },
                                    {
                                        href: `${base}/settings/domain`,
                                        title: 'Custom Domain',
                                        desc: 'Cài đặt tên miền riêng',
                                        icon: Globe
                                    },
                                    {
                                        href: `${base}/settings`,
                                        title: 'Cấu hình Chi nhánh',
                                        desc: 'Thiết lập tham số workspace',
                                        icon: Settings
                                    }
                                ].map((link, idx) => (
                                    <li key={idx}>
                                        <Link 
                                            href={link.href}
                                            className="flex items-center gap-3 p-3 rounded-2xl border bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-blue-500/40 hover:shadow-lg transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800 border border-slate-750 group-hover:bg-blue-600/10 transition-colors">
                                                <link.icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{link.title}</h4>
                                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{link.desc}</p>
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                                                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
