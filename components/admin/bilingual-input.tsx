'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { KhmerCorner } from '@/components/ui/khmer-corner';

interface BilingualInputProps {
    label: string;
    valueVi: string;
    valueKm: string;
    onChangeVi: (value: string) => void;
    onChangeKm: (value: string) => void;
    placeholderVi?: string;
    placeholderKm?: string;
    multiline?: boolean;
    className?: string;
    required?: boolean;
}

export function BilingualInput({
    label,
    valueVi,
    valueKm,
    onChangeVi,
    onChangeKm,
    placeholderVi = 'Nhập content tiếng Việt...',
    placeholderKm = 'Nhập content tiếng Khmer...',
    multiline = false,
    className,
    required = false,
}: BilingualInputProps) {
    const [activeTab, setActiveTab] = React.useState('vi');

    const InputComponent = multiline ? Textarea : Input;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="vi" className="text-xs">Tiếng Việt</TabsTrigger>
                        <TabsTrigger value="km" className="text-xs font-khmer">ភាsaa Khmer</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="vi" className="mt-0">
                        <InputComponent
                            value={valueVi}
                            onChange={(e) => onChangeVi(e.target.value)}
                            placeholder={placeholderVi}
                            className={cn(
                                "bg-white border-gray-200 focus:border-gold-primary transition-all",
                                multiline ? "min-h-[120px]" : "h-11"
                            )}
                        />
                    </TabsContent>
                    <TabsContent value="km" className="mt-0 relative">
                        <div className="relative">
                            <InputComponent
                                value={valueKm}
                                onChange={(e) => onChangeKm(e.target.value)}
                                placeholder={placeholderKm}
                                className={cn(
                                    "bg-white border-gray-200 focus:border-gold-primary transition-all font-khmer",
                                    multiline ? "min-h-[120px]" : "h-11"
                                )}
                            />
                            <KhmerCorner position="top-right" className="absolute top-0 right-0 pointer-events-none opacity-20 w-16 h-16" />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
