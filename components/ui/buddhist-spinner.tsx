/**
 * BuddhistSpinner — Bánh xe Pháp (Dharmacakra) SVG animated spinner
 *
 * Phong cách Phật giáo Nam tông: 8 nan hoa (Bát Chánh Đạo),
 * vòng ngoài xoay, các cánh hoa sen nảy disable theo nhịp thiền định.
 *
 * Usage:
 *   <BuddhistSpinner />              — medium, gold (default)
 *   <BuddhistSpinner size="sm" />   — nhỏ cho button loading
 *   <BuddhistSpinner size="lg" />   — lớn cho page loading
 *   <BuddhistSpinner withText />    — kèm văn "Loading..."
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BuddhistSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    withText?: boolean;
    text?: string;
    color?: 'gold' | 'white' | 'dark';
}

const SIZES = {
    xs: 16,
    sm: 24,
    md: 48,
    lg: 80,
    xl: 120,
} as const;

export function BuddhistSpinner({
    size = 'md',
    className,
    withText = false,
    text = 'Loading...',
    color = 'gold',
}: BuddhistSpinnerProps) {
    const px = SIZES[size];

    const colors = {
        gold: {
            primary: '#C9960C',
            secondary: '#D4A860',
            glow: 'rgba(201,150,12,0.3)',
        },
        white: {
            primary: '#FFFFFF',
            secondary: 'rgba(255,255,255,0.7)',
            glow: 'rgba(255,255,255,0.2)',
        },
        dark: {
            primary: '#4A2C0A',
            secondary: '#8B6914',
            glow: 'rgba(74,44,10,0.3)',
        },
    }[color];

    const textSizes = {
        xs: 'text-[9px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    } as const;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3',
                className
            )}
            role="status"
            aria-label={text}
        >
            <svg
                width={px}
                height={px}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <defs>
                    {/* Radial glow behind hub */}
                    <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                    </radialGradient>

                    {/* Glow filter for the whole wheel */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── Outer ring — slow spin ── */}
                <g style={{ animation: 'dharma-spin 3s linear infinite', transformOrigin: '50px 50px' }}>
                    {/* Outer ring */}
                    <circle
                        cx="50" cy="50" r="44"
                        stroke={colors.primary}
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        opacity="0.9"
                    />
                    {/* 8 spoke tips (Bát Chánh Đạo) */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x1 = 50 + 34 * Math.cos(angle);
                        const y1 = 50 + 34 * Math.sin(angle);
                        const x2 = 50 + 44 * Math.cos(angle);
                        const y2 = 50 + 44 * Math.sin(angle);
                        return (
                            <line
                                key={i}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={colors.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>

                {/* ── Inner wheel — faster spin ── */}
                <g style={{ animation: 'dharma-spin 2s linear infinite', transformOrigin: '50px 50px' }}>
                    {/* 8 spokes */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x2 = 50 + 30 * Math.cos(angle);
                        const y2 = 50 + 30 * Math.sin(angle);
                        return (
                            <line
                                key={i}
                                x1="50" y1="50"
                                x2={x2} y2={y2}
                                stroke={colors.secondary}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                opacity="0.85"
                            />
                        );
                    })}

                    {/* Inner rim */}
                    <circle
                        cx="50" cy="50" r="30"
                        stroke={colors.primary}
                        strokeWidth="2"
                        opacity="0.7"
                        fill="none"
                    />

                    {/* 8 lotus petal shapes at rim */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const cx = 50 + 30 * Math.cos(angle);
                        const cy = 50 + 30 * Math.sin(angle);
                        return (
                            <ellipse
                                key={i}
                                cx={cx} cy={cy}
                                rx="4" ry="2.5"
                                fill={colors.primary}
                                opacity="0.7"
                                transform={`rotate(${i * 45 + 90}, ${cx}, ${cy})`}
                                style={{
                                    animation: `petal-pulse 1.6s ease-in-out ${i * 0.2}s infinite`,
                                }}
                            />
                        );
                    })}
                </g>

                {/* ── Glow behind center hub ── */}
                <circle cx="50" cy="50" r="12" fill="url(#hubGlow)" />

                {/* ── Center hub — static dharma wheel symbol ── */}
                <circle
                    cx="50" cy="50" r="9"
                    fill={colors.primary}
                    filter="url(#glow)"
                    opacity="0.95"
                />
                {/* Triratna dot (3 jewels) */}
                <circle cx="50" cy="50" r="3.5" fill="#FFF8E1" opacity="0.9" />
            </svg>

            {/* Text */}
            {withText && (
                <p
                    className={cn(
                        'font-medium tracking-widest uppercase',
                        textSizes[size],
                        color === 'gold' && 'text-gold-primary',
                        color === 'white' && 'text-white/80',
                        color === 'dark' && 'text-coffee-dark',
                    )}
                    style={{ animation: 'text-breathe 2s ease-in-out infinite' }}
                >
                    {text}
                </p>
            )}

            {/* CSS Animations — injected inline so no global CSS dependency */}
            <style>{`
                @keyframes dharma-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes petal-pulse {
                    0%, 100% { opacity: 0.4; transform-box: fill-box; }
                    50%       { opacity: 1.0; }
                }
                @keyframes text-breathe {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 1.0; }
                }
            `}</style>
        </div>
    );
}

/**
 * BuddhistSpinnerOverlay — full-screen overlay (for page transitions)
 */
export function BuddhistSpinnerOverlay({ text }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-coffee-dark/90 backdrop-blur-sm">
            {/* Vignette rings */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(201,150,12,0.08),transparent)]" />
            <BuddhistSpinner size="xl" withText text={text ?? 'Loading...'} color="gold" />
        </div>
    );
}

/**
 * InlineSpinner — tiny spinner để inline trong button text
 * Thay thế Loader2 với motif Phật giáo giản lược
 */
export function InlineSpinner({ className }: { className?: string }) {
    return (
        <svg
            className={cn('inline-block', className)}
            width="16" height="16"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            style={{ animation: 'dharma-spin 0.9s linear infinite', transformOrigin: '50% 50%', display: 'inline-block' }}
        >
            <circle cx="50" cy="50" r="40"
                stroke="currentColor" strokeWidth="10"
                strokeDasharray="60 200" strokeLinecap="round"
                opacity="0.9"
            />
            {/* Hub dot */}
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.7" />
            <style>{`
                @keyframes dharma-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </svg>
    );
}
