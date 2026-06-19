export interface TenantMetadata {
    id: string;
    name: string;
    domain: string | null;
    tenant_type: 'tenant' | 'company' | 'foundation';
}

export interface GlobalCategory extends Category {
    tenant_id: string | null;
    parent_id: string | null;
    name_vi: string;
    description_vi?: string | null;
    name_km?: string | null;
    description_km?: string | null;
    name_en?: string | null;
    description_en?: string | null;
    slug?: string | null;
    image_url?: string | null;
    is_visible?: boolean;
    module: string;
    published_to?: string[] | null;
    order_position?: number | null;
}

export interface GlobalMedia {
    id: string;
    title: string;
    media_url: string;
    media_type: string;
    tenant_id: string | null;
    category_id: string | null;
    published_to?: string[] | null;
    created_at: string;
    metadata?: any;
}

export interface Category {
    id: string;
    name_vi: string;
    module: string;
    parent_id: string | null;
    tenant_id: string | null;
}
