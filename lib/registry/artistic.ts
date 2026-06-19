import dynamic from 'next/dynamic';
import React from 'react';

// HELPER: Dynamic Loader
const d = (loader: () => Promise<any>, name?: string) => {
    return dynamic(async () => {
        const mod = await loader();
        return name ? mod[name] : (mod.default || mod);
    }, { ssr: true });
};

export const ARTISTIC_REGISTRY: Record<string, any> = {
    // STITCH — Enterprise Corporate Blocks
    'stitch-hero': { name: 'Hero Kỹ Thuật Số', description: 'Màn hình chào doanh nghiệp phong cách Digital — nền tối, hiệu ứng ánh sáng neon', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/stitch/StitchHero'), 'StitchHero'), requiredData: ['settings'] },
    'stitch-nodes': { name: 'Mạng Lưới Nội Dung', description: 'Display E-Learning / Đào tạo dạng node connect kỹ thuật số', category: 'dharma', group: 'DHARMA', icon: '🔗', component: d(() => import('@/components/sections/stitch/StitchNodes'), 'StitchNodes'), requiredData: ['dharmaTalks'] },
    'stitch-stats': { name: 'Thống Kê Hệ Thống', description: 'Dashboard chỉ số hoạt động — nhân sự, document, băng thông, tuân thủ', category: 'about', group: 'INTRO', icon: '📊', component: d(() => import('@/components/sections/stitch/StitchStats'), 'StitchStats') },
    'stitch-network': { name: 'Mạng Lưới Liên Kết', description: 'Trực quan hóa luồng sync dữ liệu time thực giữa Tập đoàn và các Branch', category: 'about', group: 'INTRO', icon: '🕸️', component: d(() => import('../../components/sections/stitch/StitchNetwork')) },
    'stitch-news': { name: 'Tin Tức Doanh Nghiệp Cyber', description: 'Dòng news hoạt động organization phong cách Neon Violet tối tân', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('../../components/sections/stitch/StitchNews'), 'StitchNews'), requiredData: ['news'] },
    'stitch-events': { name: 'Lịch Sự Kiện Nội Bộ', description: 'Event và lịch last namep theo phong cách lưới kỹ thuật số compact', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/stitch/StitchEvents'), 'StitchEvents'), requiredData: ['upcomingEvents'] },
    'stitch-intro': { name: 'Giới Thiệu Doanh Nghiệp', description: 'Block about organization phong cách Digital Legacy — nền tối hiện đại', category: 'about', group: 'INTRO', icon: '🏢', component: d(() => import('@/components/sections/stitch/StitchIntro'), 'StitchIntro'), requiredData: ['introSection'] },
    'stitch-footer-strip': { name: 'Thông Tin Liên Hệ (Footer)', description: 'Dải thông tin liên lạc 3 cột phong cách Terminal — address, giờ làm việc, CTA', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/stitch/StitchFooterStrip'), 'StitchFooterStrip'), requiredData: ['settings'] },
};

