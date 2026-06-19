import React from 'react';
import { cn } from '@/lib/utils';

interface HeritageTextureProps {
    className?: string;
    opacity?: number;
    withPattern?: boolean;
    patternOpacity?: number;
    variant?: 'light' | 'dark';
}

/**
 * HeritageTexture - A utility component to inject cinematic texture and sacred patterns
 * into any section. Part of the "Heritage Editorial" design system.
 */
export function HeritageTexture({ 
    className, 
    opacity = 0.1, 
    withPattern = true, 
    patternOpacity = 0.04,
    variant = 'light'
}: HeritageTextureProps) {
    return (
        <div className={cn("absolute inset-0 pointer-events-none select-none overflow-hidden z-0", className)}>
            {/* --- Film Grain / Paper Base --- */}
            <div 
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000",
                    variant === 'dark' ? "mix-blend-soft-light" : "mix-blend-overlay"
                )}
                style={{ 
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                    opacity: opacity
                }} 
            />
            
            {/* --- Noise Static (Optional Subtlety) --- */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply bg-[url('/noise.png')]" />

            {/* --- Sacred Khmer Patterns (Corner Accents) --- */}
            {withPattern && (
                <>
                    {/* Top Left Accent */}
                    <div 
                        className={cn(
                            "absolute top-0 left-0 w-[500px] h-[500px] bg-[url('/images/pattern-khmer.png')] bg-repeat rotate-[-12deg] -translate-x-[15%] -translate-y-[20%]",
                            variant === 'dark' ? "invert opacity-10" : "opacity-100"
                        )}
                        style={{ opacity: patternOpacity }}
                    />
                    
                    {/* Bottom Right Accent */}
                    <div 
                        className={cn(
                            "absolute bottom-0 right-0 w-[500px] h-[500px] bg-[url('/images/pattern-khmer.png')] bg-repeat rotate-[168deg] translate-x-[15%] translate-y-[20%]",
                            variant === 'dark' ? "invert opacity-10" : "opacity-100"
                        )}
                        style={{ opacity: patternOpacity }}
                    />

                    {/* Subtle Center Wash (Spiritual Aura) */}
                    <div 
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-[160px]",
                            variant === 'dark' ? "bg-white/[0.03]" : "bg-black/[0.02]"
                        )}
                    />
                </>
            )}
        </div>
    );
}
