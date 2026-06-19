import { unstable_cache } from 'next/cache';
import { getServiceRoleClient, getBaseSlug, TTL, BUDDHIST_KEYWORDS, type HeroSlideRow } from './shared';
import { SYSTEM_THEMES } from '@/lib/themes-config';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { hexToRgbString, darkenRgbString, lightenRgbString } from '@/lib/utils/colors';

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

// ─── Hero Slides ─────────────────────────────────────────────────────────────
export const getCachedHeroSlides = async (tenantId?: string): Promise<HeroSlideRow[]> => {
    try {
        return await unstable_cache(
            async () => {
                const supabase = getServiceRoleClient();
                let query = supabase
                    .from('hero_slides')
                    .select('*')
                    .eq('is_active', true);

                if (tenantId) {
                    query = query.eq('tenant_id', tenantId);
                }

                const { data, error } = await query.order('order_position', { ascending: true });

                if (error) {
                    console.error('[Cache] hero_slides error:', error.message);
                    return [];
                }
                return (data ?? []) as unknown as HeroSlideRow[];
            },
            ['hero-slides-v2', tenantId || 'default'],
            { revalidate: TTL.HERO_SLIDES, tags: ['hero-slides', tenantId ? `hero-slides-${tenantId}` : 'hero-slides-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedHeroSlides:', e);
        return [];
    }
};

// ─── Pages Tree ──────────────────────────────────────────────────────────────
export const getCachedPagesTree = async (tenantId?: string): Promise<PageNode[]> => {
    return unstable_cache(
        async () => {
            const supabase = getServiceRoleClient();
            let query = supabase
                .from('pages')
                .select('id, slug, title_vi, title_en, title_km, parent_id, show_in_menu, order_index')
                .eq('status', 'published')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: true });

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[Cache] pages_tree error:', error.message);
                return [];
            }

            const items = (data || []) as unknown as PageNode[];
            const treeMap: Record<string, PageNode> = {};
            const rootNodes: PageNode[] = [];

            items.forEach((item: PageNode) => {
                treeMap[item.id] = { ...item, children: [] } as PageNode;
            });

            items.forEach((item: PageNode) => {
                if (item.parent_id && treeMap[item.parent_id]) {
                    treeMap[item.parent_id].children!.push(treeMap[item.id]);
                } else {
                    rootNodes.push(treeMap[item.id]);
                }
            });

            return rootNodes;
        },
        ['pages-tree', tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['pages', tenantId ? `pages-${tenantId}` : 'pages-all'] }
    )();
};

// ─── Transaction Projects ───────────────────────────────────────────────────
export const getCachedTransactionProjects = async (limit: number = 2, tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getServiceRoleClient();
            let query = supabase
                .from('transaction_projects')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'ongoing')
                .eq('approval_status' as any, 'published');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] transaction_projects error:', error.message);
                return [];
            }
            return data || [];
        },
        ['transaction-projects-active', limit.toString(), tenantId || 'all'],
        { revalidate: false, tags: ['transaction_projects'] }
    )();
};

// ─── Unified Layout Data ─────────────────────────────────────────────────────
export const getCachedLayoutData = async (domain: string, tenantId: string) => {
    return unstable_cache(
        async () => {
            const supabase = getServiceRoleClient();
            
            const { data: tenantDataObj } = await supabase.from('tenants' as any).select('tenant_type').eq('id', tenantId).single();
            const tType = (tenantDataObj as any)?.tenant_type || 'tenant';

            const [
                { data: settingsData },
                { data: categoriesData },
                { data: pagesData },
                { data: aboutData },
                { data: tenantData },
                projectsResult
            ] = await Promise.all([
                supabase.from('site_settings').select('key, value').eq('tenant_id', tenantId),
                supabase.from('categories')
                    .select('*')
                    .or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`)
                    .eq('is_visible', true)
                    .order('order_position', { ascending: true })
                    .order('created_at', { ascending: true }),
                supabase.from('pages').select('*').or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`),
                supabase.from('about_sections').select('*').or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`).eq('is_active', true).order('display_order', { ascending: true }),
                supabase.from('tenants' as any).select('*').eq('id', tenantId).single(),
                supabase.from('transaction_projects').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true).eq('status', 'ongoing').eq('approval_status' as any, 'published')
            ]);

            const projectsCount = (projectsResult as any)?.count || 0;

            const filteredCategoriesData = (categoriesData || []).filter(cat => {
                if (tType === 'company') {
                    const name = (cat.name_vi || '').toLowerCase();
                    return !BUDDHIST_KEYWORDS.some((kw: string) => name.includes(kw));
                }
                return true;
            });

            const settings = (settingsData || []).reduce((acc: any, curr: any) => {
                acc[curr.key] = typeof curr.value === 'string' ? curr.value : JSON.stringify(curr.value);
                return acc;
            }, {} as Record<string, string>);

            const buildTree = (items: any[]) => {
                if (!items?.length) return [];
                const treeMap: Record<string, any> = {};
                const rootNodes: any[] = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    treeMap[item.id] = { ...item, children: [] };
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.parent_id && treeMap[item.parent_id]) {
                        treeMap[item.parent_id].children.push(treeMap[item.id]);
                    } else {
                        rootNodes.push(treeMap[item.id]);
                    }
                }
                return rootNodes;
            };

            const newsItems: any[] = [];
            const dharmaItems: any[] = [];
            const docItems: any[] = [];
            const transactionsItems: any[] = [];

            if (categoriesData) {
                const keptCatsMap = new Map<string, any>();
                const catIdMapping = new Map<string, string>();

                filteredCategoriesData.forEach(item => {
                    const baseSlug = getBaseSlug(item.slug);
                    const existing = keptCatsMap.get(baseSlug);
                    if (!existing) {
                        keptCatsMap.set(baseSlug, item);
                        catIdMapping.set(item.id, item.id);
                    } else {
                        const isNewTenant = item.tenant_id === tenantId;
                        const isExistingTenant = existing.tenant_id === tenantId;
                        if (isNewTenant && !isExistingTenant) {
                            keptCatsMap.set(baseSlug, item);
                            catIdMapping.set(existing.id, item.id);
                            catIdMapping.set(item.id, item.id);
                        } else {
                            catIdMapping.set(item.id, existing.id);
                        }
                    }
                });

                const dedupedCats = Array.from(keptCatsMap.values()).map(c => ({
                    ...c,
                    parent_id: c.parent_id ? (catIdMapping.get(c.parent_id) || c.parent_id) : null,
                    children: []
                }));

                for (let i = 0; i < dedupedCats.length; i++) {
                    const c = dedupedCats[i];
                    if (c.module === 'news') newsItems.push(c);
                    else if (c.module === 'dharma') dharmaItems.push(c);
                    else if (c.module === 'documents') docItems.push(c);
                    else if (c.module === 'transactions') transactionsItems.push(c);
                }
            }

            const categoriesTree = {
                news: buildTree(newsItems),
                dharma: buildTree(dharmaItems),
                documents: buildTree(docItems),
                transactions: buildTree(transactionsItems)
            };
            const pagesTree = buildTree(pagesData || []);

            const keptAboutMap = new Map<string, any>();
            (aboutData || []).forEach(sec => {
                const existing = keptAboutMap.get(sec.key);
                if (!existing || (sec.tenant_id === tenantId && existing.tenant_id !== tenantId)) {
                    keptAboutMap.set(sec.key, sec);
                }
            });

            const flatAbout = Array.from(keptAboutMap.values());
            const aboutMap: Record<string, any> = {};
            const aboutSectionsTree: any[] = [];

            flatAbout.forEach(sec => {
                if (sec.key && sec.key !== 'noi-quy-tu-vien') {
                    aboutMap[sec.key] = {
                        id: sec.id,
                        name_vi: sec.title_vi,
                        name_km: sec.title_km,
                        name_en: sec.title_en,
                        slug: sec.key,
                        children: []
                    };
                }
            });

            flatAbout.forEach(sec => {
                if (!sec.key || sec.key === 'noi-quy-tu-vien') return;
                const node = aboutMap[sec.key];
                if (!node) return;

                const parts = sec.key.split('/');
                if (parts.length > 1) {
                    const parentKey = parts.slice(0, -1).join('/');
                    if (aboutMap[parentKey]) {
                        aboutMap[parentKey].children.push(node);
                    } else {
                        aboutSectionsTree.push(node);
                    }
                } else {
                    aboutSectionsTree.push(node);
                }
            });

            const t = tenantData || {};
            const tColors = (t as any).theme_colors || {};
            
            const themePreset = SYSTEM_THEMES.find(th => th.tenantId === tenantId)?.colors 
                || SYSTEM_THEMES.find(th => th.id === (t as any).layout_style)?.colors;

            const primaryStr = hexToRgbString(tColors.primary || settings['theme_color_primary'] || themePreset?.primary, '245 158 11');
            const secondaryStr = hexToRgbString(tColors.secondary || settings['theme_color_secondary'] || themePreset?.secondary, '92 64 51');
            const textStr = hexToRgbString(tColors.text || settings['theme_color_text'] || themePreset?.text, '44 24 16');
            const accentStr = hexToRgbString(tColors.accent || settings['theme_color_accent'] || themePreset?.accent, '255 140 0');
            const bgStartStr = hexToRgbString(tColors.bgStart || settings['theme_background_start'] || themePreset?.background, '254 249 243');
            const bgEndStr = hexToRgbString(tColors.bgEnd || settings['theme_background_end'] || themePreset?.bgEnd, '253 245 235');
            const primaryDarkStr = tColors.primaryDark ? hexToRgbString(tColors.primaryDark, '218 165 32') : darkenRgbString(primaryStr, 0.85);
            const primaryLightStr = tColors.primaryLight ? hexToRgbString(tColors.primaryLight, '253 183 26') : lightenRgbString(primaryStr, 0.25);
            const heroStr = (tColors.hero || settings['theme_hero'] || themePreset?.hero) 
                ? hexToRgbString(tColors.hero || settings['theme_hero'] || themePreset?.hero!, '26 15 9') 
                : darkenRgbString(textStr, 0.55);
            const surfaceStr = (tColors.surface || settings['theme_surface'] || themePreset?.surface)
                ? hexToRgbString(tColors.surface || settings['theme_surface'] || themePreset?.surface!, '250 250 247') 
                : lightenRgbString(bgStartStr, 0.4);

            const themeVars = {
                primary: primaryStr,
                secondary: secondaryStr,
                text: textStr,
                accent: accentStr,
                bgStart: bgStartStr,
                bgEnd: bgEndStr,
                primaryDark: primaryDarkStr,
                primaryLight: primaryLightStr,
                hero: heroStr,
                surface: surfaceStr,
                patternOpacity: tColors.opacity || settings['theme_pattern_opacity'] || '0.05',
                headerBg: tColors.headerBg || settings['theme_header_bg'] || '',
                footerBg: tColors.footerBg || settings['theme_footer_bg'] || '',
            };

            return {
                settings,
                categoriesTree,
                pagesTree,
                aboutSectionsTree,
                themeVars,
                tenant: t as any,
                hasProjects: projectsCount > 0
            };
        },
        ['unified-layout-v16-final-visibility-fix', domain, tenantId],
        { revalidate: false, tags: [CACHE_TAGS.SITE_SETTINGS, CACHE_TAGS.CATEGORIES, CACHE_TAGS.pages.list(tenantId), CACHE_TAGS.pages.aboutSections(tenantId), CACHE_TAGS.system.tenantConfig(tenantId || domain), `tenant-config-${domain}`] }
    )();
};
