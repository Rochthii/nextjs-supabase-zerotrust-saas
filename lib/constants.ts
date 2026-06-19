/**
 * SITE_URL — Priority env var NEXT_PUBLIC_SITE_URL.
 * Trailing slash is automatically removed.
 *
 * ► Current: set NEXT_PUBLIC_SITE_URL in Vercel
 * No code changes needed.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://nexus-corp-ptit.vercel.app';

export const DEFAULT_SITE_NAME = "Secure Multi-tenant SaaS";
export const DEFAULT_SITE_DESCRIPTION = "Research and design of secure software architecture for multi-tenant platforms";

export const BRAND_NAME_VI = "Secure Multi-tenant SaaS";
export const BRAND_NAME_EN = "Secure Multi-tenant SaaS";

export const LOCALES = {
    vi: "Tiếng Việt",
    km: "ភាសាខ្មែរ",
    en: "English",
} as const;

export const DEFAULT_LOCALE = "en";
