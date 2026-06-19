import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

export function GoldButton({ className, ...props }: ButtonProps) {
    return (
        <Button
            className={cn(
                "bg-gold-primary hover:bg-gold-dark text-gray-900 font-semibold",
                "shadow-[0_4px_15px_rgba(255,215,0,0.3)]",
                "transition-all duration-300",
                className
            )}
            {...props}
        />
    );
}
