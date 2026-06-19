import React from 'react';
import { MinimalFooter } from './footers/minimal-footer';
import { ModernFooter } from './footers/modern-footer';
import { McAaronFooter } from './footers/mcaaron-footer';
import { InkFooter } from './footers/ink-footer';
import { CorporateFooter } from './footers/corporate-footer';

export function Footer({ settings = {}, layoutStyle = 'corporate', domain, isCompany = true, hasProjects, modulesConfig }: { 
    settings?: Record<string, string>, 
    layoutStyle?: string, 
    domain?: string, 
    isCompany?: boolean,
    hasProjects?: boolean,
    modulesConfig?: Record<string, boolean>
}) {
    const props = { settings, domain, isCompany: true, hasProjects, modulesConfig };

    switch (layoutStyle) {
        case 'saas_violet':
        case 'corp_navy':
        case 'charity_green':
        case 'creative_amber':
        case 'modern_tech':
        case 'corporate': 
        default:
            return <CorporateFooter {...props} />;
        case 'mcaaron': return <McAaronFooter {...props} />;
        case 'minimal_white':
        case 'minimal': 
            return <MinimalFooter {...props} />;
        case 'modern': return <ModernFooter {...props} />;
        case 'ink': return <InkFooter {...props} />;
    }
}