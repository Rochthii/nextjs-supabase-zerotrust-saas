import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, ServerCog } from 'lucide-react';
import { cn } from '@/lib/utils';

export async function SystemJobsWidget() {
    const supabase = await createAdminClient();
    
    // Fetch the 5 most recent cron runs
    const { data: logs } = await (supabase as any)
        .from('cron_job_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(5);

    return (
        <Card className="border border-slate-200 dark:border-slate-800/60 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
            
            <CardHeader className="p-7 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Cron Job History <ServerCog className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-slate-500">
                    Status of automatic background tasks
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {logs && logs.length > 0 ? logs.map((log: any) => (
                        <div key={log.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-4">
                            <div className="shrink-0 mt-0.5">
                                {log.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : log.status === 'failed' ? (
                                    <XCircle className="w-5 h-5 text-rose-500" />
                                ) : (
                                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {log.job_name}
                                    </p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs truncate",
                                    log.status === 'failed' ? "text-rose-500" : "text-slate-500"
                                )}>
                                    {log.message || (log.status === 'running' ? 'Running...' : 'Complete')}
                                </p>
                                {log.duration_ms && (
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                        {(log.duration_ms / 1000).toFixed(1)}s
                                    </p>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">No cron job logs found.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
