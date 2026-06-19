'use server';

import { getAllAuditLogsForExport as libGetAllAuditLogsForExport } from '@/lib/audit';
import { requirePermission, getTenantScope } from '@/lib/permissions';

export async function getAuditLogExportData(filters?: {
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    tenant_id?: string;
}) {
    try {
        await requirePermission('analytics', 'read');
        const scope = await getTenantScope();
        
        // Enforce the tenant scope
        const finalFilters = {
            ...filters,
            tenant_id: scope !== undefined ? scope : filters?.tenant_id
        };

        const logs = await libGetAllAuditLogsForExport(finalFilters);
        return { success: true, data: logs };
    } catch (error: any) {
        console.error('Audit export action error:', error);
        return { success: false, error: error.message || 'Error retrieving log export data' };
    }
}
