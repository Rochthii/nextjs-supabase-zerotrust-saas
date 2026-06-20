import { requirePermission, requireTenantAccess } from '@/lib/permissions';
import { getAuditLogs } from '@/lib/audit';
import { formatAuditChanges, getResourceLabel } from '@/lib/audit/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuditExportDialog } from '@/components/admin/audit/audit-export-dialog';
import { AuditFilters } from '@/app/admin/audit-logs/AuditFilters';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShieldAlert, History, Activity } from 'lucide-react';
import { getTenantConfig } from '@/lib/tenant';

export default async function TenantAuditLogsPage({
    params,
    searchParams
}: {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { tenant_id } = await params;
    
    // SECURITY: Ensure user is authenticated, authorized, and belongs to this tenant
    await requireTenantAccess(tenant_id);
    await requirePermission('analytics', 'read');

    // Get context tenant information
    const tenantConfig = await getTenantConfig(tenant_id);
    const tenantName = (tenantConfig as any)?.name ?? 'Branch';

    const sParams = await searchParams;
    const page = Number(sParams.page) || 1;
    const resource = sParams.resource as string;
    const action = sParams.action as string;
    const search = sParams.search as string;
    
    const limit = 50;

    // Get tenant-isolated audit logs with filters
    const { logs, count } = await getAuditLogs({ 
        limit, 
        page,
        resource: resource === 'all' ? undefined : resource,
        action: action === 'all' ? undefined : action,
        search: search || undefined,
        tenant_id: tenant_id // Forced tenant-level isolation
    });

    const totalPages = Math.ceil(count / limit);

    const currentFilters = {
        resource,
        action,
        search
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Abstract lighting */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-2xl -ml-32 -mb-32 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500/30 text-violet-400">
                            <Activity className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-200 via-violet-400 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                                    Activity Logs
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 text-violet-300">
                                    Secure Isolation
                                </span>
                            </div>
                            <p className="text-slate-400 mt-1.5 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Real-time monitoring for <strong>{tenantName}</strong> — Total: <strong className="text-violet-400 font-bold">{count}</strong> records
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <AuditExportDialog tenantId={tenant_id} currentFilters={currentFilters} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AuditFilters />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Records Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{count}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Current Page
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-violet-400">
                            {page} / {totalPages || 1}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/60 border border-emerald-950/40 shadow-lg relative overflow-hidden backdrop-blur-xl rounded-2xl">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            New Records (CREATE)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-emerald-450">
                            {logs.filter(l => l.action === 'create').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/60 border border-rose-950/40 shadow-lg relative overflow-hidden backdrop-blur-xl rounded-2xl">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Deleted Actions (DELETE)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-rose-450">
                            {logs.filter(l => l.action === 'delete').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 overflow-hidden relative z-10 shadow-xl rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Identity (User)
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Resource
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Trace (IP/Agent)
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Change Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {logs && logs.length > 0 ? (
                                    logs.map((log: any) => {
                                        const isDelete = log.action === 'delete';
                                        return (
                                        <tr key={log.id} className={`hover:bg-slate-800/50 transition-colors ${isDelete ? 'bg-rose-950/20' : ''}`}>
                                            <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                                                {new Date(log.created_at).toLocaleString('en-US', {
                                                    timeZone: 'Asia/Ho_Chi_Minh',
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium">
                                                {log.user_email === 'guest@anonymous' ? (
                                                    <Badge variant="outline" className="font-mono text-[10px] border-slate-700 text-slate-400 bg-slate-800">GUEST</Badge>
                                                ) : (
                                                    <span className="text-violet-400 font-mono">{log.user_email || 'System'}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    log.action === 'delete' ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                    log.action === 'create' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-450 border border-emerald-500/30' :
                                                    log.action === 'update' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                    'bg-slate-800 text-slate-400 border border-slate-700'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-355 font-medium">
                                                <div>{getResourceLabel(log.resource)}</div>
                                                <div className="text-[10px] text-slate-500 font-normal mt-1 flex items-center gap-1">
                                                    <span>🏢</span>
                                                    <span>{tenantName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-400">
                                                <div className="space-y-1">
                                                    <div className="font-mono text-violet-400/70">IP: {log.ip_address || '-'}</div>
                                                    <div className="truncate max-w-[120px] text-[10px] text-slate-500" title={log.user_agent}>
                                                        {log.user_agent || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-400 max-w-md">
                                                <div className="text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 break-words whitespace-pre-wrap max-h-32 overflow-y-auto w-full shadow-inner text-slate-400">
                                                    {formatAuditChanges(log.changes)}
                                                </div>
                                            </td>
                                        </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-450">
                                            No activity traces found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl px-5 py-4 rounded-2xl border border-slate-800 shadow-lg relative z-10">
                    <div className="text-sm text-slate-400 font-mono">
                        Showing <span className="font-bold text-white">{(page - 1) * limit + 1}</span> to{' '}
                        <span className="font-bold text-white">{Math.min(page * limit, count)}</span> of{' '}
                        <span className="font-bold text-white">{count}</span> total records
                    </div>
                    <div className="flex gap-2 items-center">
                        <Link
                            href={{
                                pathname: `/admin/t/${tenant_id}/audit-logs`,
                                query: { ...Object.fromEntries(new URLSearchParams(Object.entries(currentFilters).filter(([_, v]) => v !== undefined) as any)), page: page - 1 },
                            }}
                            className={`p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700 hover:text-white transition-colors'}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center px-4 text-sm font-bold text-violet-400 font-mono">
                            PAGE {page} / {totalPages}
                        </div>
                        <Link
                            href={{
                                pathname: `/admin/t/${tenant_id}/audit-logs`,
                                query: { ...Object.fromEntries(new URLSearchParams(Object.entries(currentFilters).filter(([_, v]) => v !== undefined) as any)), page: page + 1 },
                            }}
                            className={`p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700 hover:text-white transition-colors'}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
