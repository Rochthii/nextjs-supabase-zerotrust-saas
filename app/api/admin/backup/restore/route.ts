

/**
 * /api/admin/backup/restore — RESTORE ROUTE
 * 
 * SECURITY:
 * - Requires admin/super_admin role
 * - Reads JSON file, validates schema
 * - Upserts data into tables
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserContext, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';

export const maxDuration = 60; // 60s execution limit on Vercel
export async function POST(request: Request) {
    try {
        const ctx = await getUserContext();
        if (!ctx || !['super_admin', 'company_editor', 'admin', 'tenant_admin'].includes(ctx.role)) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const scope = await getTenantScope();
        const supabase = await createClient();

        // 1. Get file from FormData
        const formData = await request.formData();
        const file = formData.get('backup_file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 2. Parse JSON
        const textWrapper = await file.text();
        const backupData = JSON.parse(textWrapper);

        if (!backupData || !backupData.version || !backupData.data) {
            return NextResponse.json({ error: 'Invalid backup file sequence' }, { status: 400 });
        }

        const dataTree = backupData.data;

        // Ensure user is authorized to restore into specific scope if tenant
        if (scope && backupData.scope && backupData.scope !== `tenant:${scope}`) {
            return NextResponse.json({ error: `You only have permission to restore files scoped to tenant_id: ${scope}` }, { status: 403 });
        }

        // 3. Upsert data safely via chunks to avoid DB overload/timeout
        const CHUNK_SIZE = 500;
        let totalUpserted = 0;

        for (const [table, records] of Object.entries(dataTree)) {
            const arr = records as any[];
            if (!arr || arr.length === 0) continue;

            // Security: Enforce tenant scope on all records before UPSERT
            const safeRecords = arr.filter(record => {
               if (scope) {
                   return record.tenant_id === scope;
               }
               return true; // global admins can restore anything
            });

            for (let i = 0; i < safeRecords.length; i += CHUNK_SIZE) {
                const chunk = safeRecords.slice(i, i + CHUNK_SIZE);
                
                const { error } = await supabase.from(table as any)
                    .upsert(chunk, { ignoreDuplicates: false });
                
                if (error) {
                    console.error(`Error restoring table ${table}:`, error);
                    throw new Error(`Restoration failed at table ${table}: ${error.message}`);
                }
                
                totalUpserted += chunk.length;
            }
        }

        // 4. Audit Log
        await createAuditLog({
            user: { id: ctx.userId, email: ctx.email },
            action: 'restore',
            tableName: 'system',
            newData: {
                total_records_upserted: totalUpserted,
                original_version: backupData.version,
                source_exported_by: backupData.exported_by,
                scope_restored: scope || 'global',
            },
        });

        return NextResponse.json({ success: true, total: totalUpserted });

    } catch (err: any) {
        console.error('RESTORE ERROR:', err);
        return NextResponse.json({ error: err.message || 'Failed to parse restore data' }, { status: 500 });
    }
}
