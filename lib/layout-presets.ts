import { BlockConfig, DEFAULT_LAYOUT_BLOCKS, DEFAULT_COMPANY_BLOCKS, DEFAULT_TECH_BLOCKS } from '@/lib/types/layout-blocks';
import { BRAND_NAME_VI } from '@/lib/constants';

/**
 * Layout Presets — Bộ block default cho từng phong cách homepage doanh nghiệp
 * Admin select preset → tự động instead toàn bộ blocks state current
 */

export interface LayoutPreset {
    id: string;
    name: string;
    nameVi: string;
    emoji: string;
    description: string;
    blocks: BlockConfig[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
    // ─── SECURE MULTI-TENANT SAAS (SYSTEM PRESET) ──────────────────────────────────────────
    {
        id: 'mcaaron',
        name: BRAND_NAME_VI,
        nameVi: 'Social Green',
        emoji: '🌿',
        description: 'Interface chuyên biệt cho doanh nghiệp tác động xã hội, minh bạch và đội ngũ chuyên nghiệp',
        blocks: [
            { id: 'mc-hero', type: 'mcaaron_hero', visible: true },
            { id: 'mc-impact', type: 'impact_dashboard', visible: true },
            { id: 'mc-timeline', type: 'transparency_timeline', visible: true },
            { id: 'mc-founders', type: 'founder_section', visible: true },
            { id: 'mc-network', type: 'network_section', visible: true },
            { id: 'mc-news', type: 'modern_news', visible: true },
            { id: 'mc-cta', type: 'traditional_cta', visible: true },
        ],
    },
    // ─── CORPORATE / ENTERPRISE B2B SAAS PRESET ──────────────────────────────────────────
    {
        id: 'corporate',
        name: 'Corporate (Enterprise B2B)',
        nameVi: 'Corporate Navy',
        emoji: '🛡️',
        description: 'Interface B2B SaaS standard Enterprise — dark navy, hero chuyển đổi số, tính năng dịch vụ, chỉ số năng lực, news organization',
        blocks: [
            { id: 'corp-hero',     type: 'enterprise_hero',     visible: true },
            { id: 'corp-features', type: 'enterprise_features',  visible: true },
            { id: 'corp-stats',    type: 'enterprise_stats',     visible: true },
            { id: 'corp-news',     type: 'enterprise_news',      visible: true },
            { id: 'corp-cta',      type: 'enterprise_cta',       visible: true },
        ],
    },
    // ─── MODERN ─────────────────────────────────────────────────────────────────
    {
        id: 'modern',
        name: 'Modern SaaS',
        nameVi: 'Cyberpunk Neon Tech',
        emoji: '⚡',
        description: 'Glassmorphism cao cấp, chế độ tối màu công nghệ, dải thông tin truyền thông liên tục',
        blocks: [
            { id: 'mo-hero', type: 'modern_hero', visible: true },
            { id: 'mo-ticker', type: 'modern_ticker', visible: true },
            { id: 'mo-news', type: 'modern_news', visible: true },
            { id: 'mo-dharma', type: 'modern_dharma', visible: true }, // Document & SOP Modern
            { id: 'mo-cta', type: 'modern_cta', visible: true },
        ],
    },

    // ─── MINIMAL ────────────────────────────────────────────────────────────────
    {
        id: 'minimal',
        name: 'Minimal Clean',
        nameVi: 'Clean Minimalist',
        emoji: '📄',
        description: 'Bố cục Swiss editorial cao cấp, chú trọng Typography, thoáng đãng và tinh tế',
        blocks: [
            { id: 'mi-hero', type: 'minimal_hero', visible: true },
            { id: 'mi-news', type: 'minimal_news', visible: true },
            { id: 'mi-dharma', type: 'minimal_dharma', visible: true }, // Document & SOP Minimal
            { id: 'mi-events', type: 'minimal_events', visible: true },
            { id: 'mi-cta', type: 'minimal_cta', visible: true },
        ],
    },

    // ─── STITCH — Digital Zenith ──────────────────────────────────────────────
    {
        id: 'stitch',
        name: 'Stitch (Digital Zenith)',
        nameVi: 'Violet Premium',
        emoji: '🔮',
        description: 'Phong cách Fintech & Công nghệ, trực quan hóa mạng lưới liên kết kỹ thuật số',
        blocks: [
            { id: 'st-hero', type: 'stitch-hero', visible: true },
            { id: 'st-stats', type: 'stitch-stats', visible: true },
            { id: 'st-intro', type: 'stitch-intro', visible: true },
            { id: 'st-network', type: 'stitch-network', visible: true },
            { id: 'st-nodes', type: 'stitch-nodes', visible: true },
            { id: 'st-news', type: 'stitch-news', visible: true },
            { id: 'st-events', type: 'stitch-events', visible: true },
            { id: 'st-footer-strip', type: 'stitch-footer-strip', visible: true },
        ],
    },

    // ─── INK — Editorial Magazine Á Đông ────────────────────────────────────────
    {
        id: 'ink',
        name: 'Ink Editorial',
        nameVi: 'Creative Amber',
        emoji: '🖋️',
        description: 'Trắng tinh + đen ink tối giản nghệ thuật, structure tạp chí tri thức & triết lý doanh nghiệp',
        blocks: [
            { id: 'ink-hero', type: 'ink_hero', visible: true },
            { id: 'ink-news', type: 'ink_feature_story', visible: true },
            { id: 'ink-dharma', type: 'ink_dharma_band', visible: true }, // Dải last namec liệu & SOP
            { id: 'ink-quote', type: 'ink_quote_banner', visible: true },
            { id: 'ink-events', type: 'ink_event_grid', visible: true },
            { id: 'ink-contact', type: 'ink_contact_strip', visible: true },
        ],
    },
];

/**
 * Return danh sách blocks default tương ứng với từng Phong cách Interface và mô hình doanh nghiệp/branch
 */
export function getDefaultBlocksForStyle(layoutStyle: string, tenantType: string): BlockConfig[] {
    const isCompany = tenantType !== 'tenant';
    
    // Ánh xạ Phong cách Global sang Bố cục Builder
    const styleToPresetId: Record<string, string> = {
        'saas_violet': 'stitch',
        'corp_navy': 'corporate',
        'modern_tech': 'modern',
        'charity_green': 'mcaaron',
        'creative_amber': 'ink',
        'minimal_white': 'minimal',
    };
    
    const presetId = styleToPresetId[layoutStyle];
    if (presetId) {
        const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
        if (preset) {
            return preset.blocks.map(b => ({ ...b }));
        }
    }
    
    // Các trường hợp đặc thù / fallback cũ
    if (layoutStyle === 'modern_tech') return DEFAULT_TECH_BLOCKS.map(b => ({ ...b }));
    return isCompany 
        ? DEFAULT_COMPANY_BLOCKS.map(b => ({ ...b })) 
        : DEFAULT_LAYOUT_BLOCKS.map(b => ({ ...b }));
}
