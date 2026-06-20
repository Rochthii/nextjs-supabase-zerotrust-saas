# 11 — SEV-1 Scenarios & Communication Templates

> **Incident Scenario Documentation — TenantShield Enterprise Core**  
> **Topic:** Secure Multi-tenant SaaS: Applying RLS and Audit Log in Information Risk Management.  
> **Updated:** 2026-05-16  
> **Objective:** Provide SEV-1 handling scenarios in a real-world format + notification templates + postmortem templates to fill in quickly. Meet the Incident Management requirements of ISO/IEC 27017.

## 1) SEV-1 Activation Conditions

Activate SEV-1 as soon as at least one of the following conditions occurs:

- Multiple tenants cannot access the public site.
- Admins cannot log in or perform core module operations.
- Critical cron jobs fail continuously, posing data/operational risks.
- Severe security vulnerabilities that could affect multiple tenant data.

Target timeline:

- Initial triage: within 15 minutes.
- Temporary recovery: within 60 minutes.

---

## 2) SEV-1 Scenarios Based on Real-World Situations

## 2.1 Scenario A — Public Site Down on a Large Scale

**Indicators**

- Sudden increase in 5xx errors on multiple public routes.
- Users report access errors on multiple tenant domains.

**Playbook 0–60 minutes**

1. Minutes 0–5: Confirm the scope (which tenants, routes, locales are affected).
2. Minutes 5–10: Freeze new deployments, only maintain recovery streams.
3. Minutes 10–20: Check the latest build/deploy, env diff, and new Sentry issues.
4. Minutes 20–35: Roll back to the most recent stable version if the root cause is not yet determined.
5. Minutes 35–50: Perform smoke tests on the public site using 2–3 representative tenants.
6. Minutes 50–60: Update the status to “temporarily recovered”, continue in-depth investigation.

---

## 2.2 Scenario B — Admins Cannot Operate on a Large Scale

**Indicators**

- Admins receive 401/403 errors in bulk or actions fail consistently.

**Playbook 0–60 minutes**

1. Minutes 0–10: Check session/auth service and middleware guard.
2. Minutes 10–20: Check role mapping (`user_roles`) and the latest policy changes.
3. Minutes 20–35: Verify if actions fail due to guard or DB policy.
4. Minutes 35–45: Quickly recover (roll back migration/policy or code).
5. Minutes 45–60: Re-authenticate core admin modules: news/events/transactions/settings.

---

## 2.3 Scenario C — Critical Cron Job Failure

**Indicators**

- Backup does not generate new files.
- Scheduled publish does not run for multiple cycles.
- Reminders are not sent within the operational time frame.

**Playbook 0–60 minutes**

1. Minutes 0–10: Confirm the error based on cron endpoint, response code, and log.
2. Minutes 10–20: Check `CRON_SECRET`, access rights to the endpoint, and `vercel.json` schedule.
3. Minutes 20–35: Manually trigger the endpoint for temporary recovery.
4. Minutes 35–50: Address the root cause (secret mismatch, missing env, quota/provider error).
5. Minutes 50–60: Confirm a successful run cycle + record any necessary compensatory tasks.

---

## 2.4 Scenario D — Cross-Tenant Data Breach

**Indicators (Anomaly)**

- Users report seeing data not belonging to their organization (e.g., Admin of Tenant A sees Tenant B’s posts/config).
- Alert from the SOC system: An IP has been fetching data from multiple tenants consecutively.
- `get_rls_coverage()` reports a score drop below 90%.

**Playbook 0–60 minutes (RLS Emergency Response)**

1. **Minutes 0–5:** Pause the system (Maintenance Mode) for related modules to prevent further leakage. Initialize a SEV-1 emergency ticket.
2. **Minutes 5–15:** Query `audit_logs` via SQL to precisely identify which user/role accessed the data and the extent of the exposure (Exfiltration scope).
3. **Minutes 15–30:** Review `pg_policies` on the database. Identify the cause (usually a developer mistakenly pushes a migration that deletes RLS policy or writes incorrect logic in `get_current_tenant_id()`).
4. **Minutes 30–45:** Restore RLS policy (run the safest migration again) or temporarily disable suspected compromised user accounts.
5. **Minutes 45–60:** Disable Maintenance Mode, send a data breach notification to affected Tenants according to ISO 27017 §CLD.16.1.2 standards.

---

## 3) Internal Notification Templates (copy/paste)

## 3.1 Incident Opening Template

``` 
[INCIDENT][SEV-1][OPEN]
Detection Time: <YYYY-MM-DD HH:mm TZ>
Opened by: <name>
Affected Scope: <tenant/module/route>
Primary Symptom: <brief description>
User Impact: <high/very high>
Ongoing Actions: <triage/rollback/check env>
Next Update: <HH:mm>
```

## 3.2 Periodic Update Template (every 15 minutes)

``` 
[INCIDENT][SEV-1][UPDATE #<n>]
Time: <HH:mm>
Current Status: <investigating/contained/recovered>
Temporary Cause: <if known>
Recent Actions: <...>
Remaining Risks: <...>
ETA for Next Update: <HH:mm>
```

## 3.3 Recovery Notification Template

``` 
[INCIDENT][SEV-1][MITIGATED]
Temporary Recovery Time: <YYYY-MM-DD HH:mm TZ>
Total Downtime/Affected Time: <xx minutes>
Recovery Measures: <rollback/fix/rotate secret>
Ongoing Monitoring Scope: <if any>
Postmortem Scheduled: <date/time>
```

---

## 4) Detailed Postmortem Template (fill in the framework)

``` 
# Postmortem — Incident SEV-1

1) Overview
- Incident ID:
- Start Time:
- End Time:
- Total Downtime/Affected Time:

2) Impact
- Affected Tenants/Routes/Modules:
- Estimated Number of Affected Users:
- Unstable Functions:

3) Timeline
- T0 Detection:
- T+15 Triage:
- T+30 Containment:
- T+60 Temporary Recovery:
- T+End:

4) Root Cause
- Direct Cause:
- Systemic Cause:
- Why it was not detected earlier:

5) Recovery and Verification
- Recovery Actions Taken:
- Method of Verification of Stability:
- Remaining Risks:

6) Preventative Actions
- Action 1 (owner/deadline):
- Action 2 (owner/deadline):
- Action 3 (owner/deadline):

7) Documentation Updates
- Updated Runbook File:
- Updated Release/Handoff Checklist:
```

---

## 5) Verification Checklist After SEV-1 (within 24 hours)

- No unusual 5xx spikes on previously affected routes.
- No recurring errors in Sentry/logs.
- Critical cron jobs have completed at least one verification cycle after the fix.
- A ticket for preventative actions has been created with a clear owner.
- The postmortem has been linked to the corresponding release/handoff ticket.