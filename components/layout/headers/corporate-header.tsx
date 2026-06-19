'use client';

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, ChevronDown, Menu, X, ArrowRight, Building2,
    Layers, BarChart3, BookOpen, Users, Phone, ArrowUpRight, Activity
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenu } from '@/components/layout/user-menu';
import type { BlockConfig } from '@/lib/types/layout-blocks';
import { NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';

const getCorporateIcon = (item: NavItem) => {
    switch (item.nameKey) {
        case 'about': return <Users className="w-4 h-4 text-indigo-500" />;
        case 'solutions': return <Layers className="w-4 h-4 text-blue-500" />;
        case 'projects': return <BarChart3 className="w-4 h-4 text-emerald-500" />;
        case 'transaction':
        case 'company_transaction':
            return <Activity className="w-4 h-4 text-amber-500" />;
        case 'knowledge': return <BookOpen className="w-4 h-4 text-violet-500" />;
        case 'contact': return <Phone className="w-4 h-4 text-rose-500" />;
        default: return null;
    }
};

export type CorporateHeaderProps = {
    settings?: Record<string, string>;
    categoriesTree?: { news: any[]; dharma: any[]; documents: any[]; transactions?: any[]; media?: any[] };
    pagesTree?: any[];
    aboutSectionsTree?: any[];
    layoutBlocks?: BlockConfig[];
    domain?: string;
    modulesConfig?: Record<string, boolean>;
    hasProjects?: boolean;
    navVisibility?: Record<string, boolean>;
};

export function CorporateHeader({
    settings = {},
    categoriesTree,
    aboutSectionsTree,
    pagesTree,
    layoutBlocks = [],
    modulesConfig,
    hasProjects,
    navVisibility = {}
}: CorporateHeaderProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('navigation');

    const navItems = React.useMemo(() => buildNavigation({
        layoutBlocks,
        categoriesTree,
        pagesTree,
        aboutSectionsTree,
        modulesConfig,
        isCompany: true,
        hasProjects,
        navVisibility
    }), [layoutBlocks, categoriesTree, pagesTree, aboutSectionsTree, modulesConfig, hasProjects, navVisibility]);

    const isActive = React.useCallback((href: string) => {
        const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
        if (href === '/') return pathWithoutLocale === '/';
        return pathWithoutLocale.startsWith(href);
    }, [pathname, locale]);

    const switchLocale = React.useCallback((newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    }, [pathname, router]);

    React.useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const siteName = settings['site_name_vi'] || DEFAULT_SITE_NAME;
    const siteLogo = settings['site_logo'];

    return (
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 lg:px-8 pointer-events-none" suppressHydrationWarning>
            {/* White-Slate Neo-Glassmorphic Container */}
            <div className="mx-auto max-w-7xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl pointer-events-auto transition-colors duration-300">
                <nav className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 relative" aria-label="Main navigation">
                    
                    {/* Brand Identity / Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-3" prefetch={true}>
                            <TenantLogo 
                                src={siteLogo} 
                                alt={siteName} 
                                variant="circle" 
                                size="md" 
                                className="bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-indigo-500/50 transition-all shadow-sm"
                            />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-[14px] xl:text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">
                                    {siteName}
                                </span>
                                <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                    Enterprise Portal
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu Navigation */}
                    <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
                        {navItems.map((item, idx) => {
                            const label = getNavLabel(item, t, locale);
                            const itemActive = isActive(item.href);
                            
                            if (item.variant === 'cta' || item.variant === 'button') {
                                return (
                                    <Link
                                        key={`${item.href}-${idx}`}
                                        href={item.href}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5",
                                            itemActive 
                                                ? "bg-indigo-600 text-white" 
                                                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                        )}
                                    >
                                        {label}
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                );
                            }

                            if (!item.children || item.children.length === 0) {
                                return (
                                    <Link
                                        key={`${item.href}-${idx}`}
                                        href={item.href}
                                        className={cn(
                                            'px-3 xl:px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap',
                                            itemActive
                                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        )}
                                    >
                                        {getCorporateIcon(item)}
                                        {label}
                                    </Link>
                                );
                            }

                            return (
                                <div key={`${item.href}-${idx}`} className="group relative">
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'px-3 xl:px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap',
                                            itemActive
                                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        )}
                                    >
                                        {getCorporateIcon(item)}
                                        {label}
                                        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
                                    </Link>

                                    {/* Glassmorphic Dropdown */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300 z-50">
                                        <div className="absolute -top-2 inset-x-0 h-2 pointer-events-auto" />
                                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl rounded-xl p-2 min-w-[240px] ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                                            {item.children.map((child) => {
                                                const childActive = isActive(child.href);
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center px-4 py-2.5 text-[13px] font-medium rounded-lg transition-all gap-2.5",
                                                            childActive 
                                                                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 font-bold" 
                                                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", childActive ? "bg-indigo-600 dark:bg-indigo-400" : "bg-slate-300 dark:bg-slate-600")} />
                                                        {getNavLabel(child, t, locale)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Right Panel (Lang, Auth, Portal Access) */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        {/* Desktop Multi-language selector */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 h-9 px-3 text-[12.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/50 rounded-lg transition-all shadow-sm">
                                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="uppercase">{locale}</span>
                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg rounded-xl p-1.5">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer text-[13px] font-semibold rounded-lg py-2 px-2.5 mb-0.5 last:mb-0 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:bg-slate-100 dark:focus:bg-slate-800/50',
                                                locale === code && 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Interactive User Auth State Menu */}
                        <UserMenu isCompany={true} />

                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex lg:hidden items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            aria-label="Open navigation drawer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Premium Sliding Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl p-6 pointer-events-auto flex flex-col justify-between"
                        >
                            <div>
                                {/* Mobile Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                        <span className="font-extrabold text-[15px] text-slate-900 dark:text-white">
                                            {siteName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                                    {navItems.map((item, idx) => {
                                        const label = getNavLabel(item, t, locale);
                                        const itemActive = isActive(item.href);
                                        const isExpanded = expandedItem === item.href;

                                        if (item.variant === 'cta' || item.variant === 'button') {
                                            return (
                                                <Link
                                                    key={`${item.href}-${idx}`}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-[13px] rounded-lg border border-indigo-100 dark:border-indigo-900/50"
                                                >
                                                    {label}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            );
                                        }

                                        if (!item.children || item.children.length === 0) {
                                            return (
                                                <Link
                                                    key={`${item.href}-${idx}`}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 text-[13.5px] font-semibold rounded-lg transition-all",
                                                        itemActive 
                                                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20" 
                                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                                    )}
                                                >
                                                    {getCorporateIcon(item)}
                                                    {label}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <div key={`${item.href}-${idx}`} className="space-y-1">
                                                <button
                                                    onClick={() => setExpandedItem(isExpanded ? null : item.href)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold rounded-lg transition-all text-left",
                                                        itemActive 
                                                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20" 
                                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        {getCorporateIcon(item)}
                                                        {label}
                                                    </span>
                                                    <ChevronDown className={cn("w-4 h-4 opacity-60 transition-transform duration-200", isExpanded && "rotate-180")} />
                                                </button>

                                                {/* Expanded submenu */}
                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden pl-10 pr-2 space-y-1 border-l-2 border-indigo-100 dark:border-indigo-950 ml-6"
                                                        >
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    onClick={() => setMobileOpen(false)}
                                                                    className={cn(
                                                                        "block py-2 px-3 text-[13px] font-medium rounded-md transition-all",
                                                                        isActive(child.href)
                                                                            ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                                                    )}
                                                                >
                                                                    {getNavLabel(child, t, locale)}
                                                                </Link>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mobile Language switch and details */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                                <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                                    {locale === 'vi' ? 'Select Ngôn Ngữ' : 'Choose Language'}
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <button
                                            key={code}
                                            onClick={() => {
                                                switchLocale(code);
                                                setMobileOpen(false);
                                            }}
                                            className={cn(
                                                "py-2 text-[12px] font-bold rounded-lg border text-center transition-all",
                                                locale === code 
                                                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900" 
                                                    : "text-slate-600 dark:text-slate-300 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-850"
                                            )}
                                        >
                                            {name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
