'use client';

import React from 'react';
import { MinimalHeader } from './headers/minimal-header';
import { ModernHeader } from './headers/modern-header';
import { McAaronHeader } from './headers/mcaaron-header';
import { InkHeader } from './headers/ink-header';
import { CorporateHeader } from './headers/corporate-header';
import { BlockConfig } from '@/lib/types/layout-blocks';

export type HeaderProps = {
    settings?: Record<string, string>;
    categoriesTree?: any;
    pagesTree?: any;
    aboutSectionsTree?: any;
    layoutStyle?: string;
    layoutBlocks?: BlockConfig[];
    domain?: string;
    modulesConfig?: Record<string, boolean>;
    isCompany?: boolean;
    hasProjects?: boolean;
    navVisibility?: Record<string, boolean>;
};

export function Header({ settings = {}, layoutStyle = 'corporate', layoutBlocks = [], domain, modulesConfig, isCompany = true, hasProjects, navVisibility = {} }: HeaderProps) {
    const props = { 
        settings, 
        layoutBlocks: layoutBlocks || [], 
        domain, 
        modulesConfig, 
        isCompany: true, 
        hasProjects, 
        navVisibility: navVisibility || {} 
    };

    switch (layoutStyle) {
        case 'saas_violet':
        case 'corp_navy':
        case 'charity_green':
        case 'creative_amber':
        case 'modern_tech':
        case 'corporate': 
        default:
            return <CorporateHeader {...props} />;
        case 'mcaaron': return <McAaronHeader {...props} />;
        case 'minimal_white':
        case 'minimal': 
            return <MinimalHeader {...props} />;
        case 'modern': return <ModernHeader {...props} />;
        case 'ink': return <InkHeader {...props} />;
    }
}