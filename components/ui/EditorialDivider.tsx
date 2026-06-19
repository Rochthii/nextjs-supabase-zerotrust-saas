'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { LotusIcon, DharmaWheelIcon } from './khmer-icons';
import { motion } from 'framer-motion';

interface EditorialDividerProps {
    className?: string;
    variant?: 'simple' | 'ornate' | 'minimal';
    icon?: 'lotus' | 'wheel';
    color?: string;
}

/**
 * EditorialDivider - A sophisticated section divider for the "Heritage Editorial" system.
 * Features animated lines and optional sacred icons.
 */
export function EditorialDivider({ 
    className, 
    variant = 'ornate', 
    icon = 'lotus',
    color = 'rgb(var(--theme-primary) / 0.3)' 
}: EditorialDividerProps) {
    
    if (variant === 'minimal') {
        return (
            <div className={cn("w-12 h-0.5 bg-current mx-auto md:mx-0 opacity-40", className)} style={{ color }} />
        );
    }

    if (variant === 'simple') {
        return (
            <div className={cn("flex items-center gap-4 py-8 pointer-events-none select-none", className)}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-10" style={{ color }} />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-center gap-6 py-12 md:py-20 pointer-events-none select-none", className)}>
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '120px', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent to-current" 
                style={{ color }}
            />
            
            <motion.div
                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, type: "spring", damping: 20 }}
                className="flex items-center justify-center"
            >
                {icon === 'lotus' ? (
                    <LotusIcon className="w-6 h-6" color={color} />
                ) : (
                    <DharmaWheelIcon className="w-6 h-6" color={color} />
                )}
            </motion.div>

            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '120px', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-l from-transparent to-current" 
                style={{ color }}
            />
        </div>
    );
}

