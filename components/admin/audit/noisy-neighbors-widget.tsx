import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, Wifi, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NoisyNeighborsWidgetProps {
    rateLimitHits: { ip_address: string; action_type: string; hit_count: number; last_hit: string }[];
}

export function NoisyNeighborsWidget({ rateLimitHits }: NoisyNeighborsWidgetProps) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] bg-white dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen transition-transform group-hover:scale-110 duration-700" />
            
            <CardHeader className="p-7 pb-5 border-b border-slate-100 dark:border-slate-800 relative z-10">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-amber-500" /> Noisy Neighbors (Rate Limits)
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-slate-500">
                    Top IP bị block/throttle nhiều nhất do spam API
                </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 relative z-10">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {rateLimitHits && rateLimitHits.length > 0 ? (
                        rateLimitHits.map((hit, i) => (
                            <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{hit.ip_address}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">{hit.action_type}</span>
                                            <span className="text-[10px] text-slate-400">
                                                {formatDistanceToNow(new Date(hit.last_hit), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                                        {hit.hit_count}
                                    </span>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Hits</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                            <Shield className="w-12 h-12 mb-3 text-emerald-500/50" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Không phát hiện Noisy Neighbor</p>
                            <p className="text-xs mt-1 text-center">System active trong ngưỡng an toàn</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
