'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary explicitly via URL (if env is provided, Cloudinary auto-reads CLOUDINARY_URL, but we enforce it here)
cloudinary.config({
    secure: true,
});

// ─── File validation constants ─────────────────────────────────────────────────

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_MEDIA_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
]);

const ALLOWED_MEDIA_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/aac',
    'application/pdf',
]);

// ─── Helper: validate file ─────────────────────────────────────────────────────

function validateFile(
    file: File,
    allowedTypes: Set<string>,
    maxSize: number,
    label: string,
): { valid: true } | { valid: false; error: string } {
    if (!file || file.size === 0) {
        return { valid: false, error: 'File is empty or invalid' };
    }
    if (!allowedTypes.has(file.type)) {
        return { valid: false, error: `Format "${file.type}" is not allowed for ${label}` };
    }
    if (file.size > maxSize) {
        const mb = Math.round(maxSize / 1024 / 1024);
        const fileMb = (file.size / 1024 / 1024).toFixed(1);
        return { valid: false, error: `File "${file.name}" (${fileMb} MB) exceeds the limit of ${mb} MB` };
    }
    return { valid: true };
}

// ─── uploadImage ───────────────────────────────────────────────────────────────

export async function uploadImage(formData: FormData, tenantIdProp?: string) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'None file nào được cung cấp' };
        }

        // FIXED: Validate file size và MIME type
        const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, 'ảnh');
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Generate unique filename for Cloudinary Public ID
        const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`; // Cloudinary automatically adds extension

        // Use user's tenant_id to create an isolated folder
        const { getUserTenantId } = await import('@/lib/permissions');
        const userTenantId = await getUserTenantId();

        const tenantFolder = tenantIdProp || userTenantId || 'global';
        const folderPath = `saas/${tenantFolder}/${new Date().getFullYear()}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using Upload Stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    public_id: fileName,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Cloudinary upload failed with no secure URL returned');
        }

        await createAuditLog({
            user,
            action: 'upload',
            tableName: 'cloudinary.media',
            recordId: uploadResult.public_id,
            newData: { url: uploadResult.secure_url, size: uploadResult.bytes, type: file.type },
        });

        return {
            success: true,
            url: uploadResult.secure_url,
            path: uploadResult.public_id, // Original path mapping
        };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') return { success: false, error: error.message, unauthorized: true };
        console.error('Upload error:', error);

        // Return error details hơn nếu có
        const errorMessage = error?.message || 'Error unknown';
        return {
            success: false,
            error: `Upload failed: ${errorMessage}`
        };
    }
}

/**
 * Upload multiple media files to Supabase Storage and save metadata to media table
 */
export async function uploadMedia(formData: FormData, tenantIdProp?: string) {
    try {
        // Editors can upload media
        const user = await requireEditor();
        const supabase = await createClient();
        const files = formData.getAll('files') as File[];
        const titlesJson = formData.get('titles') as string;
        let titles: string[] = [];
        try {
            if (titlesJson) titles = JSON.parse(titlesJson);
        } catch (e) { console.error('Error parse titles:', e); }

        if (!files || files.length === 0) {
            return { success: false, error: 'Chưa select file nào' };
        }

        const uploadedFiles = [];
        const errors: string[] = [];
        let index = 0;

        for (const file of files) {
            const customTitle = titles[index] || file.name;
            index++;
            // FIXED: Validate từng file trước khi upload
            const validation = validateFile(file, ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE, 'media');
            if (!validation.valid) {
                errors.push(validation.error);
                continue;
            }

            // Generate unique filename for Cloudinary
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Lấy tenant_id từ DB để save vào đúng folder branch
            const { getUserTenantId } = await import('@/lib/permissions');
            const userTenantId = await getUserTenantId();

            const tenantFolder = tenantIdProp || userTenantId || 'global';
            const folderPath = `saas/${tenantFolder}/${new Date().getFullYear()}`;

            // Convert File to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload via Cloudinary Stream
            let uploadResult: any;
            try {
                uploadResult = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: folderPath,
                            public_id: fileName,
                            resource_type: 'auto',
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
            } catch (uploadError: any) {
                console.error('Cloudinary upload error:', uploadError);
                errors.push(`"${file.name}": Error upload Cloudinary`);
                continue;
            }

            // Determine media type — DB enum: 'image' | 'video' | 'audio' | 'document'
            let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';
            if (file.type.startsWith('image/')) mediaType = 'image';
            else if (file.type.startsWith('video/')) mediaType = 'video';
            else if (file.type.startsWith('audio/')) mediaType = 'audio';

            const rawCategoryId = formData.get('category_id') as string | null;
            const category_id = (!rawCategoryId || rawCategoryId === 'null' || rawCategoryId === 'undefined' || rawCategoryId === '') ? null : rawCategoryId;

            const rawPublishedTo = formData.get('published_to') as string | null;
            let published_to = [];
            if (rawPublishedTo) {
                try {
                    published_to = JSON.parse(rawPublishedTo);
                } catch(e) {}
            }

            const mediaMetadata = {
                title_vi: customTitle,
                title_km: formData.get('title_km') as string || null,
                title_en: formData.get('title_en') as string || null,
                type: mediaType,
                url: uploadResult.secure_url,
                file_size: uploadResult.bytes,
                mime_type: file.type,
                year: new Date().getFullYear(),
                category_id,
                tenant_id: tenantFolder === 'global' ? null : tenantFolder,
                published_to: published_to.length > 0 ? published_to : null,
            };

            // Insert metadata vào bảng media
            const { data, error: insertError } = await (supabase as any)
                .from('media')
                .insert(mediaMetadata)
                .select('id')
                .single();

            if (insertError) {
                console.error('Insert media error:', insertError);
                // Atomicity: Delete from Cloudinary if DB insert fails
                await cloudinary.api.delete_resources([uploadResult.public_id], { type: 'upload' }).catch(console.error);
                errors.push(`"${file.name}": Save database failed`);
                continue;
            }

            await createAuditLog({
                user,
                action: 'upload',
                tableName: 'media',
                recordId: data?.id,
                newData: { ...mediaMetadata, path: uploadResult.public_id },
            });

            uploadedFiles.push({
                name: file.name,
                url: uploadResult.secure_url,
            });
        }

        revalidatePath('/admin/media');
        revalidatePath('/vi/tai-lieu-so');
        revalidatePath('/km/tai-lieu-so');
        revalidatePath('/en/tai-lieu-so');

        if (uploadedFiles.length === 0) {
            return {
                success: false,
                error: errors.length > 0
                    ? errors.join('; ')
                    : 'Không upload được file nào. Check Supabase Storage bucket "media".',
                uploaded: 0,
                total: files.length,
            };
        }

        return {
            success: true,
            uploaded: uploadedFiles.length,
            total: files.length,
            // Báo error từng section nếu có file không upload được
            partialErrors: errors.length > 0 ? errors : undefined,
        };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') return { success: false, error: error.message, unauthorized: true };
        console.error('Upload media error:', error);

        const errorMessage = error?.message || 'Error unknown';
        return {
            success: false,
            error: `Upload failed: ${errorMessage}`
        };
    }
}
