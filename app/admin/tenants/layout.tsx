import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function TenantsLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('tenants', 'read');
    return <>{children}</>;
}
