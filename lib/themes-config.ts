import { BRAND_NAME_VI } from './constants';

export interface ColorTheme {
    id: string;
    name: string;
    description: string;
    tenantId?: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string; // Map to bgStart
        bgEnd?: string;
        text?: string;
        hero?: string;
        surface?: string;
        opacity?: string;
    };
}

export const SYSTEM_THEMES: ColorTheme[] = [
    // ── 1. PRESET THEO PHONG CÁCH THIẾT KẾ ─────────────────────────────────────
    {
        id: 'modern-moon',
        name: 'Corporate Dark — Xanh Navy & Vàng',
        description: 'Chuyên nghiệp, hiện đại — phù hợp doanh nghiệp công nghệ.',
        colors: {
            primary: '#C8B560', secondary: '#6FB3D3', accent: '#A89040',
            background: '#0D1B2A', bgEnd: '#162032', text: '#E8E4D9',
            hero: '#060E18', surface: '#111D2B'
        }
    },
    {
        id: 'minimal-vedana',
        name: 'Minimal Trắng Tinh — Vàng Trầm',
        description: 'Tối giản tuyệt đối, centralized vào content.',
        colors: {
            primary: '#B8860B', secondary: '#8A7A6A', accent: '#9A7209',
            background: '#FAFAF8', bgEnd: '#F3F0EA', text: '#1C1C1A',
            hero: '#0E0E0D', surface: '#FFFFFF'
        }
    },
    {
        id: 'lotus-champa',
        name: 'Cam Đất — Ấm Áp & Năng Động',
        description: 'Năng động, sáng tạo — phù hợp thương hiệu trẻ.',
        colors: {
            primary: '#C73B2A', secondary: '#F4A028', accent: '#E8896A',
            background: '#FDF6EE', bgEnd: '#FAF0E2', text: '#2D1A0E',
            hero: '#1A0A05', surface: '#FEF9F2'
        }
    },
    {
        id: 'angkor-prasat',
        name: 'Editorial Tối — Vàng & Nâu Gỗ',
        description: 'Phong cách tạp chí cao cấp, nền tối sang trọng.',
        colors: {
            primary: '#D4A843', secondary: '#7A5C3A', accent: '#4A8C6F',
            background: '#2C1A0A', bgEnd: '#1E1106', text: '#F0E8D0',
            hero: '#120800', surface: '#3A2518'
        }
    },
    {
        id: 'zen-anapanasati',
        name: 'Xanh Thiên Nhiên — Bình Tĩnh & Tin Cậy',
        description: 'Xanh tự nhiên — phù hợp thương hiệu bền vững.',
        colors: {
            primary: '#2D6A4F', secondary: '#74C69D', accent: '#D4A843',
            background: '#F2F7F0', bgEnd: '#E8F2E5', text: '#1B4332',
            hero: '#0D2418', surface: '#FFFFFF'
        }
    },
    {
        id: 'sunrise-mekong',
        name: 'Cam Bình Minh — Năng Lượng Tích Cực',
        description: 'Ấm áp, năng động — phù hợp startup và thương mại.',
        colors: {
            primary: '#E05C1A', secondary: '#F4A028', accent: '#BD4291',
            background: '#FFF8F0', bgEnd: '#FFF0E0', text: '#2A1506',
            hero: '#160A03', surface: '#FFFBF5'
        }
    },
    {
        id: 'festival-bon',
        name: 'Tím Đêm — Phong Cách Tech & Startup',
        description: 'Nền tím tối với điểm nhấn vàng neon — digital first.',
        colors: {
            primary: '#FFD700', secondary: '#FF4D6D', accent: '#39D5A0',
            background: '#12023A', bgEnd: '#1A0550', text: '#FFF8E7',
            hero: '#060118', surface: '#1C0A44'
        }
    },

    // ── 3. PREMIUM ENTERPRISE THEMES ───────────────────────────────────────────
    {
        id: 'neo-glassmorphic',
        name: `Premium: Navy & Gold — ${BRAND_NAME_VI}`,
        description: 'Navy Blue & Gold với hiệu ứng kính mờ — standard Enterprise.',
        colors: {
            primary: '#002B5B', secondary: '#FFD700', accent: '#00D2FF',
            background: '#FFFFFF', bgEnd: '#F8F9FA', text: '#1A202C',
            hero: '#0B1120', surface: 'rgba(255, 255, 255, 0.4)'
        }
    },
    {
        id: 'zen-minimalism',
        name: 'Premium: Xám Chì & Xanh Mint — Chuyên Nghiệp',
        description: 'Trung tính, sang trọng — phù hợp finance & tư vấn.',
        colors: {
            primary: '#2C3E50', secondary: '#8E8E93', accent: '#A8C69F',
            background: '#F9F9F9', bgEnd: '#F0F0F0', text: '#1A1A1A',
            hero: '#121212', surface: '#FFFFFF'
        }
    },
    {
        id: 'royal-saffron',
        name: 'Premium: Cam Đậm & Vàng — Nhiệt Huyết',
        description: 'Nồng ấm, mạnh mẽ — phù hợp thương hiệu truyền thống.',
        colors: {
            primary: '#D35400', secondary: '#F39C12', accent: '#4A2311',
            background: '#FFF9E6', bgEnd: '#FFE4B5', text: '#3E1E02',
            hero: '#1F0F01', surface: '#FFF8F0'
        }
    },
    {
        id: 'himalayan-maroon',
        name: 'Premium: Đỏ Đô & Vàng — Uy Quyền',
        description: 'Mạnh mẽ, uy nghiêm — phù hợp tập đoàn & chính phủ.',
        colors: {
            primary: '#800000', secondary: '#FFD700', accent: '#1ABC9C',
            background: '#FDFEFE', bgEnd: '#FCE4EC', text: '#4A0000',
            hero: '#2A0000', surface: '#FFFAFA'
        }
    },
    {
        id: 'lotus-purity',
        name: 'Premium: Hồng Nhạt — Sáng Tạo & Tinh Tế',
        description: 'Thanh lịch, nữ tính — phù hợp thương hiệu lifestyle.',
        colors: {
            primary: '#E91E63', secondary: '#F8BBD0', accent: '#CFD8DC',
            background: '#FFFFFF', bgEnd: '#FFF0F5', text: '#440118',
            hero: '#22000C', surface: '#FFFAFC'
        }
    },
    {
        id: 'vietnamese-earth',
        name: 'Premium: Nâu Đất — Mộc Mạc & Tin Cậy',
        description: 'Giản dị, gần gũi — phù hợp thương hiệu địa phương.',
        colors: {
            primary: '#4D2C19', secondary: '#A67C52', accent: '#E67E22',
            background: '#F4ECE1', bgEnd: '#E6D9C8', text: '#26160C',
            hero: '#130B06', surface: '#F9F5F0'
        }
    },
    {
        id: 'celestial-blue',
        name: 'Premium: Xanh Dương & Vàng — Tin Cậy & Chuyên Môn',
        description: 'Xanh biển sâu — phù hợp y tế, giáo dục, CNTT.',
        colors: {
            primary: '#1A5276', secondary: '#5DADE2', accent: '#D4AC0D',
            background: '#EBF5FB', bgEnd: '#D6EAF8', text: '#0A2535',
            hero: '#05121A', surface: '#F4FAFE'
        }
    },
    {
        id: 'imperial-pagoda',
        name: 'Premium: Đỏ & Vàng — Cung Đình Page Nghiêm',
        description: 'Cổ điển, sang trọng — phù hợp thương hiệu heritage.',
        colors: {
            primary: '#C0392B', secondary: '#D4AF37', accent: '#1B4F72',
            background: '#FEF9E7', bgEnd: '#FCF3CF', text: '#350905',
            hero: '#1B0402', surface: '#FFFBF0'
        }
    },
    {
        id: 'inner-peace-mint',
        name: 'Premium: Xanh Lá Mint & Tím — Hiện Đại & Tươi Mới',
        description: 'Thư giãn, trẻ trung — phù hợp wellbeing & edutech.',
        colors: {
            primary: '#16A085', secondary: '#A2D9CE', accent: '#6C3483',
            background: '#F4F9F4', bgEnd: '#E8F3E8', text: '#0E2923',
            hero: '#071411', surface: '#FBFFFB'
        }
    },
    {
        id: 'ancient-forest',
        name: 'Premium: Xanh Rừng & Nâu Đất — Bền Vững',
        description: 'Trầm mặc, bền vững — phù hợp thương hiệu xanh.',
        colors: {
            primary: '#1B5E20', secondary: '#795548', accent: '#F1C40F',
            background: '#E8F5E9', bgEnd: '#C8E6C9', text: '#0D2E10',
            hero: '#061708', surface: '#F1F8F1'
        }
    },
    {
        id: 'dharma-wheel',
        name: 'Premium: Cam & Xanh & Đỏ — Đa Sắc Quốc Tế',
        description: 'Sống động, hòa hợp — phù hợp organization quốc tế.',
        colors: {
            primary: '#FF9800', secondary: '#2196F3', accent: '#F44336',
            background: '#FAFAFA', bgEnd: '#F5F5F5', text: '#1C1C1C',
            hero: '#111111', surface: '#FFFFFF'
        }
    },
    {
        id: 'forest-gold-premium',
        name: 'Premium: Xanh & Vàng Hoàng Kim — Đẳng Cấp',
        description: 'Kết hợp xanh rừng già và vàng hoàng gia — bình an và trù phú.',
        colors: {
            primary: '#1B5E20', secondary: '#D4AF37', accent: '#FFD700',
            background: '#FFFFFF', bgEnd: '#F1F8E9', text: '#1A2421',
            hero: '#0A1B0E', surface: '#F8FAF8', opacity: '0.05'
        }
    },
    {
        id: 'modern_tech',
        name: 'SaaS: Neon Cyberpunk Tech — Phá Cách',
        description: 'Tông màu Neon Cyan & Dark Space — khẳng định đẳng cấp SaaS công nghệ.',
        colors: {
            primary: '#00F0FF', secondary: '#8A2BE2', accent: '#FF007F',
            background: '#060B13', bgEnd: '#0D1527', text: '#E2F1FF',
            hero: '#03060B', surface: '#0E1726'
        }
    },
    {
        id: 'saas_violet',
        name: 'SaaS: Violet Premium — Đột Phá',
        description: 'Tông màu Tím Violet Neon & Dark Space — tối ưu cho sản phẩm công nghệ cao.',
        colors: {
            primary: '#8B5CF6', secondary: '#4C1D95', accent: '#EC4899',
            background: '#0B071E', bgEnd: '#120A2A', text: '#EDE9FE',
            hero: '#06030F', surface: '#170F34'
        }
    },
    {
        id: 'corp_navy',
        name: 'SaaS: Corporate Navy — Uy Tín',
        description: 'Tông màu Xanh Navy truyền thống & Slate tối — khẳng định sự tin cậy cao.',
        colors: {
            primary: '#1E40AF', secondary: '#1E3A8A', accent: '#D97706',
            background: '#0F172A', bgEnd: '#1E293B', text: '#F1F5F9',
            hero: '#090D16', surface: '#1E293B'
        }
    },
    {
        id: 'charity_green',
        name: 'SaaS: Social Green — Thân Thiện',
        description: 'Tông màu Xanh Emerald & Nền sáng nhẹ nhàng — tối ưu cho các organization cộng đồng.',
        colors: {
            primary: '#10B981', secondary: '#064E3B', accent: '#F59E0B',
            background: '#F0FDF4', bgEnd: '#DCFCE7', text: '#064E3B',
            hero: '#022C22', surface: '#FFFFFF'
        }
    },
    {
        id: 'creative_amber',
        name: 'SaaS: Creative Amber — Sáng Tạo',
        description: 'Tông màu Cam Đất ấm áp & Nền sáng nhẹ nhàng — phù hợp doanh nghiệp dịch vụ.',
        colors: {
            primary: '#D97706', secondary: '#78350F', accent: '#3B82F6',
            background: '#FFFBEB', bgEnd: '#FEF3C7', text: '#78350F',
            hero: '#451A03', surface: '#FFFFFF'
        }
    },
    {
        id: 'minimal_white',
        name: 'SaaS: Clean Minimalist — Tối Giản',
        description: 'Trắng/Đen tối giản maximum — centralized vào sự tinh tế và performance.',
        colors: {
            primary: '#1E293B', secondary: '#475569', accent: '#0F172A',
            background: '#FFFFFF', bgEnd: '#F8FAFC', text: '#0F172A',
            hero: '#090D16', surface: '#FFFFFF'
        }
    }
];

/** @deprecated Use SYSTEM_THEMES directly */
export const BUDDHIST_THEMES = SYSTEM_THEMES;

