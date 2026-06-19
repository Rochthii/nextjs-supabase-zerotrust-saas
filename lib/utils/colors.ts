/**
 * Utility functions for color manipulation
 */

export function hexToRgbString(hex: string, fallbackRgb: string) {
    if (!hex) return fallbackRgb;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return fallbackRgb;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return fallbackRgb;
    return `${r} ${g} ${b}`;
}

export function darkenRgbString(rgbStr: string, factor: number): string {
    const parts = rgbStr.split(' ').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return rgbStr;
    const [r, g, b] = parts.map((v) => Math.max(0, Math.round(v * factor)));
    return `${r} ${g} ${b}`;
}

export function lightenRgbString(rgbStr: string, factor: number): string {
    const parts = rgbStr.split(' ').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return rgbStr;
    const [r, g, b] = parts.map((v) => Math.min(255, Math.round(v + (255 - v) * factor)));
    return `${r} ${g} ${b}`;
}
