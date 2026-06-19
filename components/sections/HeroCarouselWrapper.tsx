'use client';
import Image from 'next/image';
import { HeroCarousel } from './HeroCarousel';

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

interface Props {
  slides: HeroSlide[];
}

export function HeroCarouselWrapper({ slides }: Props) {
  const firstSlide = slides[0];

  return (
    // svh = small viewport height — avoids iOS browser chrome causing layout jump
    // min-h-[320px] ensures iPhone SE (375px wide) has a proper hero height
    <div className="relative min-h-[320px] h-[60svh] sm:h-[580px] md:h-[700px]">
      {/*
       * STATIC FIRST SLIDE IMAGE — rendered by Server Component.
       * fetchpriority="high" is set automatically by Next.js when priority=true.
       * This image is discovered by the browser's preload scanner instantly.
       */}
      {firstSlide && (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={firstSlide.image_url}
            alt={firstSlide.title_vi || 'Hero image'}
            fill
            className="object-cover"
            priority
            // Critical: sizes tells browser exact pixel width at each breakpoint
            // so it downloads the right srcset variant — not the 100vw default
            sizes="100vw"
            quality={90}
          />
          {/* Overlay matches exactly what HeroCarousel renders */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
      )}


      {/*
       * INTERACTIVE CAROUSEL — hydrates over the static image above.
       * absolute + inset-0 so it perfectly overlays the static image.
       * On first render (before hydration), the static image shows.
       * After hydration, carousel takes over seamlessly.
       */}
      <div className="absolute inset-0 z-10">
        <HeroCarousel slides={slides} />
      </div>
    </div>
  );
}
