import React from 'react';
import { cn } from '@/lib/utils';

interface KhmerHeadingProps {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4;
    className?: string;
    withDivider?: boolean;
}

export function KhmerHeading({
    children,
    level = 1,
    className,
    withDivider = false
}: KhmerHeadingProps) {
    const baseStyles = "font-playfair font-bold text-gold-primary";
    const sizeStyles = {
        1: "text-3xl md:text-4xl lg:text-5xl",
        2: "text-2xl md:text-3xl lg:text-4xl",
        3: "text-xl md:text-2xl lg:text-3xl",
        4: "text-lg md:text-xl lg:text-2xl",
    };

    const combinedClassName = cn(baseStyles, sizeStyles[level]);

    return (
        <div className={cn("mb-6", className)}>
            {level === 1 && <h1 className={combinedClassName}>{children}</h1>}
            {level === 2 && <h2 className={combinedClassName}>{children}</h2>}
            {level === 3 && <h3 className={combinedClassName}>{children}</h3>}
            {level === 4 && <h4 className={combinedClassName}>{children}</h4>}
            {withDivider && (
                <div className="relative my-4 h-[2px] w-full bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
            )}
        </div>
    );
}
