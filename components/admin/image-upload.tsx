'use client';

import React, { useState } from 'react';
// @ts-ignore - TypeScript cache issue with newly created action
import { uploadImage } from '@/app/actions/admin/upload';
import { compressImageToWebP } from '@/lib/utils/compress-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    trim?: boolean; // Tự động cắt khoảng trắng
}

export function ImageUpload({ label, value, onChange, disabled, trim }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Compress image to WebP before upload to save Supabase storage space
            const compressed = await compressImageToWebP(file, { trim });
            const formData = new FormData();
            formData.append('file', compressed);
            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onChange(result.url);
            } else {
                setError(result.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange('');
    };

    return (
        <div className="w-full">
            {label && <Label className="mb-2 block">{label}</Label>}

            {value ? (
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                        src={value}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        disabled={disabled}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="mt-2">
                    <label className={`
                        flex flex-col items-center justify-center w-full h-32 
                        border-2 border-dashed border-gray-300 rounded-lg 
                        cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 mb-3 text-gray-400 animate-spin" />
                                    <p className="text-sm text-gray-500">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                    <p className="text-xs text-gray-400 mt-1">All image formats · Auto WebP compression</p>
                                </>
                            )}
                        </div>
                        <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={disabled || uploading}
                        />
                    </label>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
