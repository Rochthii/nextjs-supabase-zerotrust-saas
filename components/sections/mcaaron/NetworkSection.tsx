'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Landmark, Globe, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { BRAND_NAME_VI } from '@/lib/constants';

interface OrgData {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    org_type: string | null;
}

export function NetworkSection({ data, tenantId }: { data?: BlockConfig, tenantId?: string }) {
    const t = useTranslations('mcaaron');
    const [mounted, setMounted] = useState(false);
    const [organizations, setOrganizations] = useState<OrgData[]>([]);
    const content = data?.settings || {};

    const sectionBadge = content.sectionBadge || 'Mạng Lưới Đối Tác';
    const sectionTitleHtml = content.sectionTitleHtml || 'Hệ Sinh Thái <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#002B5B] to-[#00D2FF]">Tác Động.</span>';
    const sectionDesc = content.sectionDesc || `Danh sách các organization, doanh nghiệp xã hội và đối tác chiến lược đang cùng ${BRAND_NAME_VI} kiến tạo giá trị cộng đồng.`;

    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '600px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible && !mounted) {
            setMounted(true);
            const fetchData = async () => {
                try {
                    const supabase = await createClient(); // Use common client
                    let query = supabase
                        .from('organizations')
                        .select('id, name, logo_url, website_url, org_type')
                        .eq('is_active', true);

                    if (tenantId) {
                        query = query.eq('tenant_id', tenantId);
                    }

                    const { data: orgs } = await query;

                    if (orgs) {
                        setOrganizations(orgs);
                    }
                } catch (error) {
                    console.error("Error fetching network data:", error);
                }
            };
            fetchData();
        }
    }, [isVisible, mounted, tenantId]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    if (!mounted) {
        return <div ref={containerRef} className="py-24 min-h-[400px] bg-white flex items-center justify-center text-gray-400 animate-pulse">Loading danh sách mạng lưới...</div>;
    }

    return (
        <section ref={containerRef} className="relative py-24 overflow-hidden bg-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-b from-[#00D2FF]/3 to-transparent blur-[80px]" />
                <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-[#002B5B]/3 to-transparent blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#002B5B]/5 border border-[#002B5B]/10 mb-4"
                    >
                        <Globe className="w-4 h-4 text-[#00D2FF]" />
                        <span className="text-xs font-bold tracking-widest uppercase text-[#002B5B]">{sectionBadge}</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
                        dangerouslySetInnerHTML={{ __html: sectionTitleHtml }}
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 font-medium text-lg"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                {organizations.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {organizations.map((org) => (
                            <motion.a
                                key={org.id}
                                href={org.website_url || '#'}
                                target={org.website_url ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                variants={itemVariants}
                                className="group block p-6 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,43,91,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden h-full"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:bg-blue-50/50" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl group-hover:bg-[#002B5B]/5 transition-colors flex items-center justify-center overflow-hidden">
                                            {org.logo_url ? (
                                                <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-[#002B5B]" />
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter opacity-70">
                                            {org.org_type || 'Đối tác'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#002B5B] transition-colors line-clamp-2">{org.name}</h3>
                                    {org.website_url && (
                                        <p className="text-xs text-gray-400 mt-auto flex items-center gap-1.5 font-mono truncate">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            {org.website_url.replace('https://', '').replace('http://', '')}
                                        </p>
                                    )}
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                        System đang sync dữ liệu các organization liên kết.
                    </div>
                )}
            </div>
        </section>
    );
}

export default NetworkSection;
