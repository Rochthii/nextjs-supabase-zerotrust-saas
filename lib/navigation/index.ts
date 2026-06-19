/**
 * @file lib/navigation/index.ts
 * @description Shared navigation logic for all Header components.
 *
 * All header variants (traditional, thera, minimal, modern, lotus, zen,
 * sunrise, festival, angkor, ink, mcaaron) import from here instead of redefining
 * themselves. Changing the menu logic here applies it to the entire system.
 */

import type { CategoryNode } from '@/lib/cache/queries';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PageNode = {
    id: string;
    slug: string;
    title_vi: string;
    title_en?: string | null;
    title_km?: string | null;
    parent_id?: string | null;
    show_in_menu?: boolean;
    children?: PageNode[];
};

export type NavItem = {
    nameKey?: string;
    node?: CategoryNode;
    href: string;
    variant?: 'default' | 'button' | 'cta';
    children?: NavItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Recursively map CategoryNode from DB to NavItem */
export const mapCategoryToNavItem = (node: CategoryNode, basePath: string): NavItem => ({
    node,
    href: `${basePath}/${node.slug}`,
    children:
        node.children && node.children.length > 0
            ? node.children.map(child => mapCategoryToNavItem(child, basePath))
            : undefined,
});

/** Map PageNode to NavItem */
export const mapPageToNavItem = (node: PageNode): NavItem => ({
    nameKey: node.title_vi,
    node: node as any,
    href: `/${node.slug}`,
    children:
        node.children && node.children.filter((c: PageNode) => c.show_in_menu).length > 0
            ? node.children
                  .filter((c: PageNode) => c.show_in_menu)
                  .map((child: PageNode) => mapPageToNavItem(child))
            : undefined,
});

/** Get multilingual label of NavItem */
export const getNavLabel = (item: NavItem, tNav: any, locale: string): string => {
    // For PageNode, prioritize title_xx
    if (item.node && 'title_vi' in item.node) {
        const page = item.node as any;
        if (locale === 'en' && page.title_en) return page.title_en;
        if (locale === 'km' && page.title_km) return page.title_km;
        return page.title_vi;
    }

    if (item.nameKey) {
        try {
            return tNav(item.nameKey);
        } catch {
            return item.nameKey;
        }
    }

    if (item.node) {
        if (locale === 'en' && item.node.name_en) return item.node.name_en;
        if (locale === 'km' && item.node.name_km) return item.node.name_km;
        return item.node.name_vi;
    }

    return '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Core: buildNavigation
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildNavigationOptions {
    categoriesTree?: {
        news: CategoryNode[];
        dharma: CategoryNode[];
        documents: CategoryNode[];
        transactions?: CategoryNode[];
    };
    pagesTree?: PageNode[];
    aboutSectionsTree?: CategoryNode[];
    layoutBlocks?: BlockConfig[];
    modulesConfig?: Record<string, boolean>;
    isCompany?: boolean;
    hasProjects?: boolean;
    /**
     * Configuration to enable/disable each Header item from the Admin "Configuration Menu".
     * Key: 'home' | 'about' | 'news' | 'dharma' | 'documents' | 'transaction' | 'contact'
     * false = hidden regardless of layoutBlocks; undefined/true = uses layoutBlocks logic.
     */
    navVisibility?: Record<string, boolean>;
}

export function buildNavigation({
    categoriesTree,
    pagesTree,
    aboutSectionsTree,
    layoutBlocks = [],
    modulesConfig,
    isCompany,
    hasProjects,
    navVisibility = {},
}: BuildNavigationOptions): NavItem[] {
    // Layer 1: layoutBlocks — whether the block is visible
    const isCategoryVisible = (category: string): boolean =>
        (layoutBlocks || []).some(block => {
            const blockType = block.type || (block.id as BlockType);
            const registryEntry = SECTION_REGISTRY[blockType as keyof typeof SECTION_REGISTRY];
            return registryEntry?.category === category && block.visible !== false;
        });

    // Layer 2: navVisibility — if admin explicitly disables it, it's hidden regardless of layoutBlocks
    const isMenuItemVisible = (key: string, fallback: boolean): boolean => {
        if (navVisibility[key] === false) return false;
        if (navVisibility[key] === true) return true;
        return fallback;
    };

    const nav: NavItem[] = [{ nameKey: 'home', href: '/' }];

    // ── B2B SAAS CORPORATE (Corporate Navigation) ───────────────────────────
    
    // Corporate About
    if (isMenuItemVisible('about', true)) {
        nav.push({ nameKey: 'about', href: '/about' });
    }

    // Document & SOP internally
    if (isMenuItemVisible('documents', true)) {
        nav.push({
            nameKey: 'documents',
            href: '/documents',
            children: categoriesTree?.documents?.map(cat => mapCategoryToNavItem(cat, '/documents')) || 
                      categoriesTree?.dharma?.map(cat => mapCategoryToNavItem(cat, '/documents')),
        });
    }

    // Project & AI RAG Solutions
    if (hasProjects || isMenuItemVisible('projects', true)) {
        nav.push({ nameKey: 'projects', href: '/projects' });
    }

    // News & Media
    if (isMenuItemVisible('news', true)) {
        nav.push({
            nameKey: 'news',
            href: '/news',
            children: categoriesTree?.news?.map(cat => mapCategoryToNavItem(cat, '/news')),
        });
    }

    // Contact & Collaboration
    if (isMenuItemVisible('contact', true)) {
        nav.push({ nameKey: 'contact', href: '/contact' });
    }

    return nav;
}
