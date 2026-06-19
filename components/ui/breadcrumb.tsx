import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-6", className)}>
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 text-gold-primary flex-shrink-0" />
                    )}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-600 hover:text-gold-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
