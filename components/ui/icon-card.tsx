import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconCardProps {
    icon?: LucideIcon;
    emoji?: string;
    title: string;
    description: string;
    iconColor?: string;
    children?: React.ReactNode;
}

export function IconCard({ icon: Icon, emoji, title, description, iconColor, children }: IconCardProps) {
    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <div className={cn('p-4 bg-gray-50 rounded-full mb-4 transition-all duration-300 hover:scale-110', iconColor)}>
                        {emoji ? (
                            <span className="text-4xl">{emoji}</span>
                        ) : Icon ? (
                            <Icon className="h-8 w-8" />
                        ) : null}
                    </div>
                    <h3 className="font-playfair font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}
