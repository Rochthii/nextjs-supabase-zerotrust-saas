import React from 'react';
import { MODERN_REGISTRY } from './registry/modern';
import { ARTISTIC_REGISTRY } from './registry/artistic';

export type SectionDataKey =
    | 'locale'
    | 'tenantId'
    | 'heroSlides'
    | 'dharmaTalks'
    | 'settings'
    | 'introSection'
    | 'abbotSection'
    | 'architectureSection'
    | 'calendarEvents'
    | 'news'
    | 'categories'
    | 'aboutSections'
    | 'upcomingEvents'
    | 'nextMajorFestival';

export type SectionDataMap = {
    locale?: string;
    tenantId?: string;
    heroSlides?: any[];
    dharmaTalks?: any[];
    settings?: any;
    introSection?: any;
    abbotSection?: any;
    architectureSection?: any;
    calendarEvents?: any[];
    news?: any[];
    aboutSections?: any[];
    upcomingEvents?: any[];
    nextMajorFestival?: any;
};

export const SECTION_REGISTRY: Record<string, {
    name: string;
    description: string;
    category: 'hero' | 'news' | 'dharma' | 'events' | 'about' | 'spiritual' | 'quotes' | 'cta' | 'social' | 'transparency';
    group: 'HERO' | 'INTRO' | 'TRIPLE_GEM' | 'QUOTE_BANNER' | 'NEWS' | 'DHARMA' | 'EVENTS' | 'SOCIAL' | 'LEGACY';
    icon?: string;
    component: React.ComponentType<any>;
    requiredData?: SectionDataKey[];
}> = {
    ...MODERN_REGISTRY,
    ...ARTISTIC_REGISTRY,
};