# 02 — Cron & Backup Runbook
**Canonical Operation Documentation (v2)**
**Updated:** 2026-03-14

---

## 1) Current Cron Schedule

According to `vercel.json`:

- `0 3 * * *` → `/api/cron/backup`
- `0 2 * * *` → `/api/cron/send-event-reminders`
- `0 1 * * *` → `/api/cron/publish-scheduled`

Note: `GET`/`POST` routes are handled differently for each endpoint, so check the route code before changing the scheduler.

---

## 2) Periodic Routes and Purposes

### 2.1 `/api/cron/backup`

Purpose:

- Export multiple data tables to JSON.
- Upload to the `backups` bucket of Supabase Storage.
- Auto-rotate, keeping up to 30 recent files.
- Record system audit logs.

Points to note:

- `CRON_SECRET` is required.
- Use the `Authorization: Bearer <CRON_SECRET>` header.

### 2.2 `/api/cron/publish-scheduled`

Purpose:

- Automatically publish `news` with `status = scheduled` and `scheduled_at <= now`.
- Record batch audit logs after publishing.

Points to note:

- `CRON_SECRET` is checked.
- Both `GET` and `POST` calls are made to ensure compatibility with the cron invoker.

### 2.3 `/api/cron/send-event-reminders`

Purpose:

- Send email reminders for confirmed event registrations for the next day.
- Use the Resend API.

Points to note:

- `RESEND_API_KEY` is required.
- `CRON_SECRET` is required if verification is enabled.
- Use the Vietnam timezone to determine "tomorrow".

---

## 3) Manual Backup Route for Admin

### `/api/admin/backup`

- Protected by `requireAdmin()`.
- Returns a JSON backup for download/comparison.
- Records backup audit logs.

Usage scenario:

- Before risky migrations.
- Before major refactoring of the content module.

---

## 4) Cron Check Procedure After Deployment

1. Verify that Vercel cron has synced the correct schedule.
2. Manually trigger each route with a signed/authorized request.
3. Observe logs:
   - Success markers for the route.
   - Number of records processed.
   - Execution time.
4. Confirm side effects:
   - Backup files appear in the bucket.
   - Scheduled news is published.
   - Email reminders have a valid send count.

---

## 5) Recovery Procedure from Backup (Application Level)

Note: The system currently creates JSON snapshots by table, not a full physical backup of Postgres WAL.

Proposed procedure:

1. Determine the error time.
2. Choose the most recent backup file before the error time.
3. Restore selectively by table/important records (do not overwrite everything if not necessary).
4. After restoration: run integrity checks by tenant.
5. Revalidate related tags/paths to sync the cache.

---

## 6) Troubleshooting and Quick Fixes

### 6.1 `401 Unauthorized` on Cron

- Check `CRON_SECRET` at runtime.
- Check the header format is correct `Bearer <token>`.

### 6.2 Backup Upload Error to Bucket

- Check if the `backups` bucket exists.
- The route has fallback logic to create the bucket, check service/runtime permissions.

### 6.3 Scheduled Publish Not Working

- Check if `status='scheduled'` and `scheduled_at` are valid.
- Check the timezone when entering the schedule.

### 6.4 Reminders Not Sending Emails

- Check `RESEND_API_KEY`.
- Check if the email is confirmed and not null.

---

## 7) Hardening Backlog (Recommendations)

- Standardize methods for all cron routes.
- Add idempotency keys for long-running jobs.
- Add alerting for consecutive job failures.
- Standardize metrics: duration, success count, error count.