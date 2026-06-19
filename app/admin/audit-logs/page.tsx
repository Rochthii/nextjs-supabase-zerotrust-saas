import { requirePermission, getTenantScope } from '@/lib/permissions';
// @ts-ignore - Module import
import { getAuditLogs } from '@/lib/audit';
import { formatAuditChanges, getResourceLabel, getActionColor } from '@/lib/audit/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AuditExportDialog } from '@/components/admin/audit/audit-export-dialog';

// Formatting utilities moved to lib/audit/formatters.ts

import { AuditFilters } from './AuditFilters';
import { Button as UIButton } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default async function AuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Only super_admin and admin can view audit logs
    await requirePermission('analytics', 'read');
    const scope = await getTenantScope();

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const resource = params.resource as string;
    const action = params.action as string;
    const search = params.search as string;
    
    const limit = 50;

    // Get recent audit logs with filters
    const { logs, count } = await getAuditLogs({ 
        limit, 
        page,
        resource: resource === 'all' ? undefined : resource,
        action: action === 'all' ? undefined : action,
        search: search || undefined,
        tenant_id: scope
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
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-slate-950/80 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">System Giám sát Audit Trail</h1>
                            <p className="text-slate-400 mt-1.5 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Real-time protection — ISO 27017 §CLD.12.4.1 — Total: <strong className="text-amber-400 font-black">{count}</strong> records
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <AuditExportDialog currentFilters={currentFilters} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AuditFilters />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                            Records found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{count}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                            Page current
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                            {page} / {totalPages || 1}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/60 border border-emerald-200 dark:border-emerald-950/40 shadow-lg relative overflow-hidden backdrop-blur-xl rounded-2xl">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                            Hành động CREATE (An toàn)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-450">
                            {logs.filter(l => l.action === 'create').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/60 border border-rose-200 dark:border-rose-950/40 shadow-lg relative overflow-hidden backdrop-blur-xl rounded-2xl">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider">
                            Hành động DELETE (Rủi ro)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-450">
                            {logs.filter(l => l.action === 'delete').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 shadow-xl rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Định danh (User)
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Tài nguyên
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Dấu vết (IP/Agent)
                                    </th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Details thay đổi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {logs && logs.length > 0 ? (
                                    logs.map((log: any) => {
                                        const isDelete = log.action === 'delete';
                                        return (
                                        <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isDelete ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                                            <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                {new Date(log.created_at).toLocaleString('vi-VN', {
                                                    timeZone: 'Asia/Ho_Chi_Minh',
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium">
                                                {log.user_email === 'guest@anonymous' ? (
                                                    <Badge variant="outline" className="font-mono text-[10px] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">GUEST</Badge>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400 font-mono">{log.user_email || 'System'}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    log.action === 'delete' ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                                    log.action === 'create' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                                                    log.action === 'update' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-800 dark:text-slate-300 font-medium">
                                                <div>{getResourceLabel(log.resource)}</div>
                                                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-1 flex items-center gap-1">
                                                    <span className="text-xs">🏢</span>
                                                    <span>{log.tenant_name || 'System (Global)'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="space-y-1">
                                                    <div className="font-mono text-amber-600/70 dark:text-amber-400/70">IP: {log.ip_address || '-'}</div>
                                                    <div className="truncate max-w-[120px] text-[10px] text-slate-400 dark:text-slate-500" title={log.user_agent}>
                                                        {log.user_agent || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                                                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 break-words whitespace-pre-wrap max-h-32 overflow-y-auto w-full shadow-inner text-slate-700 dark:text-slate-400">
                                                    {formatAuditChanges(log.changes)}
                                                </div>
                                            </td>
                                        </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                                            Not found dấu vết nào.
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
                <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg relative z-10">
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                        Display từ <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> đến{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * limit, count)}</span> trong total{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span> records
                    </div>
                    <div className="flex gap-2 items-center">
                        <Link
                            href={{
                                pathname: '/admin/audit-logs',
                                query: { ...Object.fromEntries(new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as any)), page: page - 1 },
                            }}
                            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors'}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center px-4 text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                            TRANG {page} / {totalPages}
                        </div>
                        <Link
                            href={{
                                pathname: '/admin/audit-logs',
                                query: { ...Object.fromEntries(new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as any)), page: page + 1 },
                            }}
                            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors'}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
