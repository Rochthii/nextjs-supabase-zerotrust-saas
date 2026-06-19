import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { extractYouTubeId } from '@/lib/constants/media';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        const body = await request.json();
        const { url, title_vi, category } = body;

        if (!url || !title_vi) {
            return NextResponse.json({ success: false, error: 'URL vÃ  tiÃªu Ä‘á» lÃ  báº¯t buá»™c' }, { status: 400 });
        }

        // Validate YouTube URL
        const videoId = extractYouTubeId(url);
        if (!videoId) {
            return NextResponse.json({ success: false, error: 'URL YouTube khÃ´ng há»£p lá»‡' }, { status: 400 });
        }

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        const mediaData = {
            title_vi,
            type: 'video',
            url,
            thumbnail_url: thumbnailUrl,
            category: category || null,
            year: new Date().getFullYear(),
        };

        const { data, error } = await (supabase as any).from('media').insert(mediaData).select('id').single();

        if (error) {
            console.error('Insert YouTube media error:', error);
            return NextResponse.json({ success: false, error: 'CÃ³ lá»—i khi lÆ°u video: ' + error.message }, { status: 500 });
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'media',
            recordId: data?.id,
            newData: mediaData,
        });

        revalidatePath('/admin/media');
        revalidatePath('/[locale]/tai-lieu-so', 'page');

        return NextResponse.json({ success: true, id: data?.id });
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') {
            return NextResponse.json({ success: false, error: err.message, unauthorized: true }, { status: 401 });
        }
        console.error('YouTube media API error:', err);
        return NextResponse.json({ success: false, error: 'CÃ³ lá»—i xáº£y ra' }, { status: 500 });
    }
}
