'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface ThemeColorPickerProps {
    id: string;
    name: string;
    defaultValue: string;
    placeholder?: string;
}

export function ThemeColorPicker({ id, name, defaultValue, placeholder }: ThemeColorPickerProps) {
    return (
        <div className="flex gap-2 mt-1">
            <Input
                type="color"
                className="w-12 h-10 p-1"
                id={`${id}_picker`}
                defaultValue={defaultValue}
                onChange={(e) => {
                    const textInput = document.getElementById(id) as HTMLInputElement;
                    if (textInput) textInput.value = e.target.value;
                }}
            />
            <Input
                id={id}
                name={name}
                defaultValue={defaultValue}
                onChange={(e) => {
                    const colorPicker = document.getElementById(`${id}_picker`) as HTMLInputElement;
                    if (colorPicker) colorPicker.value = e.target.value;
                }}
                placeholder={placeholder}
            />
        </div>
    );
}
