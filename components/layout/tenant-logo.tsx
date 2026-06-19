'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TenantLogoProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant?: 'circle' | 'square' | 'adaptive';
    fallbackText?: string;
    fallbackIcon?: React.ReactNode;
    showShadow?: boolean;
}

const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

/**
 * TenantLogo - Thành section display Logo thông minh
 * Tự động process tỉ lệ ảnh, fallback và các phong cách đặc trưng của từng theme.
 */
export function TenantLogo({
    src,
    alt = 'Logo',
    size = 'md',
    className,
    variant = 'adaptive',
    fallbackText = 'MC',
    fallbackIcon,
    showShadow = true,
}: TenantLogoProps) {
    const sizeClass = sizeMap[size];

    const containerClasses = cn(
        'relative flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300',
        sizeClass,
        // Phong cách bo góc dựa trên variant
        variant === 'circle' && 'rounded-full',
        variant === 'square' && 'rounded-xl',
        variant === 'adaptive' && 'rounded-xl md:rounded-2xl',
        // Hiệu ứng nền
        'bg-white/5 border border-white/10 backdrop-blur-sm',
        showShadow && 'shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:shadow-gold-primary/20',
        className
    );

    if (!src) {
        return (
            <div className={cn(containerClasses, 'bg-gradient-to-tr from-gold-primary/20 to-gold-dark/40')}>
                {fallbackIcon ? (
                    <div className="text-white/80 transition-transform duration-300 group-hover:scale-110">
                        {fallbackIcon}
                    </div>
                ) : (
                    <span className="font-black text-white text-[10px] uppercase opacity-80">
                        {fallbackText.slice(0, 2)}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <Image
                src={src}
                alt={alt}
                fill
                className={cn(
                    'transition-transform duration-500 group-hover:scale-110',
                    // Sử dụng object-contain để không bao giờ bị cắt mất details Logo
                    'object-contain p-1',
                    // Nếu là tròn thì p-1.5 để chừa lề đẹp hơn
                    variant === 'circle' && 'p-1.5'
                )}
                unoptimized
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
        </div>
    );
}

export default TenantLogo;
