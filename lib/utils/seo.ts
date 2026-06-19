/**
 * SEO Utilities for Multi-Tenant Tenant Ecosystem
 * This file contains logic for automatic keyword extraction and metadata optimization.
 * All functions are tenant-aware to support the multi-tenant architecture.
 */

const STOP_WORDS_EN = new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'for', 'on', 'with', 'as', 'at', 'by', 'an', 'be', 'this', 'are', 'from'
]);

const STOP_WORDS_VI = new Set([
    'và', 'của', 'là', 'có', 'trong', 'với', 'cho', 'được', 'một', 'này', 'đó', 'về', 'những', 'các', 'khi', 'như',
    'tại', 'đến', 'ra', 'vào', 'lên', 'xuống', 'qua', 'lại', 'cũng', 'đã', 'đang', 'sẽ', 'cần', 'phải', 'muốn'
]);

/**
 * Default brand keywords for tenant-type tenants.
 * These are generic — for tenant-specific keywords, use getTenantBrandKeywords().
 */
const DEFAULT_COMPANY_KEYWORDS = [
    'Enterprise Administration', 'Enterprise Portal',
    'Digital Transformation', 'SOP Internal Process',
    'Information Transparency', 'Knowledge Management',
];

/**
 * Generates brand keywords dynamically per tenant.
 * Uses tenant name and type to produce contextually correct keywords
 * instead of hardcoding for a single tenant.
 */
export function getTenantBrandKeywords(
    tenantName?: string | null,
    tenantType?: string | null,
    extraKeywords?: string[]
): string[] {
    const result: string[] = [];

    // Add tenant name as the first keyword (most important for brand)
    if (tenantName) {
        result.push(tenantName);
    }

    // Add base keywords
    result.push(...DEFAULT_COMPANY_KEYWORDS);

    // Append any custom keywords (e.g., from site_settings.seo_keywords)
    if (extraKeywords?.length) {
        result.push(...extraKeywords.filter(k => k && !result.includes(k)));
    }

    return result;
}

/**
 * Extracts meaningful keywords from a title and content.
 * Used for dynamic meta keywords and tag generation.
 * 
 * @param title - The page/article title
 * @param content - The page/article content (first 500 chars used)
 * @param limit - Maximum number of keywords to return
 * @param tenantName - Optional tenant name for brand keywords
 * @param tenantType - Optional tenant type ('company' | 'tenant')
 */
export function extractKeywords(
    title: string,
    content: string = '',
    limit: number = 10,
    tenantName?: string | null,
    tenantType?: string | null
): string[] {
    // Combine title and a snippet of content
    const text = `${title} ${content.substring(0, 500)}`
        .toLowerCase()
        .replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const words = text.split(' ');
    const wordFreq: Record<string, number> = {};

    words.forEach(word => {
        if (word.length > 2 && !STOP_WORDS_VI.has(word) && !STOP_WORDS_EN.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    const brandKeywords = getTenantBrandKeywords(tenantName, tenantType);

    // Sort by frequency
    const sortedWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word)
        .filter(word => !brandKeywords.some(k => k.toLowerCase().includes(word)));

    // Combine Brand Keywords + Top extracted words
    const result = [...brandKeywords, ...sortedWords].slice(0, limit);

    return result;
}

/**
 * Generates structured tags for display.
 */
export function generateTags(title: string, categoryName: string = ''): string[] {
    const tags = new Set<string>();

    if (categoryName) tags.add(categoryName);

    // Extract specific corporate concepts (simple heuristic)
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('process') || lowerTitle.includes('guide') || lowerTitle.includes('sop') || lowerTitle.includes('quy trình')) {
        tags.add('Process & SOP');
    }
    if (lowerTitle.includes('report') || lowerTitle.includes('finance') || lowerTitle.includes('metric') || lowerTitle.includes('chỉ số')) {
        tags.add('Report & Metrics');
    }
    if (lowerTitle.includes('hr') || lowerTitle.includes('recruitment') || lowerTitle.includes('training') || lowerTitle.includes('nhân sự')) {
        tags.add('HR & Training');
    }
    if (lowerTitle.includes('project') || lowerTitle.includes('deployment') || lowerTitle.includes('plan') || lowerTitle.includes('kế hoạch')) {
        tags.add('Projects & Initiatives');
    }

    return Array.from(tags);
}

/**
 * Returns the absolute base URL for a given tenant domain.
 * Falls back to NEXT_PUBLIC_SITE_URL if domain is missing.
 */
export function getTenantBaseUrl(domain: string): string {
    if (!domain) return process.env.NEXT_PUBLIC_SITE_URL || 'https://nexus-corp-ptit.vercel.app';
    const decodedDomain = decodeURIComponent(domain);
    const protocol = decodedDomain.includes('localhost') || decodedDomain.includes('.local') ? 'http' : 'https';
    return `${protocol}://${decodedDomain}`;
}

/**
 * Escapes common XML special characters.
 */
export function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

/**
 * Generates a WebSite schema with SearchAction for sitelinks search box.
 * Call this from the root layout to enable Google's search box in SERPs.
 */
export function generateWebSiteSchema(baseUrl: string, siteName: string): string {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": baseUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/en/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    });
}
