/**
 * SITE_URL — Priority env var NEXT_PUBLIC_SITE_URL.
 * Trailing slash is automatically removed.
 *
 * ► Current: set NEXT_PUBLIC_SITE_URL in Vercel
 * No code changes needed.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://tenantshield-saas.vercel.app';

export const DEFAULT_SITE_NAME = "TenantShield Systems";
export const DEFAULT_SITE_DESCRIPTION = "TenantShield - Row-Level Secure Multi-tenant SaaS Boilerplate";

export const BRAND_NAME_VI = "TenantShield Systems";
export const BRAND_NAME_EN = "TenantShield Systems";

export const LOCALES = {
    vi: "Tiếng Việt",
    km: "ភាសាខ្មែរ",
    en: "English",
} as const;

export const DEFAULT_LOCALE = "en";
