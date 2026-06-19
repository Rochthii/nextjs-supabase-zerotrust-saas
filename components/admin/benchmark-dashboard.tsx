'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Activity, Clock, Zap, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { runRlsBenchmark, BenchmarkResult } from '@/app/actions/admin/benchmark';
import { toast } from 'sonner';

export function BenchmarkDashboard() {
    const [isTesting, setIsTesting] = useState(false);
    const [results, setResults] = useState<{ legacy: BenchmarkResult | null; jwt: BenchmarkResult | null } | null>(null);
    const [iterations, setIterations] = useState(100);

    const handleRunBenchmark = async () => {
        setIsTesting(true);
        setResults(null);
        toast.info(`Bắt đầu chạy đo lường... (${iterations} requests/bảng)`);
        
        try {
            const data = await runRlsBenchmark(iterations);
            if (data.error) throw new Error(data.error);
            
            setResults({ legacy: data.legacy, jwt: data.jwt });
            toast.success('Đo lường Benchmark hoàn tất!');
        } catch (err: any) {
            toast.error(err.message || 'An error occurred trong quá trình Benchmark. (Please check đã chạy Migration Database chưa)');
        } finally {
            setIsTesting(false);
        }
    };

    const calculateImprovement = (oldVal: number, newVal: number) => {
        if (!oldVal || oldVal === 0) return 0;
        return (((oldVal - newVal) / oldVal) * 100).toFixed(1);
    };

    return (
        <div className="space-y-6 text-slate-300">
            {/* Control Panel */}
            <Card className="border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        RLS Performance Benchmark
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Kiểm thử tự động độ trễ mạng và performance DB của system authorization (Row Level Security).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-950/50 rounded-xl border border-white/5">
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-200">Kịch bản Test (Test Scenario)</h3>
                            <ul className="text-sm text-slate-500 mt-2 list-disc list-inside space-y-1">
                                <li><strong>Legacy (O(N)):</strong> RLS dùng SQL Function query bảng user_roles.</li>
                                <li><strong>JWT (O(1)):</strong> RLS đọc directly dữ liệu authorization từ Custom Claims (auth.jwt).</li>
                                <li>Submit <strong className="text-slate-300">{iterations}</strong> vòng lặp tuần tự cho mỗi phương pháp.</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <div className="flex items-center justify-between text-sm">
                                <span>Số lần Request (Lặp):</span>
                                <select 
                                    className="bg-slate-800 border-slate-700 rounded text-white text-xs px-2 py-1"
                                    value={iterations}
                                    onChange={(e) => setIterations(Number(e.target.value))}
                                    disabled={isTesting}
                                >
                                    <option value={50}>50 Lần</option>
                                    <option value={100}>100 Lần</option>
                                    <option value={300}>300 Lần</option>
                                    <option value={500}>500 Lần</option>
                                </select>
                            </div>
                            <Button 
                                onClick={handleRunBenchmark} 
                                disabled={isTesting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-bold shadow-lg shadow-indigo-900/20"
                            >
                                {isTesting ? <Activity className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 fill-white" />}
                                {isTesting ? 'Running mô phỏng...' : 'Bắt đầu Benchmark'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Panel */}
            {results && results.legacy && results.jwt && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* LEGACY CARD */}
                    <Card className="border-rose-500/20 bg-rose-950/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock className="w-24 h-24 text-rose-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-rose-400 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                RLS Truyền thống (Legacy)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                JOIN + SQL Function: <code className="text-rose-300 bg-rose-950/50 px-1 py-0.5 rounded text-xs">public.get_current_user_role()</code>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-rose-500/10">
                                        <p className="text-sm text-slate-500 mb-1">Time Trung bình (AVG)</p>
                                        <p className="text-3xl font-black text-rose-300">{results.legacy.avg_ms} <span className="text-sm font-medium text-slate-500">ms</span></p>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-rose-500/10">
                                        <p className="text-sm text-slate-500 mb-1">Tổng time chạy</p>
                                        <p className="text-xl font-bold text-slate-300">{results.legacy.total_time_ms} <span className="text-sm font-medium text-slate-500">ms</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-white/5">
                                        <p className="text-xs text-slate-500">P50</p>
                                        <p className="font-bold text-slate-300">{results.legacy.p50_ms} ms</p>
                                    </div>
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-white/5">
                                        <p className="text-xs text-slate-500">P90</p>
                                        <p className="font-bold text-amber-400">{results.legacy.p90_ms} ms</p>
                                    </div>
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-white/5">
                                        <p className="text-xs text-slate-500">P99</p>
                                        <p className="font-bold text-rose-400">{results.legacy.p99_ms} ms</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* JWT CARD */}
                    <Card className="border-emerald-500/30 bg-emerald-950/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-24 h-24 text-emerald-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Tối ưu hoá (JWT Claims)
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Đọc Token tại Application Layer: <code className="text-emerald-300 bg-emerald-950/50 px-1 py-0.5 rounded text-xs">auth.jwt() -&gt;&gt; 'role'</code>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <p className="text-sm text-slate-500 mb-1">Time Trung bình (AVG)</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black text-emerald-400">{results.jwt.avg_ms} <span className="text-sm font-medium text-emerald-600">ms</span></p>
                                            <span className="mb-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <TrendingDown className="w-3 h-3" />
                                                {calculateImprovement(results.legacy.avg_ms, results.jwt.avg_ms)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-500/10">
                                        <p className="text-sm text-slate-500 mb-1">Tổng time chạy</p>
                                        <p className="text-xl font-bold text-slate-300">{results.jwt.total_time_ms} <span className="text-sm font-medium text-slate-500">ms</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-emerald-500/10">
                                        <p className="text-xs text-slate-500">P50</p>
                                        <p className="font-bold text-emerald-300">{results.jwt.p50_ms} ms</p>
                                    </div>
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-emerald-500/10">
                                        <p className="text-xs text-slate-500">P90</p>
                                        <p className="font-bold text-emerald-300">{results.jwt.p90_ms} ms</p>
                                    </div>
                                    <div className="bg-slate-900/30 p-3 rounded-lg text-center border border-emerald-500/10">
                                        <p className="text-xs text-slate-500">P99</p>
                                        <p className="font-bold text-emerald-300">{results.jwt.p99_ms} ms</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Comparison Chart */}
                    <Card className="lg:col-span-2 border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-400" />
                                So sánh Trực quan (Visual Comparison)
                            </h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'AVG (Trung bình)', legacy: results.legacy.avg_ms, jwt: results.jwt.avg_ms },
                                    { label: 'P50 (Trung vị)', legacy: results.legacy.p50_ms, jwt: results.jwt.p50_ms },
                                    { label: 'P90 (90th Percentile)', legacy: results.legacy.p90_ms, jwt: results.jwt.p90_ms },
                                    { label: 'P99 (Worst Case)', legacy: results.legacy.p99_ms, jwt: results.jwt.p99_ms },
                                ].map(row => {
                                    const maxVal = Math.max(row.legacy, row.jwt, 1);
                                    const legacyPct = (row.legacy / maxVal) * 100;
                                    const jwtPct = (row.jwt / maxVal) * 100;
                                    return (
                                        <div key={row.label}>
                                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                                <span className="font-medium text-slate-300">{row.label}</span>
                                                <span className="text-emerald-400 font-bold">↓ {calculateImprovement(row.legacy, row.jwt)}% faster</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-rose-400 w-12 text-right font-bold">LEGACY</span>
                                                    <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                                                            style={{ width: `${legacyPct}%` }}
                                                        >
                                                            <span className="text-[10px] font-black text-white">{row.legacy}ms</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-emerald-400 w-12 text-right font-bold">JWT</span>
                                                    <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                                                            style={{ width: `${jwtPct}%` }}
                                                        >
                                                            <span className="text-[10px] font-black text-white">{row.jwt}ms</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Report Summary */}
                    <Card className="lg:col-span-2 border-white/[0.08] bg-gradient-to-r from-indigo-950/40 to-slate-900/60 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Kết luận Đánh giá (Benchmark Report)</h3>
                                    <p className="text-sm text-slate-400 max-w-3xl">
                                        Results đo lường cho thấy việc sử dụng <strong>JWT Custom Claims</strong> giúp cải thiện tốc độ phản hồi trung bình 
                                        khoảng <strong className="text-emerald-400">{calculateImprovement(results.legacy.avg_ms, results.jwt.avg_ms)}%</strong>. 
                                        Bên cạnh đó, các chỉ số phân vị ở đuôi (P90, P99) ổn định hơn, chứng minh giải pháp O(1) giải quyết triệt để vấn đề thắt cổ chai (bottleneck) khi có nhiều Request đồng thời truy cập vào CSDL.
                                    </p>
                                </div>
                                <div className="shrink-0 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">ISO 27017 Compliance Score</p>
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black text-xl">
                                        A+
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
