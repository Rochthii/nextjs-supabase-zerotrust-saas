'use client';

import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Pipette } from 'lucide-react';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase().padStart(6, '0');
}

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
    className?: string;
}

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
    // Ensure color starts with #
    const safeColor = color.startsWith('#') ? color : `#${color}`;
    
    const [isOpen, setIsOpen] = useState(false);
    const [internalColor, setInternalColor] = useState(safeColor);
    
    // Sync internal state when opened
    useEffect(() => {
        if (isOpen) {
            setInternalColor(safeColor);
        }
    }, [isOpen, safeColor]);

    const rgb = hexToRgb(internalColor);

    const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;
        if (num > 255) num = 255;
        if (num < 0) num = 0;
        
        const newRgb = { ...rgb, [component]: num };
        setInternalColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInternalColor(val.startsWith('#') ? val : `#${val}`);
    };

    const handleSave = () => {
        onChange(internalColor);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    const pickColorWithEyeDropper = async () => {
        try {
            // @ts-ignore - EyeDropper API is not fully typed yet
            if ('EyeDropper' in window) {
                // @ts-ignore
                const eyeDropper = new EyeDropper();
                const result = await eyeDropper.open();
                setInternalColor(result.sRGBHex);
            } else {
                alert('Trình duyệt của bạn không hỗ trợ tính năng EyeDropper.');
            }
        } catch (e) {
            console.log('EyeDropper cancelled or failed', e);
        }
    };

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {label && (
                <label className="text-xs font-medium text-gray-600 mb-0.5">
                    {label}
                </label>
            )}
            
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="group relative flex items-center gap-2 w-full h-11 px-3 rounded-lg border border-gray-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all text-left"
                    >
                        <div 
                            className="w-6 h-6 rounded-md border border-black/5 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: safeColor || '#FFFFFF' }}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[11px] text-gray-400 uppercase font-mono truncate leading-none">
                                HEX CODE
                            </span>
                            <span className="text-sm font-semibold text-gray-700 font-mono">
                                {safeColor.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-gray-300 group-hover:text-amber-500 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </button>
                </PopoverTrigger>
                
                <PopoverContent className="w-auto p-4 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border-gray-200 rounded-xl z-[100]" align="start">
                    <div className="w-[260px] flex flex-col custom-color-picker">
                        
                        <div className="relative">
                            <HexColorPicker 
                                color={internalColor} 
                                onChange={setInternalColor} 
                            />
                            
                            {/* Toolbar below Saturation: Color Circle, Eyedropper, (Hue is handled by react-colorful via CSS) */}
                            <div className="absolute bottom-[2px] left-0 flex items-center gap-2 z-10">
                                <div 
                                    className="w-6 h-6 rounded-full shadow-inner border border-black/10" 
                                    style={{ backgroundColor: internalColor }} 
                                />
                                <button 
                                    type="button" 
                                    onClick={pickColorWithEyeDropper}
                                    className="w-6 h-6 rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100 bg-white shadow-sm"
                                    title="Hút màu"
                                >
                                    <Pipette className="w-3.5 h-3.5 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Labels & Inputs Grid */}
                        <div className="mt-4">
                            <div className="grid grid-cols-[1fr_45px_45px_45px] gap-2 mb-1.5">
                                <span className="text-[11px] font-medium text-gray-500">Hệ lục phân</span>
                                <span className="text-[11px] font-medium text-gray-500 text-center">R</span>
                                <span className="text-[11px] font-medium text-gray-500 text-center">G</span>
                                <span className="text-[11px] font-medium text-gray-500 text-center">B</span>
                            </div>
                            <div className="grid grid-cols-[1fr_45px_45px_45px] gap-2">
                                <input
                                    type="text"
                                    value={internalColor}
                                    onChange={handleHexChange}
                                    className="border border-gray-300 rounded-md text-xs px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-gray-700"
                                    maxLength={7}
                                />
                                <input type="number" value={rgb.r} onChange={e => handleRgbChange('r', e.target.value)} className="border border-gray-300 rounded-md text-xs text-center py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700" />
                                <input type="number" value={rgb.g} onChange={e => handleRgbChange('g', e.target.value)} className="border border-gray-300 rounded-md text-xs text-center py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700" />
                                <input type="number" value={rgb.b} onChange={e => handleRgbChange('b', e.target.value)} className="border border-gray-300 rounded-md text-xs text-center py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-gray-100">
                            <button 
                                type="button" 
                                onClick={handleCancel} 
                                className="px-4 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSave} 
                                className="px-5 py-1.5 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                Ok
                            </button>
                        </div>

                        <style jsx global>{`
                            .custom-color-picker .react-colorful {
                                width: 100% !important;
                                height: 180px !important;
                                display: flex;
                                flex-direction: column;
                            }
                            .custom-color-picker .react-colorful__saturation {
                                border-radius: 8px 8px 0 0;
                                flex-grow: 1;
                                margin-bottom: 12px;
                            }
                            .custom-color-picker .react-colorful__hue {
                                height: 16px;
                                border-radius: 8px;
                                width: calc(100% - 70px) !important;
                                margin-left: auto;
                            }
                            .custom-color-picker .react-colorful__pointer {
                                width: 20px;
                                height: 20px;
                                border-width: 2px;
                            }
                        `}</style>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
