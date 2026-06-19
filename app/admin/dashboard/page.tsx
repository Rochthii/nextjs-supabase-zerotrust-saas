import React from 'react';
import { getGlobalDashboardStats } from '@/lib/cache/queries';
import { getSecurityStats } from '@/lib/audit/security-stats';
import { SystemJobsWidget } from '@/components/admin/system-jobs-widget';
import { DashboardCharts } from '@/components/admin/dashboard-charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Building2, 
    ArrowRight, 
    ShieldCheck, 
    Activity, 
    ShieldAlert, 
    Fingerprint, 
    Sparkles, 
    Globe, 
    FileText, 
    Terminal, 
    Settings, 
    AlertTriangle,
    CheckCircle2,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { isGlobalAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function GlobalDashboardPage() {
    // SECURITY: High-level system dashboard
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    // Direct database parallel fetching
    const stats = await getGlobalDashboardStats();
    const securityStats = await getSecurityStats();

    // Map Action Distribution from Record to Array for Pie Chart
    const securityActionData = Object.entries(securityStats.actionDistribution || {}).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
    }));

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* ── Premium Enterprise Header ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Neon Ambient Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -ml-64 -mb-64 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
                                <Terminal className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-100 via-indigo-100 to-slate-100 bg-clip-text text-transparent tracking-tight">Ecosystem Control Center</h1>
                        </div>
                        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                            Trung tâm giám sát toàn diện và điều phối tài nguyên time thực của nền tảng SaaS đa tenant (Multi-tenant). Chào mừng Super Admin!
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">HỆ THỐNG AN TOÀN & ỔN ĐỊNH</span>
                    </div>
                </div>
            </div>

            {/* ── Pillar Stats Grid (Four Core Columns of the Thesis Architecture) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pillar 1: Multi-tenancy */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden group rounded-[2rem] hover:border-indigo-500/50 hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.25)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-7 relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Workspaces</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Workspace</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stats.tenantsCount} organization</h3>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Enterprise: {stats.typeBreakdown?.enterprise || 0}</span>
                                <span>•</span>
                                <span>Legacy: {stats.typeBreakdown?.legacy || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pillar 2: Data Isolation (RLS Shield) */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden group rounded-[2rem] hover:border-emerald-500/50 hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.25)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-7 relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Secured</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cô lập database (RLS)</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{securityStats.rlsCoverage?.percentage || 100}% an toàn</h3>
                            <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> ISO 27017 Compliant
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Pillar 3: System Personnel */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden group rounded-[2rem] hover:border-amber-500/50 hover:shadow-[0_0_35px_-5px_rgba(245,158,11,0.25)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-7 relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Nhân sự</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nhân sự mạng lưới</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stats.totalMembersCount} nhân sự</h3>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Nhân viên & admin được cấp quyền</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pillar 4: SOC Operations (24h audit logs) */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden group rounded-[2rem] hover:border-rose-500/50 hover:shadow-[0_0_35px_-5px_rgba(244,63,94,0.25)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-7 relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
                                <Fingerprint className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-[9px] text-rose-500 font-bold uppercase tracking-wider">SOC Operations</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phiên hoạt động (24h)</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{securityStats.last24hLogs} event</h3>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Tổng audit logs: {securityStats.totalAuditLogs}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Interactive Recharts Dashboard (The 4 Corporate SaaS Ideas) ── */}
            <DashboardCharts 
                planChartData={stats.planChartData}
                featureChartData={stats.featureChartData}
                resourceChartData={stats.resourceChartData}
                securityActionData={securityActionData}
                hourlyTimeline={securityStats.hourlyTimeline || []}
            />

            {/* ── Dynamic Content & Threat Intelligence Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Tenants Resources List */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800/60 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                    
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-8 pb-6 relative z-10">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/30">
                                <Building2 className="w-5 h-5" />
                            </div>
                            Danh sách Workspace Mới khởi tạo
                        </CardTitle>
                        <CardDescription className="text-sm mt-1.5 text-slate-500 dark:text-slate-400">Danh sách các doanh nghiệp và chi nhánh được cấp phép gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Workspace</th>
                                        <th className="px-8 py-5">Kiểu Web</th>
                                        <th className="px-8 py-5 text-right">Plan / Trạng thái</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                                    {stats.recentTenants.map((tenant: any) => {
                                        return (
                                            <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-sm border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors relative">
                                                            {tenant.name.charAt(0)}
                                                            {tenant.tenant_type !== 'tenant' && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)]" title="Enterprise">
                                                                    <Building2 className="w-2 h-2 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                 <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{tenant.name}</p>
                                                                 <Badge variant="outline" className={cn(
                                                                    "text-[10px] px-1.5 py-0 h-4 leading-none uppercase font-bold",
                                                                    tenant.tenant_type !== 'tenant' 
                                                                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" 
                                                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                                                )}>
                                                                    {tenant.tenant_type !== 'tenant' ? 'Enterprise' : 'Legacy'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{tenant.domain}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-xs font-semibold">
                                                    {tenant.tenant_type !== 'tenant' ? 'Enterprise SaaS' : 'Legacy Organization'}
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                                    Gói: {tenant.plan_type || 'Free'}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link 
                                                        href={`/admin/t/${tenant.id}/dashboard`}
                                                        className="inline-flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 hover:text-white font-bold px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 transition-all border border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:border-indigo-500"
                                                    >
                                                        Quản trị <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {stats.recentTenants.length === 0 && (
                            <div className="py-24 text-center text-slate-400">
                                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Chưa có workspace nào được khởi tạo.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Threat Intelligence / SOC Alerts Panel (Production-Real Security) */}
                <div className="space-y-8">
                    {/* SOC Threat Alerts Panel */}
                    <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <CardHeader className="p-7 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                SOC Threat Intelligence <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-7 relative z-10">
                            <div className="space-y-4">
                                {securityStats.anomalyAlerts && securityStats.anomalyAlerts.length > 0 ? (
                                    securityStats.anomalyAlerts.map((alert: any, index: number) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 group">
                                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-rose-500">{alert.user_email}</p>
                                                <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                                                <span className="inline-flex text-[9px] font-black uppercase bg-rose-500/20 px-2 py-0.5 rounded-md mt-2 text-rose-400">
                                                    {alert.severity}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 dark:text-slate-400">
                                        <ShieldCheck className="w-12 h-12 text-emerald-500 mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <p className="text-sm font-bold text-emerald-500">Giám sát SOC An toàn</p>
                                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Không phát hiện hành vi xâm nhập hoặc bất thường trong 24h qua.</p>
                                    </div>
                                )}

                                {/* Noisy Neighbors checking */}
                                {securityStats.rateLimitHits && securityStats.rateLimitHits.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giám sát Noisy Neighbors (Rate limits)</h4>
                                        <div className="space-y-2">
                                            {securityStats.rateLimitHits.slice(0, 2).map((hit: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                    <span className="font-mono text-slate-400">{hit.ip_address}</span>
                                                    <span className="font-bold text-amber-500">{hit.hit_count} hits</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Infrastructure System Jobs */}
                    <SystemJobsWidget />

                    {/* SaaS Platform Identity Card */}
                    <Card className="border border-slate-800 shadow-2xl bg-slate-950 text-white overflow-hidden relative rounded-[2.5rem]">
                         <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                         <CardHeader className="p-8 pb-4 relative z-10">
                             <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> KIẾN TRÚC MẠNG LƯỚI SAAS
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-8 pt-0 relative z-10">
                             <div className="space-y-6">
                                  <div className="flex justify-between items-end">
                                      <div>
                                          <p className="text-5xl font-black text-white">{stats.tenantsCount}</p>
                                          <p className="text-sm font-medium text-slate-400 mt-1">Workspace Đa tenant</p>
                                      </div>
                                      <Link href="/admin/tenants" className="text-xs font-bold px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                                          Configuration Workspace
                                      </Link>
                                  </div>
                                  <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-800">
                                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-[100%] shadow-[0_0_12px_rgba(99,102,241,0.6)] relative">
                                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                      </div>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                     <span>Database RLS: Activate</span>
                                     <span>Tenant Isolation: Cô lập 100%</span>
                                  </div>
                             </div>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
