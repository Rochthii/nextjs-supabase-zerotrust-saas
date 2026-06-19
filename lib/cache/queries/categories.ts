import { unstable_cache } from 'next/cache';
import { getPublicClient, getBaseSlug, TTL, BUDDHIST_KEYWORDS } from './shared';

export interface CategoryNode {
    id: string;
    tenant_id: string | null;
    name_vi: string;
    name_km: string | null;
    name_en: string | null;
    slug: string;
    module: string | null;
    parent_id: string | null;
    image_url: string | null;
    description_vi: string | null;
    description_km: string | null;
    description_en: string | null;
    is_visible: boolean;
    children: CategoryNode[];
}

// ─── Categories Mega Tree ────────────────────────────────────────────────────
export const getCachedCategoriesTree = async (
    tenantId?: string,
    tenantType: string = 'tenant'
): Promise<{ 
    news: CategoryNode[], 
    dharma: CategoryNode[], 
    documents: CategoryNode[], 
    media: CategoryNode[], 
    events: CategoryNode[], 
    transactions: CategoryNode[] 
}> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            let query = supabase
                .from('categories')
                .select('*')
                .in('module', ['news', 'dharma', 'documents', 'media', 'transactions', 'events'])
                .eq('is_visible', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            } else {
                if (tenantType === 'company') {
                    query = query.eq('tenant_id', '55555555-5555-5555-5555-555555555555');
                }
            }

            const { data, error } = await query.order('order_position', { ascending: true }).order('created_at', { ascending: true });

            if (error) {
                console.error('[Cache] categories_tree error:', error.message);
                return { news: [], dharma: [], documents: [], media: [], transactions: [], events: [] };
            }

            const rawItems = data || [];
            
            const keptItemsMap = new Map<string, any>();
            const idMapping = new Map<string, string>();
            
            const filteredCategoriesData = rawItems.filter(item => {
                if (tenantType === 'company') {
                    const name = (item.name_vi || '').toLowerCase();
                    return !BUDDHIST_KEYWORDS.some((kw: string) => name.includes(kw));
                }
                return true;
            });

            filteredCategoriesData.forEach(item => {
                const baseSlug = getBaseSlug(item.slug);
                const existing = keptItemsMap.get(baseSlug);
                
                if (!existing) {
                    keptItemsMap.set(baseSlug, item);
                    idMapping.set(item.id, item.id);
                } else {
                    const isNewItemTenant = tenantId && item.tenant_id === tenantId;
                    const isExistingTenant = tenantId && existing.tenant_id === tenantId;
                    
                    if (isNewItemTenant && !isExistingTenant) {
                        keptItemsMap.set(baseSlug, item);
                        idMapping.set(existing.id, item.id);
                        idMapping.set(item.id, item.id);
                    } else {
                        idMapping.set(item.id, existing.id);
                    }
                }
            });

            const items = Array.from(keptItemsMap.values()).map(item => ({
                ...item,
                parent_id: item.parent_id ? (idMapping.get(item.parent_id) || item.parent_id) : null,
                is_visible: (item as any).is_visible !== false,
                children: [] 
            })) as CategoryNode[];

            const treeMap: Record<string, CategoryNode> = {};

            items.forEach(item => {
                treeMap[item.id] = item;
            });

            const newsTree: CategoryNode[] = [];
            const dharmaTree: CategoryNode[] = [];
            const documentsTree: CategoryNode[] = [];
            const mediaTree: CategoryNode[] = [];
            const eventsTree: CategoryNode[] = [];
            const transactionsTree: CategoryNode[] = [];

            items.forEach(item => {
                if (item.parent_id && treeMap[item.parent_id]) {
                    treeMap[item.parent_id].children.push(treeMap[item.id]);
                } else {
                    if (item.module === 'news') newsTree.push(treeMap[item.id]);
                    else if (item.module === 'dharma') dharmaTree.push(treeMap[item.id]);
                    else if (item.module === 'documents') documentsTree.push(treeMap[item.id]);
                    else if (item.module === 'media') mediaTree.push(treeMap[item.id]);
                    else if (item.module === 'events') eventsTree.push(treeMap[item.id]);
                    else if (item.module === 'transactions') transactionsTree.push(treeMap[item.id]);
                }
            });

            return { news: newsTree, dharma: dharmaTree, documents: documentsTree, media: mediaTree, transactions: transactionsTree, events: eventsTree };
        },
        ['categories-mega-tree-final-v7', tenantId || 'all', tenantType],
        { revalidate: TTL.CATEGORIES, tags: ['categories', tenantId ? `categories-${tenantId}` : 'categories-all'] }
    )();
};
