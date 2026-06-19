/**
 * lib/validations/admin.ts
 * Zod schemas for admin Server Actions.
 */
import { z } from 'zod';

// Flexible UUID pattern: accepts both standard RFC 4122 UUIDs and custom formats (11111111-...)
const FLEX_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const flexUuid = z.string().regex(FLEX_UUID_REGEX, 'Invalid UUID');

const UUID_OR_EMPTY = z.union([
    flexUuid,
    z.literal(''),
]).optional().nullable();

// ─── NEWS ────────────────────────────────────────────────────────────────────

export const NewsSchema = z.object({
    title_vi: z.string().min(3, 'Title must be at least 3 characters').max(255),
    title_en: z.string().max(255).optional().nullable(),
    title_km: z.string().max(255).optional().nullable(),
    content_vi: z.string().min(10, 'Content must be at least 10 characters'),
    content_en: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    excerpt_vi: z.string().max(500).optional().nullable(),
    excerpt_en: z.string().max(500).optional().nullable(),
    excerpt_km: z.string().max(500).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional().nullable(),
    // thumbnail_url: allows empty string (thumbnail is optional)
    thumbnail_url: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional().nullable(),
    category_id: UUID_OR_EMPTY,
    tenant_id: UUID_OR_EMPTY,
    status: z.enum(['draft', 'pending_review', 'published', 'scheduled', 'rejected', 'archived']).default('draft'),
    published_at: z.string().datetime().optional().nullable(),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type NewsInput = z.infer<typeof NewsSchema>;

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export const EventSchema = z.object({
    title_vi: z.string().min(3, 'Title must be at least 3 characters').max(255),
    title_en: z.string().max(255).optional().nullable(),
    title_km: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    excerpt_vi: z.string().max(500, 'Short description cannot exceed 500 characters').optional().nullable(),
    excerpt_en: z.string().max(500).optional().nullable(),
    excerpt_km: z.string().max(500).optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    thumbnail_url: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional().nullable(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
    category: z.string().optional().nullable(),
    registration_required: z.boolean().default(false),
    max_participants: z.number().int().positive().optional().nullable(),
    is_recurring: z.boolean().default(false),
    tenant_id: UUID_OR_EMPTY,
    published_to: z.array(flexUuid).optional().nullable(),
}).refine(
    // FIXED: Validate end_date >= start_date if end_date has a value
    (data) => {
        if (!data.end_date || !data.start_date) return true;
        return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
        message: 'End date must be after or equal to start date',
        path: ['end_date'],
    }
).strip();


export type EventInput = z.infer<typeof EventSchema>;

// ─── DONATIONS ───────────────────────────────────────────────────────────────

export const TransactionUpdateSchema = z.object({
    // 'confirmed' = admin confirmed, 'cancelled' = admin rejected/cancelled
    status: z.enum(['pending', 'confirmed', 'cancelled', 'failed', 'refunded']),
    note: z.string().max(500).optional().nullable(),
    transaction_id: z.string().max(255).optional().nullable(),
    completed_at: z.string().datetime().optional().nullable(),
}).strip();

export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;

// ─── MEDIA ───────────────────────────────────────────────────────────────────

export const MediaSchema = z.object({
    title_vi: z.string().min(1, 'Title is required').max(255),
    title_en: z.string().max(255).optional().nullable(),
    description_vi: z.string().optional().nullable(),
    type: z.enum(['image', 'video', 'audio', 'document']),
    url: z.string().url('Invalid URL'),
    thumbnail_url: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional().nullable(),
    category_id: z.union([z.string().uuid(), z.literal('')]).optional().nullable(),
    year: z.number().int().min(1900).max(2100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    tenant_id: UUID_OR_EMPTY,
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type MediaInput = z.infer<typeof MediaSchema>;

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const FaqSchema = z.object({
    question_vi: z.string().min(5, 'Question must be at least 5 characters'),
    question_en: z.string().optional().nullable(),
    answer_vi: z.string().min(5, 'Answer must be at least 5 characters'),
    answer_en: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    order_position: z.number().int().min(0).default(0),
    is_published: z.boolean().default(true),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type FaqInput = z.infer<typeof FaqSchema>;

// ─── PAGES ───────────────────────────────────────────────────────────────────

export const PageSchema = z.object({
    title_vi: z.string().min(1, 'Title is required').max(255),
    title_en: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug'),
    content_vi: z.string().optional().nullable(),
    content_en: z.string().optional().nullable(),
    meta_description_vi: z.string().max(160).optional().nullable(),
    meta_description_en: z.string().max(160).optional().nullable(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    tenant_id: UUID_OR_EMPTY,
    parent_id: UUID_OR_EMPTY,
    order_index: z.number().int().default(0).optional(),
    show_in_menu: z.boolean().default(true).optional(),
}).strip();

export type PageInput = z.infer<typeof PageSchema>;

// ─── USERS ───────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.object({
    role: z.enum(['super_admin', 'admin', 'moderator', 'editor', 'viewer']),
}).strip();

export type UserRoleInput = z.infer<typeof UserRoleSchema>;

// ─── HERO SLIDES ─────────────────────────────────────────────────────────────

export const HeroSlideSchema = z.object({
    title_vi: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    title_km: z.string().optional().nullable(),
    subtitle_vi: z.string().optional().nullable(),
    subtitle_en: z.string().optional().nullable(),
    subtitle_km: z.string().optional().nullable(),
    image_url: z.string().min(1, 'Image is required'),
    cta1_enabled: z.boolean().default(true),
    cta1_text_key: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta1_link: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta2_enabled: z.boolean().default(true),
    cta2_text_key: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta2_link: z.union([z.string(), z.literal('')]).optional().nullable(),
    is_active: z.boolean().default(true),
    order_position: z.number().default(0),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type HeroSlideFormValues = z.infer<typeof HeroSlideSchema>;

// ─── ABOUT SECTIONS ──────────────────────────────────────────────────────────

export const AboutSectionSchema = z.object({
    key: z.string().regex(/^[a-z0-9-\/]+$/, 'Key can only contain lowercase letters, numbers, hyphens, and slashes').optional(),
    title_vi: z.string().min(1, 'Vietnamese title is required'),
    title_km: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    summary_vi: z.string().max(500, 'Summary cannot exceed 500 characters').optional().nullable(),
    summary_km: z.string().max(500).optional().nullable(),
    summary_en: z.string().max(500).optional().nullable(),
    content_vi: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    content_en: z.string().optional().nullable(),
    images: z.array(z.string()).optional(), // Array of image URLs
    image_url: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type AboutSectionFormValues = z.infer<typeof AboutSectionSchema>;
// ─── CATEGORIES ─────────────────────────────────────────────────────────────
export const CategorySchema = z.object({
    name_vi: z.string().min(1, 'Category name is required').max(255),
    name_km: z.string().max(255).optional().nullable(),
    name_en: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug'),
    module: z.string().min(1, 'Module is required'),
    type: z.string().optional().nullable(),
    parent_id: UUID_OR_EMPTY,
    image_url: z.string().url('Invalid image URL').or(z.literal('')).optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    tenant_id: UUID_OR_EMPTY,
    order_position: z.number().int().default(0),
    is_visible: z.boolean().default(true),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type CategoryInput = z.infer<typeof CategorySchema>;

// ─── TENANTS ─────────────────────────────────────────────────────────────────
export const TenantSchema = z.object({
    name: z.string().min(1, 'Workspace / Enterprise name is required').max(255),
    domain: z.string().min(3, 'Invalid domain name').max(255),
    subdomain: z.string().max(255).optional().nullable(),
    layout_style: z.string().default('saas_violet'),
    logo_url: z.string().url().or(z.literal('')).optional().nullable(),
    theme_colors: z.record(z.string(), z.string()).optional().nullable(),
    contact_info: z.record(z.string(), z.any()).optional().nullable(),
    tenant_type: z.enum(['tenant', 'company', 'ngo']).default('tenant').optional(),
    has_web_frontend: z.boolean().default(true).optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    plan_type: z.enum(['free', 'pro', 'enterprise']).default('free').optional(),
    lifecycle_status: z.enum(['active', 'suspended', 'offboarding', 'terminated']).default('active').optional(),
    modules_config: z.record(z.string(), z.any()).optional().nullable(),
}).strip();

export type TenantInput = z.infer<typeof TenantSchema>;

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const SiteSettingsSchema = z.object({
    site_name_vi: z.string().min(1, 'Website name is required'),
    site_name_en: z.string().optional().nullable(),
    contact_email: z.string().email('Invalid email').optional().nullable(),
    contact_phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    facebook_url: z.string().url('Invalid Facebook URL').or(z.literal('')).optional().nullable(),
    youtube_url: z.string().url('Invalid YouTube URL').or(z.literal('')).optional().nullable(),
    // Bank
    'bank.id': z.string().optional().nullable(),
    'bank.account_no': z.string().optional().nullable(),
    'bank.account_name': z.string().optional().nullable(),
    'bank.name': z.string().optional().nullable(),
    // Brand
    site_name_km: z.string().optional().nullable(),
    site_subtitle_vi: z.string().optional().nullable(),
    map_embed_url: z.string().optional().nullable(),
    map_direction_url: z.string().optional().nullable(),
}).strip();

export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;
// ─── LEARNING RESOURCES ───────────────────────────────────────────────────────
export const LearningResourceSchema = z.object({
    title_vi: z.string().min(1, 'Vietnamese title is required').max(500),
    title_km: z.string().max(500).optional().nullable(),
    title_en: z.string().max(500).optional().nullable(),
    description_vi: z.string().max(5000).optional().nullable(),
    media_url: z.string().url('Invalid video URL').min(1, 'Video URL is required'),
    thumbnail_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    instructor_name_vi: z.string().max(255).optional().nullable(),
    topic_vi: z.string().max(255).optional().nullable(),
    duration_minutes: z.number().int().positive().optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional().nullable(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    order_position: z.number().int().min(0).optional(),
    category_id: UUID_OR_EMPTY,
    tenant_id: UUID_OR_EMPTY,
    approval_status: z.enum(['draft', 'pending_review', 'published', 'rejected']).optional(),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type LearningResourceInput = z.infer<typeof LearningResourceSchema>;

// ─── DONATION PROJECTS ────────────────────────────────────────────────────────
export const TransactionProjectSchema = z.object({
    title_vi: z.string().min(1, 'Title is required'),
    title_km: z.string().optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug').optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    content_vi: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    thumbnail_url: z.string().url('Invalid image URL').or(z.literal('')).optional().nullable(),
    target_amount: z.number().min(0).default(0),
    current_amount: z.number().min(0).default(0),
    status: z.enum(['ongoing', 'completed', 'cancelled']).default('ongoing'),
    is_active: z.boolean().default(true),
    start_date: z.string().datetime().or(z.string().nullable()).optional(),
    end_date: z.string().datetime().or(z.string().nullable()).optional(),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type TransactionProjectInput = z.infer<typeof TransactionProjectSchema>;

// ─── BATCH OPERATIONS ─────────────────────────────────────────────────────────
export const BatchOrderSchema = z.array(z.object({
    id: z.string().uuid('Invalid ID'),
    order_position: z.number().int().min(0)
})).min(1, 'List cannot be empty');


// ─── UTILS: Format Zod error messages clearly in English ─────────────────────
export function formatZodError(error: z.ZodError): string {
    const FIELD_LABELS: Record<string, string> = {
        title_vi: 'Title (VI)',
        name_vi: 'Name (VI)',
        slug: 'Path (Slug)',
        media_url: 'Video/Audio Path',
        thumbnail_url: 'Thumbnail URL',
        content_vi: 'Content (VI)',
        start_date: 'Start Date',
        domain: 'Domain Name',
        email: 'Email',
        // Brand
        site_name_km: 'Website Name (KM)',
        site_subtitle_vi: 'Website Subtitle (VI)',
    };
    return error.issues.map(i => {
        const field = i.path.length > 0 ? i.path[i.path.length - 1].toString() : 'Data';
        const label = FIELD_LABELS[field] ?? field;
        return `${label}: ${i.message}`;
    }).join(' | ');
}
