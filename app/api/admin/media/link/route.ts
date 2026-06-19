import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

// â”€â”€â”€ URL Detection Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function detectYouTube(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function detectTikTok(url: string): boolean {
    return /tiktok\.com\/@[\w.]+\/video\/\d+/.test(url) || /vm\.tiktok\.com\//.test(url) || /vt\.tiktok\.com\//.test(url);
}

function detectFacebook(url: string): boolean {
    return /(?:facebook\.com|fb\.watch|m\.facebook\.com)/.test(url) &&
        (/\/videos?\//.test(url) || /fb\.watch\//.test(url) || /\/watch\/?\?/.test(url));
}

function detectDirectImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|tif|heic|heif|ico)(\?.*)?$/i.test(url) ||
        /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|tif|heic|heif|ico)$/i.test(url.split('?')[0]);
}

function detectDirectVideo(url: string): boolean {
    return /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)(\?.*)?$/i.test(url);
}

function detectDirectAudio(url: string): boolean {
    return /\.(mp3|wav|ogg|m4a|flac|aac|opus|wma)(\?.*)?$/i.test(url);
}

// Láº¥y thumbnail URL cho tá»«ng loáº¡i nguá»“n
function getThumbnail(url: string, youtubeId?: string | null): string | null {
    if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    if (detectTikTok(url)) {
        // TikTok khÃ´ng cáº¥p thumbnail cÃ´ng khai â€” dÃ¹ng logo placeholder
        return null;
    }
    if (detectFacebook(url)) {
        return null;
    }
    if (detectDirectImage(url)) {
        return url; // ChÃ­nh URL lÃ  thumbnail
    }
    return null;
}

// ——— Route Handler ———
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const user = await requireEditor();

        const body = await request.json();
        const { url, title_vi, category_id, tenant_id, published_to } = body;

        if (!url?.trim()) {
            return NextResponse.json({ success: false, error: 'URL lÃ  báº¯t buá»™c' }, { status: 400 });
        }

        const normalizedUrl = url.trim();

        // ——— Auto-detect type ——————————————————————————————————————————————————————
        const youtubeId = detectYouTube(normalizedUrl);
        const isTikTok = detectTikTok(normalizedUrl);
        const isFacebook = detectFacebook(normalizedUrl);
        const isDirectImage = detectDirectImage(normalizedUrl);
        const isDirectVideo = detectDirectVideo(normalizedUrl);
        const isDirectAudio = detectDirectAudio(normalizedUrl);

        let mediaType: string;
        let source: string;
        const thumbnailUrl: string | null = getThumbnail(normalizedUrl, youtubeId);

        if (youtubeId) {
            mediaType = 'video';
            source = 'youtube';
        } else if (isTikTok) {
            mediaType = 'video';
            source = 'tiktok';
        } else if (isFacebook) {
            mediaType = 'video';
            source = 'facebook';
        } else if (isDirectImage) {
            mediaType = 'image';
            source = 'external';
        } else if (isDirectVideo) {
            mediaType = 'video';
            source = 'external';
        } else if (isDirectAudio) {
            mediaType = 'audio';
            source = 'external';
        } else {
            return NextResponse.json({
                success: false,
                error: 'KhÃ´ng nháº­n diá»‡n Ä‘Æ°á»£c loáº¡i media. Há»— trá»£: YouTube, TikTok, Facebook Video, vÃ  link trá»±c tiáº¿p áº£nh/video/audio.',
                detected: null,
            }, { status: 422 });
        }

        // Tá»± Ä‘á»™ng táº¡o tiÃªu Ä‘á»  náº¿u khÃ´ng cÃ³
        const autoTitle = title_vi?.trim() ||
            (youtubeId ? `YouTube - ${youtubeId}` :
                isTikTok ? 'TikTok Video' :
                    isFacebook ? 'Facebook Video' :
                        normalizedUrl.split('/').pop()?.split('?')[0] || 'Media');

        const mediaData: Record<string, any> = {
            title_vi: autoTitle,
            type: mediaType,
            url: normalizedUrl,
            thumbnail_url: thumbnailUrl,
            category_id: category_id || null,
            year: new Date().getFullYear(),
            tenant_id: tenant_id || null,
            published_to: published_to && published_to.length > 0 ? published_to : null,
        };

        const { data, error } = await (supabase as any)
            .from('media')
            .insert(mediaData)
            .select('id')
            .single();

        if (error) {
            console.error('Insert media link error:', error);
            return NextResponse.json({ success: false, error: 'CÃ³ lá»—i khi lÆ°u: ' + error.message }, { status: 500 });
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'media',
            recordId: data?.id,
            newData: mediaData,
        });

        revalidatePath('/admin/media');
        revalidatePath('/vi/tai-lieu-so');
        revalidatePath('/km/tai-lieu-so');
        revalidatePath('/en/tai-lieu-so');

        return NextResponse.json({
            success: true,
            id: data?.id,
            detected: { type: mediaType, source },
        });
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') {
            return NextResponse.json({ success: false, error: err.message, unauthorized: true }, { status: 401 });
        }
        console.error('Media link API error:', err);
        return NextResponse.json({ success: false, error: 'CÃ³ lá»—i xáº£y ra' }, { status: 500 });
    }
}
