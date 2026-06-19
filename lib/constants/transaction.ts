export interface TransactionPurpose {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    goal: number;
    current: number;
    color: string;
    is_active: boolean;
    order_position: number;
    recipient_type: 'tenant_fund' | 'charity_fund';
    bank_account_id?: string;
    tenant_id: string;
}

export interface TransactionProjectUI {
    id: string;
    title: string;
    description: string;
    icon?: string;
    goal: number;
    current: number;
    color?: string;
    is_active: boolean;
    order_position: number;
    created_at: string;
    updated_at: string;
    tenant_id?: string;
    bank_account_id?: string;
    recipient_type: 'tenant_fund' | 'charity_fund';
    
    type: 'general_fund' | 'specific_project';
    slug?: string;
    status: 'ongoing' | 'completed' | 'cancelled';
    thumbnail_url?: string;
    content_vi?: string;
    title_km?: string;
    description_km?: string;
    content_km?: string;
    start_date?: string;
    end_date?: string;
}

export type PaymentMethod = 'bank_transfer' | 'momo';

export interface TransactionFormData {
    amount: number;
    payment_method: PaymentMethod;
    donor_name: string;
    donor_email?: string;
    donor_phone?: string;
    note?: string;
    is_anonymous: boolean;
    purpose: string;
}

export const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

export function calculatePercentage(current: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
}
