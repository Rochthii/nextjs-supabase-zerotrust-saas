'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { SearchModal } from '@/components/search/search-modal';
import { UserMenu } from '@/components/layout/user-menu';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';

// ──────────────────────────────────────────────────────────
// Style: Ink Header — Editorial Minimalist
// Triết lý: Đen mực trên nền giấy trắng tinh, khoảng trống cực lớn.
// Typography: Serif (Playfair Display) cho Logo, Sans-serif cho Nav.
// ──────────────────────────────────────────────────────────

export function InkHeader({
    settings = {},
    categoriesTree,
    pagesTree,
    aboutSectionsTree,
    layoutBlocks = [],
    isCompany,
    modulesConfig,
    hasProjects,
    navVisibility = {}
}: {
    settings?: Record<string, string>,
    categoriesTree?: { news: CategoryNode[], dharma: CategoryNode[], documents: CategoryNode[], transactions?: CategoryNode[] },
    pagesTree?: PageNode[],
    aboutSectionsTree?: CategoryNode[],
    layoutBlocks?: BlockConfig[],
    modulesConfig?: Record<string, boolean>,
    isCompany?: boolean,
    hasProjects?: boolean,
    navVisibility?: Record<string, boolean>
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const tNav = useTranslations('navigation');

    const navigation = React.useMemo(() => buildNavigation({ 
        categoriesTree, 
        pagesTree, 
        aboutSectionsTree, 
        layoutBlocks, 
        modulesConfig, 
        isCompany, 
        hasProjects, 
        navVisibility 
    }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);

    const isActive = (href: string) => 
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/5" style={{ backgroundColor: 'var(--theme-header-bg, rgba(255, 255, 255, 0.8))' }} suppressHydrationWarning>
            <nav className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between relative">
                
                {/* Logo Section Container */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="flex items-center gap-4 border-l-2 border-black pl-4 py-1">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="md" 
                                variant="adaptive" 
                                className="grayscale contrast-125"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-serif font-black uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mt-1">
                                    {settings['site_name_en'] || 'Buddhist Magazine'}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Desktop Nav — Horizontal, very spaced out */}
                <div className="hidden lg:flex items-center justify-center gap-10">
                    {navigation.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'text-[13px] font-bold uppercase tracking-widest transition-all duration-300 relative py-2',
                                'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full',
                                isActive(item.href) ? 'text-black after:w-full' : 'text-black/40 hover:text-black'
                            )}
                        >
                            {getNavLabel(item, tNav, locale)}
                        </Link>
                    ))}
                </div>

                {/* Actions Container */}
                <div className="flex-1 flex items-center justify-end gap-6">
                    {/* Search */}
                    <button onClick={() => setSearchOpen(true)} className="hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Lang */}
                    <div className="hidden sm:flex text-[11px] font-black gap-2 border border-black/10 rounded px-2 py-1">
                        {Object.keys(LOCALES).map(lang => (
                            <button 
                                key={lang} 
                                onClick={() => switchLocale(lang)}
                                className={cn(lang === locale ? 'text-black' : 'text-black/20 hover:text-black')}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* User */}
                    <UserMenu />

                    {/* Mobile Menu */}
                    <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Fullscreen Drawer */}
            <div className={cn(
                'fixed inset-0 bg-white z-[100] transition-all duration-700 flex flex-col items-center justify-center',
                mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            )}>
                <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-8 right-8 text-black"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col gap-6 text-center">
                    {navigation.map((item, idx) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-4xl font-serif font-black uppercase tracking-tighter hover:italic hover:pl-4 transition-all"
                            style={{ transitionDelay: `${idx * 50}ms`, fontFamily: 'var(--font-playfair)' }}
                        >
                            {getNavLabel(item, tNav, locale)}
                        </Link>
                    ))}
                </div>

                <div className="mt-20 flex gap-4 text-xs font-bold tracking-widest uppercase opacity-40">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>{DEFAULT_SITE_NAME}</span>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
