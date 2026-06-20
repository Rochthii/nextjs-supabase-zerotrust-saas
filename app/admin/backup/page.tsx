'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
    id: string;
    name: string;
}

interface BackupHistoryEntry {
    id: string;
    job_name: string;
    status: 'success' | 'failed' | 'running';
    message: string | null;
    metadata: Record<string, any> | null;
    duration_ms: number | null;
    executed_at: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string>('all');
    const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
    const [tenants, setTenants] = useState<Tenant[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [restoring, setRestoring] = useState(false);

    // TASK-5.4: Backup history state
    const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // TASK-5.2: Fetch tenants list on mount
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await fetch('/api/admin/tenants-list');
                if (!res.ok) return; // Not super_admin -> hide it
                const data = await res.json();
                setTenants(Array.isArray(data) ? data : []);
            } catch {
                // Tenant fetch error is not critical -> hide select box
            }
        };
        fetchTenants();
    }, []);

    // TASK-5.4: Fetch backup history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const res = await fetch('/api/admin/backup-history');
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Could not load backup history');
                }
                const data = await res.json();
                setBackupHistory(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setHistoryError(e.message || 'Error loading backup history');
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleExport = async () => {
        setLoading(true);

        try {
            // Build URL với các params filter
            const params = new URLSearchParams();
            if (selectedTable !== 'all') params.set('table', selectedTable);
            if (selectedTenantId !== 'all') params.set('tenant_id', selectedTenantId);

            const urlEndpoint = `/api/admin/backup${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(urlEndpoint);
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to backup');
            }

            const data = await response.json();

            // Create JSON blob
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });

            // Tạo filename có thông tin tenant nếu filter
            const dateStr = new Date().toISOString().split('T')[0];
            const tenantName = selectedTenantId !== 'all'
                ? tenants.find(t => t.id === selectedTenantId)?.name?.replace(/\s+/g, '-').toLowerCase() || selectedTenantId.slice(0, 8)
                : null;
            const tableSuffix = selectedTable !== 'all' ? `-${selectedTable}` : '';
            const tenantSuffix = tenantName ? `-tenant-${tenantName}` : '';
            const filename = `saas-backup-${dateStr}${tenantSuffix}${tableSuffix}.json`;

            // Download — must append, click, and cleanup to actually download the file
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Backup file created successfully!');
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while exporting backup');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('WARNING: Restoring will OVERWRITE the current data with the data in the JSON file. Are you sure you want to continue?')) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setRestoring(true);
        const formData = new FormData();
        formData.append('backup_file', file);

        try {
            const res = await fetch('/api/admin/backup/restore', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to restore');

            toast.success(`Restore successful! Overwrote ${result.total || 0} records.`);
        } catch (error: any) {
            toast.error(error.message || 'Error restoring data');
        } finally {
            setRestoring(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ─── Status badge renderer ─────────────────────────────────────────────────
    const renderStatusBadge = (status: BackupHistoryEntry['status']) => {
        if (status === 'success') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                </span>
            );
        }
        if (status === 'failed') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                    <XCircle className="w-3 h-3" />
                    Failed
                </span>
            );
        }
        // running
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
            </span>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <Download className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">Backup & Storage Administration</h1>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                Backup and restore multi-tenant system data. Ensure high availability and data integrity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Card */}
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            Export System Data (Export JSON)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Action to download global data (news, events, media, charity funds) in original structured JSON format.
                            </p>

                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed font-medium">
                                    <strong>Note:</strong> Backup files only contain structured text data. Media files remain stored in the public Supabase CDN bucket.
                                </p>
                            </div>

                            {/* TASK-5.2: Data Scope */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Export Data Scope (Partial Check)</label>
                                <select 
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="w-full max-w-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    disabled={loading || restoring}
                                >
                                    <option value="all">All Data (Full Export)</option>
                                    <option value="news">Dharma Magazine (news)</option>
                                    <option value="events">Events (events)</option>
                                    <option value="transactions">Individual Transactions (transactions)</option>
                                    <option value="event_registrations">Event Registrations (event_registrations)</option>
                                    <option value="about_sections">Branch About Sections (about_sections)</option>
                                </select>
                            </div>

                            {/* TASK-5.2: Filter by Tenant — only render if tenants exist (super_admin) */}
                            {tenants.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter by Workspace (Tenant)</label>
                                    <select
                                        value={selectedTenantId}
                                        onChange={(e) => setSelectedTenantId(e.target.value)}
                                        className="w-full max-w-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        disabled={loading || restoring}
                                    >
                                        <option value="all">All Workspaces (Global)</option>
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    {selectedTenantId !== 'all' && (
                                        <p className="text-xs text-amber-550/80 font-medium">
                                            Backup will only include data of the selected workspace
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={loading || restoring}
                            className="w-full sm:w-auto mt-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/25 px-6 transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exporting data...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Backup (JSON)
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Restore Card */}
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-rose-500/5">
                        <CardTitle className="text-xl font-bold text-rose-600 dark:text-rose-450 flex items-center gap-2">
                            Restore System Data (Import JSON)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Feature to automatically overwrite and directly fill database gaps based on a provided JSON backup file.
                            </p>
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
                                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
                                    WARNING: This action will permanently overwrite existing data with the data in the file. Uploading the wrong file may lead to system-wide data inconsistency. Proceed with caution!
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                            <input 
                                type="file"
                                accept=".json,application/json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleRestore}
                            />
                            <Button 
                                variant="destructive"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || restoring}
                                className="font-bold rounded-xl shadow-lg shadow-rose-500/20 px-6 transition-all duration-200"
                            >
                                {restoring ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        Loading and inserting data...
                                    </>
                                ) : (
                                    "Upload JSON File & Restore"
                                )}
                            </Button>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Auto-Upsert API Chunking</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TASK-5.4: Backup History Section */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <History className="w-5 h-5 text-amber-400" />
                        Automatic Backup History (Cron Jobs)
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last 10 executions of the backup cron job</p>
                </CardHeader>
                <CardContent className="p-6">
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading history...</span>
                        </div>
                    ) : historyError ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-rose-400">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm">{historyError}</span>
                        </div>
                    ) : backupHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
                            <Clock className="w-8 h-8 opacity-40" />
                            <p className="text-sm">No backup history recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700/60">
                                        <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                                        <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job / File</th>
                                        <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                                        <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Records Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {backupHistory.map((entry) => (
                                        <tr
                                            key={entry.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                                        >
                                            <td className="py-3.5 px-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">
                                                        {formatDistanceToNow(new Date(entry.executed_at), { addSuffix: true, locale: enUS })}
                                                    </span>
                                                    <span className="text-slate-400 dark:text-slate-500 text-xs">
                                                        {new Date(entry.executed_at).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                {renderStatusBadge(entry.status)}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                    <span className="text-slate-700 dark:text-slate-300 font-mono text-xs truncate">
                                                        {entry.job_name}
                                                    </span>
                                                    {entry.metadata?.file_path && (
                                                        <span className="text-slate-400 dark:text-slate-500 text-xs truncate font-mono">
                                                            {String(entry.metadata.file_path).split('/').pop()}
                                                        </span>
                                                    )}
                                                    {entry.message && entry.status === 'failed' && (
                                                        <span className="text-rose-400 text-xs truncate" title={entry.message}>
                                                            {entry.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3 text-right">
                                                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                                                    {entry.duration_ms != null
                                                        ? entry.duration_ms >= 1000
                                                            ? `${(entry.duration_ms / 1000).toFixed(1)}s`
                                                            : `${entry.duration_ms}ms`
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right">
                                                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                                                    {entry.metadata?.total_records != null
                                                        ? Number(entry.metadata.total_records).toLocaleString('en-US')
                                                        : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
