import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// Types cho Visual Page Builder
export type BlockType = keyof typeof SECTION_REGISTRY;

export interface BlockConfig {
    id: string; // Unique ID (UUID) sinh ngẫu nhiên cho mỗi block khi được kéo vào Layout
    type: BlockType; // Type component, map với SECTION_REGISTRY
    visible: boolean;
    settings?: Record<string, any>; // Các settings riêng của block (display title, số lượng item, colors phụ...)
    order?: number;
}

export const DEFAULT_LAYOUT_BLOCKS: BlockConfig[] = [
    { id: 'default-hero', type: 'traditional_hero', visible: true },
    { id: 'default-intro', type: 'traditional_intro', visible: true },
    { id: 'default-news', type: 'traditional_news', visible: true },
    { id: 'default-events', type: 'traditional_events', visible: true },
];

export const DEFAULT_COMPANY_BLOCKS: BlockConfig[] = [
    { id: 'ent-hero', type: 'enterprise_hero', visible: true },
    { id: 'ent-stats', type: 'enterprise_stats', visible: true },
    { id: 'ent-features', type: 'enterprise_features', visible: true },
    { id: 'ent-news', type: 'enterprise_news', visible: true },
    { id: 'ent-cta', type: 'enterprise_cta', visible: true },
];

export const DEFAULT_TECH_BLOCKS: BlockConfig[] = [
    { id: 'tech-hero', type: 'enterprise_hero', visible: true },
    { id: 'tech-stats', type: 'enterprise_stats', visible: true },
    { id: 'tech-features', type: 'enterprise_features', visible: true },
    { id: 'tech-news', type: 'enterprise_news', visible: true },
    { id: 'tech-ticker', type: 'modern_ticker', visible: true },
    { id: 'tech-cta', type: 'enterprise_cta', visible: true },
];

