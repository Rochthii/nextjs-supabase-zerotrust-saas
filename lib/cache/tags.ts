/**
 * 10/10 Gold Standard Cache Tag Naming Strategy
 * Centralizing all cache tags to ensure consistency between fetching and invalidation.
 */

export const CACHE_TAGS = {
    // Global tags
    SITE_SETTINGS: 'site_settings',
    CATEGORIES: 'categories',
    DONATION_CAMPAIGNS: 'transaction-projects-all',
    CONFIRMED_DONATIONS: 'confirmed-transactions-all',
    RECENT_DONATIONS: 'recent-transactions-all',
    
    // Categories
    categories: {
        all: 'categories-all',
        tenant: (tenantId: string) => `categories-${tenantId}`,
    },
    
    // News
    news: {
        all: 'news-all',
        list: (tenantId: string) => `news-list-${tenantId}`,
        item: (idOrSlug: string) => `news-${idOrSlug}`,
        tenant: (tenantId: string) => `news-${tenantId}`,
    },
    
    // Events
    events: {
        all: 'events-all',
        list: (tenantId: string) => `events-list-${tenantId}`,
        item: (idOrSlug: string) => `event-${idOrSlug}`,
        tenant: (tenantId: string) => `events-${tenantId}`,
    },
    
    // Learning Resources
    learningResources: {
        all: 'learning-resources-all',
        list: (tenantId: string) => `learning-resources-${tenantId}`,
        item: (idOrSlug: string) => `learning-resource-${idOrSlug}`,
        tenant: (tenantId: string) => `learning-resources-${tenantId}`,
    },

    // Hero Slides
    heroSlides: {
        all: 'hero-slides-all',
        tenant: (tenantId: string) => `hero-slides-${tenantId}`,
    },

    // Transactions
    transactions: {
        projects: {
            all: 'transaction-projects-all',
            tenant: (tenantId: string) => `transaction-projects-${tenantId}`,
        },
        confirmed: {
            all: 'confirmed-transactions-all',
            tenant: (tenantId: string) => `confirmed-transactions-${tenantId}`,
        },
        recent: {
            all: 'recent-transactions-all',
            tenant: (tenantId: string) => `recent-transactions-${tenantId}`,
        }
    },
    
    // About / Pages
    pages: {
        list: (tenantId: string) => `pages-${tenantId}`,
        about: (tenantId: string) => `about-${tenantId}`,
        aboutGlobal: 'about',
        aboutSections: (tenantId: string) => `about-sections-${tenantId}`,
        aboutSectionsV2: 'about-sections-v2',
    },
    
    // System / Dashboard
    system: {
        dashboardStats: (tenantId: string) => `dashboard-stats-${tenantId}`,
        dashboardStatsGlobal: 'dashboard-stats',
        tenantConfig: (tenantId: string) => `tenant-config-${tenantId}`,
        tenantConfigGlobal: 'tenant-config',
    }
} as const;

export type CacheTag = string;
