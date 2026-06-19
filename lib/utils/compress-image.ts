/**
 * compress-image.ts
 * Shared utility — client-side image compression before uploading to Supabase Storage.
 * 
 * Strategy:
 * - Output: WebP (approx. 35% smaller than JPEG, supported by all modern browsers)
 * - Max dimension: 1600px (standard web quality)
 * - Quality: 0.82 (highly optimized yet visually appealing)
 * - GIF / SVG / non-image: preserved as-is, no compression
 * - If WebP is larger than original: fallback to the original file
 */

export interface CompressOptions {
    maxDimension?: number;
    quality?: number;
    trim?: boolean;
}

/**
 * Trims transparent/white edges from an image
 */
function trimImage(ctx: CanvasRenderingContext2D, width: number, height: number): { x: number, y: number, w: number, h: number } | null {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let r, g, b, a;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            r = data[index];
            g = data[index + 1];
            b = data[index + 2];
            a = data[index + 3];

            // Consider a pixel "not empty" if it's not transparent AND not pure white (with some tolerance)
            // This is useful for logos on white backgrounds
            const isWhite = r > 250 && g > 250 && b > 250;
            const isEmpty = a < 10 || isWhite;

            if (!isEmpty) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return null;

    // Add 2px padding to avoid cutting pixels due to antialiasing
    return {
        x: Math.max(0, minX - 2),
        y: Math.max(0, minY - 2),
        w: Math.min(width, maxX - minX + 4),
        h: Math.min(height, maxY - minY + 4)
    };
}

export function compressImageToWebP(file: File, options: CompressOptions = {}): Promise<File> {
    const { maxDimension = 1600, quality = 0.82, trim = false } = options;
    
    return new Promise((resolve) => {
        // Do not compress GIF (with animations), SVG (vectors), and non-images
        if (
            !file.type.startsWith('image/') ||
            file.type === 'image/svg+xml' ||
            file.type === 'image/gif'
        ) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous"; // Handle CORS if any
            img.onload = () => {
                let { width, height } = img;

                // 1. Initial Processing Canvas
                const processingCanvas = document.createElement('canvas');
                processingCanvas.width = width;
                processingCanvas.height = height;
                const pCtx = processingCanvas.getContext('2d', { willReadFrequently: true });
                if (!pCtx) { resolve(file); return; }
                pCtx.drawImage(img, 0, 0);

                let sourceX = 0, sourceY = 0, sourceW = width, sourceH = height;

                // 2. Perform Auto-Trim if requested
                if (trim) {
                    const box = trimImage(pCtx, width, height);
                    if (box) {
                        sourceX = box.x;
                        sourceY = box.y;
                        sourceW = box.w;
                        sourceH = box.h;
                        width = box.w;
                        height = box.h;
                    }
                }

                // 3. Scale down if still too large
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                // 4. Final Canvas
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = width;
                finalCanvas.height = height;
                const fCtx = finalCanvas.getContext('2d');
                if (!fCtx) { resolve(file); return; }
                
                // Draw either cropped or original, scaled
                fCtx.drawImage(processingCanvas, sourceX, sourceY, sourceW, sourceH, 0, 0, width, height);

                finalCanvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        // Only use compressed version if it is actually smaller than the original (or if trimmed)
                        if (blob.size >= file.size && !trim) { resolve(file); return; }
                        const newName = file.name.replace(/\.[^.]+$/, '.webp');
                        resolve(new File([blob], newName, { type: 'image/webp' }));
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => resolve(file); // Fallback if decode fails
            img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}


/**
 * Compress multiple files simultaneously (in parallel)
 */
export async function compressImagesToWebP(files: File[], options: CompressOptions = {}): Promise<File[]> {
    return Promise.all(files.map(f => compressImageToWebP(f, options)));
}

/**
 * Calculate compression savings percentage
 */
export function calcSavedPercent(originalFiles: File[], compressedFiles: File[]): number {
    const origSize = originalFiles.reduce((s, f) => s + f.size, 0);
    const compSize = compressedFiles.reduce((s, f) => s + f.size, 0);
    if (origSize === 0) return 0;
    return Math.round(((origSize - compSize) / origSize) * 100);
}
