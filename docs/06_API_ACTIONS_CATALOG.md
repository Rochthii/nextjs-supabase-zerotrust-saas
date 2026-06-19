# 06 — API & Server Actions Catalog

**Catalog of Standard Endpoints/Actions (Canonical v2)**  
**Updated:** 2026-05-23

---

## 1) Reading the Catalog

- API routes: `app/api/**/route.ts`
- Server actions: `app/actions/**/*.ts`
- Each entry includes purpose, authentication, input/output, and primary side-effects.

---

## 2) API Routes Catalog

### 2.1 Public/Content APIs

#### `GET /api/search`
- Purpose: Global search by tenant.
- Authentication: Public.
- Input: Query `q`, `limit`, `tenant` (dev fallback).
- Side-effects: No mutation, with short cache header.

#### `GET /api/sections/news-events`
- Purpose: Provides data for the news/events section of the homepage.
- Authentication: Public.
- Side-effects: No mutation.

#### `GET /api/sections/categories`
- Purpose: News categories by tenant.
- Authentication: Public.

#### `GET /api/sections/about`
- Purpose: About sections by tenant.
- Authentication: Public.

### 2.2 Newsletter/Notifications

#### `POST /api/newsletter/subscribe`
- Purpose: Subscribe to the newsletter.
- Authentication: Public.
- Guard: Rate limit + duplicate check.

#### `POST /api/notifications/send`
- Purpose: Send push notifications to tokens by tenant/global.
- Authentication: Requires admin role or higher.

### 2.3 Revalidation & Webhooks

#### `POST /api/revalidate`
- Purpose: Invalidate cache by event type.
- Authentication: HMAC signature + timestamp + rate limit.
- Types: `news_updated`, `event_updated`, `about_updated`, `dharma_talk_updated`, `transaction_project_updated`, `tenant_settings_updated`.

### 2.4 Cron APIs

#### `GET /api/cron/backup`
- Purpose: Periodic JSON backup + rotation + audit.
- Authentication: `CRON_SECRET`.

#### `GET|POST /api/cron/publish-scheduled`
- Purpose: Publish scheduled news articles.
- Authentication: `CRON_SECRET`.

#### `POST /api/cron/send-event-reminders`
- Purpose: Send email reminders for events the next day.
- Authentication: `CRON_SECRET`.
- Dependency: `RESEND_API_KEY`.

#### `GET /api/cron/backup-db`
- Purpose: Backup DB variant (legacy/tailored environment route).

### 2.5 Admin Utilities APIs

#### `GET /api/admin/backup`
- Purpose: Manual backup with admin control.
- Authentication: `requireAdmin`.

#### `POST /api/admin/media/youtube`
- Purpose: Add YouTube media to the library.
- Authentication: Admin.

#### `POST /api/admin/media/link`
- Purpose: Add media from an external URL, auto-detect type/source.
- Authentication: Editor/admin.

### 2.6 Misc/ops APIs

#### `GET /api/warmup`
- Purpose: Ping DB to avoid cold-start/free-tier sleep.
- Authentication: `CRON_SECRET` if configured.

#### `POST /api/ai/seo-suggest`
- Purpose: Suggest SEO metadata using Gemini.
- Authentication: Logged-in user.
- Guard: In-memory rate limit by IP.

#### `GET /api/seed-khleang`
- Purpose: Seed sample tenant data.
- Authentication: Secret query (`REVALIDATE_SECRET`/`SEED_SECRET`).
- Note: Operational tool route, not for public traffic.

### 2.7 Admin Security APIs (v1.4.0)

#### `GET /api/admin/security/worm-vault`
- Purpose: Check the integrity of the WORM Audit Ledger (SHA-256 hash-chaining).
- Authentication: `requireSuperAdmin`.
- Output: `{ ledger_size, last_hash, integrity: "VERIFIED" | "CORRUPTED", verified_at }`.

#### `POST /api/admin/security/worm-vault`
- Purpose: Record a new audit entry into the immutable ledger.
- Authentication: `requireSuperAdmin`.
- Input: `{ actor, action, resource, tenant_id?, metadata? }`.
- Side-effects: Append entry to `storage/worm_vault/immutable_ledger.json` with hash-chaining, set file `0o444`.

#### `GET /api/admin/security/tenant-pooler`
- Purpose: Return statistics of the current connection slots for all tenants.
- Authentication: `requireSuperAdmin`.
- Output: `{ stats: [{ tenantId, tier, active, limit, utilization_pct }]... }`.

#### `POST /api/admin/security/tenant-pooler`
- Purpose: Perform a test or management action on the pool.
- Authentication: `requireSuperAdmin`.
- Actions:
  - `simulate_flood`: Activate DDoS simulation (all free-tier tenants fill slots).
  - `release`: Release slots by `tenantId`.
- Side-effects: Change in-memory pool state, log audit.

---

## 3) Server Actions Catalog (Public)

### 3.1 `createTransaction`
- File: `app/actions/create-transaction.ts`
- Input: Transaction form data.
- Guard: Rate limit + schema validation + tenant host check.
- Output: `{ success, transaction?, error? }`.

### 3.2 `registerForEvent`
- File: `app/actions/register-event.ts`
- Guard: Rate limit + event validity/capacity checks.
- Side-effects: Insert registration, audit log, increment participants, send email.

### 3.3 `submitContactForm`
- File: `app/actions/submit-contact.ts`
- Guard: Rate limit + Zod validation.
- Side-effects: Insert contact message + audit.

### 3.4 Other Public Actions
- `transactions.ts`, `upload-receipt.ts`, `search.ts`, `get-faqs.ts`, `auth.ts`.
- Primary goal: Support UI queries or handle public flow steps.

---

## 4) Server Actions Catalog (Admin)

The group of actions in `app/actions/admin/` includes:

- Content: `news.ts`, `events.ts`, `dharma-talks.ts`, `faq.ts`, `pages.ts`, `about-sections.ts`
- Presentation structure: `category.ts`, `layout-blocks.ts`, `hero-slides.ts`, `theme.ts`
- Media/tags resources: `media.ts`, `upload.ts`, `tags.ts`
- Business operations: `transactions.ts`, `transaction-projects.ts`, `transaction-purposes.ts`, `registrations.ts`, `contact-messages.ts`
- Financial management (Global Finance): `finance.ts` (Manage Bank Accounts, financial reports)
- System administration: `tenants.ts`, `users.ts`, `organizations.ts`, `settings.ts`, `site-settings.ts`, `revisions.ts`

Standard template for admin actions:

1. `require*` + `requirePermission`.
2. `enforceTenantScopeForRecord` with mutate record.
3. Validate schema (`safeParse`).
4. DB mutation.
5. `createAuditLog`.
6. Revalidate tag/path.

---

## 5) Revalidation Matrix (High-Level)

- News mutation → revalidate news tags + related tenant/broadcast homepage.
- Events mutation → revalidate event tags + dashboard stats.
- Transactions mutation → revalidate transaction tags + dashboard stats.
- Settings/theme mutation → revalidate tenant layout/config tags.

---

## 6) Error Contract Recommendations

To synchronize the entire system, it is recommended to return a standard object for actions:

- `success: boolean`
- `error?: string`
- `unauthorized?: boolean`
- `data?: any`

API routes maintain corresponding HTTP status codes (`400/401/409/429/500`).

---

## 7) Checklist for Adding New API/Action

1. Clearly define public or admin surface.
2. Add auth guard/rate limit according to risk.
3. Validate input using a schema.
4. Add audit log if important mutation.
5. Add revalidation tags/path.
6. Update this catalog immediately in the PR.