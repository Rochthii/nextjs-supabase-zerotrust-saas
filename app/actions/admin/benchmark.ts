'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface BenchmarkResult {
    method: 'legacy' | 'jwt';
    avg_ms: number;
    p50_ms: number;
    p90_ms: number;
    p99_ms: number;
    total_time_ms: number;
    success_count: number;
    error_count: number;
}

export async function runRlsBenchmark(iterations: number = 100): Promise<{ legacy: BenchmarkResult | null; jwt: BenchmarkResult | null; error?: string }> {
    try {
        // Require admin permission (ensure token is valid)
        await requireAdmin();

        // Use authenticated client (will automatically submit Authorization header with JWT token)
        const supabase = await createClient();

        // --- 1. Measure Legacy (JOIN - Call SELECT public.get_current_user_role()) ---
        const legacyResult = await runTest(supabase, 'benchmark_legacy', iterations);

        // --- 2. Measure JWT (RAM session claims lookup - Read auth.jwt()->>'role') ---
        const jwtResult = await runTest(supabase, 'benchmark_jwt', iterations);

        return { legacy: legacyResult, jwt: jwtResult };
    } catch (error: any) {
        console.error('[Benchmark] Error:', error);
        return { legacy: null, jwt: null, error: error.message || 'Error running benchmark' };
    }
}

/**
 * Helper function: Call table n times, save the response time (Latency) of each query.
 */
async function runTest(supabase: any, tableName: string, iterations: number): Promise<BenchmarkResult> {
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    const startTotal = performance.now();

    for (let i = 0; i < iterations; i++) {
        const startReq = performance.now();
        const { error } = await supabase.from(tableName).select('id').limit(1);
        const reqTime = performance.now() - startReq;
        
        if (error) {
            errorCount++;
        } else {
            successCount++;
            latencies.push(reqTime);
        }
    }

    const totalTime = performance.now() - startTotal;

    // Calculate Percentiles
    latencies.sort((a, b) => a - b);
    
    const getPercentile = (arr: number[], q: number) => {
        if (arr.length === 0) return 0;
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
        } else {
            return arr[base];
        }
    };

    const avg = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const p50 = getPercentile(latencies, 0.50);
    const p90 = getPercentile(latencies, 0.90);
    const p99 = getPercentile(latencies, 0.99);

    return {
        method: tableName === 'benchmark_legacy' ? 'legacy' : 'jwt',
        avg_ms: Number(avg.toFixed(2)),
        p50_ms: Number(p50.toFixed(2)),
        p90_ms: Number(p90.toFixed(2)),
        p99_ms: Number(p99.toFixed(2)),
        total_time_ms: Number(totalTime.toFixed(2)),
        success_count: successCount,
        error_count: errorCount
    };
}
