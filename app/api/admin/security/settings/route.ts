import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { withAdminAuth } from '@/lib/utils/api-handler';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
    // Read status from settings table
    const supabase = (await createAdminClient()) as any;
    const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'auto_defense')
        .maybeSingle();

    const isEnabled = data?.value === 'true';
    return NextResponse.json({ autoDefense: isEnabled });
});

export const POST = withAdminAuth(async (request: NextRequest) => {
    // Get configuration parameter
    const body = await request.json().catch(() => ({}));
    const autoDefense = body.autoDefense === true;

    const supabase = (await createAdminClient()) as any;

    // Upsert into settings table
    const { error } = await supabase
        .from('settings')
        .upsert({ 
            key: 'auto_defense', 
            value: String(autoDefense) 
        }, { onConflict: 'key' });

    if (error) throw error;

    // Write immutable Audit Log to audit_logs table for compliance auditing
    await supabase.from('audit_logs').insert({
        user_id: null,
        user_email: 'admin@system',
        action: 'toggle_auto_defense',
        resource: 'security_settings',
        table_name: 'settings',
        record_id: 'auto_defense',
        new_data: { auto_defense: autoDefense },
        created_at: new Date().toISOString()
    });

    console.log(`[Security Settings] Auto Defense successfully set to ${autoDefense} and logged.`);

    return NextResponse.json({ success: true, autoDefense });
});
