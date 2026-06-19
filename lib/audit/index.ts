import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type AuditAction =
    | 'create' | 'update' | 'delete'
    | 'publish' | 'archive' | 'restore'
    | 'login' | 'logout'
    | 'upload' | 'approve' | 'reject' | 'submit_review'
    | 'settings_change' | 'backup'
    | 'ban' | 'activate';

export interface AuditLogParams {
    user?: { id: string; email?: string | null } | null; // Can be null for Guest
    action: AuditAction;
    tableName: string; // The resource being acted upon
    recordId?: string;
    tenantId?: string | null;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuditLogEntry {
    id: string;
    user_id: string | null;
    user_email: string | null; // Joined from auth.users or stored
    action: string;
    resource: string; // mapped from table_name
    resource_id: string | null; // mapped from record_id
    tenant_id: string | null;
    tenant_name?: string;
    tenant_type?: string;
    changes: {
        before?: any;
        after?: any;
    } | null;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
}

// ============================================================================
// WRITE FUNCTIONS
// ============================================================================

/**
 * Write audit log. Does not throw error — only logs if failed.
 * Always invoke after the primary operation has succeeded.
 * Use createAdminClient to bypass RLS.
 */
export async function createAuditLog({
    user,
    action,
    tableName,
    recordId,
    tenantId,
    oldData,
    newData,
    ipAddress,
    userAgent,
}: AuditLogParams): Promise<void> {
    try {
        const supabase = await createAdminClient();

        const { error } = await (supabase.from('audit_logs') as any).insert({
            user_id: user?.id ?? null,
            user_email: user?.email ?? 'guest@anonymous',
            action: action,
            resource: tableName,
            table_name: tableName,
            tenant_id: tenantId ?? null, // Record the branch ID performing the action
            record_id: recordId ?? null,
            old_data: oldData ?? null,
            new_data: newData ?? null,
            ip_address: ipAddress ?? null,
            user_agent: userAgent ?? null,
        });

        if (error) {
            console.error('[AuditLog] Failed to write audit log:', error.message);
        }
    } catch (err) {
        console.error('[AuditLog] Unexpected error:', err);
    }
}



// ============================================================================
// READ FUNCTIONS
// ============================================================================

/**
 * Get audit logs with filters and map to UI-friendly format.
 */
export async function getAuditLogs(filters?: {
    resource?: string;
    resource_id?: string;
    user_id?: string;
    tenant_id?: string;
    action?: string;
    limit?: number;
    page?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}): Promise<{ logs: AuditLogEntry[]; count: number }> {
    const supabase = await createAdminClient(); // Bypass RLS to fetch users table info

    let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

    if (filters?.resource) {
        query = query.eq('table_name', filters.resource);
    }
    if (filters?.resource_id) {
        query = query.eq('record_id', filters.resource_id);
    }
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }
    if (filters?.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
    }
    if (filters?.action) {
        query = query.eq('action', filters.action);
    }
    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }
    if (filters?.search) {
        query = query.ilike('user_email', `%${filters.search}%`);
    }

    const limit = filters?.limit || 50;
    const page = filters?.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
        .order('created_at', { ascending: false })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Get audit logs error:', error);
        return { logs: [], count: 0 };
    }

    // Fetch tenant details to map names
    const { data: tenantsData } = await (supabase as any).from('tenants').select('id, name, tenant_type');
    const tenantMap = new Map((tenantsData || []).map((t: any) => [t.id, t]));

    // Map DB result to AuditLogEntry
    const logs: AuditLogEntry[] = (data || []).map((log: any) => {
        const tenant = tenantMap.get(log.tenant_id) as any;
        return {
            id: log.id,
            user_id: log.user_id,
            user_email: log.user_email || 'Unknown',
            action: log.action,
            resource: log.table_name,
            resource_id: log.record_id,
            tenant_id: log.tenant_id,
            tenant_name: tenant?.name || 'System (Global)',
            tenant_type: tenant?.tenant_type || 'system',
            changes: (log.old_data || log.new_data) ? {
                before: log.old_data,
                after: log.new_data
            } : null,
            created_at: log.created_at,
            ip_address: log.ip_address,
            user_agent: log.user_agent
        };
    });

    return { logs, count: count || 0 };
}

/**
 * Fetch all audit logs matching filters for export (ignores pagination).
 */
export async function getAllAuditLogsForExport(filters?: {
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    tenant_id?: string;
}): Promise<AuditLogEntry[]> {
    const supabase = await createAdminClient();

    let query = supabase
        .from('audit_logs')
        .select('*');

    if (filters?.resource && filters.resource !== 'all') {
        query = query.eq('table_name', filters.resource);
    }
    if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
    }
    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }
    if (filters?.search) {
        query = query.ilike('user_email', `%${filters.search}%`);
    }
    if (filters?.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Export audit logs error:', error);
        return [];
    }

    // Fetch tenant details to map names
    const { data: tenantsData } = await (supabase as any).from('tenants').select('id, name, tenant_type');
    const tenantMap = new Map((tenantsData || []).map((t: any) => [t.id, t]));

    return (data || []).map((log: any) => {
        const tenant = tenantMap.get(log.tenant_id) as any;
        return {
            id: log.id,
            user_id: log.user_id,
            user_email: log.user_email || 'Unknown',
            action: log.action,
            resource: log.table_name,
            resource_id: log.record_id,
            tenant_id: log.tenant_id,
            tenant_name: tenant?.name || 'System (Global)',
            tenant_type: tenant?.tenant_type || 'system',
            changes: (log.old_data || log.new_data) ? {
                before: log.old_data,
                after: log.new_data
            } : null,
            created_at: log.created_at,
            ip_address: log.ip_address,
            user_agent: log.user_agent
        };
    });
}
