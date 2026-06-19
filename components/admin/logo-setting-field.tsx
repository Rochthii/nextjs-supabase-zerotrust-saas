'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/admin/image-upload';
import { Label } from '@/components/ui/label';

interface LogoSettingFieldProps {
    defaultValue?: string;
}

export function LogoSettingField({ defaultValue = '' }: LogoSettingFieldProps) {
    const [logoUrl, setLogoUrl] = useState(defaultValue);

    return (
        <div className="space-y-4">
            <Label>Logo chính của website</Label>
            <div className="max-w-xs">
                <ImageUpload
                    value={logoUrl}
                    onChange={(url) => setLogoUrl(url)}
                    trim={true}
                />
            </div>
            {/* Hidden input to pass value to Server Action FormData */}
            <input type="hidden" name="site_logo" value={logoUrl} />
            <p className="text-xs text-gray-500">
                Upload ảnh có định dạng PNG trong suốt (khuyên dùng) hoặc JPG. Tỉ lệ khuyên dùng 1:1 hoặc ngang tỷ lệ vừa phải.
            </p>
        </div>
    );
}
