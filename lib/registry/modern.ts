import { ModernMoonCTA } from '@/components/sections/modern/ModernMoonCTA';
import { BRAND_NAME_VI } from '../constants';
import { DharmaTickerSection } from '@/components/sections/modern/DharmaTickerSection';
import { ModernDharmaPlayer } from '@/components/sections/modern/ModernDharmaPlayer';
import { ModernLatestNewsSection } from '@/components/sections/modern/ModernLatestNewsSection';

import { MinimalHeroText } from '@/components/sections/minimal/MinimalHeroText';
import { MinimalNewsList } from '@/components/sections/minimal/MinimalNewsList';
import { MinimalDharmaList } from '@/components/sections/minimal/MinimalDharmaList';
import { MinimalEventCalendar } from '@/components/sections/minimal/MinimalEventCalendar';
import { MinimalCTA } from '@/components/sections/minimal/MinimalCTA';

import { FounderSection } from '@/components/sections/mcaaron/FounderSection';
import { ImpactDashboard } from '@/components/sections/mcaaron/ImpactDashboard';
import { McAaronHero } from '@/components/sections/mcaaron/McAaronHero';
import { NetworkSection } from '@/components/sections/mcaaron/NetworkSection';
import { TransparencyTimeline } from '@/components/sections/mcaaron/TransparencyTimeline';
import { SolutionsGridSection } from '@/components/sections/mcaaron/SolutionsGridSection';

import { EnterpriseHero } from '@/components/sections/enterprise/EnterpriseHero';
import { EnterpriseFeatures } from '@/components/sections/enterprise/EnterpriseFeatures';
import { EnterpriseStats } from '@/components/sections/enterprise/EnterpriseStats';
import { EnterpriseNews } from '@/components/sections/enterprise/EnterpriseNews';
import { EnterpriseCTA } from '@/components/sections/enterprise/EnterpriseCTA';

export const MODERN_REGISTRY: Record<string, any> = {
    // MODERN
    'modern_hero': { name: 'Hero Glassmorphism Tối', description: 'Hero carousel nền tối với hiệu ứng kính mờ cao cấp', category: 'hero', group: 'HERO', icon: '🎬', component: HeroCarouselWrapper, requiredData: ['heroSlides'] },
    'modern_news': { name: 'Bảng Tin Nội Bộ', description: 'News và notification dạng block tối màu hiện đại', category: 'news', group: 'NEWS', icon: '📰', component: ModernLatestNewsSection, requiredData: ['locale', 'news', 'upcomingEvents'] },
    'modern_dharma': { name: 'Thư Viện E-Learning Tối', description: 'Video Player tối màu featured cho đào tạo internally', category: 'dharma', group: 'DHARMA', icon: '🎓', component: ModernDharmaPlayer, requiredData: ['dharmaTalks'] },
    'modern_ticker': { name: 'Ticker Thông Báo Hệ Thống', description: 'Chữ chạy ngang — warning security, notification internally', category: 'spiritual', group: 'TRIPLE_GEM', icon: '📡', component: DharmaTickerSection },
    'modern_cta': { name: 'CTA Hành Động Chính', description: 'Banner kêu gọi hành động featured với hiệu ứng ánh sáng', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: ModernMoonCTA },

    // MINIMAL
    'minimal_hero': { name: 'Hero Tối Giản Chuyên Nghiệp', description: 'Typography lớn, không cản trở — phù hợp thương hiệu cao cấp', category: 'hero', group: 'HERO', icon: '🎬', component: MinimalHeroText, requiredData: ['settings'] },
    'minimal_news': { name: 'Danh Sách Tin Tối Giản', description: 'Văn bản chiếm ưu thế, viền mỏng — standard editorial', category: 'news', group: 'NEWS', icon: '📰', component: MinimalNewsList, requiredData: ['locale', 'news'] },
    'minimal_dharma': { name: 'Danh Sách Đào Tạo Tối Giản', description: 'Danh sách khóa last namec dạng text sạch sẽ', category: 'dharma', group: 'DHARMA', icon: '🎓', component: MinimalDharmaList, requiredData: ['dharmaTalks'] },
    'minimal_events': { name: 'Lịch Sự Kiện Tối Giản', description: 'List dọc thanh lịch chỉ với đường line mảnh', category: 'events', group: 'EVENTS', icon: '📅', component: MinimalEventCalendar, requiredData: ['locale', 'upcomingEvents'] },
    'minimal_cta': { name: 'CTA Tối Giản', description: 'Nút đơn giản, thông điệp rõ ràng', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: MinimalCTA },

    // ENTERPRISE B2B SAAS
    'enterprise_hero': { name: 'Hero Doanh Nghiệp SaaS', description: 'Hero section centralized giá trị chuyển đổi số', category: 'hero', group: 'HERO', icon: '🎬', component: EnterpriseHero },
    'enterprise_features': { name: 'Giải Pháp & Tính Năng', description: 'Bento Grid about tính năng B2B', category: 'about', group: 'INTRO', icon: '💡', component: EnterpriseFeatures },
    'enterprise_stats': { name: 'Chỉ Số Năng Lực', description: 'Statistics minh bạch, ISO 27001, Uptime', category: 'transparency', group: 'INTRO', icon: '📊', component: EnterpriseStats },
    'enterprise_news': { name: 'Bảng Tin Tổ Chức', description: 'News, update sản phẩm doanh nghiệp', category: 'news', group: 'NEWS', icon: '📰', component: EnterpriseNews },
    'enterprise_cta': { name: 'Call To Action B2B', description: 'Banner chốt sale và contact tư vấn', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: EnterpriseCTA },

    // MCAARON — Enterprise Corporate
    'mcaaron_hero': { name: 'Hero Doanh Nghiệp Premium', description: 'Hero Neo-Glassmorphic nền tối — ấn tượng đầu tiên của organization', category: 'hero', group: 'HERO', icon: '🎬', component: McAaronHero },
    'mcaaron_founder': { name: 'Ban Lãnh Đạo & Đội Ngũ', description: 'Bento Grid about Ban Giám Đốc và member chủ chốt', category: 'about', group: 'INTRO', icon: '👥', component: FounderSection },
    'mcaaron_statistics': { name: 'Chỉ Số Hoạt Động', description: 'Statistics minh bạch — nhân sự, project, document, tuân thủ security', category: 'transparency', group: 'INTRO', icon: '📊', component: ImpactDashboard },
    'mcaaron_transparency': { name: 'Lộ Trình & Cột Mốc', description: 'Timeline phát triển organization và các project quan trọng', category: 'transparency', group: 'INTRO', icon: '🛣', component: TransparencyTimeline },
    'mcaaron_services': { name: 'Giải Pháp & Dịch Vụ', description: 'Grid 4 dịch vụ/giải pháp cốt lõi với icon và link details', category: 'about', group: 'INTRO', icon: '💡', component: SolutionsGridSection },
    'mcaaron_network': { name: 'Mạng Lưới Chi Nhánh', description: 'Display system branch và đối tác toàn quốc', category: 'about', group: 'INTRO', icon: '🌐', component: NetworkSection },

    // Aliases for compatibility with DEFAULT_COMPANY_BLOCKS
    'mcaaron_intro': { name: 'Ban Lãnh Đạo & Đội Ngũ', description: 'Bento Grid about Ban Giám Đốc và member chủ chốt', category: 'about', group: 'INTRO', icon: '👥', component: FounderSection },
    'impact_dashboard': { name: 'Chỉ Số Hoạt Động', description: 'Statistics minh bạch — nhân sự, project, document, tuân thủ security', category: 'transparency', group: 'INTRO', icon: '📊', component: ImpactDashboard },
    'transparency_timeline': { name: 'Lộ Trình & Cột Mốc', description: 'Timeline phát triển organization và các project quan trọng', category: 'transparency', group: 'INTRO', icon: '🛣', component: TransparencyTimeline },
    'founder_section': { name: 'Ban Lãnh Đạo & Đội Ngũ', description: 'Bento Grid about Ban Giám Đốc và member chủ chốt', category: 'about', group: 'INTRO', icon: '👥', component: FounderSection },
    'network_section': { name: 'Mạng Lưới Chi Nhánh', description: 'Display system branch và đối tác toàn quốc', category: 'about', group: 'INTRO', icon: '🌐', component: NetworkSection },
    'mcaaron_cta': { name: 'CTA Hành Động Chính', description: 'Banner kêu gọi hành động featured', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: ModernMoonCTA },
    'mcaaron_news': { name: 'Bảng Tin Nội Bộ', description: 'News và notification dạng block tối màu hiện đại', category: 'news', group: 'NEWS', icon: '📰', component: ModernLatestNewsSection, requiredData: ['locale', 'news', 'upcomingEvents'] },
};

import { HeroCarouselWrapper } from '@/components/sections/HeroCarouselWrapper';

