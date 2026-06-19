import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('users', 'read');
    return <>{children}</>;
}
