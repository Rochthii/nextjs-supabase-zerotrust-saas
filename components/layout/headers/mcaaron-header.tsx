'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LOCALES, BRAND_NAME_VI, DEFAULT_SITE_NAME } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, ChevronDown, Menu, X, ArrowRight, Handshake,
    Layers, BarChart2, BookOpen, Users, Phone
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenu } from '@/components/layout/user-menu';
import type { CategoryNode, PageNode } from '@/lib/cache/queries';
import type { BlockConfig } from '@/lib/types/layout-blocks';

import { NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';

// Get icon local for McAaron items
const getMcAaronIcon = (item: NavItem) => {
    switch (item.nameKey) {
        case 'about': return <Users className="w-3.5 h-3.5" />;
        case 'solutions': return <Layers className="w-3.5 h-3.5" />;
        case 'projects': return <BarChart2 className="w-3.5 h-3.5" />;
        case 'transaction': return <Handshake className="w-3.5 h-3.5" />;
        case 'knowledge': return <BookOpen className="w-3.5 h-3.5" />;
        case 'contact': return <Phone className="w-3.5 h-3.5" />;
        default: return null;
    }
};

// ─── Props ───────────────────────────────────────────────────────────────────

export type McAaronHeaderProps = {
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

// ─── Desktop Nav Node ────────────────────────────────────────────────────────

function DesktopNavItem({ item, isActive, t, locale }: { item: NavItem; isActive: (href: string) => boolean; t: any; locale: string }) {
    const label = getNavLabel(item, t, locale);
    if (item.variant === 'cta' || item.variant === 'button') {
        return (
            <Link
                href={item.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00D2FF] text-[#0A0F1A] text-[13px] font-extrabold rounded-full hover:bg-white transition-all shadow-[0_4px_20px_rgba(0,210,255,0.3)] hover:shadow-[0_6px_30px_rgba(0,210,255,0.5)] hover:-translate-y-0.5"
            >
                {label}
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        );
    }

    if (!item.children || item.children.length === 0) {
        return (
            <Link
                href={item.href}
                className={cn(
                    'relative px-2 xl:px-4 py-2 text-[12px] xl:text-[13px] font-semibold rounded-full transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap',
                    isActive(item.href)
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
            >
                {getMcAaronIcon(item)}
                {label}
            </Link>
        );
    }

    return (
        <div className="group">
            <Link
                href={item.href}
                className={cn(
                    'relative px-2 xl:px-4 py-2 text-[12px] xl:text-[13px] font-semibold rounded-full transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap',
                    isActive(item.href)
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
            >
                {getMcAaronIcon(item)}
                {label}
                <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
            </Link>

            {/* Dropdown - Fixed Hover Bridge with pointer-events and continuous area */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300 z-50">
                {/* Invisible bridge to keep hover active between trigger and menu */}
                <div className="absolute -top-4 inset-x-0 h-4 pointer-events-auto" />
                <div className="bg-[#0D1625]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5)] rounded-2xl p-2 min-w-[220px] ring-1 ring-white/5 pointer-events-auto">
                    {item.children.map((child) => {
                        const isChildActive = isActive(child.href);
                        return (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-[13px] rounded-xl transition-all gap-2",
                                isChildActive 
                                    ? "font-bold text-[#00D2FF] bg-white/5" 
                                    : "font-medium text-gray-300 hover:text-[#00D2FF] hover:bg-white/5"
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", isChildActive ? "bg-[#00D2FF]" : "bg-[#00D2FF]/40 group-hover:bg-[#00D2FF]")} />
                            {getNavLabel(child, t, locale)}
                        </Link>
                    )})}
                </div>
            </div>
        </div>
    );
}

function StandardNavItem({ item, isActive, t, locale }: { item: NavItem; isActive: (href: string) => boolean; t: any; locale: string }) {
    const label = getNavLabel(item, t, locale);
    return (
        <Link
            href={item.href}
            className={cn(
                'relative px-2 xl:px-4 py-2 text-[12px] xl:text-[13px] font-semibold rounded-full transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap',
                isActive(item.href)
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
        >
            {getMcAaronIcon(item)}
            {label}
        </Link>
    );
}

// ─── Main Header Component ───────────────────────────────────────────────────

export function McAaronHeader({ settings = {}, categoriesTree, aboutSectionsTree, pagesTree, layoutBlocks = [], modulesConfig, hasProjects, navVisibility = {} }: McAaronHeaderProps) {
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
        isCompany: true, // McAaron is company theme
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
    const isCompany = settings['tenant_type'] !== 'tenant';

    return (
        <header className="sticky top-0 z-50 w-full pt-3 pb-1 px-4 lg:px-8 pointer-events-none" suppressHydrationWarning>
            {/* Main dark glassmorphic bar */}
            <div className="mx-auto max-w-7xl backdrop-blur-2xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full pointer-events-auto ring-1 ring-white/5" style={{ backgroundColor: 'var(--theme-header-bg, rgba(10, 15, 26, 0.85))' }}>
                <nav className="flex items-center justify-between gap-4 px-3 sm:px-5 py-2 relative" aria-label="Main navigation" suppressHydrationWarning>
                    
                    {/* Logo Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-3 pr-2" prefetch={true}>
                            <TenantLogo 
                                src={siteLogo} 
                                alt={siteName} 
                                variant="circle" 
                                size="md" 
                                className="bg-[#0D121F]/50 ring-2 ring-white/5 group-hover:ring-gold-primary/30 transition-all shadow-lg"
                            />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-[14px] xl:text-[15px] font-black text-white tracking-tight leading-tight whitespace-nowrap">
                                    {siteName}
                                </span>
                                <span className="text-[8px] xl:text-[9px] font-bold tracking-[0.2em] uppercase text-gold-primary/70 whitespace-nowrap">
                                    {isCompany ? "Social Enterprise" : "McAaron Theme"}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center justify-center lg:gap-0.5 xl:gap-1">
                        {navItems.map((item, idx) => (
                            item.children && item.children.length > 0 ? (
                                <DesktopNavItem key={`${item.href}-${idx}`} item={item} isActive={isActive} t={t} locale={locale} />
                            ) : (
                                <StandardNavItem key={`${item.href}-${idx}`} item={item} isActive={isActive} t={t} locale={locale} />
                            )
                        ))}
                    </div>

                    {/* Right side Container */}
                    <div className="flex-1 flex items-center justify-end lg:gap-1 xl:gap-2">
                        {/* Language switcher — desktop */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 h-9 px-3 text-[12px] font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 rounded-full transition-all">
                                        <Globe className="w-3.5 h-3.5 opacity-70" />
                                        <span className="uppercase">{locale}</span>
                                        <ChevronDown className="w-3 h-3 opacity-40" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[110px] bg-[#0D1625]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl p-2 z-[60]">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer text-[13px] font-semibold rounded-xl py-2.5 px-3 mb-1 last:mb-0 text-gray-300 hover:text-white focus:bg-white/10',
                                                locale === code && 'text-[#00D2FF] bg-[#00D2FF]/10'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="hidden lg:flex items-center pl-1">
                            <UserMenu isCompany={true} />
                        </div>

                        {/* Mobile toggle */}
                        <div className="flex lg:hidden items-center ml-1">
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="flex items-center justify-center h-9 w-9 text-gray-200 bg-white/5 border border-white/10 rounded-full transition-all active:scale-95"
                                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            >
                                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <div className="lg:hidden fixed inset-0 z-[100] pointer-events-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="absolute right-0 top-0 bottom-0 w-[88%] max-w-[340px] bg-[#0A0F1A] border-l border-white/8 overflow-y-auto overscroll-contain"
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-tr from-[#00D2FF]/30 to-[#004080] rounded-full flex items-center justify-center border border-[#00D2FF]/20">
                                        <span className="font-black text-white text-[10px]">MC</span>
                                    </div>
                                    <span className="text-[13px] font-extrabold text-white tracking-wide">{siteName}</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center h-9 w-9 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Nav items */}
                            <nav className="px-4 py-5 flex flex-col gap-1" aria-label="Mobile navigation">
                                {navItems.map((item) => {
                                    const active = isActive(item.href);
                                    const hasChildren = item.children && item.children.length > 0;
                                    const isExpanded = expandedItem === item.href;

                                    if (item.variant === 'cta') {
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="mt-3 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#00D2FF] text-[#0A0F1A] text-[14px] font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(0,210,255,0.3)] transition-all"
                                            >
                                                {getNavLabel(item, t, locale)}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        );
                                    }

                                    if (!hasChildren) {
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all',
                                                    active
                                                        ? 'bg-white/8 text-[#00D2FF]'
                                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                )}
                                            >
                                                {getMcAaronIcon(item)}
                                                {getNavLabel(item, t, locale)}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div key={item.href}>
                                            <button
                                                onClick={() => setExpandedItem(isExpanded ? null : item.href)}
                                                className={cn(
                                                    'w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all',
                                                    active ? 'text-[#00D2FF]' : 'text-gray-300'
                                                )}
                                            >
                                                <span className="flex items-center gap-3">{getMcAaronIcon(item)}{getNavLabel(item, t, locale)}</span>
                                                <ChevronDown className={cn('w-4 h-4 opacity-50 transition-transform duration-300', isExpanded && 'rotate-180')} />
                                            </button>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden ml-3 mb-1"
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-[#00D2FF] hover:text-[#00D2FF]/80 rounded-xl transition-all"
                                                        >
                                                            <span className="opacity-50">→</span> View page aggregate
                                                        </Link>
                                                        {item.children!.map((child) => (
                                                            <Link
                                                                key={child.href}
                                                                href={child.href}
                                                                onClick={() => setMobileOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-gray-400 hover:text-[#00D2FF] rounded-xl transition-all"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]/30" />
                                                                {getNavLabel(child, t, locale)}
                                                            </Link>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </nav>

                            {/* Locale switcher — mobile */}
                            <div className="px-4 pb-8 mt-4">
                                <div className="bg-white/5 border border-white/8 rounded-2xl p-1.5 flex gap-1 mb-4">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <button
                                            key={code}
                                            onClick={() => { switchLocale(code); setMobileOpen(false); }}
                                            className={cn(
                                                'flex-1 py-2.5 text-[12px] font-bold rounded-xl transition-all',
                                                locale === code
                                                    ? 'bg-[#00D2FF] text-[#0A0F1A]'
                                                    : 'text-gray-400 hover:text-gray-200'
                                            )}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-center bg-white/5 py-3 rounded-2xl border border-white/8">
                                    <UserMenu isCompany={true} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default McAaronHeader;
