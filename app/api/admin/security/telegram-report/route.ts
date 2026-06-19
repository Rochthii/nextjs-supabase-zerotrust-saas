import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin, getUserContext } from '@/lib/permissions';
import { generateAndSendSecurityPDFReport } from '@/lib/security/telegram-report-service';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user access
        const ctx = await getUserContext();
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = await isGlobalAdmin();
        const body = await req.json().catch(() => ({}));
        const targetTenantId = body.tenantId || null;

        // If not global admin, enforce tenant scoped access
        if (!isAdmin) {
            if (!ctx.tenantId || ctx.tenantId !== targetTenantId) {
                return NextResponse.json({ error: 'Forbidden: You do not have access to this tenant data' }, { status: 403 });
            }
        }

        // 2. Call the shared service to generate and send PDF report (default: weekly)
        console.log(`[Telegram Report API] Invoking shared PDF generation service for tenant: ${targetTenantId}...`);
        const result = await generateAndSendSecurityPDFReport(targetTenantId, 'weekly');
        
        return NextResponse.json(result);

    } catch (e: any) {
        console.error('[Telegram Report API] Critical error:', e);
        return NextResponse.json({ error: e.message || 'Failed to export security report' }, { status: 500 });
    }
}
