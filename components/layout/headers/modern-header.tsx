'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TenantLogo } from '@/components/layout/tenant-logo';
import { Search, ChevronDown, Menu, X, Globe, User, ArrowRight } from 'lucide-react';


// ─────────────────────────────────────────────────
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { SearchModal } from '@/components/search/search-modal';
import { UserMenu } from '@/components/layout/user-menu';

// NavLink component (Modern)
// ─────────────────────────────────────────────────

const NavLink = React.memo(({
    item,
    isActive,
    onClick,
    locale
}: {
    item: NavItem;
    isActive: boolean;
    onClick?: () => void;
    locale: string;
}) => {
    const tNav = useTranslations('navigation');

    return (
        <Link
            href={item.href}
            onClick={onClick}
            prefetch={true}
            className={cn(
                'relative px-3 py-2 text-[13px] font-medium transition-all duration-300 rounded-full min-h-[40px] flex items-center whitespace-nowrap shrink-0',
                'hover:bg-black/5 hover:text-black',
                isActive
                    ? 'text-primary font-bold'
                    : 'text-gray-700',
                item.children && 'pr-2'
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-white shadow-sm ring-1 ring-black/5 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{getNavLabel(item, tNav, locale)}</span>
        </Link>
    );
});

NavLink.displayName = 'NavLink';

// ─────────────────────────────────────────────────
// Recursive Desktop Modern Menu Renderer
// ─────────────────────────────────────────────────

const DesktopNavNode = ({ item, t, locale, isActiveLink }: { item: NavItem; t: any; locale: string; isActiveLink: (href: string) => boolean }) => {
    const isRootActive = isActiveLink(item.href);
    const label = getNavLabel(item, t, locale);

    if (!item.children || item.children.length === 0) {
        if (item.variant === 'button') {
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'relative px-5 py-2.5 ml-3 text-[14px] font-bold tracking-wide rounded-full whitespace-nowrap flex items-center shadow-[0_4px_14px_0_rgba(255,215,0,0.2)] transition-all duration-300 transform hover:-translate-y-0.5',
                        'bg-gradient-to-tr from-[#002B5B] to-[#004080] text-white hover:text-white',
                    )}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {label}
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </div>
                    </span>
                </Link>
            );
        }
        return <NavLink item={item} isActive={isRootActive} locale={locale} />;
    }

    if (item.variant === 'button') {
        return (
            <div className="group relative ml-3 mt-1 lg:mt-0">
                <Link
                    href={item.href}
                    className={cn(
                        'relative px-5 py-2.5 text-[14px] font-bold tracking-wide rounded-full whitespace-nowrap flex items-center shadow-[0_4px_14px_0_rgba(255,215,0,0.2)] transition-all duration-300 transform group-hover:shadow-[0_6px_20px_rgba(255,215,0,0.3)] group-hover:-translate-y-0.5 border border-white/20',
                        'bg-gradient-to-tr from-[#002B5B] to-[#004080] text-white hover:text-white'
                    )}
                >
                    <span className="relative z-10 flex items-center gap-1.5">
                        {label}
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                            <ChevronDown className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:rotate-180" />
                        </div>
                    </span>
                </Link>

                {/* Neo-Glassmorphism Dropdown Menu */}
                <div className="absolute top-full right-0 pt-3 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-3 min-w-[240px] relative mt-1 flex flex-col gap-1 ring-1 ring-black/5">
                        {item.children.map((child) => {
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] px-4 py-2.5 rounded-xl transition-all flex items-center justify-between",
                                            isChildActive 
                                                ? "font-bold text-primary bg-primary/5 shadow-sm" 
                                                : "font-medium text-gray-700 hover:text-primary hover:bg-black/5 hover:shadow-sm"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Standard modern dropdown
    return (
        <div className="group shrink-0">
            <Link
                href={item.href}
                className={cn(
                    'relative px-3 py-2 text-[13px] font-medium transition-all duration-300 rounded-full min-h-[40px] flex items-center peer gap-1 whitespace-nowrap',
                    'hover:bg-black/5 text-gray-700 hover:text-gray-900',
                    isRootActive && 'text-primary font-bold'
                )}
            >
                {isRootActive && (
                    <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-black/5 rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <span className="relative z-10">{label}</span>
                <ChevronDown className="w-4 h-4 relative z-10 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
            </Link>

            {/* Neo-Glassmorphic Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-3 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white border border-gray-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 rounded-[2rem] p-6 min-w-[280px] w-max flex gap-4 mt-1 pointer-events-auto">
                    <div className="flex flex-row flex-wrap gap-x-10 gap-y-8 min-w-[220px] flex-1">
                        {item.children.map((child) => {
                            const hasGrandChildren = child.children && child.children.length > 0;
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col min-w-max">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "font-bold text-[15px] mb-3 transition-colors inline-block pb-1 border-b-2",
                                            isChildActive ? "text-primary border-primary" : hasGrandChildren ? "text-gray-900 border-primary/20" : "text-gray-700 hover:text-primary border-transparent hover:border-primary/30"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-2 mt-2">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild.href);
                                                return (
                                                    <Link
                                                        key={grandChild.href}
                                                        href={grandChild.href}
                                                        className={cn(
                                                            "text-[14px] px-3 py-2 rounded-xl transition-all flex items-center gap-2 group/link",
                                                            isGrandActive 
                                                                ? "font-bold text-primary bg-primary/5" 
                                                                : "font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5"
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", isGrandActive ? "bg-primary shadow-[0_0_8px_rgba(255,215,0,0.6)]" : "bg-gray-300 group-hover/link:bg-primary group-hover/link:shadow-[0_0_8px_rgba(255,215,0,0.6)]")} />
                                                        {getNavLabel(grandChild, t, locale)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────
// Mobile Nav Node (Modern)
// ─────────────────────────────────────────────────

const MobileNavNode = ({ item, t, locale, isActiveLink, closeMenu, expandedNodes, toggleAccordion, depth = 0 }: any) => {
    const active = isActiveLink(item.href);
    const label = getNavLabel(item, t, locale);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes[item.href];

    if (!hasChildren) {
        if (item.variant === 'button') {
            return (
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                        'flex items-center justify-between px-5 py-3.5 min-h-[44px] text-sm font-bold rounded-2xl transition-all mt-4 border border-white/40 shadow-sm bg-gradient-to-tr from-[#002B5B] to-[#004080] text-white',
                        depth > 0 && 'ml-4'
                    )}
                >
                    {label}
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-5 py-3.5 min-h-[44px] text-[14px] font-medium rounded-2xl transition-all mb-1',
                    active
                        ? 'bg-white text-primary shadow-sm ring-1 ring-gray-100'
                        : 'text-gray-700 active:bg-white/40',
                    depth > 0 && `ml-4 border-l-2 border-primary/20 pl-4 rounded-l-none`,
                    depth === 0 && 'uppercase tracking-wide font-bold'
                )}
            >
                {label}
            </Link>
        );
    }

    return (
        <div className="w-full flex-col flex mt-1 mb-1 bg-gray-50 rounded-2xl p-1">
            <button
                onClick={() => toggleAccordion(item.href)}
                className={cn(
                    'flex items-center justify-between w-full px-4 py-3 min-h-[44px] rounded-xl transition-all font-medium text-[14px]',
                    item.variant === 'button'
                        ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-md'
                        : active
                            ? 'text-primary font-bold bg-white shadow-sm'
                            : 'text-gray-800 active:bg-white/40'
                )}
            >
                <div className="flex items-center text-left">
                    <span>{label}</span>
                </div>
                <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    isExpanded ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                )}>
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                </div>
            </button>
            <div className={cn(
                'overflow-hidden transition-all duration-300 flex flex-col',
                isExpanded ? 'max-h-[1000px] opacity-100 mt-2 pb-2' : 'max-h-0 opacity-0'
            )}>
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center px-5 py-2.5 min-h-[40px] text-[12px] font-bold text-primary/80 uppercase tracking-wider rounded-lg active:bg-gray-100 transition-colors mb-2 border border-primary/10 shadow-sm"
                    style={{ marginLeft: `${(depth + 1) * 0.75}rem` }}
                >
                    <span className="mr-2">→</span> View page aggregate
                </Link>
                {item.children.map((child: any) => (
                    <MobileNavNode
                        key={child.href}
                        item={child}
                        t={t}
                        locale={locale}
                        isActiveLink={isActiveLink}
                        closeMenu={closeMenu}
                        expandedNodes={expandedNodes}
                        toggleAccordion={toggleAccordion}
                        depth={depth + 1}
                    />
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────
// MODERN Header component
// ─────────────────────────────────────────────────

export function ModernHeader({
    settings = {},
    categoriesTree,
    pagesTree,
    aboutSectionsTree,
    layoutBlocks = [],
    domain,
    modulesConfig,
    isCompany,
    hasProjects,
    navVisibility = {}
}: {
    settings?: Record<string, string>,
    categoriesTree?: { news: CategoryNode[], dharma: CategoryNode[], documents: CategoryNode[], transactions?: CategoryNode[] },
    pagesTree?: PageNode[],
    aboutSectionsTree?: CategoryNode[],
    layoutBlocks?: BlockConfig[],
    domain?: string,
    modulesConfig?: Record<string, boolean>,
    isCompany?: boolean,
    hasProjects?: boolean,
    navVisibility?: Record<string, boolean>
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');

    const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);

    const isActiveLink = React.useCallback((href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname === href || pathname.startsWith(href + '/');
    }, [pathname]);

    const switchLocale = React.useCallback((newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    }, [pathname, router]);

    const closeMobileMenu = React.useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setExpandedNodes({});
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleAccordion = (href: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [href]: !prev[href]
        }));
    };

    return (
        // Floating wrapper padding setup for Modern Look
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 lg:px-8 pointer-events-none" suppressHydrationWarning>

            {/* ── Main Glassmorphism Bar (Floating Pill) ── */}
            <div className="mx-auto max-w-7xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full pointer-events-auto" style={{ backgroundColor: 'var(--theme-header-bg, #ffffff)' }}>
                <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-5 py-2 relative" aria-label="Main navigation" suppressHydrationWarning>

                    {/* Modern Logo (Round and Compact) — Left column */}
                    <div className="flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-3 pr-2" prefetch={true}>
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="circle" 
                                size="md" 
                                className="bg-white/50 ring-1 ring-gray-100 group-hover:ring-primary/30 transition-all shadow-sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg font-inter font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 leading-tight">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation — Center column, always centered */}
                    <div className="hidden lg:flex items-center justify-center gap-0.5 group/nav overflow-hidden">
                        {navigation.map((item) => (
                            <DesktopNavNode key={item.href} item={item} t={tNav} locale={locale} isActiveLink={isActiveLink} />
                        ))}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center justify-end gap-2 relative z-10">
                        {/* Search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-10 w-10 text-gray-700 hover:text-primary hover:bg-black/5 bg-white shadow-sm border border-white/80 rounded-full transition-all"
                            aria-label="Search"
                        >
                            <Search className="w-4 h-4" />
                        </button>

                        {/* Language switcher */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 h-10 px-3.5 text-[13px] font-bold text-gray-700 hover:text-primary bg-white hover:bg-gray-50 shadow-sm border border-white/80 rounded-full transition-all">
                                        <Globe className="w-4 h-4 opacity-70" />
                                        <span className="uppercase">{locale}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl p-2 z-[60]">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-[13px] font-semibold rounded-xl py-2.5 px-3 focus:bg-gray-100 mb-1 last:mb-0',
                                                locale === code && 'text-primary bg-primary/10 shadow-sm'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* User Profile */}
                        <div className="hidden lg:flex items-center pl-1">
                            <UserMenu />
                        </div>

                        {/* Mobile Menu Icon */}
                        <div className="flex lg:hidden items-center ml-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex items-center justify-center h-10 w-10 text-gray-800 bg-white shadow-sm border border-white rounded-full transition-all active:scale-95"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ── Mobile Glass Drawer ── */}
            <div className={cn(
                'lg:hidden fixed inset-0 z-[100] transition-opacity duration-400 pointer-events-auto',
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
                <div className={cn(
                    'absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-400',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[88%] max-w-[360px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] overflow-y-auto overscroll-contain transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-l-3xl border-l border-gray-100',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    {/* Drawer Header inside Glass */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <span className="text-[13px] font-extrabold text-[#002B5B] uppercase tracking-widest">Navigation</span>
                        <button
                            onClick={closeMobileMenu}
                            className="flex items-center justify-center h-10 w-10 text-gray-600 bg-gray-100/50 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav items */}
                    <nav className="px-5 py-6" aria-label="Mobile navigation">
                        {navigation.map((item) => (
                            <MobileNavNode
                                key={item.href}
                                item={item}
                                t={tNav}
                                locale={locale}
                                isActiveLink={isActiveLink}
                                closeMenu={closeMobileMenu}
                                expandedNodes={expandedNodes}
                                toggleAccordion={toggleAccordion}
                            />
                        ))}
                    </nav>

                    {/* Footer Utility inside Drawer */}
                    <div className="px-5 pb-8 flex flex-col gap-4 mt-auto">
                        <div className="bg-gray-100/50 p-2 rounded-2xl flex gap-1 border border-white shadow-inner">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'flex-1 py-3 text-[13px] font-bold rounded-xl transition-all',
                                        locale === code
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    )}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center bg-gray-50/50 py-3 rounded-2xl border border-white">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
