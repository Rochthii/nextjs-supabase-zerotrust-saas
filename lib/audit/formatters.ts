const fieldLabels: Record<string, string> = {
    title: 'Title',
    title_vi: 'Title (Vietnamese)',
    title_en: 'Title (English)',
    title_km: 'Title (Khmer)',
    content: 'Content',
    content_vi: 'Content (Vietnamese)',
    content_en: 'Content (English)',
    content_km: 'Content (Khmer)',
    excerpt: 'Summary',
    excerpt_vi: 'Summary (Vietnamese)',
    excerpt_en: 'Summary (English)',
    excerpt_km: 'Summary (Khmer)',
    slug: 'Slug',
    name: 'Name',
    domain: 'Domain',
    subdomain: 'Subdomain',
    status: 'Status',
    amount: 'Amount',
    description: 'Description',
    email: 'Email',
    role: 'Role',
    phone: 'Phone',
    address: 'Address',
    logo_url: 'Logo URL',
    tenant_type: 'Organization Type',
    layout_style: 'Layout Style',
    theme_colors: 'Theme Colors',
    modules_config: 'Features Config',
    parent_id: 'Parent Organization',
    contact_info: 'Contact Info',
    bank_name: 'Bank Name',
    account_number: 'Account Number',
    account_holder: 'Account Holder',
    project_id: 'Campaign / Project',
    is_active: 'Active',
    is_published: 'Published',
    user_roles: 'Permissions',
    tenant_members: 'Branch Membership',
    tenant_member_roles: 'Branch Roles',
    metadata: 'Metadata Configuration',
    author_name: 'Author',
    category_name: 'Category',
    published_at: 'Published At',
    thumbnail_url: 'Thumbnail URL',
};

/**
 * Filter out technical fields that do not carry helpful information for end users.
 */
function isTechnicalField(key: string): boolean {
    return (
        key.endsWith('_id') || 
        ['id', 'created_at', 'updated_at', 'password', 'tenant_id', 'parent_id', 'user_id', 'record_id'].includes(key)
    );
}

/**
 * Normalize display values: strip HTML tags, translate labels, limit lengths.
 */
function cleanAndFormatValue(key: string, val: any): string | null {
    if (val === null || val === undefined) return null;
    
    // If complex object, skip
    if (typeof val === 'object') {
        const str = JSON.stringify(val);
        if (str === '{}' || str === '[]') return null;
        return null;
    }
    
    let strVal = String(val).trim();
    if (strVal === '' || strVal === '[]' || strVal === '{}') return null;

    // Remove HTML tags using Regex
    strVal = strVal.replace(/<[^>]*>/g, ' ').trim();
    // Replace multiple spaces with a single space
    strVal = strVal.replace(/\s+/g, ' ');

    // Truncate if too long to prevent layout breaking
    if (strVal.length > 80) {
        strVal = strVal.substring(0, 77) + '...';
    }

    // Translate statuses and Boolean values
    if (key === 'status' || key === 'status_name') {
        if (strVal === 'draft') return 'Draft';
        if (strVal === 'published') return 'Published';
        if (strVal === 'active') return 'Active';
        if (strVal === 'inactive') return 'Inactive';
    }
    if (strVal === 'true') return 'On / Yes';
    if (strVal === 'false') return 'Off / No';

    return strVal;
}

/**
 * Format data changes for display inside Audit Logs.
 * Returns description string of changes, or '-' if none.
 */
export function formatAuditChanges(changes: any): string {
    if (!changes) return '-';
    
    // Handle if changes is a JSON string
    let parsed = changes;
    if (typeof changes === 'string') {
        try {
            parsed = JSON.parse(changes);
        } catch (e) {
            return changes;
        }
    }

    try {
        // Case: Before / After comparison (Update action)
        if (parsed.before && parsed.after && typeof parsed.after === 'object') {
            const updates: string[] = [];
            for (const key in parsed.after) {
                if (isTechnicalField(key)) continue;
                
                const beforeVal = cleanAndFormatValue(key, parsed.before[key]);
                const afterVal = cleanAndFormatValue(key, parsed.after[key]);

                // Only show if value actually changed
                if ((beforeVal || afterVal) && beforeVal !== afterVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    updates.push(`• ${fieldLabel}: "${beforeVal || 'empty'}" ➝ "${afterVal || 'empty'}"`);
                }
            }
            if (updates.length > 0) return updates.join('\n');
            return 'Update system information';
        }

        // Case: old data only (Delete action)
        if (parsed.before && (!parsed.after || parsed.after === null)) {
            const deletes: string[] = [];
            for (const key in parsed.before) {
                if (isTechnicalField(key)) continue;
                const displayVal = cleanAndFormatValue(key, parsed.before[key]);
                if (displayVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    deletes.push(`• ${fieldLabel}: "${displayVal}"`);
                }
            }
            if (deletes.length > 0) return '[DELETED RESOURCE]\n' + deletes.join('\n');
            return 'Delete system information';
        }

        // Case: new data only (Create action)
        if (typeof parsed === 'object') {
            const dataToFormat = parsed.after || parsed;
            const creates: string[] = [];
            for (const key in dataToFormat) {
                if (isTechnicalField(key)) continue;
                const displayVal = cleanAndFormatValue(key, dataToFormat[key]);
                if (displayVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    creates.push(`• ${fieldLabel}: "${displayVal}"`);
                }
            }
            if (creates.length > 0) return creates.join('\n');
        }

        return '-';
    } catch (e) {
        return '-';
    }
}

/**
 * Resource labels for system resources.
 */
export const resourceLabels: Record<string, string> = {
    news: 'Internal Announcements',
    events: 'Events',
    media: 'Media Documents',
    users: 'Users',
    settings: 'System Configuration',
    site_settings: 'Branch Settings',
    transactions: 'Budget / Funds',
    transaction_projects: 'Projects / Campaigns',
    bank_accounts: 'Bank Accounts',
    registrations: 'Registrations',
    event_registrations: 'Event Registrations',
    contact_messages: 'Contact Messages',
    organizations: 'Organizations / Partners',
    tenants: 'Tenant Branch',
    user_roles: 'RBAC Permissions',
    tenant_members: 'Branch Membership',
    tenant_member_roles: 'Branch Roles',
    audit_logs: 'Audit Logs',
};

/**
 * Badge color classes for actions based on SOC severity levels.
 * - Green: safe actions (create, approve, activate)
 * - Blue: updates (update)
 * - Red: critical (delete, ban)
 * - Purple: state transitions (publish)
 * - Orange: moderate alerts (reject)
 * - Yellow: config shifts (settings_change)
 */
export const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    publish: 'bg-purple-100 text-purple-800',
    approve: 'bg-emerald-100 text-emerald-800',
    reject: 'bg-orange-100 text-orange-800',
    ban: 'bg-red-200 text-red-900',
    activate: 'bg-green-200 text-green-900',
    settings_change: 'bg-amber-100 text-amber-800',
    login: 'bg-sky-100 text-sky-800',
    logout: 'bg-gray-100 text-gray-600',
    backup: 'bg-indigo-100 text-indigo-800',
    upload: 'bg-cyan-100 text-cyan-800',
    submit_review: 'bg-violet-100 text-violet-800',
};

/**
 * English action labels.
 */
export const actionLabels: Record<string, string> = {
    create: 'CREATE',
    update: 'UPDATE',
    delete: 'DELETE',
    publish: 'PUBLISH',
    approve: 'APPROVE',
    reject: 'REJECT',
    ban: 'BLOCK ACCOUNT',
    activate: 'ACTIVATE',
    settings_change: 'CHANGE CONFIG',
    login: 'LOGIN',
    logout: 'LOGOUT',
    backup: 'BACKUP',
    upload: 'UPLOAD',
    submit_review: 'SUBMIT REVIEW',
};

/**
 * Resolve action badge color.
 */
export function getActionColor(action: string): string {
    return actionColors[action] || 'bg-gray-100 text-gray-800';
}

/**
 * Resolve resource display label.
 */
export function getResourceLabel(resource: string): string {
    return resourceLabels[resource] || resource;
}

/**
 * Resolve action display label.
 */
export function getActionLabel(action: string): string {
    return actionLabels[action] || action.toUpperCase();
}

/**
 * Classify threat severity for SOC Dashboards.
 */
export type SeverityLevel = 'critical' | 'warning' | 'info' | 'safe';

export function getActionSeverity(action: string): SeverityLevel {
    if (['delete', 'ban'].includes(action)) return 'critical';
    if (['reject', 'settings_change'].includes(action)) return 'warning';
    if (['login', 'logout', 'backup'].includes(action)) return 'info';
    return 'safe';
}

export const severityColors: Record<SeverityLevel, string> = {
    critical: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
    safe: 'bg-emerald-500 text-white',
};
