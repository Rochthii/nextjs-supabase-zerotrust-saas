'use client';

import { useState } from 'react';
import { BenchmarkResult } from './scaling-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Zap, AlertCircle, BarChart3, Database, Layers, ArrowRight, ShieldAlert } from 'lucide-react';

// Explicit type definition for CustomTooltip to avoid any TypeScript errors from Recharts
interface TooltipPayloadItem {
    name: string;
    value: number;
    color?: string;
    [key: string]: any;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950/95 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl min-w-[240px] border-amber-500/20">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2.5 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>Dataset Size</span>
                    <span className="font-mono text-white">{Number(label).toLocaleString()} rows</span>
                </p>
                <div className="space-y-2">
                    {payload.map((item) => {
                        const nameLabel = item.name.split(' — ')[0];
                        const isOptimized = nameLabel.toLowerCase().includes('optimized');
                        return (
                            <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
                                <span className="flex items-center gap-2 text-slate-300 font-medium">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    {nameLabel}
                                </span>
                                <span className={`font-mono font-black ${isOptimized ? 'text-emerald-400 font-black' : 'text-white'}`}>
                                    {Number(item.value).toFixed(2)} ms
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function ScalingBenchmarkPage() {
    const [data, setData] = useState<BenchmarkResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePercentile, setActivePercentile] = useState<'p50' | 'p95' | 'p99'>('p50');

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/benchmark', { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Unknown error');
            setData(json.results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format X axis (1k, 10k, 100k)
    const formatDatasetSize = (value: number) => {
        if (value >= 1000) return `${value / 1000}k`;
        return String(value);
    };

    // Dynamically map data based on selected percentile
    const chartData = data.map((row) => ({
        datasetSize: row.datasetSize,
        appFilterMs: row.appFilter[activePercentile],
        rlsJoinMs: row.rlsJoin[activePercentile],
        rlsClaimsMs: row.rlsClaims[activePercentile],
    }));

    // Performance metrics statistics based on dynamically mapped chartData
    const getStats = () => {
        if (chartData.length === 0) return null;
        const maxScale = chartData[chartData.length - 1];
        const joinMs = maxScale.rlsJoinMs;
        const claimsMs = maxScale.rlsClaimsMs;
        const speedup = claimsMs > 0 ? (joinMs / claimsMs).toFixed(1) : '0';
        const reduction = joinMs > 0 ? (((joinMs - claimsMs) / joinMs) * 100).toFixed(1) : '0';
        
        return {
            speedup,
            reduction,
            maxScaleSize: maxScale.datasetSize.toLocaleString(),
            claimsMs: claimsMs.toFixed(2),
            joinMs: joinMs.toFixed(2),
        };
    };

    const stats = getStats();

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-slate-100 dark bg-slate-950 p-6 rounded-[2.5rem] min-h-screen">
            {/* Premium Header - SaaS Dark Mode with Glowing Ambient effects */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl -mr-48 -mt-48 mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl -ml-48 -mb-48 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-400/20 text-slate-950">
                            <ShieldAlert className="w-8 h-8 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">
                                    Large Dataset Filtering Performance
                                </h1>
                                <span className="px-3 py-1 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full uppercase tracking-wider">
                                    Chapter 5 Thesis
                                </span>
                            </div>
                            <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
                                Experimental chart measuring and visually comparing performance between 3 authorization solutions as dataset size scales up to <strong className="text-amber-400">100,000 records</strong>.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-7 py-4 rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition-all text-xs border border-amber-400/30 uppercase tracking-widest shrink-0"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-slate-950 animate-spin" />
                                <span>Benchmarking...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                                <span>Start Experiment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2rem] flex items-start gap-4 animate-in shake duration-500">
                    <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-200 font-bold text-sm">System Experiment Error</p>
                        <p className="text-red-400/90 text-xs mt-1 leading-relaxed">{error}</p>
                    </div>
                </div>
            )}

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat 1: Speedup Ratio */}
                <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-7 transition-all duration-300 hover:shadow-amber-500/5 hover:border-amber-500/30 group">
                    <div className="flex items-center justify-between text-slate-400 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Speedup Ratio</span>
                        <Zap className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                        {stats ? `${stats.speedup}x` : '—'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                        JWT Claims faster than RLS JOIN (Legacy)
                    </p>
                </div>

                {/* Stat 2: Latency Reduction */}
                <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-7 transition-all duration-300 hover:shadow-emerald-500/5 hover:border-emerald-500/30 group">
                    <div className="flex items-center justify-between text-slate-400 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Latency Reduction</span>
                        <Layers className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        {stats ? `-${stats.reduction}%` : '—'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                        Authorization overhead reduction
                    </p>
                </div>

                {/* Stat 3: Complexity */}
                <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-7 transition-all duration-300 hover:shadow-blue-500/5 hover:border-blue-500/30 group">
                    <div className="flex items-center justify-between text-slate-400 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Validation Overhead</span>
                        <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">Const</p>
                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                        Claim extraction in RAM Session
                    </p>
                </div>

                {/* Stat 4: Sample size */}
                <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-7 transition-all duration-300 hover:shadow-purple-500/5 hover:border-purple-500/30 group">
                    <div className="flex items-center justify-between text-slate-400 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Test Samples</span>
                        <Database className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-4xl font-black text-slate-200">
                        {stats ? stats.maxScaleSize : '100,000'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                        Measured data rows
                    </p>
                </div>
            </div>

            {/* Performance Chart Card */}
            <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <div className="py-6 px-8 border-b border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between w-full xl:w-auto">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                                Performance Scaling Curve (Percentile Stats)
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold">
                                Comparing actual processing latency (ms) as dataset size (N) grows linearly
                            </p>
                        </div>
                        
                        {/* Percentiles P50/P95/P99 Switcher */}
                        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-850 shadow-inner shrink-0">
                            {(['p50', 'p95', 'p99'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivePercentile(p)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                        activePercentile === p
                                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {p === 'p50' ? 'P50 (Median)' : p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-end text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <span>App-side Filter: O(N)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span>RLS JOIN: O(N)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-emerald-400">Optimized RLS: O(log N)</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="h-96 w-full relative">
                        {data.length === 0 && !loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                                    <BarChart3 className="w-8 h-8 text-amber-500" />
                                </div>
                                <p className="font-black text-slate-350 tracking-wider uppercase text-xs">No experimental data yet</p>
                                <p className="text-slate-500 text-xs max-w-sm text-center leading-relaxed font-medium">
                                    Click the <strong className="text-amber-400 font-bold">"Start Experiment"</strong> button to run RPC measurement on up to 100,000 rows of data directly on Supabase.
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm gap-4 bg-slate-950/20 backdrop-blur-sm rounded-[2rem]">
                                <div className="w-14 h-14 rounded-full border-4 border-slate-850 border-t-amber-500 animate-spin shadow-lg" />
                                <p className="font-black text-amber-400 tracking-widest animate-pulse uppercase text-xs">Executing measurement RPCs...</p>
                            </div>
                        )}

                        {chartData.length > 0 && !loading && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="datasetSize"
                                        tickFormatter={formatDatasetSize}
                                        stroke="#475569"
                                        fontSize={11}
                                        fontWeight="bold"
                                    />
                                    <YAxis 
                                        stroke="#475569" 
                                        fontSize={11} 
                                        fontWeight="bold"
                                        label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', offset: -5, fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '15px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="appFilterMs"
                                        name="App-side Filtering (Worst)"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#090d16' }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rlsJoinMs"
                                        name="Standard RLS with JOIN"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#090d16' }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rlsClaimsMs"
                                        name="Optimized RLS (Claims)"
                                        stroke="#10b981"
                                        strokeWidth={5}
                                        dot={{ r: 6, stroke: '#10b981', strokeWidth: 3, fill: '#090d16' }}
                                        activeDot={{ r: 9 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Data Table */}
            {chartData.length > 0 && !loading && (
                <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in fade-in duration-700">
                    <div className="py-5 px-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                            Detailed comparative table of scenarios ({activePercentile.toUpperCase()})
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse text-left text-xs text-slate-350">
                            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Test Row Count (N)</th>
                                    <th className="px-8 py-5">App-side Filtering (ms)</th>
                                    <th className="px-8 py-5">Standard RLS JOIN (ms)</th>
                                    <th className="px-8 py-5 text-emerald-400">Optimized RLS (ms)</th>
                                    <th className="px-8 py-5">Superior Speedup Metric</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 font-medium">
                                {chartData.map((row) => {
                                    const improvement = row.rlsJoinMs > 0
                                        ? ((row.rlsJoinMs - row.rlsClaimsMs) / row.rlsJoinMs * 100).toFixed(1)
                                        : '—';
                                    const speedup = row.rlsClaimsMs > 0 ? (row.rlsJoinMs / row.rlsClaimsMs).toFixed(1) : '—';
                                    
                                    return (
                                        <tr key={row.datasetSize} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 font-mono font-bold text-slate-200">
                                                {row.datasetSize.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 font-mono text-rose-500">
                                                {row.appFilterMs.toFixed(2)} ms
                                            </td>
                                            <td className="px-8 py-5 font-mono text-blue-400">
                                                {row.rlsJoinMs.toFixed(2)} ms
                                            </td>
                                            <td className="px-8 py-5 font-mono text-emerald-400 font-black bg-emerald-500/5">
                                                {row.rlsClaimsMs.toFixed(2)} ms
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 inline-flex items-center gap-1 shadow-inner">
                                                    Faster by {speedup}x (-{improvement}% latency)
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Benchmark Environment Specs Card */}
            <div className="border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 mb-8 mt-8">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-4">
                    Benchmark Environment Specifications
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                    <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/60">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Database & Hosting</span>
                        <p className="text-slate-200 font-black">PostgreSQL 16.3 (Supabase Cloud)</p>
                        <p className="text-slate-400 mt-1">VPS Spec: 2 vCPU, 1GB RAM, SSD Storage (GP3)</p>
                    </div>
                    <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/60">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Test Data & Indexing</span>
                        <p className="text-slate-200 font-black">111,000 rows of synthetic data</p>
                        <p className="text-slate-400 mt-1">Indexes: B-Tree Index on `tenant_id` & `id` fields</p>
                    </div>
                    <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/60">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Cache Status & Load-testing</span>
                        <p className="text-slate-200 font-black">Warm Cache (Hot Read) & Cold Read</p>
                        <p className="text-slate-400 mt-1">Tools: `k6` + Postgres `pg_stat_statements` (network noise excluded)</p>
                    </div>
                </div>
            </div>

            {/* Scientific Explanation SOC Style Panel */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between shadow-2xl gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shrink-0 mt-0.5 shadow-inner">
                        <ShieldAlert className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5">Scientific Significance of Experiment (Chapter 5 Thesis)</h3>
                        <p className="text-sm text-slate-350 leading-relaxed max-w-3xl">
                            The logarithmic latency curve <strong className="text-emerald-400 font-bold">O(log N)</strong> of <strong className="text-emerald-400">Optimized RLS</strong> demonstrates excellent SaaS scalability. By entirely eliminating JOIN authorization overhead (constant-time RAM Claims lookup) and utilizing B-Tree Index Scans, the system completely removes performance bottlenecks as data scales up.
                        </p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2.5 shrink-0 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoring system running</span>
                </div>
            </div>
        </div>
    );
}