'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Newspaper,
    Calendar,
    Image as ImageIcon,
    Users,
    BarChart3,
    FileText,
    Layout,
    GraduationCap,
    FolderTree,
    Building2,
    Settings,
    HelpCircle,
    Info,
    LogOut,
    ChevronDown,
    ExternalLink,
    ArrowLeft,
    Shield,
    ShieldAlert,
    Globe,
    Sparkles,
    Palette,
    TrendingUp,
    Mail,
    Handshake,
    Boxes,
    MonitorDot,
    DollarSign,
    UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ChildItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    resource?: string;
};

type MenuGroup = {
    id: string;
    label: string;
    icon: React.ElementType;
    resource?: string;
    children: ChildItem[];
};

type StandaloneItem = {
    id: string;
    href: string;
    label: string;
    icon: React.ElementType;
    resource?: string;
    standalone: true;
};

type MenuItem = MenuGroup | StandaloneItem;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EnterpriseSidebarProps {
    role?: string;
    tenantName?: string | null;
    themeColor?: string | null;
    email?: string;
    canSwitchTenant?: boolean;
    permissions?: Record<string, any>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function EnterpriseSidebar({
    role = 'editor',
    tenantName: propTenantName,
    themeColor: propThemeColor,
    email,
    canSwitchTenant = false,
    permissions = {},
}: EnterpriseSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const tenantId = (params?.tenant_id as string) ?? '';

    const hasAccess = (resource?: string) => {
        if (!resource) return true;
        if (role === 'super_admin' || role === 'admin') return true;
        if (role === 'tenant_admin') return true;
        return !!permissions[resource]?.can_read;
    };

    // ─── Fetch tenant data ────────────────────────────────────────────────────
    const [resolvedName, setResolvedName] = React.useState<string | null>(propTenantName ?? null);
    const [resolvedDomain, setResolvedDomain] = React.useState<string | null>(null);
    const [modulesConfig, setModulesConfig] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        if (!tenantId) return;
        setResolvedName(propTenantName ?? null);

        const fetchTenantData = async () => {
            const supabase = createClient();
            const { data } = await (supabase as any)
                .from('tenants')
                .select('name, domain, modules_config')
                .eq('id', tenantId)
                .single();
            if (data) {
                setResolvedName(data.name ?? null);
                setResolvedDomain(data.domain ?? null);
                setModulesConfig(data.modules_config ?? {});
                try {
                    localStorage.setItem('lastViewedTenantId', tenantId);
                    localStorage.setItem('lastViewedTenantName', data.name ?? '');
                    localStorage.setItem('lastViewedTenantDomain', data.domain ?? '');
                } catch { /* ignore */ }
            }
        };
        fetchTenantData();
    }, [tenantId, propTenantName]);

    const displayName = resolvedName ?? 'Enterprise Workspace';

    const hasModule = (key: string): boolean => {
        if (Object.keys(modulesConfig).length === 0) return true;
        return modulesConfig[key] !== false;
    };

    const buildMenuItems = (tenantId: string): MenuItem[] => {
        const base = `/admin/t/${tenantId}`;
        return [
            // ── Overview ────────────────────────────────────────────────────
            {
                id: 'dashboard',
                href: `${base}/dashboard`,
                label: 'Overview',
                icon: LayoutDashboard,
                standalone: true,
            },
            // -- Security & Audit System ----------------------------------
            {
                id: 'security_group',
                label: 'Security & Audit',
                icon: Shield,
                resource: 'users',
                children: [
                    { href: `${base}/users`, label: 'Team Members', icon: Users, resource: 'users' },
                    { href: `${base}/audit-logs`, label: 'Activity Logs', icon: FileText, resource: 'analytics' },
                    { href: `${base}/security`, label: 'Security Center', icon: ShieldAlert, resource: 'users' },
                ],
            },
            // -- System Settings ------------------------------------------
            {
                id: 'settings_group',
                label: 'System Settings',
                icon: Settings,
                resource: 'settings',
                children: [
                    { href: `${base}/settings/domain`, label: 'Custom Domain', icon: Globe, resource: 'settings' },
                    { href: `${base}/settings`, label: 'Workspace Settings', icon: Settings, resource: 'settings' },
                ],
            },
        ];
    };

    const menuItems = buildMenuItems(tenantId);

    const defaultOpenGroups = () => {
        const map: Record<string, boolean> = {};
        for (const item of menuItems) {
            if (!('standalone' in item)) {
                const group = item as MenuGroup;
                const hasActive = group.children.some(child =>
                    pathname === child.href || pathname.startsWith(child.href + '/')
                );
                if (hasActive) map[group.id] = true;
            }
        }
        return map;
    };

    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(defaultOpenGroups);

    const toggleGroup = (id: string) => {
        setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const initial = displayName.charAt(0).toUpperCase();

    return (
        <aside className="w-64 bg-[#0a0a0f] text-white min-h-screen flex flex-col shadow-2xl z-50 border-r border-white/[0.06]">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 border border-white/10 shrink-0">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-white truncate leading-tight">
                            {displayName}
                        </p>
                        {resolvedDomain ? (
                            <a
                                href={`https://${resolvedDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-slate-500 flex items-center gap-1 hover:text-slate-300 transition-colors truncate mt-0.5"
                            >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{resolvedDomain}</span>
                            </a>
                        ) : (
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                #{tenantId.slice(0, 8)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Enterprise badge */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Enterprise Workspace</span>
                </div>

                {/* Switch controls */}
                {canSwitchTenant && (
                    <div className="flex flex-col gap-1.5 mt-3">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Shield className="w-3 h-3 text-violet-400" />
                            <span>Control Center</span>
                        </Link>
                        <Link
                            href="/admin/select-tenant"
                            className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Switch Workspace</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <nav className="flex-1 p-3 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
                {menuItems.map((item) => {
                    if ('standalone' in item) {
                        const Icon = item.icon;
                        if (!hasAccess(item.resource)) return null;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                                    isActive
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    }

                    const group = item as MenuGroup;
                    const GroupIcon = group.icon;
                    if (group.resource && !hasAccess(group.resource)) return null;

                    const isOpen = openGroups[group.id] ?? false;
                    const visibleChildren = group.children.filter(child => hasAccess(child.resource));
                    if (visibleChildren.length === 0) return null;

                    const isGroupActive = visibleChildren.some(child =>
                        pathname === child.href || pathname.startsWith(child.href + '/')
                    );

                    return (
                        <div key={group.id}>
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={cn(
                                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm',
                                    isGroupActive && !isOpen
                                        ? 'text-white bg-white/5 border-l-2 border-violet-500'
                                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <div className="flex items-center gap-2.5">
                                    <GroupIcon className="w-4 h-4 shrink-0" />
                                    <span className="font-medium">{group.label}</span>
                                </div>
                                <ChevronDown
                                    className={cn('w-3.5 h-3.5 text-slate-600 transition-transform duration-200', isOpen && 'rotate-180')}
                                />
                            </button>

                            {isOpen && (
                                <ul className="mt-0.5 ml-4 pl-3 border-l border-white/[0.06] space-y-0.5 py-1">
                                    {visibleChildren.map(child => {
                                        const ChildIcon = child.icon;
                                        const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                                        return (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    className={cn(
                                                        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px]',
                                                        isChildActive
                                                            ? 'bg-violet-600/20 text-violet-300 font-semibold'
                                                            : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                                                    )}
                                                >
                                                    <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{child.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}

                {/* View Public Site */}
                <div className="pt-3 mt-2 border-t border-white/[0.06]">
                    <a
                        href={resolvedDomain ? `https://${resolvedDomain}` : `/?tenant_id=${tenantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all text-[13px]"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Public Site</span>
                    </a>
                </div>
            </nav>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <div className="p-3 border-t border-white/[0.06] bg-black/20">
                {email && (
                    <p className="text-[11px] text-slate-600 truncate mb-2 px-2">{email}</p>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:bg-red-900/20 hover:text-red-400 transition-all w-full text-sm"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
