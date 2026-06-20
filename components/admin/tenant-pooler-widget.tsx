'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, RefreshCw, Zap, Server, Activity, Users, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TenantPoolStats {
    tenantId: string;
    tenantName: string;
    plan: 'free' | 'pro' | 'enterprise';
    activeConnections: number;
    maxConcurrentLimit: number;
    usagePercentage: number;
    state: 'NORMAL' | 'HIGH_LOAD' | 'EXHAUSTED';
}

export function TenantPoolerWidget() {
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [data, setData] = useState<TenantPoolStats[]>([]);

    const fetchPools = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/security/tenant-pooler');
            if (res.ok) {
                const json = await res.json();
                setData(json.stats || []);
            } else {
                toast.error('Failed to load Connection Pools data');
            }
        } catch (e) {
            toast.error('Error connect Connection Pooler API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPools();
        
        // Polling stats every 4 seconds to observe real-time connections
        const interval = setInterval(fetchPools, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateFlood = async (tenantId: string, plan: string, count: number) => {
        setSimulating(true);
        try {
            const res = await fetch('/api/admin/security/tenant-pooler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'simulate-flood',
                    tenantId,
                    plan,
                    count
                })
            });
            const json = await res.json();
            if (res.ok) {
                const results = json.results;
                if (results.blockedRequests > 0) {
                    toast.warning(
                        `BLOCKED SUCCESSFUL! ${results.blockedRequests}/${results.totalRequests} tenant queries were throttled to prevent resource exhaustion of the shared connection pool.`
                    );
                } else {
                    toast.success(
                        `Submitted ${results.successfulAcquires} concurrent queries. Tenant operates normally within limits.`
                    );
                }
                fetchPools();
            } else {
                toast.error(json.error || 'Failed to simulate connection flood');
            }
        } catch (e) {
            toast.error('Error connect API');
        } finally {
            setSimulating(false);
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'enterprise': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'pro': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'EXHAUSTED': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'HIGH_LOAD': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
    };

    return (
        <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <CardHeader className="border-b border-slate-800/60 pb-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <Server className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                Tenant Connection Pooler (Supavisor Sandbox)
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Prevents shared database resource starvation (Anti-Noisy Neighbor protection)
                            </CardDescription>
                        </div>
                    </div>
                    
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={fetchPools} 
                        disabled={loading}
                        className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent className="pt-6 relative z-10 space-y-6">
                {/* Visual statistics grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.length === 0 ? (
                        <div className="col-span-full text-center py-6 text-slate-500 text-xs">
                            No active tenant connections found.
                        </div>
                    ) : (
                        data.map((t) => {
                            const isExhausted = t.state === 'EXHAUSTED';
                            const isHighLoad = t.state === 'HIGH_LOAD';
                            
                            return (
                                <Card 
                                    key={t.tenantId} 
                                    className={`bg-slate-900/40 border transition-all duration-300 ${
                                        isExhausted 
                                            ? 'border-rose-500/30 bg-rose-950/5' 
                                            : 'border-slate-800/80 hover:border-slate-700/80'
                                    }`}
                                >
                                    <CardContent className="p-5 space-y-4">
                                        {/* Tenant Header */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-100 leading-tight line-clamp-1">{t.tenantName}</h4>
                                                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{t.tenantId.substring(0, 18)}...</span>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <Badge className={`text-[9px] uppercase tracking-wider px-2 py-0 border ${getPlanColor(t.plan)}`}>
                                                    {t.plan}
                                                </Badge>
                                                <Badge className={`text-[9px] uppercase tracking-wider px-2 py-0 border ${getStateColor(t.state)}`}>
                                                    {t.state}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        {/* Concurrent Usage Progress */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="text-slate-400">Database Slots:</span>
                                                <span className="font-bold text-slate-200">
                                                    {t.activeConnections} / {t.maxConcurrentLimit} active
                                                </span>
                                            </div>
                                            
                                            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/40">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isExhausted 
                                                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                                                            : isHighLoad 
                                                                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                                                                : 'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${Math.min(t.usagePercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Simulation Control */}
                                        <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleSimulateFlood(t.tenantId, t.plan, 2)}
                                                disabled={simulating}
                                                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-[10px] h-7 flex-1 border border-slate-800 w-full"
                                            >
                                                Normal Query
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleSimulateFlood(t.tenantId, t.plan, t.maxConcurrentLimit + 3)}
                                                disabled={simulating}
                                                className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] h-7 font-bold flex-1 border-none shadow w-full"
                                            >
                                                Flood (Simulate 429)
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
                
                {/* Defensive mechanism callout */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                        <h5 className="text-xs font-bold text-slate-300">Automatic Resource Contention Shield</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            By applying <strong>Tenant-scoped Connection Limits</strong>, the system automatically throttles concurrent queries from any tenant with excessive traffic (Noisy Neighbor) within their respective pool limits (e.g. Free plan max 3 slots). This prevents database resource exhaustion, ensuring Pro/Enterprise tenants retain stable, guaranteed pool access.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
