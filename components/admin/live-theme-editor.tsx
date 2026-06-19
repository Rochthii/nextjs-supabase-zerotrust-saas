'use client';

/**
 * LiveThemeEditor — Fully upgraded admin theme customization component.
 *
 * Features:
 *  ✓ Live preview: CSS variables are injected into :root in real-time as colors change.
 *  ✓ Auto-derive: gold-dark, gold-light, hero, surface computed from core colors automatically.
 *  ✓ Mini-preview panel: visual preview of header, button, background, card, text.
 *  ✓ 1-click presets: 4 tenant presets that apply all 8 colors at once.
 *  ✓ Reset button: revert to saved settings.
 *  ✓ Derived values display: shows the auto-computed values in read-only chips.
 *  ✓ Saves to DB via parent form's FormData on submit.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';

// ── Color Math Utilities ─────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return null;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToStr(r: number, g: number, b: number): string {
    return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
}

function darken(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(...rgb.map(v => v * factor) as [number, number, number]);
}

function lighten(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(...rgb.map(v => v + (255 - v) * factor) as [number, number, number]);
}

// Derive all CSS variable values from the 8 core color inputs
function derivedVars(c: ThemeColors) {
    const primaryRgb = hexToRgb(c.primary);
    const textRgb = hexToRgb(c.text);
    const bgStartRgb = hexToRgb(c.bgStart);

    const primary = primaryRgb ? rgbToStr(...primaryRgb) : '245 158 11';
    const secondary = hexToRgb(c.secondary) ? rgbToStr(...hexToRgb(c.secondary)!) : '92 64 51';
    const text = textRgb ? rgbToStr(...textRgb) : '44 24 16';
    const accent = hexToRgb(c.accent) ? rgbToStr(...hexToRgb(c.accent)!) : '255 140 0';
    const bgStart = bgStartRgb ? rgbToStr(...bgStartRgb) : '254 249 243';
    const bgEnd = hexToRgb(c.bgEnd) ? rgbToStr(...hexToRgb(c.bgEnd)!) : '253 245 235';

    // Derived — override if user explicitly set, else auto-compute
    const heroHex = c.hero || darken(c.text, 0.55);
    const heroRgb = hexToRgb(heroHex);
    const hero = heroRgb ? rgbToStr(...heroRgb) : '26 15 9';

    const surfaceHex = c.surface || lighten(c.bgStart, 0.4);
    const surfaceRgb = hexToRgb(surfaceHex);
    const surface = surfaceRgb ? rgbToStr(...surfaceRgb) : '250 250 247';

    const primaryDark = hexToRgb(darken(c.primary, 0.85)) ? rgbToStr(...hexToRgb(darken(c.primary, 0.85))!) : '208 140 9';
    const primaryLight = hexToRgb(lighten(c.primary, 0.25)) ? rgbToStr(...hexToRgb(lighten(c.primary, 0.25))!) : '253 183 26';

    return { primary, secondary, text, accent, bgStart, bgEnd, hero, surface, primaryDark, primaryLight, heroHex, surfaceHex, patternOpacity: c.patternOpacity };
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    bgStart: string;
    bgEnd: string;
    hero: string;    // may be empty → auto-derived
    surface: string; // may be empty → auto-derived
    patternOpacity: string;
    headerBg: string; // Custom header background color
    footerBg: string; // Custom footer background color
}

interface ThemePreset {
    name: string;
    colors: ThemeColors;
}

// ── Tenant Presets (Layout-based) ───────────────────────────────────────────────────

const PRESETS: ThemePreset[] = [
    {
        name: 'Amber Classic',
        colors: {
            primary: '#F59E0B', secondary: '#5C4033', accent: '#FF8C00',
            text: '#2C1810', bgStart: '#FEF9F3', bgEnd: '#FDF5EB',
            hero: '#1A0F09', surface: '#FAFAF7', patternOpacity: '0.05', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Royal Crimson',
        colors: {
            primary: '#D4AF37', secondary: '#8B1E1E', accent: '#C59A28',
            text: '#3A1F1F', bgStart: '#F5F0E6', bgEnd: '#EBE2CD',
            hero: '#280F0F', surface: '#F8F5EE', patternOpacity: '0.05', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Forest Emerald',
        colors: {
            primary: '#2F6F4E', secondary: '#E8C547', accent: '#E8C547',
            text: '#132B1E', bgStart: '#FFFFFF', bgEnd: '#F0F5F2',
            hero: '#0A1F14', surface: '#F4F9F6', patternOpacity: '0.03', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Royal Violet',
        colors: {
            primary: '#5A3E8E', secondary: '#F2D16B', accent: '#F2D16B',
            text: '#271744', bgStart: '#F5F0E6', bgEnd: '#EBE2D0',
            hero: '#150C28', surface: '#F7F4F0', patternOpacity: '0.04', headerBg: '', footerBg: '',
        }
    },

    // ── Preset màu theo từng Layout Style ───────────────────────────────────
    {
        name: 'modern — Ánh Trăng',
        colors: {
            primary: '#C8B560', secondary: '#6FB3D3', accent: '#A89040',
            text: '#E8E4D9', bgStart: '#0D1B2A', bgEnd: '#162032',
            hero: '#060E18', surface: '#111D2B', patternOpacity: '0.04', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'minimal — Thuần Khiết',
        colors: {
            primary: '#B8860B', secondary: '#8A7A6A', accent: '#9A7209',
            text: '#1C1C1A', bgStart: '#FAFAF8', bgEnd: '#F3F0EA',
            hero: '#0E0E0D', surface: '#FFFFFF', patternOpacity: '0.02', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'lotus — Warm Coral',
        colors: {
            primary: '#C73B2A', secondary: '#F4A028', accent: '#E8896A',
            text: '#2D1A0E', bgStart: '#FDF6EE', bgEnd: '#FAF0E2',
            hero: '#1A0A05', surface: '#FEF9F2', patternOpacity: '0.05', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'angkor — Heritage',
        colors: {
            primary: '#D4A843', secondary: '#7A5C3A', accent: '#4A8C6F',
            text: '#F0E8D0', bgStart: '#2C1A0A', bgEnd: '#1E1106',
            hero: '#120800', surface: '#3A2518', patternOpacity: '0.07', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'zen — Nature Green',
        colors: {
            primary: '#2D6A4F', secondary: '#74C69D', accent: '#D4A843',
            text: '#1B4332', bgStart: '#F2F7F0', bgEnd: '#E8F2E5',
            hero: '#0D2418', surface: '#FFFFFF', patternOpacity: '0.03', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'sunrise — Morning',
        colors: {
            primary: '#E05C1A', secondary: '#F4A028', accent: '#BD4291',
            text: '#2A1506', bgStart: '#FFF8F0', bgEnd: '#FFF0E0',
            hero: '#160A03', surface: '#FFFBF5', patternOpacity: '0.04', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'festival — Neon Night',
        colors: {
            primary: '#FFD700', secondary: '#FF4D6D', accent: '#39D5A0',
            text: '#FFF8E7', bgStart: '#12023A', bgEnd: '#1A0550',
            hero: '#060118', surface: '#1C0A44', patternOpacity: '0.06', headerBg: '', footerBg: '',
        }
    },
];

// ── Business Presets (Enterprise) ───────────────────────────────────────────────

const BUSINESS_PRESETS: ThemePreset[] = [
    {
        name: 'Corporate Indigo',
        colors: {
            primary: '#4F46E5', secondary: '#1E293B', accent: '#06B6D4',
            text: '#0F172A', bgStart: '#F8FAFC', bgEnd: '#F1F5F9',
            hero: '#0F172A', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Tech Emerald',
        colors: {
            primary: '#059669', secondary: '#0F172A', accent: '#10B981',
            text: '#0F172A', bgStart: '#F0FDF4', bgEnd: '#DCFCE7',
            hero: '#0B251C', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Clean Minimal',
        colors: {
            primary: '#18181B', secondary: '#71717A', accent: '#A1A1AA',
            text: '#09090B', bgStart: '#FAFAFA', bgEnd: '#F4F4F5',
            hero: '#09090B', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Ocean Blue',
        colors: {
            primary: '#0284C7', secondary: '#1E293B', accent: '#0EA5E9',
            text: '#0F172A', bgStart: '#F0F9FF', bgEnd: '#E0F2FE',
            hero: '#0C1E30', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Sunset Orange',
        colors: {
            primary: '#EA580C', secondary: '#2D1A1A', accent: '#F97316',
            text: '#1C1111', bgStart: '#FFF7ED', bgEnd: '#FFEDD5',
            hero: '#2A1105', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    },
    {
        name: 'Royal Purple',
        colors: {
            primary: '#7C3AED', secondary: '#1E1B4B', accent: '#A78BFA',
            text: '#0F0E17', bgStart: '#FAF5FF', bgEnd: '#F3E8FF',
            hero: '#150A21', surface: '#FFFFFF', patternOpacity: '0.01', headerBg: '', footerBg: '',
        }
    }
];

// ── Main Component ──────────────────────────────────────────────────────────

export function LiveThemeEditor({ initialSettings, tenantType = 'tenant' }: { initialSettings: Record<string, string>; tenantType?: string }) {
    const isCompany = tenantType !== 'tenant';
    const activePresetsList = isCompany ? BUSINESS_PRESETS : PRESETS;

    const [colors, setColors] = useState<ThemeColors>({
        primary: initialSettings['theme_color_primary'] || (isCompany ? '#4F46E5' : '#F59E0B'),
        secondary: initialSettings['theme_color_secondary'] || (isCompany ? '#1E293B' : '#5C4033'),
        accent: initialSettings['theme_color_accent'] || (isCompany ? '#06B6D4' : '#FF8C00'),
        text: initialSettings['theme_color_text'] || (isCompany ? '#0F172A' : '#2C1810'),
        bgStart: initialSettings['theme_background_start'] || (isCompany ? '#F8FAFC' : '#FEF9F3'),
        bgEnd: initialSettings['theme_background_end'] || (isCompany ? '#F1F5F9' : '#FDF5EB'),
        hero: initialSettings['theme_hero'] || (isCompany ? '#0F172A' : '#1A0F09'),
        surface: initialSettings['theme_surface'] || (isCompany ? '#FFFFFF' : '#FAFAF7'),
        patternOpacity: initialSettings['theme_pattern_opacity'] || '0.05',
        headerBg: initialSettings['theme_header_bg'] || '',
        footerBg: initialSettings['theme_footer_bg'] || '',
    });

    const [customPresets, setCustomPresets] = useState<ThemePreset[]>(() => {
        try {
            const saved = initialSettings['custom_theme_presets'];
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const savedColors = useRef<ThemeColors>({ ...colors });
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [hasUnsaved, setHasUnsaved] = useState(false);

    // UI state for adding new preset
    const [isAddingPreset, setIsAddingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    // Live CSS variable injection
    useEffect(() => {
        const d = derivedVars(colors);
        const root = document.documentElement;
        root.style.setProperty('--theme-primary', d.primary);
        root.style.setProperty('--theme-secondary', d.secondary);
        root.style.setProperty('--theme-text', d.text);
        root.style.setProperty('--theme-accent', d.accent);
        root.style.setProperty('--theme-bg-start', d.bgStart);
        root.style.setProperty('--theme-bg-end', d.bgEnd);
        root.style.setProperty('--theme-hero', d.hero);
        root.style.setProperty('--theme-surface', d.surface);
        root.style.setProperty('--theme-primary-dark', d.primaryDark);
        root.style.setProperty('--theme-primary-light', d.primaryLight);
        root.style.setProperty('--theme-pattern-opacity', d.patternOpacity);

        const changed = JSON.stringify(colors) !== JSON.stringify(savedColors.current);
        setHasUnsaved(changed);
    }, [colors]);

    const setColor = useCallback((key: keyof ThemeColors, val: string) => {
        setColors(prev => ({ ...prev, [key]: val }));
        setActivePreset(null);
    }, []);

    const applyPreset = useCallback((preset: ThemePreset, isCustom: boolean = false) => {
        setColors({ ...preset.colors });
        setActivePreset(isCustom ? `custom_${preset.name}` : preset.name);
    }, []);

    const resetToSaved = useCallback(() => {
        setColors({ ...savedColors.current });
        setActivePreset(null);
    }, []);

    const handleSaveAsPreset = () => {
        if (!newPresetName.trim()) return;
        const newPreset: ThemePreset = {
            name: newPresetName.trim(),
            colors: { ...colors }
        };
        setCustomPresets([...customPresets, newPreset]);
        setActivePreset(`custom_${newPreset.name}`);
        setIsAddingPreset(false);
        setNewPresetName('');
        setHasUnsaved(true); // Treat adding preset as an unsaved state to encourage saving
    };

    const handleDeleteCustomPreset = (nameToDelete: string) => {
        if (!window.confirm(`Bạn có chắc muốn delete preset "${nameToDelete}"?`)) return;
        setCustomPresets(customPresets.filter(p => p.name !== nameToDelete));
        if (activePreset === `custom_${nameToDelete}`) {
            setActivePreset(null);
        }
        setHasUnsaved(true);
    };

    const d = derivedVars(colors);

    return (
        <div className="space-y-6">
            {/* Hidden inputs for form submission */}
            <input type="hidden" name="theme_color_primary" value={colors.primary} />
            <input type="hidden" name="theme_color_secondary" value={colors.secondary} />
            <input type="hidden" name="theme_color_accent" value={colors.accent} />
            <input type="hidden" name="theme_color_text" value={colors.text} />
            <input type="hidden" name="theme_background_start" value={colors.bgStart} />
            <input type="hidden" name="theme_background_end" value={colors.bgEnd} />
            <input type="hidden" name="theme_hero" value={colors.hero} />
            <input type="hidden" name="theme_surface" value={colors.surface} />
            <input type="hidden" name="theme_pattern_opacity" value={colors.patternOpacity} />
            <input type="hidden" name="theme_header_bg" value={colors.headerBg} />
            <input type="hidden" name="theme_footer_bg" value={colors.footerBg} />
            <input type="hidden" name="custom_theme_presets" value={JSON.stringify(customPresets)} />

            {/* ── Presets ─────────────────────────── */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-none mb-8">
                <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>🎨</span> {isCompany ? 'Bộ màu Enterprise Premium' : 'Bộ màu system Premium'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                        {activePresetsList.length} Themes {isCompany ? 'chuyên nghiệp' : 'nghiên cứu'}
                    </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {/* Fixed Presets */}
                    {activePresetsList.map(preset => {
                        const isActive = activePreset === preset.name;
                        return (
                            <button
                                key={`fixed_${preset.name}`}
                                type="button"
                                onClick={() => applyPreset(preset, false)}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 bg-slate-950/30 ${isActive
                                    ? 'border-amber-500/60 shadow-md scale-105 ring-4 ring-amber-500/10 bg-slate-900/50'
                                    : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/40 hover:scale-105'
                                    }`}
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <span className="w-7 h-7 rounded-full shadow-sm z-30" style={{ backgroundColor: preset.colors.primary }} />
                                    <span className="w-7 h-7 rounded-full shadow-sm z-20 -ml-2.5" style={{ backgroundColor: preset.colors.secondary }} />
                                    <span className="w-7 h-7 rounded-full shadow-sm z-10 -ml-2.5 border border-white/[0.08]" style={{ backgroundColor: preset.colors.surface || preset.colors.bgStart }} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 truncate w-full text-center">
                                    {preset.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* Custom Presets */}
                    {customPresets.map(preset => {
                        const isActive = activePreset === `custom_${preset.name}`;
                        return (
                            <div key={`custom_${preset.name}`} className="relative group flex">
                                <button
                                    type="button"
                                    onClick={() => applyPreset(preset, true)}
                                    className={`flex flex-col flex-1 items-center justify-center p-3.5 rounded-2xl border border-dashed transition-all duration-300 bg-slate-950/20 ${isActive
                                        ? 'border-amber-500/60 shadow-md scale-105 ring-4 ring-amber-500/10 bg-slate-900/50'
                                        : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/40 hover:scale-105'
                                        }`}
                                >
                                    <div className="flex items-center justify-center mb-3">
                                        <span className="w-7 h-7 rounded-full shadow-sm z-30" style={{ backgroundColor: preset.colors.primary }} />
                                        <span className="w-7 h-7 rounded-full shadow-sm z-20 -ml-2.5" style={{ backgroundColor: preset.colors.secondary }} />
                                        <span className="w-7 h-7 rounded-full shadow-sm z-10 -ml-2.5 border border-white/[0.08]" style={{ backgroundColor: preset.colors.surface || preset.colors.bgStart }} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 truncate w-full text-center">
                                        {preset.name}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomPreset(preset.name); }}
                                    className="absolute -top-1.5 -right-1.5 bg-red-950/80 text-red-400 hover:bg-red-600 hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-900/50 z-40"
                                    title="Delete preset này"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}

                    {/* Add New Custom Preset Button */}
                    <div className="relative flex items-center justify-center">
                        {!isAddingPreset ? (
                            <button
                                type="button"
                                onClick={() => setIsAddingPreset(true)}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-slate-950/30 transition-all w-full h-full min-h-[90px]"
                                title="Save bộ màu current thành một Preset mới"
                            >
                                <span className="text-2xl mb-1">+</span>
                                <span className="text-[10px] font-medium text-center text-slate-400">Save Preset</span>
                            </button>
                        ) : (
                            <div className="absolute top-0 left-0 flex flex-col gap-2 bg-slate-950 p-2.5 rounded-xl border border-white/[0.12] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200" style={{ width: '220px' }}>
                                <p className="text-xs font-semibold text-slate-200">Save bộ màu mới</p>
                                <input
                                    type="text"
                                    placeholder={isCompany ? "Name preset (VD: Corporate)" : "Name preset (VD: Mùa An Cư)"}
                                    value={newPresetName}
                                    onChange={e => setNewPresetName(e.target.value)}
                                    className="text-xs px-2.5 py-2 w-full border border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-900 text-white"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveAsPreset())}
                                />
                                <div className="flex gap-1.5 mt-1">
                                    <button
                                        type="button"
                                        onClick={handleSaveAsPreset}
                                        disabled={!newPresetName.trim()}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded text-[11px] font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddingPreset(false); setNewPresetName(''); }}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-1.5 rounded text-[11px] font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Color Pickers + Live Preview ─────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                {/* Left: Color Pickers */}
                <div className="space-y-5">
                    {/* Row 1: Core Colors */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">🎨 Colors chủ đạo</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ColorField label={isCompany ? "Màu Chủ đạo" : "Màu Chủ đạo (Gold)"} id="primary" value={colors.primary} onChange={v => setColor('primary', v)}
                                hint={isCompany ? "Colors chính cho nút bấm, liên kết và điểm nhấn thương hiệu" : "Nút bấm, badge, điểm nhấn chính"} />
                            <ColorField label={isCompany ? "Màu Phụ" : "Màu Phụ (Brown)"} id="secondary" value={colors.secondary} onChange={v => setColor('secondary', v)}
                                hint={isCompany ? "Dùng cho thanh định hướng, các details phụ trợ" : "Viền, icon phụ, section tử thứ cấp"} />
                            <ColorField label={isCompany ? "Màu Nhấn (Accent)" : "Accent (Saffron)"} id="accent" value={colors.accent} onChange={v => setColor('accent', v)}
                                hint={isCompany ? "Làm featured các section tử thu hút chú ý (Sale, Hot, v.v.)" : "Highlight đặc biệt, label featured"} />
                        </div>
                    </div>

                    {/* Row 2: Text + Backgrounds */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">🖌️ Nền & Chữ</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorField label="Màu Chữ Tiêu Đề" id="text" value={colors.text} onChange={v => setColor('text', v)}
                                hint="Title chính, đoạn văn, văn bản quan trọng" />
                            <div className="grid grid-cols-2 gap-2">
                                <ColorField label="Nền Gradient (trên)" id="bgStart" value={colors.bgStart} onChange={v => setColor('bgStart', v)}
                                    hint="Nền page gradient phía trên" compact />
                                <ColorField label="Nền Gradient (dưới)" id="bgEnd" value={colors.bgEnd} onChange={v => setColor('bgEnd', v)}
                                    hint="Nền page gradient phía dưới" compact />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Semantic Colors */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">⚙️ Màu Ngữ Nghĩa (tự tính nếu để trống)</p>
                        <p className="text-xs text-slate-400 mb-3">Các màu này tự động tính từ màu trên. Chỉ cần đặt nếu muốn override.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorField label="Hero Background (Header/Footer/CTA)" id="hero" value={colors.hero} onChange={v => setColor('hero', v)}
                                hint={`Tự tính: ${darken(colors.text, 0.55)}`} />
                            <ColorField label="Surface (Nền page — Ivory)" id="surface" value={colors.surface} onChange={v => setColor('surface', v)}
                                hint={`Tự tính: ${lighten(colors.bgStart, 0.4)}`} />
                        </div>
                    </div>

                    {/* Row 4: Pattern Opacity */}
                    <div>
                        <Label className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                            {isCompany ? `🌸 Độ mờ last namea tiết nền (${(parseFloat(colors.patternOpacity) * 100).toFixed(0)}%)` : `🌸 Độ mờ hoa văn nền Khmer (${(parseFloat(colors.patternOpacity) * 100).toFixed(0)}%)`}
                        </Label>
                        <input
                            type="range"
                            min="0.01"
                            max="0.15"
                            step="0.01"
                            value={colors.patternOpacity}
                            onChange={e => setColor('patternOpacity', e.target.value)}
                            className="w-full mt-2 accent-amber-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Mờ (1%)</span>
                            <span>Đậm (15%)</span>
                        </div>
                    </div>

                    
                    {/* Row 5: Custom Header & Footer Background */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">📐 Tùy chỉnh Nền Header & Footer</p>
                        <p className="text-[10px] text-slate-400 mb-3">Chỉ đặt khi bạn không muốn dùng màu nền default của Interface (Theme).</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorField label="Nền Header" id="headerBg" value={colors.headerBg} onChange={v => setColor('headerBg', v)}
                                hint="Ví dụ: #000000 hoặc để trống" />
                            <ColorField label="Nền Footer" id="footerBg" value={colors.footerBg} onChange={v => setColor('footerBg', v)}
                                hint="Ví dụ: #FFFFFF hoặc để trống" />
                        </div>
                    </div>

                    {/* Auto-derived display */}
                    <div className="bg-slate-950/40 rounded-xl p-4 border border-white/[0.06]">
                        <p className="text-xs font-semibold text-slate-300 mb-2">🔁 Màu tự động (not needed đặt)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <AutoColorChip label="gold-dark (hover)" hex={darken(colors.primary, 0.85)} />
                            <AutoColorChip label="gold-light (badge)" hex={lighten(colors.primary, 0.25)} />
                            <AutoColorChip label="hero (auto)" hex={darken(colors.text, 0.55)} />
                            <AutoColorChip label="surface (auto)" hex={lighten(colors.bgStart, 0.4)} />
                        </div>
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="sticky top-4 self-start bg-slate-900/10 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">👁️ View Trước Trực Tiếp</p>
                    <LivePreview colors={colors} tenantType={tenantType} />
                </div>
            </div>

            {/* Unsaved indicator */}
            {hasUnsaved && (
                <div className="flex items-center justify-between p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg">
                    <span className="text-xs text-amber-400 font-medium">⚠️ Bạn có thay đổi chưa save. Kéo xuống và nhấn "Save settings" để áp dụng vĩnh viễn.</span>
                    <button
                        type="button"
                        onClick={resetToSaved}
                        className="text-xs text-slate-400 hover:text-slate-200 underline ml-4 whitespace-nowrap"
                    >
                        Hoàn tác
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ColorField({ label, id, value, onChange, hint }: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    compact?: boolean;
}) {
    return (
        <div className="mb-1">
            <ColorPicker 
                label={label} 
                color={value} 
                onChange={onChange} 
            />
            {hint && <p className="text-[10px] text-slate-400 mt-1.5 leading-tight italic">{hint}</p>}
        </div>
    );
}

function AutoColorChip({ label, hex }: { label: string; hex: string }) {
    return (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-5 h-5 rounded border border-white/10 flex-shrink-0 shadow-sm" style={{ backgroundColor: hex }} />
            <div>
                <span className="font-medium text-slate-300">{label}</span>
                <br />
                <span className="font-mono text-slate-500">{hex}</span>
            </div>
        </div>
    );
}

function LivePreview({ colors, tenantType = 'tenant' }: { colors: ThemeColors; tenantType?: string }) {
    const isCompany = tenantType !== 'tenant';
    const primary = colors.primary;
    const hero = colors.hero || darken(colors.text, 0.55);
    const surface = colors.surface || lighten(colors.bgStart, 0.4);
    const goldLight = lighten(primary, 0.25);

    // Dynamic strings for Enterprise vs Temple
    const previewTitle = isCompany ? 'Name Enterprise' : 'Name Branch';
    const previewSubtitle = isCompany ? 'ENTERPRISE' : 'THERAVADA';
    const previewHeroTitle = isCompany ? 'Sản phẩm & Dịch vụ' : 'Pháp sự hằng ngày';
    const previewHeroSub = isCompany ? 'Giải pháp công nghệ vượt trội' : 'Nơi bình an và tu tập';
    const previewBtnText = isCompany ? 'Tìm hiểu add →' : 'Khám phá ngay →';
    const previewNewsTitle = isCompany ? 'News featured' : 'Lịch lễ tháng 3/2026';
    const previewNewsDesc = isCompany 
        ? 'Chúng tôi không ngừng đổi mới để mang lại những giá trị tối ưu nhất...'
        : 'Branch organization nhiều pháp sự quan trọng trong this month...';
    const previewCtaTitle = isCompany ? 'Hợp tác phát triển' : 'Hộ Trì Tam Bảo';
    const previewCtaBtn = isCompany ? 'Submit yêu cầu →' : 'Payment →';
    const previewNavItems = isCompany ? ['Homepage', 'Sản phẩm', 'Contact'] : ['About', 'News', 'Payment'];
    const previewFooterText = isCompany ? '© 2026 Enterprise · All rights reserved' : '© 2026 Branch · All rights reserved';

    return (
        <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg text-[10px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {/* Header preview */}
            <div className="px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hero }}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border flex-shrink-0" style={{ borderColor: primary, backgroundColor: `${primary}20` }} />
                    <div>
                        <div className="font-bold text-[9px] leading-tight" style={{ color: goldLight }}>{previewTitle}</div>
                        <div className="text-[7px]" style={{ color: `${goldLight}80` }}>{previewSubtitle}</div>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {previewNavItems.map(name => (
                        <div key={name} className="px-1 py-0.5 text-[7px] rounded" style={{ color: goldLight, opacity: 0.7 }}>{name}</div>
                    ))}
                </div>
            </div>

            {/* Hero section */}
            <div className="px-4 py-4 flex flex-col items-center text-center" style={{
                background: `linear-gradient(135deg, ${hero}, ${colors.text})`
            }}>
                <div className="text-[9px] font-bold" style={{ color: primary }}>{isCompany ? '✦ GIỚI THIỆU ✦' : '✦ CHÀO MỪNG ✦'}</div>
                <div className="text-sm font-bold mt-1 text-white leading-tight">{previewHeroTitle}</div>
                <div className="text-[8px] mt-1" style={{ color: goldLight }}>{previewHeroSub}</div>
                <div className="mt-2.5 px-3 py-1 rounded text-[8px] font-semibold" style={{ backgroundColor: primary, color: 'white' }}>
                    {previewBtnText}
                </div>
            </div>

            {/* Page content */}
            <div className="px-3 py-3" style={{ backgroundColor: surface }}>
                {/* Article card */}
                <div className="rounded-lg overflow-hidden border shadow-sm mb-2" style={{ borderColor: `${primary}20`, backgroundColor: 'white' }}>
                    <div className="p-2.5">
                        <div className="inline-block px-1.5 py-0.5 rounded text-[7px] font-semibold mb-1" style={{ backgroundColor: primary, color: 'white' }}>News</div>
                        <div className="font-bold text-[9px] text-gray-800 leading-tight mb-1">{previewNewsTitle}</div>
                        <div className="text-[8px] text-gray-500 line-clamp-2">{previewNewsDesc}</div>
                        <div className="flex items-center gap-1 mt-1.5" style={{ color: primary }}>
                            <span className="text-[8px] font-medium">View details →</span>
                        </div>
                    </div>
                </div>

                {/* Call to action bar */}
                <div className="rounded-lg p-2 text-center" style={{ backgroundColor: hero }}>
                    <div className="text-[8px] font-bold mb-1" style={{ color: goldLight }}>{previewCtaTitle}</div>
                    <div className="inline-block px-2 py-0.5 rounded text-[7px]" style={{ backgroundColor: primary, color: 'white' }}>{previewCtaBtn}</div>
                </div>
            </div>

            {/* Footer preview */}
            <div className="px-3 py-2 flex items-center justify-between border-t" style={{ backgroundColor: hero, borderColor: `${primary}20` }}>
                <div className="text-[7px]" style={{ color: `${goldLight}60` }}>{previewFooterText}</div>
                <div className="flex gap-1">
                    {['Fb', 'Ln'].map(s => (
                        <div key={s} className="w-4 h-4 rounded flex items-center justify-center text-[7px]" style={{ backgroundColor: `${goldLight}10`, color: goldLight }}>{s}</div>
                    ))}
                </div>
            </div>

            {/* Color palette strip */}
            <div className="flex h-2 w-full">
                {[primary, colors.secondary, colors.accent, hero, surface, goldLight].map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
            </div>
        </div>
    );
}
