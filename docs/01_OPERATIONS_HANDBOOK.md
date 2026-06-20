# 01 — Operations Handbook

> **Standard Operations Document — TenantShield Enterprise Core**  
> **Topic:** Secure Multi-tenant SaaS: Applying RLS and Audit Log in Information Risk Management.  
> **Updated:** 2026-05-16

---

## 1) Scope

This document describes the operation of the Next.js + Supabase system based on the multi-tenant model, including:

- Runtime environment and required environment variables.
- Build/deploy/runtime on Vercel.
- Monitoring and error observation.
- Post-deploy checklist.

---

## 2) Runtime Architecture

### 2.1 Main Components

- App runtime: Next.js App Router.
- Database/Auth/Storage: Supabase.
- Error tracking: Sentry.
- Analytics: Vercel Analytics, PostHog (if enabled).

### 2.2 Key Technical Points to Remember

- `middleware.ts`: resolve host/locale and rewrite multi-tenant paths.
- `lib/tenant.ts`: cache tenant configuration by domain/id/subdomain.
- `lib/cache/queries.ts`: cache public data (`unstable_cache`) with tags by tenant.
- `lib/cache/revalidate.ts`: surgical invalidation by tag/path.

---

## 3) Environment Variables

### 3.1 Required Group (core)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (used in specialized backend flows)

### 3.2 Security & Cron Group

- `CRON_SECRET` (protects cron routes)
- `REVALIDATE_SECRET` (HMAC authentication for revalidate webhooks)

### 3.3 Monitoring & Notification Group

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `RESEND_API_KEY` (email reminder)

### 3.4 Media Group (if used)

- `CLOUDINARY_URL`

---

## 4) Deploy & Production Configuration

### 4.1 Vercel

- Region configured in `vercel.json`: `sin1`.
- Cron jobs run according to `vercel.json` (see cron/backup runbook).

### 4.2 Security Headers

Configured in `next.config.ts` including:

- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Note: CSP is currently commented out to avoid breaking external integrations.

### 4.3 Remote Image Patterns

`next.config.ts` allows image domains from:

- Supabase Storage host
- `res.cloudinary.com`
- YouTube thumbnails (`img.youtube.com`, `i.ytimg.com`)
- Some whitelisted external hosts

---

## 5) Standard Build/Test Before Release

Minimum execution:

1. `npm run lint`
2. `npm run test:unit`
3. `npm run build`

Recommended additional tests before production:

4. `npm run test:e2e` (or smoke subset)

---

## 6) Monitoring & Observability

### 6.1 Sentry

- Client config: `sentry.client.config.ts`
- Server config: `sentry.server.config.ts`
- `tracesSampleRate` is currently set to 1.0 (needs adjustment based on actual production costs).

### 6.2 Analytics

- Includes `@vercel/analytics` and `@vercel/speed-insights` in dependencies.
- `lib/analytics.ts` has reduced manual tracking to avoid increasing CPU/DB load.

### 6.3 Log Strategy

- Important APIs have logs with prefixes (e.g., `REVALIDATE`, `Backup Cron`).
- Secrets/tokens are not logged.

---

## 7) Post-deploy Checklist (standard)

1. Access public routes by tenant + locale (`/vi`, `/km`, `/en`) to check rewrite.
2. Access admin routes and perform basic authentication and authorization checks.
3. Check important endpoints:
   - `/api/search`
   - `/api/revalidate` (only test with valid signatures)
4. Check cron status on the Vercel dashboard.
5. Check for new errors in Sentry after 15–30 minutes.

---

## 8) Common Issues

### 8.1 Incorrect Tenant Domain Resolution

- Check the host header and domain/subdomain mapping in the `tenants` table.
- Check the fallback logic for `localhost`/`dev-tenant` in middleware and search API.

### 8.2 Cache Not Updating After Admin Content Changes

- Check if the server action called revalidate with the corresponding tag/path.
- Check the dedupe window in `lib/cache/revalidate.ts` (2 seconds).

### 8.3 Cron Runs But Has No Effect

- Check `CRON_SECRET` and the Authorization header.
- Check the route method (`GET`/`POST`) compatibility with the job.

---

## 9) Next Document Links

- Cron/backup details: `docs/02_CRON_BACKUP_RUNBOOK.md`
- Security/permissions: `docs/03_SECURITY_PERMISSIONS.md`
- Index canonical: `docs/_index.md`