import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('analytics', 'read');
    return <>{children}</>;
}
