import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function AuditLogsLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('settings', 'read');
    return <>{children}</>;
}
