# 08 — Incident Response Runbook

**Last Updated:** 2026-03-14  
**Objective:** Rapid service recovery, minimizing user impact, and preserving sufficient evidence for postmortem analysis.

---

## 1) Severity Convention

### SEV-1 (Critical)

- Widespread public site outage (multiple tenants inaccessible).
- Admin unable to log in or perform CRUD operations on core modules.
- Critical cron jobs fail continuously (backups not running, publish-scheduled stuck).

**Initial Response Goal:** ≤ 15 minutes.  
**Temporary Recovery Goal:** ≤ 60 minutes.

### SEV-2 (High)

- A major module error (tenant-wide search, transaction flow, event registration).
- Revalidation error causing prolonged data staleness.

**Initial Response Goal:** ≤ 30 minutes.  
**Recovery Goal:** within the day.

### SEV-3 (Medium)

- Localized errors (single admin page, small tenant, display errors without data loss).

**Initial Response Goal:** within working hours.

---

## 2) Standard Response Procedure (0–30 minutes)

1. **Confirm Scope:** Identify affected tenants, locales, public or admin, and endpoints.
2. **Freeze Changes:** Suspend new deployments until the cause is clear.
3. **Collect Logs Immediately:** Vercel Functions log + Sentry issue + request ID (if available).
4. **Classify SEV:** Based on actual user impact.
5. **Perform Short-term Recovery:** Roll back code/env or safely bypass temporarily.
6. **Status Updates:** Internal updates every 15 minutes until recovery.

---

## 3) Runbook by Primary Symptom

## 3.1 `/api/revalidate` returns 401 / 400 / 429

**Indicators**

- Admin updates content, but public site doesn't change.
- Logs warn of Signature Mismatch, Timestamp Expired, Missing Signature/Timestamp.
- May encounter 429 when sending too frequently.

**Quick Check**

1. Confirm `REVALIDATE_SECRET` exists in the running environment.
2. Confirm the webhook sends `x-signature` and `x-timestamp` headers.
3. Check system clock sync (±5 minutes) for webhook sender.
4. Check for unusual traffic causing rate limit exceedance (15 req/min per IP).

**Recovery**

- Fix secret or HMAC signing logic on the caller side.
- If due to burst: reduce trigger frequency and batch revalidate by tag/path.
- After fixing: retrigger the corresponding event to refresh tags/paths.

---

## 3.2 Cron backup error 401 or 500 (`/api/cron/backup`)

**Indicators**

- No new backup files in the `backups` bucket.
- Logs report `Unauthorized` or `Backup upload failed`.

**Quick Check**

1. Confirm `CRON_SECRET` matches between scheduler and server.
2. Check if the `backups` bucket exists and has stable write permissions.
3. Check Supabase Storage quota and temporary network errors.

**Recovery**

- Manually run the backup endpoint with the correct token to verify.
- If bucket permissions are faulty: recreate the bucket and confirm upload success.
- Confirm the 30-backup retention policy is still working (rotation not faulty).

---

## 3.3 Cron publish-scheduled not publishing (`/api/cron/publish-scheduled`)

**Indicators**

- Posts have `status=scheduled`, `scheduled_at <= now` but haven't gone live.

**Quick Check**

1. Confirm cron is calling the correct endpoint with a valid token.
2. Check the timezone in scheduling data (`scheduled_at`) and current Vietnam time.
3. Check service-role permissions and write errors to `news`/`audit_logs`.

**Recovery**

- Manually trigger the endpoint to unblock immediately.
- Standardize datetime data for affected posts to avoid timezone issues.
- If necessary, update the job schedule in `vercel.json` and redeploy.

---

## 3.4 Cron event reminders not sending mail (`/api/cron/send-event-reminders`)

**Indicators**

- Tomorrow's events with confirmed registrations don't receive emails.

**Quick Check**

1. Confirm `RESEND_API_KEY` has a real value (not a placeholder).
2. Check `CRON_SECRET` and logs for Unauthorized errors.
3. Check event data (`start_date` tomorrow) + registration status `confirmed` + non-null email.
4. Check email provider's sending limits.

**Recovery**

- Resend in small batches for affected events.
- If API key is faulty: rotate the key and update the environment immediately.
- Record unsent emails for follow-up handling.

---

## 3.5 Search returns empty incorrectly (`/api/search`)

**Indicators**

- Users always get empty search results despite available data.
- Logs report `Tenant not found`.

**Quick Check**

1. Check domain/host mapping in the `tenants` table.
2. Locally, check the `tenant` fallback query has the correct value.
3. Check published data is correctly indexed for the tenant.

**Recovery**

- Fix domain/subdomain mapping in tenant config.
- Rerun search checks with the actual tenant host.

---

## 3.6 Admin returns 401/403 widespread

**Indicators**

- Logged-in users can't access admin routes or actions are denied.

**Quick Check**

1. Check Supabase session/cookie validity.
2. Check roles in metadata and role mapping table by tenant.
3. Check middleware guard + `requireAdminAccess`/`checkPermission` call path.
4. Check recent RLS policy changes.

**Recovery**

- Restore correct role metadata for affected accounts.
- If due to migration/policy change: rollback migration or quickly fix the policy.

---

## 4) Priority Endpoint Monitoring List

- `/api/revalidate` — cache freshness and content sync.
- `/api/cron/backup` — data safety.
- `/api/cron/publish-scheduled` — automated content operation.
- `/api/cron/send-event-reminders` — event registrant experience.
- `/api/search` — public search experience.
- `/api/warmup` — post-deploy readiness monitoring.

---

## 5) Incident Closure Checklist

- Service has been restored and verified by the module owner.
- No recurring errors in logs for 30–60 minutes.
- A standard timeline has been documented (detection, triage, recovery, verification).
- Preventative action items have been created (owner + deadline).

---

## 6) Minimum Postmortem Template

1. **Incident Summary:** Impact, start and end times.
2. **Technical Root Cause:** Original file/module/endpoint causing the error.
3. **Recovery Actions:** Sequence of actions and time taken.
4. **Preventative Measures:** Tests, alerts, guards, runbook updates.
5. **Responsible Person:** Primary owner and deadline.

---

## 7) Quick Reference Documentation

- SEV-1 scenario templates + notification templates + detailed postmortem:
    - `docs/11_SEV1_SCENARIOS_TEMPLATES.md`

---

## 8) ISO/IEC 27017 — Cloud Security Mapping

> Reference: ISO/IEC 27017:2015 — Code of practice for information security controls based on ISO/IEC 27002 for cloud services.

### 8.1 Shared Responsibility Model

| Layer | SaaS Provider (Us) | Tenant (Branch) |
|---|---|---|
| **Physical Infrastructure** | ❌ Supabase/Vercel responsible | ❌ Not applicable |
| **Network & Firewall** | ⚠️ Edge/Rate Limit configuration | ❌ Not applicable |
| **Authentication (AuthN)** | ✅ Supabase Auth + Middleware guard | ⚠️ Credential management |
| **Authorization (AuthZ)** | ✅ RBAC + ABAC policies | ⚠️ Internal role management |
| **Data Isolation** | ✅ RLS + tenant_id FK + trigger | ❌ Not applicable |
| **At-Rest Encryption** | ✅ Supabase AES-256 default | ❌ Not applicable |
| **In-Transit Encryption** | ✅ TLS 1.3 (Vercel Edge) | ❌ Not applicable |
| **Data Backup** | ✅ Cron backup 3AM UTC daily | ⚠️ Check backups when needed |
| **Audit Logging** | ✅ audit_logs + immutable triggers | ⚠️ Read logs when needed |
| **Incident Response** | ✅ Runbook SEV-1/2/3 + postmortem | ⚠️ Report incidents found |

### 8.2 Asset Handling Procedure upon Contract Termination (CLD.8.1.5)

When a Tenant (Branch) leaves the system:

1. **30-Day Notice**: Official notification to Tenant Admin.
2. **Data Export**: Super Admin creates a full data export for the tenant_id (news, events, transactions, media).
3. **Access Disable**: Lock domain mapping in `tenants` table, revoke all `user_roles` for the tenant.
4. **Audit Log Retention**: Audit logs are **NOT** deleted — kept permanently for legal purposes.
5. **Transaction Data Deletion**: After 90 days, perform hard-delete of tenant data (with audit log).
6. **Completion Confirmation**: Issue a Data Destruction Certificate.

### 8.3 Privileged Access Control (CLD.9.5.1)

- **RBAC**: 6 roles with privileges (super_admin → tenant_accountant).
- **ABAC**: Policy for business hours (07:00-22:00 ICT) for tenant_editor/tenant_accountant.
- **Principle of Least Privilege**: Each user has only one unique role (UNIQUE constraint `user_roles`).
- **Automatic Privilege Revocation**: When a tenant is disabled, RLS automatically blocks all access.

### 8.4 Event Log Protection (CLD.12.4.1)

- **Immutability**: `audit_logs` table allows only INSERT, no UPDATE/DELETE.
- **Automatic Triggers**: Before deleting sensitive data, logs are automatically recorded.
- **No Bypass**: Audit logging is done via service_role (bypassing RLS), ensuring logging cannot be disabled.
- **Retention**: Audit log data is kept permanently, without auto-cleanup.

---

## 9) Noisy Neighbor Risk Mitigation Strategy

### 9.1 Risk Scenario

In a Shared Database model, a Tenant with sudden high traffic (e.g., a viral marketing campaign) could:
- Exhaust the PostgreSQL connection pool.
- Increase latency for all other Tenants.
- Cause timeouts for admin CRUD requests.

### 9.2 Implemented Measures

| Layer | Measure | Reference File |
|---|---|---|
| **Cache** | `unstable_cache` with tag-based invalidation | `lib/cache/tags.ts` |
| **Deduplication** | Group revalidate requests by tag/path | `lib/cache/revalidate.ts` |
| **Rate Limit** | 15 req/min/IP for revalidate endpoint | `app/api/revalidate/route.ts` |
| **HMAC Signing** | SHA-256 signature + 5-minute replay window | `lib/revalidate-utils.ts` |
| **Database Index** | GIN index for `published_to` UUID[] | Migration Phase 4 |
| **Connection Pool** | Supabase Pooler (PgBouncer) default | Supabase infrastructure |

### 9.3 Noisy Neighbor Response Playbook

1. **Detection**: Latency P99 > 3s or connection count > 80% pool.
2. **Tenant Identification**: Check `audit_logs` or Vercel Analytics by domain.
3. **Throttling**: Temporarily increase cache TTL for the identified Tenant (revalidate less frequently).
4. **Notification**: Contact Tenant Admin to coordinate load reduction.
5. **Scaling**: If necessary, upgrade Supabase tier or activate read replica.

---

## 10) SEV-1 Scenario: Cross-tenant Data Breach

### 10.1 Indicators

- User of Tenant A sees data (news, transactions) belonging to Tenant B.
- Audit log records queries returning records with a different `tenant_id` than the user's current tenant.
- API response contains data outside the user's authorized scope.

### 10.2 0–30 Minute Playbook

1. **Minutes 0–5**: Freeze all public API endpoints. Switch site to maintenance mode.
2. **Minutes 5–10**: Check RLS policies on affected tables (`pg_policies`). Confirm `get_current_tenant_id()` returns the correct value.
3. **Minutes 10–15**: Check recent migrations for policy changes. Diff with the previous production version.
4. **Minutes 15–20**: Roll back the migration if a policy error is found. Or create a hotfix policy directly on the DB.
5. **Minutes 20–30**: Check `audit_logs` to see how many records were leaked. Document the scope of the breach.

### 10.3 Post-Recovery

- Notify all affected Tenants (mandatory as per ISO 27017 §CLD.16.1.2).
- Create a detailed postmortem (mandatory).
- Update test suite: add integration tests for cross-tenant isolation.
- Review all RLS policies using the `audit_storage_policies.ts` script.