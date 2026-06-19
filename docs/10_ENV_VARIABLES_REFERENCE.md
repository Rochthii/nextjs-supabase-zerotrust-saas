# 10 — Environment Variables Reference
**Last Updated:** 2026-03-14  
**Objective:** Consolidate all production environment variables by functional group and requirement level.

---

## 1) Mandatory Group (production)

## 1.1 Supabase Core

- `NEXT_PUBLIC_SUPABASE_URL`  
  Used for client/server queries, tenant resolver, and search API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  Used for secure queries with RLS and public access.
- `SUPABASE_SERVICE_ROLE_KEY`  
  Used for admin client, cron system operations, and seed/migration scripts.

**Missing this group:** The system cannot access data stably.

## 1.2 Revalidate and Cron

- `REVALIDATE_SECRET`  
  Required for the `/api/revalidate` endpoint (HMAC + timestamp).
- `CRON_SECRET`  
  Required for cron routes with bearer token protection.

**Missing this group:** Stale content persists, and cron may be blocked with a 401 error or pose a security risk.

---

## 2) Email, Notification, and AI Group

- `RESEND_API_KEY`  
  Used for sending event reminders and system emails.
- `GEMINI_API_KEY`  
  Primarily used for Chat RAG, Embedding documents (1536px), and Router Agent.
- `GEMINI_API_KEY_2`  
  Used as a fallback when the primary API key exceeds its quota limit.
- `GROQ_API_KEY`  
  Used for the Llama 3 70B model via Groq, serving as a failover mechanism when the Gemini system encounters a comprehensive failure.

**Note:** All these variables must be set in **Supabase Secrets** (`supabase secrets set`) so that Edge Functions can access them at runtime.

---

## 3) Monitoring and Analytics Group

- `NEXT_PUBLIC_SENTRY_DSN`  
  Sends errors from client/server/edge to Sentry.
- `NEXT_PUBLIC_POSTHOG_KEY`  
  Activates PostHog analytics.
- `NEXT_PUBLIC_POSTHOG_HOST`  
  Host for receiving PostHog events.

---

## 4) Firebase (Push/Notification) Group

## 4.1 Firebase Client (Public)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## 4.2 Firebase Server/Admin

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string, depending on configuration)

---

## 5) URL and Runtime Environment Group

- `NEXT_PUBLIC_SITE_URL`  
  Used for canonical URL/SEO/email template.
- `NODE_ENV`  
  Controls development/production logic branches.
- `CI`  
  Controls test behavior (Playwright/Vitest in pipeline).
- `PLAYWRIGHT_TEST_BASE_URL`  
  Base URL for E2E tests.
- `ANALYZE`  
  Enables bundle analyzer when build optimization needs to be checked.

---

## 6) Auxiliary Secret Group

- `SEED_SECRET`  
  Used for protected seed endpoints (fallback along with `REVALIDATE_SECRET` in some routes).

---

## 7) Pre-Deployment Check

1. Compare the list of env variables between local, staging, and production.
2. Confirm that secrets are not empty and do not use placeholders.
3. Confirm that all server-only variables are not exposed in the client bundle.
4. After deployment, quickly check endpoints dependent on secrets: revalidate, cron, email.

---

## 8) Secret Management Policy

- Only update secrets through the official env management system (Vercel/Supabase secrets).
- Do not commit secrets into the repo, temporary scripts, or log files.
- Periodically rotate `CRON_SECRET`, `REVALIDATE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` according to the operation cycle.
- After rotation, run a full smoke test of all related flows within the first 30 minutes.