import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';

/**
 * GET /api/admin/benchmark-debug
 * Verifies if RPC measure_db_rls_join/claims exists and if the benchmark table has sufficient data.
 * Accessible to super_admin only.
 */
export async function GET(req: NextRequest) {
    const ctx = await getUserContext();
    if (!ctx || ctx.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createAdminClient();
    // Cast as unknown because benchmark_legacy, benchmark_jwt, and measure_db_rls_* are not in Supabase type-gen yet
    // (these tables/RPCs exist in the DB but supabase gen types hasn't been re-run)
    const db = supabase as unknown as {
        rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string; hint?: string } | null }>;
        from: (table: string) => { select: (cols: string, opts?: Record<string, unknown>) => Promise<{ count: number | null; error: { message: string } | null }> };
    };

    const report: Record<string, unknown> = {};

    // Test 1: measure_db_rls_join with 100 rows
    const { data: joinData, error: joinErr } = await db.rpc('measure_db_rls_join', { limit_count: 100 });
    report.rpc_join = {
        exists: !joinErr,
        value_ms: joinData,
        error: joinErr?.message ?? null,
        hint: joinErr?.hint ?? null,
    };

    // Test 2: measure_db_rls_claims with 100 rows
    const { data: claimsData, error: claimsErr } = await db.rpc('measure_db_rls_claims', { limit_count: 100 });
    report.rpc_claims = {
        exists: !claimsErr,
        value_ms: claimsData,
        error: claimsErr?.message ?? null,
        hint: claimsErr?.hint ?? null,
    };

    // Test 3: Count rows in benchmark_legacy table
    const { count: legacyCount, error: legacyErr } = await db
        .from('benchmark_legacy')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_legacy = {
        row_count: legacyCount,
        error: legacyErr?.message ?? null,
    };

    // Test 4: Count rows in benchmark_jwt table
    const { count: jwtCount, error: jwtErr } = await db
        .from('benchmark_jwt')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_jwt = {
        row_count: jwtCount,
        error: jwtErr?.message ?? null,
    };

    // Automated diagnostics
    const diagnosis: string[] = [];
    if (joinErr) diagnosis.push('❌ RPC measure_db_rls_join DOES NOT EXIST → execute migration 20260531090000');
    else if (Number(joinData) === 0) diagnosis.push('⚠️ RPC join exists but returned 0ms → empty table or tenant mismatch');
    else diagnosis.push(`✅ RPC join is active: ${joinData}ms`);

    if (claimsErr) diagnosis.push('❌ RPC measure_db_rls_claims DOES NOT EXIST → execute migration 20260531090000');
    else if (Number(claimsData) === 0) diagnosis.push('⚠️ RPC claims exists but returned 0ms → empty table or tenant mismatch');
    else diagnosis.push(`✅ RPC claims is active: ${claimsData}ms`);

    if ((legacyCount ?? 0) < 1000) diagnosis.push(`⚠️ benchmark_legacy only has ${legacyCount ?? 0} rows → seeding ≥ 100k recommended`);
    else diagnosis.push(`✅ benchmark_legacy: ${legacyCount} rows`);

    if ((jwtCount ?? 0) < 1000) diagnosis.push(`⚠️ benchmark_jwt only has ${jwtCount ?? 0} rows → seeding ≥ 100k recommended`);
    else diagnosis.push(`✅ benchmark_jwt: ${jwtCount} rows`);

    report.diagnosis = diagnosis;

    return NextResponse.json(report, { status: 200 });
}
