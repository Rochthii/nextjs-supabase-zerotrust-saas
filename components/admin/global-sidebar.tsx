import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    FileText,
    Database,
    LogOut,
    Building2,
    ChevronRight,
    ExternalLink,
    Shield,
    ShieldAlert,
    Newspaper,
    Mic,
    ArrowLeft,
    Smartphone,
    DollarSign,
    ChevronDown,
    Calendar,
    BookOpen,
    Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
    href?: string;
    label: string;
    icon: any;
    resource?: string;
    desc: string;
    subItems?: { href: string; label: string }[];
}

interface MenuGroup {
    groupTitle: string;
    items: MenuItem[];
}

const groupedMenuItems: MenuGroup[] = [
    {
        groupTitle: 'Overview & Analytics',
        items: [
            {
                href: '/admin/dashboard',
                label: 'System Dashboard',
                icon: LayoutDashboard,
                resource: 'tenants',
                desc: 'Global network metrics',
            },
            {
                href: '/admin/analytics',
                label: 'Analytics',
                icon: BarChart3,
                resource: 'analytics',
                desc: 'Global system traffic',
            },
        ]
    },
    {
        groupTitle: 'Security & Operations (SOC)',
        items: [
            {
                href: '/admin/security-center',
                label: 'SOC Monitoring',
                icon: ShieldAlert,
                resource: 'settings',
                desc: 'Real-time security',
            },
            {
                href: '/admin/performance',
                label: 'Benchmark RLS',
                icon: Gauge,
                resource: 'settings',
                desc: 'Performance benchmark',
            },
            {
                href: '/admin/audit-logs',
                label: 'Audit Logs',
                icon: FileText,
                resource: 'settings',
                desc: 'Immutable action history',
            },
            {
                href: '/admin/users',
                label: 'User Management',
                icon: Users,
                resource: 'users',
                desc: 'Authorization RBAC',
            },
            {
                href: '/admin/backup',
                label: 'Backup & Restore',
                icon: Database,
                resource: 'settings',
                desc: 'System backups',
            },
        ]
    },
    {
        groupTitle: 'Workspaces',
        items: [
            {
                href: '/admin/tenants',
                label: 'Workspace Management',
                icon: Building2,
                resource: 'tenants',
                desc: 'Organization & Enterprise',
            },
        ]
    }
];

interface GlobalSidebarProps {
    role?: string;
    email?: string;
    permissions?: Record<string, any>;
    tenantType?: string;
}

export function GlobalSidebar({ role = 'admin', email, permissions = {}, tenantType = 'tenant' }: GlobalSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [lastTenant, setLastTenant] = React.useState<{ id: string; name: string; domain: string } | null>(null);
    const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        try {
            const id = localStorage.getItem('lastViewedTenantId');
            const name = localStorage.getItem('lastViewedTenantName');
            const domain = localStorage.getItem('lastViewedTenantDomain');
            if (id && name) setLastTenant({ id, name, domain: domain ?? '' });
        } catch { /* ignore */ }
    }, []);

    // Automatically open parent menu if currently active route is a sub-item
    React.useEffect(() => {
        groupedMenuItems.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems?.some(s => pathname === s.href || pathname.startsWith(s.href + '/'))) {
                    setOpenMenus(prev => ({ ...prev, [item.label]: true }));
                }
            });
        });
    }, [pathname]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const hasAccess = (resource?: string) => {
        if (!resource) return true;
        if (role === 'super_admin' || role === 'admin') return true;
        if (role === 'agency_admin' && (resource === 'settings' || resource === 'analytics')) return false;
        return !!permissions[resource]?.can_read;
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const roleLabel: Record<string, string> = {
        super_admin: 'Super Admin',
        company_editor: 'Company Editor',
        admin: 'Admin',
    };

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl z-50 border-r border-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 bg-slate-950">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-amber-600 shadow-amber-600/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white truncate tracking-tight uppercase">Control Center</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Global Admin</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/50 rounded-lg border border-amber-700/50">
                    <span className="text-xs font-medium text-amber-300">
                        {roleLabel[role] ?? role}
                    </span>
                </div>
            </div>

            {/* Quick Access */}
            <div className="p-4 border-b border-slate-700 flex flex-col gap-2">
                {lastTenant && (
                    <Link
                        href={`/admin/t/${lastTenant.id}/dashboard`}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-amber-900/40 hover:bg-amber-800/60 rounded-xl text-amber-300 hover:text-amber-200 font-medium text-xs transition-all border border-amber-700/30 group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="truncate">Back to Workspace: {lastTenant.name}</span>
                    </Link>
                )}
                <Link
                    href="/admin/select-tenant"
                    className="flex items-center justify-between w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold text-xs transition-all shadow-md shadow-amber-900/40 border border-amber-500/20 group"
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>SELECT WORKSPACE</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-8">
                {groupedMenuItems.map((group) => {
                    const visibleItems = group.items.filter(item => hasAccess(item.resource));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.groupTitle} className="flex flex-col gap-3">
                            <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                {group.groupTitle}
                            </h3>
                            <ul className="space-y-1">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.href 
                                        ? (pathname === item.href || pathname.startsWith(item.href + '/'))
                                        : (item.subItems?.some(s => pathname === s.href || pathname.startsWith(s.href + '/')));
                                    
                                    if (item.subItems) {
                                        const isOpen = openMenus[item.label] ?? false;
                                        return (
                                            <li key={item.label}>
                                                <button
                                                    onClick={() => toggleMenu(item.label)}
                                                    className={cn(
                                                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group',
                                                        isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            'p-1.5 rounded-lg transition-colors',
                                                            isActive ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                                                        )}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-medium">{item.label}</p>
                                                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isOpen ? "rotate-180" : "")} />
                                                </button>
                                                {isOpen && (
                                                    <div className="pl-12 pr-2 py-1 flex flex-col gap-1 mt-1">
                                                        {item.subItems.map((sub) => {
                                                            const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                                                            return (
                                                                <Link
                                                                    key={sub.href}
                                                                    href={sub.href}
                                                                    className={cn(
                                                                        'px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2',
                                                                        isSubActive ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                                                    )}
                                                                >
                                                                    <div className={cn("w-1 h-1 rounded-full", isSubActive ? "bg-amber-400" : "bg-slate-700")} />
                                                                    <span className="truncate">{sub.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href!}
                                                className={cn(
                                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                                                    isActive ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                )}
                                            >
                                                <div className={cn(
                                                    'p-1.5 rounded-lg transition-colors',
                                                    isActive ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                                                )}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                                                </div>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* External Links */}
            <div className="p-4 border-t border-slate-700 space-y-1">
                <Link
                    href="/admin/select-tenant"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all text-xs"
                >
                    <Building2 className="h-4 w-4" />
                    <span>Workspace List</span>
                </Link>
                {lastTenant?.domain && (
                    <a
                        href={`https://${lastTenant.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all text-xs"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate">Web: {lastTenant.name}</span>
                    </a>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-950">
                {email && <p className="text-[10px] text-slate-500 truncate mb-3 px-2 italic">{email}</p>}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all w-full text-xs font-bold"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>SIGN OUT</span>
                </button>
            </div>
        </aside>
    );
}
