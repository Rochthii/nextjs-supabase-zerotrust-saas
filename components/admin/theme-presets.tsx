'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ThemePreset {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        bgStart: string;
        bgEnd: string;
        opacity: string;
        // Semantic derived colors (optional — auto-computed if not set)
        hero: string;    // --theme-hero: deep dark for Header/Footer/Hero sections
        surface: string; // --theme-surface: ivory page background
    };
}

const THEME_PRESETS: ThemePreset[] = [
    {
        name: 'Amber Classic',
        colors: {
            primary: '#F59E0B',
            secondary: '#5C4033',
            accent: '#FF8C00',
            text: '#2C1810',
            bgStart: '#FEF9F3',
            bgEnd: '#FDF5EB',
            opacity: '0.05',
            hero: '#1A0F09',    // Very dark coffee
            surface: '#FAFAF7', // Warm ivory
        }
    },
    {
        name: 'Royal Crimson',
        colors: {
            primary: '#D4AF37',  // Gold
            secondary: '#8B1E1E', // Dark red
            accent: '#C59A28',   // Dark gold
            text: '#3A1F1F',     // Dark red-brown text
            bgStart: '#F5F0E6',  // Ivory white
            bgEnd: '#EBE2CD',    // Darker ivory white
            opacity: '0.05',
            hero: '#280F0F',     // Dark red-black
            surface: '#F8F5EE',  // Pale ivory yellow
        }
    },
    {
        name: 'Forest Emerald',
        colors: {
            primary: '#2F6F4E',   // Dark green
            secondary: '#E8C547', // Pale yellow
            accent: '#E8C547',
            text: '#132B1E',      // Dark green-black text
            bgStart: '#FFFFFF',
            bgEnd: '#F0F5F2',     // White with greenish tint
            opacity: '0.03',
            hero: '#0A1F14',      // Dark green-black
            surface: '#F4F9F6',   // White with slight green tint
        }
    },
    {
        name: 'Royal Violet',
        colors: {
            primary: '#5A3E8E',   // Primary purple
            secondary: '#F2D16B', // Pale yellow
            accent: '#F2D16B',
            text: '#271744',      // Deep purple-black text
            bgStart: '#F5F0E6',
            bgEnd: '#EBE2D0',
            opacity: '0.04',
            hero: '#150C28',      // Dark purple-black
            surface: '#F7F4F0',   // Soft cream white
        }
    }
];

export function ThemePresets() {
    const applyTheme = (preset: ThemePreset) => {
        const mappings = [
            { id: 'theme_color_primary', val: preset.colors.primary },
            { id: 'theme_color_secondary', val: preset.colors.secondary },
            { id: 'theme_color_accent', val: preset.colors.accent },
            { id: 'theme_color_text', val: preset.colors.text },
            { id: 'theme_background_start', val: preset.colors.bgStart },
            { id: 'theme_background_end', val: preset.colors.bgEnd },
            { id: 'theme_hero', val: preset.colors.hero },
            { id: 'theme_surface', val: preset.colors.surface },
        ];

        mappings.forEach(({ id, val }) => {
            // Update text input
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = val;

            // Update color picker
            const picker = document.getElementById(`${id}_picker`) as HTMLInputElement;
            if (picker) picker.value = val;
        });
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Quick presets (Apply with 1-click):</h3>
            <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map((preset) => (
                    <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => applyTheme(preset)}
                        style={{
                            borderColor: preset.colors.primary,
                            backgroundColor: preset.colors.bgStart,
                            color: preset.colors.text
                        }}
                    >
                        <span
                            className="w-3 h-3 rounded-full mr-2 inline-block"
                            style={{ backgroundColor: preset.colors.primary }}
                        />
                        {preset.name}
                    </Button>
                ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">*Note: After choosing a preset above, you must scroll down and click "Save settings" for the color changes to take effect on the website.</p>
        </div>
    );
}
