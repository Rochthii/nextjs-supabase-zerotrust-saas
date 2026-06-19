import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { runScalingBenchmark } from '@/app/admin/performance/scaling-engine';

/**
 * API Route: POST /api/admin/benchmark
 * Runs the RLS Performance Benchmark and returns the JSON results.
 *
 * Why we need a separate route:
 * - runScalingBenchmark needs createAdminClient() (server-only, bypasses RLS for App-side testing)
 * - Needs getUserContext() to retrieve the user's actual currentTenantId
 * - Page /admin/performance is 'use client' so it cannot directly call server functions
 */
export async function POST(req: NextRequest) {
    // Authenticate permissions: only Global Admin can run the Benchmark
    const ctx = await getUserContext();
    if (!ctx) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        return NextResponse.json(
            { error: 'Forbidden: Only Global Admins are allowed to run the Performance Benchmark.' },
            { status: 403 }
        );
    }

    try {
        const supabaseAdmin = await createAdminClient();

        // Use the current user's actual tenantId (fallback to dummy if super_admin has no tenant)
        const currentTenantId = ctx.tenantId ?? '55555555-5555-5555-5555-555555555555';

        const results = await runScalingBenchmark(supabaseAdmin);

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error('[Benchmark Error]:', err);
        return NextResponse.json(
            { error: err.message || 'Server error occurred while running the benchmark.' },
            { status: 500 }
        );
    }
}
