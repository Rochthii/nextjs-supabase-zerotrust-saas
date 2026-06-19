import React from 'react';
// Admin layout with root tags
import { Inter, Playfair_Display } from "next/font/google";
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { createClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import "@/app/globals.css";
import "@/app/tiptap.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: 'swap',
});

export const metadata = {
    title: 'System Quản trị',
    description: 'Bảng điều khiển quản trị content website',
};

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Authentication Check
    if (!user) {
        redirect('/login');
    }

    // 2. Pathname check for preview (to skip admin UI wrapping)
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';
    const isPreview = pathname.includes('/homepage/preview');

    if (isPreview) {
        return (
            <div className={`${inter.className} ${playfair.variable} font-inter antialiased bg-white min-h-screen`}>
                {children}
                <Toaster />
            </div>
        );
    }

    // 3. Authorization Check (Role) — read from user_roles table (multi-tenant aware)
    const userCtx = await getUserContext();
    const role = userCtx?.role ?? 'viewer';
    const tenantId = userCtx?.tenantId ?? null;
    const tenantName = userCtx?.tenantName ?? null;
    const email = userCtx?.email;

    // Fetch the robust capability matrices
    const { getUserPermissions } = await import('@/lib/permissions');
    const permissions = await getUserPermissions();


    // 4. For super_admin/company_editor: can switch between tenants
    const canSwitchTenant = role === 'super_admin' || role === 'company_editor' || role === 'admin';

    // 5. Fetch theme color and tenant type for the current viewed tenant (or user's home tenant)
    let themeColor: string | null = null;
    let tenantType: string = 'tenant';
    
    // Extract urlTenantId from pathname to know which tenant is being visited
    const match = pathname.match(/\/admin\/t\/([^/]+)/);
    const activeTenantId = match ? match[1] : null;

    // Get the host header to infer tenant if not explicitly in URL
    const host = headerList.get('host') || '';
    
    // 5.1 Determine the target tenant ID or domain
    let targetTenantQueryValue = activeTenantId;
    
    // If no explicit ID in URL, try to resolve from host
    if (!targetTenantQueryValue) {
        // Reverse mapping from middleware HOSTNAME_MAP logic or direct host check
        targetTenantQueryValue = host;
    }

    // Default to user's home tenant if all else fails
    if (!targetTenantQueryValue) {
        targetTenantQueryValue = tenantId;
    }

    if (targetTenantQueryValue) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetTenantQueryValue);
        
        let query = (supabase as any).from('tenants').select('theme_colors, tenant_type');
        
        if (isUuid) {
            // It's a direct ID (from URL match or user's tenantId fallback)
            query = query.eq('id', targetTenantQueryValue);
        } else {
            // It's a hostname (from headers)
            query = query.or(`domain.eq.${targetTenantQueryValue},subdomain.eq.${targetTenantQueryValue}`);
        }
        
        const { data: tenant } = await query.maybeSingle();

        // If host resolution failed and we didn't try the user's home tenant yet, fallback to it
        if (!tenant && !isUuid && tenantId) {
             const { data: fallbackTenant } = await (supabase as any).from('tenants').select('theme_colors, tenant_type').eq('id', tenantId).maybeSingle();
             themeColor = (fallbackTenant?.theme_colors as any)?.primary ?? null;
             tenantType = fallbackTenant?.tenant_type ?? 'tenant';
        } else {
             themeColor = (tenant?.theme_colors as any)?.primary ?? null;
             tenantType = tenant?.tenant_type ?? 'tenant';
        }
    }

    const allowedRoles = ['super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant', 'admin', 'editor', 'moderator'];

    if (!allowedRoles.includes(role)) {
        if (role === 'volunteer') {
            redirect('/collaborator/news-manager');
        }
        // New account / Viewer -> /admin/pending
        if (pathname !== '/admin/pending') {
            redirect('/admin/pending');
        }
    }

    return (
        <div 
            className={`${inter.className} ${playfair.variable} font-inter antialiased dark min-h-screen`} 
            style={{ background: '#020617', color: '#f1f5f9' }}
        >
            <AdminLayoutClient
                role={role}
                tenantId={tenantId}
                tenantName={tenantName}
                tenantType={tenantType}
                themeColor={themeColor}
                email={email}
                canSwitchTenant={canSwitchTenant}
                permissions={permissions}
            >
                {children}
            </AdminLayoutClient>
            <Toaster />
        </div>
    );
}


