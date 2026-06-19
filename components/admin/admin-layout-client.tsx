'use client';

import React, { useState, useEffect } from 'react';
import { GlobalSidebar } from '@/components/admin/global-sidebar';
import { EnterpriseSidebar } from '@/components/admin/enterprise-sidebar';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminLayoutClientProps {
    role: string;
    tenantId: string | null;
    tenantName: string | null;
    tenantType?: string;
    themeColor?: string | null;
    email?: string;
    canSwitchTenant?: boolean;
    permissions?: any;
    children: React.ReactNode;
}

export function AdminLayoutClient({
    role,
    tenantId,
    tenantName,
    tenantType = 'tenant',
    themeColor,
    email,
    canSwitchTenant,
    permissions,
    children
}: AdminLayoutClientProps) {
    const [mounted, setMounted] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const params = useParams();

    // tenant_id trong URL — nếu có thì đang ở Tenant Context
    const urlTenantId = params?.tenant_id as string | undefined;
    const isTenantContext = mounted ? !!urlTenantId : false;

    // Khi super_admin view branch khác: urlTenantId !== tenantId
    // → BusinessSidebar cần fetch name từ DB theo urlTenantId, không dùng prop từ user context
    const isViewingOwnTenant = !urlTenantId || urlTenantId === tenantId;
    const sidebarTenantName = isViewingOwnTenant ? tenantName : null; // null → trigger fetch in sidebar
    const sidebarThemeColor = isViewingOwnTenant ? themeColor : null;

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('admin-sidebar-collapsed');
        if (saved === 'true') setSidebarCollapsed(true);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('admin-sidebar-collapsed', String(next));
            return next;
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300">
            {/* Sidebar — hidden hoàn toàn khi collapsed */}
            <div
                className={`
                    transition-all duration-300 ease-in-out shrink-0 overflow-hidden
                    ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}
                `}
            >
                {mounted ? (
                    isTenantContext ? (
                        <EnterpriseSidebar
                            role={role}
                            tenantName={sidebarTenantName}
                            themeColor={sidebarThemeColor}
                            email={email}
                            canSwitchTenant={canSwitchTenant ?? false}
                            permissions={permissions}
                        />
                    ) : (
                        <GlobalSidebar
                            role={role}
                            email={email}
                            permissions={permissions}
                            tenantType={tenantType}
                        />
                    )
                ) : (
                    <div className="h-full w-full bg-slate-900" />
                )}
            </div>

            {/* Main content */}
            <main className="flex-1 h-screen overflow-y-auto relative bg-slate-950 transition-colors duration-300">
                {/* Visual Context Indicator */}
                <div className={cn(
                    "h-1.5 w-full fixed top-0 left-0 z-[60] transition-colors duration-500",
                    isTenantContext ? "bg-amber-500" : "bg-purple-600"
                )} />

                {/* Toggle button */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    title={sidebarCollapsed ? 'Open thanh điều hướng' : 'Hide thanh điều hướng'}
                    className="
                        fixed top-3 left-3 z-50
                        flex items-center justify-center
                        w-8 h-8 rounded-lg bg-slate-800 shadow-md border border-slate-700
                        text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg
                        transition-all duration-150
                    "
                >
                    {sidebarCollapsed
                        ? <PanelLeftOpen className="h-4 w-4" />
                        : <PanelLeftClose className="h-4 w-4" />
                    }
                </button>

                {/* Content */}
                <div className={`${sidebarCollapsed ? 'pl-12' : 'pl-0'} p-8 transition-all duration-300`}>
                    {children}
                </div>
            </main>
        </div>
    );
}

