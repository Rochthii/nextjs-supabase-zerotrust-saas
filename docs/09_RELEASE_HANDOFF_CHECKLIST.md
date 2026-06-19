# 09 — Release & Handoff Checklist

**Last Updated:** 2026-03-14  
**Objective:** Standardize production releases and handover operations, reducing the risk of missing steps.

---

## 1) Pre-release gate (mandatory)

## 1.1 Code gate

- Pull request has been reviewed for the relevant module scope.
- No migration conflicts or undocumented DB changes.
- No hotfixes that have not been documented in the canonical docs.

## 1.2 Quality gate

- Important unit tests pass.
- E2E smoke tests pass on core public routes.
- No build errors blocking deployment.

## 1.3 Data gate

- Migration has a rollback strategy.
- Seed/patch data scripts have idempotency or conditions to prevent repeated runs.
- RLS changes have been tested on: anon, authenticated, admin/tenant_admin.

---

## 2) Production deployment checklist

1. Confirm the release branch/tag.
2. Confirm the complete production environment (see document 10).
3. Deploy to Vercel.
4. Monitor the build log until completion.
5. Run smoke tests immediately after deployment (section 3).
6. Run warmup endpoint if needed to stabilize initial cache.
7. Confirm cron jobs are present and scheduled correctly in the production environment.

---

## 3) Smoke test after deployment (15–30 minutes)

## 3.1 Public flow

- Open the main tenant page in all active locales.
- Visit news, events, library, and contact pages and confirm stable rendering.
- Perform a public search with results.

## 3.2 Admin flow

- Log in as admin and load the dashboard.
- Try updating a small piece of content (e.g., draft/published status of a test article).
- Confirm cache revalidation is successful (public reflects changes).

## 3.3 API/Cron flow

- Call the `/api/warmup` endpoint (using a valid token if protected by a secret).
- Check that important cron endpoints return a valid status.
- Check logs for no repeated error sequences (401/500 consecutive errors).

---

## 4) Handover checklist for operations team

## 4.1 Technical handover

- Release commit hash.
- List of migrations run.
- List of environment variable changes.
- List of new/modified endpoints with high risk.

## 4.2 Operational handover

- Primary and backup on-call personnel.
- Incident notification channel.
- Relevant runbooks (02, 08, 10, 11) attached to the handover ticket.

## 4.3 Product handover

- Modules with changed behavior.
- Functions that need data monitoring after release (first 24 hours).

---

## 5) Standard rollback plan

## 5.1 Code rollback

- Redeploy the previous stable version on Vercel.
- Reconfirm minimum smoke tests.

## 5.2 Data rollback

- Only rollback migrations after evaluating data impact.
- If a valid backup is available from the same day, prioritize selective restoration of affected tables.

## 5.3 Cache rollback

- After code/data rollback, trigger revalidation by tag/path to avoid displaying outdated cache.

---

## 6) Conditions for closing a release

- No SEV-1/SEV-2 errors open within the first 24 hours.
- Stable monitoring, no sudden increase in 5xx errors.
- Handover ticket includes: changelog, migration, env diff, referenced runbooks.