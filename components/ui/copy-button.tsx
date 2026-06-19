'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Đã sao chép');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Không thể sao chép');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={handleCopy}
            title="Copy"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4 text-gray-400" />
            )}
        </Button>
    );
}
