import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';
import { getLockdownHtml } from './lib/security/lockdown-templates';
import { checkEdgeDefense } from './lib/security/edge-defense';

// 1. Pre-allocated Constants (Fixed memory allocation outside function)
const intlMiddleware = createMiddleware(routing);

const ROOT_ROUTES = ['/login', '/admin', '/collaborator', '/auth', '/forgot-password', '/update-password', '/council'];

const HOSTNAME_MAP: Record<string, string> = {
    'acme': 'acme-corp.tenantshield.dev',  // Demo B2B Enterprise Tenant
};

// Tenant whitelist allowed for switching via ?tenant= in production
const DEMO_TENANT_WHITELIST = new Set(['acme']);

/**
 * Multi-tenant Middleware - "Ultra Lean" Edition (Target < 4ms)
 * - Optimized string parsing for Edge Runtime
 * - Zero Object Allocation for internal routing
 * - Secure IP & Tenant resolution
 */
export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Hostname Resolution
    let hostname = request.headers.get('host') || 'localhost:3000';

    // Handle tenant switching via Query String
    // - In dev/local: allow any tenant param (UUID, domain, key)
    // - On production: ONLY allow keys in DEMO_TENANT_WHITELIST (secure, no arbitrary bypass)
    const searchParams = request.nextUrl.searchParams;
    const tenantParam = searchParams.get('tenant') || searchParams.get('tenant_id');
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('[::1]');
    const isDebug = process.env.NODE_ENV === 'development' || isLocal;

    // FIX: Track override state to prevent accidental reset to localhost below
    let tenantOverridden = false;
    if (tenantParam) {
        const isWhitelisted = DEMO_TENANT_WHITELIST.has(tenantParam);
        if (isDebug || isWhitelisted) {
            // Production: only accept whitelisted keys (mapped to real domains)
            if (HOSTNAME_MAP[tenantParam]) {
                hostname = HOSTNAME_MAP[tenantParam];
                tenantOverridden = true;
            } else if (isDebug) {
                // Dev only: allow direct UUID or domain
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantParam)) {
                    hostname = tenantParam;
                    tenantOverridden = true;
                } else if (tenantParam.includes('.')) {
                    hostname = tenantParam;
                    tenantOverridden = true;
                }
            }
        }
    }

    // Secure hostname normalization: only reset to localhost if NO tenant override exists
    if (isLocal && !tenantOverridden) {
        hostname = 'localhost:3000';
    }

    // 2. Secure Client IP Resolution (Prevent IP Spoofing on Cloudflare/Vercel)
    const clientIp = request.headers.get('cf-connecting-ip') || // Top priority from Cloudflare
                     request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     (request as any).ip || 
                     '127.0.0.1';

    let allowedIps: string[] | null = null;
    let isSuspended = false;
    let isIpBlocked = false;
    let blockReason = '';

    // 3. Parse Locale once — used for both error page and routing below
    let detectedLocale = 'en';
    let hasLocalePrefix = false;
    let pathNoLocale = pathname;

    if (pathname.length >= 3 && pathname[0] === '/') {
        const prefix = pathname.substring(1, 3);
        if (routing.locales.includes(prefix as any)) {
            const nextChar = pathname[3];
            if (!nextChar || nextChar === '/') {
                detectedLocale = prefix;
                hasLocalePrefix = true;
                pathNoLocale = pathname.substring(3) || '/';
            }
        }
    }

    // 4. Execute SOAR & IP Whitelist using Edge Defense Engine
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hostname !== 'localhost:3000') {
        const defenseResult = await checkEdgeDefense(clientIp, hostname, supabaseUrl, supabaseAnonKey);
        isSuspended = defenseResult.isSuspended;
        isIpBlocked = defenseResult.isIpBlocked;
        allowedIps = defenseResult.allowedIps;
        blockReason = defenseResult.blockReason;
    }

    // 5. Check and apply Edge security filters
    const lockdownStatus = isSuspended ? 'SUSPENDED' 
        : isIpBlocked ? 'IP_BLOCKED' 
        : (allowedIps && allowedIps.length > 0 && !allowedIps.includes(clientIp)) ? 'INTRANET_LOCKDOWN' 
        : null;

    if (lockdownStatus) {
        return new NextResponse(
            getLockdownHtml(lockdownStatus, clientIp, detectedLocale, blockReason),
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }

    // 6. Handle Root/Admin Routes (Block early and skip multi-tenant rewrite)
    const isRootRoute = ROOT_ROUTES.some(route => pathNoLocale === route || pathNoLocale.startsWith(route + '/'));

    if (isRootRoute) {
        if (hasLocalePrefix) {
            return NextResponse.redirect(new URL(`${pathNoLocale}${search}`, request.url));
        }
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    }

    // 7. Run next-intl Middleware
    const intlResponse = await intlMiddleware(request);

    if (intlResponse.status !== 200 && intlResponse.headers.has('location')) {
        return intlResponse;
    }

    // 8. Domain Rewrite for performance optimization
    const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite');
    let targetPath = pathname;

    if (rewriteHeader) {
        const protocolIdx = rewriteHeader.indexOf('://');
        if (protocolIdx !== -1) {
            const pathIdx = rewriteHeader.indexOf('/', protocolIdx + 3);
            targetPath = pathIdx !== -1 ? rewriteHeader.substring(pathIdx) : '/';
        } else {
            targetPath = rewriteHeader;
        }
    }

    // Rewrite request internally to specific tenant directory
    const response = NextResponse.rewrite(new URL(`/${hostname}${targetPath}${search}`, request.url));

    // Sync next-intl Headers
    const intlLocale = intlResponse.headers.get('x-next-intl-locale');
    if (intlLocale) response.headers.set('x-next-intl-locale', intlLocale);

    const setCookie = intlResponse.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);

    response.headers.set('x-pathname', pathname);

    return response;
}

export const config = {
    matcher: [
        /*
         * Fast filter: Skip api, static, images, favicon and files with extensions (media assets)
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
    ],
};
