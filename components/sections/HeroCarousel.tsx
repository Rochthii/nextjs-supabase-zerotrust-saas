'use client';

import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { KhmerCorner } from '@/components/ui/khmer-corner';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// ─── Icon map per CTA key ────────────────────────────────────────────────────
function CtaIcon({ keyName, className }: { keyName: string; className?: string }) {
    const icons: Record<string, React.ReactNode> = {
        learnMore: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        viewSchedule: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        viewRetreatSchedule: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        listenToDharma: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a6 6 0 010 12m-3.536-9.536a5 5 0 000 7.072" />
            </svg>
        ),
        donate: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        contact: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        registerNow: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
    };
    return <>{icons[keyName] ?? (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    )}</>;
}

interface HeroSlide {
    id: string;
    order_position: number;
    image_url: string;
    title_vi: string | null;
    title_km: string | null;
    title_en: string | null;
    subtitle_vi: string | null;
    subtitle_km: string | null;
    subtitle_en: string | null;
    cta1_enabled: boolean | null;
    cta1_text_key: string | null;
    cta1_link: string | null;
    cta2_enabled: boolean | null;
    cta2_text_key: string | null;
    cta2_link: string | null;
}

interface HeroCarouselProps {
    slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
    const locale = useLocale();
    const t = useTranslations('home.hero');

    // Setup Embla Carousel with autoplay
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 30 },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    // Update selected index on scroll
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    // Initialize scroll snaps
    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        onSelect();

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    // Manual navigation
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    // Get localized content
    const getSlideContent = (slide: HeroSlide) => {
        const title = locale === 'km' && slide.title_km
            ? slide.title_km
            : locale === 'en' && slide.title_en
                ? slide.title_en
                : slide.title_vi || '';

        const subtitle = locale === 'km' && slide.subtitle_km
            ? slide.subtitle_km
            : locale === 'en' && slide.subtitle_en
                ? slide.subtitle_en
                : slide.subtitle_vi || '';

        return { title, subtitle };
    };

    if (!slides || slides.length === 0) {
        // Fallback if no slides
        return (
            <section className="relative h-[600px] md:h-[700px] flex items-center justify-center bg-page-surface">
                <p className="text-stone-400">No hero slides available</p>
            </section>
        );
    }

    return (
        <section className="relative h-[65vh] sm:h-[600px] md:h-[750px] lg:h-[850px] overflow-hidden">
            {/* Decorative Khmer Corners */}
            <KhmerCorner position="top-left" size="md" />
            <KhmerCorner position="top-right" size="md" />
            <KhmerCorner position="bottom-left" size="md" className="hidden md:block" />
            <KhmerCorner position="bottom-right" size="md" className="hidden md:block" />

            {/* Embla Carousel */}
            <div className="h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, index) => {
                        const content = getSlideContent(slide);
                        const isPriority = index === 0;

                        return (
                            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0">
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={slide.image_url}
                                        alt={content.title}
                                        fill
                                        className="object-cover object-center"
                                        priority={isPriority}
                                        loading={isPriority ? undefined : 'lazy'}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                                        quality={85}
                                    />
                                    {/* Overlay - Dynamic intensity for readability */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 sm:from-black/50 sm:via-black/30 sm:to-black/60 z-10" />
                                </div>

                                {/* Content */}
                                <div className="relative z-20 h-full flex items-center justify-center">
                                    <div className="text-center text-white px-4 sm:px-6 max-w-4xl mx-auto animate-in fade-in zoom-in duration-700">
                                        {content.title && (
                                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white mb-3 sm:mb-5 drop-shadow-2xl leading-[1.1] sm:leading-tight px-2 break-words">
                                                {content.title}
                                            </h1>
                                        )}

                                        {content.subtitle && (
                                            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-9 text-gold-light/95 drop-shadow-md line-clamp-2 leading-relaxed px-2">
                                                {content.subtitle}
                                            </p>
                                        )}

                                        {/* CTA Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
                                            {/* Primary CTA */}
                                            {slide.cta1_enabled !== false && slide.cta1_link && (
                                                <Link href={slide.cta1_link} className="group">
                                                    <span className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] bg-gold-primary hover:bg-gold-dark text-white font-semibold text-sm sm:text-base rounded-xl shadow-[0_4px_20px_rgb(var(--theme-primary)/0.5)] hover:shadow-[0_4px_28px_rgb(var(--theme-primary)/0.7)] transition-all duration-200 group-hover:scale-[1.02] active:scale-[0.98]">
                                                        <CtaIcon keyName={slide.cta1_text_key || 'learnMore'} className="w-4 h-4 flex-shrink-0" />
                                                        {t(slide.cta1_text_key || 'learnMore')}
                                                    </span>
                                                </Link>
                                            )}

                                            {/* Secondary CTA */}
                                            {slide.cta2_enabled !== false && slide.cta2_link && (
                                                <Link href={slide.cta2_link} className="group">
                                                    <span className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/50 hover:border-white text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 group-hover:scale-[1.02] active:scale-[0.98]">
                                                        <CtaIcon keyName={slide.cta2_text_key || 'learnMore'} className="w-4 h-4 flex-shrink-0 opacity-80" />
                                                        {t(slide.cta2_text_key || 'learnMore')}
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile via CSS only (no JS resize listener) */}
            <>
                <button
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm transition-all"
                    onClick={scrollPrev}
                    disabled={!Boolean(emblaApi?.canScrollPrev())}
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm transition-all"
                    onClick={scrollNext}
                    disabled={!Boolean(emblaApi?.canScrollNext())}
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </>

            {/* Dots Navigation - Optimized for touch */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-20 pointer-events-none">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "transition-all duration-300 rounded-full shadow-sm min-w-[12px] min-h-[12px] flex items-center justify-center pointer-events-auto", // Larger touch target
                            index === selectedIndex
                                ? "w-4 h-4 bg-gold-primary scale-110"
                                : "w-3 h-3 bg-white/50 hover:bg-white"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === selectedIndex ? 'true' : 'false'}
                    />
                ))}
            </div>

            {/* Scroll Indicator (Mobile only) */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce z-20 md:hidden">
                <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </div>
            </div>
        </section>
    );
}
