'use client';

import { Facebook, Twitter, Link as LinkIcon, Mail } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    url?: string;
    description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareTitle = encodeURIComponent(title);
    const shareDesc = description ? encodeURIComponent(description) : '';

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`,
        email: `mailto:?subject=${shareTitle}&body=${shareDesc}%0A%0A${encodeURIComponent(shareUrl)}`,
    };

    return (
        <div className="flex items-center gap-2 print:hidden">
            <span className="text-sm text-gray-600 font-medium">Share:</span>

            <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                aria-label="Share on Facebook"
            >
                <Facebook className="h-5 w-5" />
            </a>

            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-sky-50 text-sky-600 transition-colors"
                aria-label="Share on Twitter"
            >
                <Twitter className="h-5 w-5" />
            </a>

            <a
                href={shareLinks.email}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Share via Email"
            >
                <Mail className="h-5 w-5" />
            </a>

            <button
                onClick={handleCopyLink}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative"
                aria-label="Copy link"
            >
                <LinkIcon className="h-5 w-5" />
                {copied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                        Đã sao chép!
                    </span>
                )}
            </button>
        </div>
    );
}
