'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
import { BlockConfig } from '@/lib/types/layout-blocks';
import { hexToRgbString, darkenRgbString, lightenRgbString } from '@/lib/utils/colors';

interface PreviewSyncProps {
    initialBlocks: BlockConfig[];
    initialThemeColors: any;
    tenantId: string;
    locale: string;
    dataContext: any;
}

export default function PreviewSync({
    initialBlocks,
    initialThemeColors,
    tenantId,
    locale,
    dataContext
}: PreviewSyncProps) {
    const [blocks, setBlocks] = useState<BlockConfig[]>(initialBlocks);
    const [themeColors, setThemeColors] = useState(initialThemeColors || {});

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Ensure the message comes from the same origin (or check specifically if needed)
            if (event.data?.type === 'LAYOUT_UPDATE') {
                if (event.data.blocks) {
                    setBlocks(event.data.blocks);
                }
                if (event.data.themeColors) {
                    setThemeColors(event.data.themeColors);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Submit 'READY' signal to let parent know the iframe is ready to receive sync
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Calculate CSS Variables for Theme (similar to DynamicPageBuilder)
    const tColors = themeColors || {};
    const settings = dataContext.settings || {};

    const primaryStr = hexToRgbString(tColors.primary || settings['theme_color_primary'], '245 158 11');
    const secondaryStr = hexToRgbString(tColors.secondary || settings['theme_color_secondary'], '92 64 51');
    const textStr = hexToRgbString(tColors.text || settings['theme_color_text'], '44 24 16');
    const accentStr = hexToRgbString(tColors.accent || settings['theme_color_accent'], '255 140 0');
    const bgStartStr = hexToRgbString(tColors.background || tColors.bgStart || settings['theme_background_start'], '254 249 243');
    const bgEndStr = hexToRgbString(tColors.bgEnd || settings['theme_background_end'], '253 245 235');

    const themeVars = {
        primary: primaryStr,
        secondary: secondaryStr,
        text: textStr,
        accent: accentStr,
        bgStart: bgStartStr,
        bgEnd: bgEndStr,
        primaryDark: tColors.primaryDark ? hexToRgbString(tColors.primaryDark, '218 165 32') : darkenRgbString(primaryStr, 0.85),
        primaryLight: tColors.primaryLight ? hexToRgbString(tColors.primaryLight, '253 183 26') : lightenRgbString(primaryStr, 0.25),
        hero: tColors.hero ? hexToRgbString(tColors.hero, '26 15 9') : (settings['theme_hero'] ? hexToRgbString(settings['theme_hero'], '26 15 9') : darkenRgbString(textStr, 0.55)),
        surface: tColors.surface ? hexToRgbString(tColors.surface, '250 250 247') : (settings['theme_surface'] ? hexToRgbString(settings['theme_surface'], '250 250 247') : lightenRgbString(bgStartStr, 0.4)),
        patternOpacity: tColors.opacity || settings['theme_pattern_opacity'] || '0.05'
    };

    const visibleBlocks = blocks.filter(b => b.visible);

    return (
        <div className="w-full bg-white min-h-screen">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                        --theme-primary: ${themeVars.primary};
                        --theme-secondary: ${themeVars.secondary};
                        --theme-text: ${themeVars.text};
                        --theme-accent: ${themeVars.accent};
                        --theme-bg-start: ${themeVars.bgStart};
                        --theme-bg-end: ${themeVars.bgEnd};
                        --theme-primary-dark: ${themeVars.primaryDark};
                        --theme-primary-light: ${themeVars.primaryLight};
                        --theme-hero: ${themeVars.hero};
                        --theme-surface: ${themeVars.surface};
                        --theme-pattern-opacity: ${themeVars.patternOpacity};
                    }
                `
                }}
            />

            {visibleBlocks.map(block => {
                const type = block.type || `traditional_${block.id}`;
                const registryEntry = SECTION_REGISTRY[type as keyof typeof SECTION_REGISTRY];

                if (!registryEntry) return null;

                const Component = registryEntry.component;

                // If Component is a normal function (not a complex memo/forwardRef)
                // We pass the entire dataContext in
                return (
                    <Suspense key={block.id} fallback={<div className="animate-pulse bg-gray-100 w-full h-48" />}>
                        <Component
                            {...dataContext}
                            {...(block.settings || {})}
                            isPreview={true} // Signal to the component that it is in preview mode
                        />
                    </Suspense>
                );
            })}
        </div>
    );
}
