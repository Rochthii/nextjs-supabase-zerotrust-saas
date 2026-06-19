import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Supabase domain for CSP — safe parse, fallback if env var missing
let supabaseHost = '*.supabase.co';
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // Keep fallback
}

// Security headers — defense in depth
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  },
  // NOTE: Content-Security-Policy intentionally removed — requires browser testing
  // per-environment to avoid breaking Supabase client, YouTube, FB embeds, etc.
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage only — avoid wildcard **
        protocol: 'https',
        hostname: supabaseHost,
      },
      {
        // Cloudinary CDN — used after Phase 5 when migrating media to Cloudinary
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // YouTube thumbnails
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        // Wikipedia images (used in some content)
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        // External tenant image used in /gioi-thieu hero
        protocol: 'https',
        hostname: 'chuaadida.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Device sizes optimized for common mobile breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@tiptap/react',
      'lodash'
    ],
  },
  // Headers: Security + Caching
  async redirects() {
    return [
      {
        source: '/admin/audit-log',
        destination: '/admin/audit-logs',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:locale/du-an',
        destination: '/:locale/transactions',
      },
      {
        source: '/:locale/du-an/:path*',
        destination: '/:locale/transactions/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets (JS/CSS chunks) — immutable 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache optimized images — 1 day, stale-while-revalidate 1 week
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // Cache public assets (fonts, icons) — 1 year
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

// Only wrap with bundle analyzer when ANALYZE=true
let config = withNextIntl(nextConfig);
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
  config = withBundleAnalyzer(config);
}

export default config;
