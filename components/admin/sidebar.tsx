'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    FileText,
    Settings,
    Database,
    LogOut,
    Building2,
    ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Role hierarchy - must match lib/auth/require-admin.ts
const ROLE_LEVEL: Record<string, number> = {
    viewer: 1,
    volunteer: 1,
    editor: 2,
    tenant_editor: 2,
    moderator: 3,
    tenant_accountant: 3,
    admin: 4,
    tenant_admin: 4,
    company_editor: 4,
    super_admin: 5,
};

/**
 * minRole: MINIMUM role required to see the menu item.
 * Higher roles will ALWAYS see items of lower roles.
 */
const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'editor' },
    { href: '/admin/security-center', label: 'Security Center', icon: ShieldAlert, minRole: 'admin' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, minRole: 'admin' },
    { href: '/admin/users', label: 'User', icon: Users, minRole: 'admin' },
    { href: '/admin/settings', label: 'Settings', icon: Settings, minRole: 'admin' },
    { href: '/admin/backup', label: 'Backup', icon: Database, minRole: 'super_admin' },
    { href: '/admin/tenants', label: 'Workspace Management', icon: Building2, minRole: 'super_admin' },
];

interface AdminSidebarProps {
    role?: string;
}

export function AdminSidebar({ role = 'editor' }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const tenantId = params?.tenant_id as string | undefined;

    // Use contextual backend path if within a tenant. Otherwise falls back to /admin (for global pages).
    const basePath = tenantId ? `/admin/t/${tenantId}` : '/admin';

    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
        'Payment': pathname.includes('/transactions') || pathname.includes('/projects')
    });

    const userLevel = ROLE_LEVEL[role] ?? 0;

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Helper function to build dynamic hrefs depending on global vs context
    const buildHref = (itemHref: string) => {
        // Global endpoints that never get tenantId prefix
        if (
            itemHref.includes('/admin/tenants') ||
            itemHref.includes('/admin/select-tenant') ||
            itemHref.includes('/admin/page-builder')
        ) {
            return itemHref;
        }
        // If we have a tenantId, rewrite /admin/xxx to /admin/t/[tenantId]/xxx
        if (tenantId && itemHref.startsWith('/admin/')) {
            return `/admin/t/${tenantId}/${itemHref.replace('/admin/', '')}`;
        }
        return itemHref;
    };

    return (
        <aside className="w-64 bg-coffee-dark text-white min-h-screen flex flex-col shadow-xl z-50">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gold-primary/20 bg-coffee-darker">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gold-primary flex items-center justify-center text-coffee-dark font-bold">
                        {tenantId ? 'T' : 'G'}
                    </div>
                    <div>
                        <h1 className="text-lg font-playfair font-bold text-gold-primary group-hover:text-white transition-colors truncate max-w-[150px]">
                            {tenantId ? 'Tenant Admin' : 'Global Admin'}
                        </h1>
                        <p className="text-xs text-gray-400 truncate">
                            {tenantId ? `ID: ${tenantId.slice(0, 8)}...` : 'Multi-tenant Ecosystem'}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {/* Public Site Link */}
                    <li className="mb-4 pb-4 border-b border-gold-primary/10">
                        <Link
                            href={tenantId ? `/` : '/'}
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gold-primary/10 hover:text-gold-primary transition-all group"
                        >
                            <div className="p-1 rounded bg-white/5 group-hover:bg-gold-primary group-hover:text-coffee-dark transition-colors">
                                <LogOut className="h-4 w-4 rotate-180" />
                            </div>
                            <span className="font-medium">View Homepage</span>
                        </Link>
                    </li>

                    {/* Global Admin Link - only if context is active */}
                    {tenantId && userLevel >= ROLE_LEVEL['super_admin'] && (
                        <li className="mb-4 pb-4 border-b border-gold-primary/10">
                            <Link
                                href="/admin/select-tenant"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-all font-semibold"
                            >
                                <Building2 className="h-5 w-5" />
                                <span>Switch Workspace</span>
                            </Link>
                        </li>
                    )}

                    {menuItems
                        .filter(item => userLevel >= (ROLE_LEVEL[item.minRole] ?? 99))
                        .filter(item => {
                            // Hide context-specific items if we are in global mode (no tenantId)
                            const isGlobalLink = item.href?.includes('/admin/tenants') || item.href === '/admin/select-tenant';
                            if (!tenantId && !isGlobalLink) {
                                if (item.href?.includes('/admin/users') || item.href?.includes('/admin/backup') || item.label === 'Settings' || item.label === 'Audit Logs' || item.label === 'Security Center') return true;
                                return false;
                            }
                            return true;
                        })
                        .map((item) => {
                            const Icon = item.icon;
                            const dynamicHref = buildHref(item.href as string);
                            const isActive = dynamicHref ? (pathname === dynamicHref || pathname.startsWith(dynamicHref + '/')) : false;

                            return (
                                <li key={item.href || item.label}>
                                    <Link
                                        href={dynamicHref}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                            isActive
                                                ? 'bg-gradient-to-r from-gold-primary to-gold-dark text-coffee-dark shadow-md font-bold'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isActive ? "text-coffee-dark" : "text-gray-400")} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gold-primary/20 bg-coffee-darker">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
