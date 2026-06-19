# 07 — Database, Migrations & RLS Playbook

> **Standard Data and DB Security Documentation — PTIT Graduation Project**  
> **Topic:** Secure Multi-tenant SaaS: Applying RLS and Audit Log in Risk Management.  
> **Updated:** 2026-05-16

---

## 1) Objective

Describe how the system manages schema lifecycle, migration, and **tenant isolation** using **PostgreSQL Row-Level Security (RLS)** in a Shared Database — Shared Schema architecture.

> **Why Shared Schema?** Compared to Isolated DB (high cost, complex management) and Separate Schema (complex migration), Shared Schema allows a single codebase to serve hundreds of tenants at the lowest cost — but requires **strict RLS** to isolate data.

---

## 2) Multi-tenant Data Architecture

### 2.1 Central Table: `tenants`

- Each tenant (branch/organization) is a record in the `tenants` table.
- Attributes: `id (UUID PK)`, `name`, `domain`, `subdomain`, `tenant_type`, `theme_colors`, `is_active`.
- All business tables **must** have a `tenant_id UUID REFERENCES tenants(id)` column.

### 2.2 Business Table Groups

| Group | Table | RLS |
|---|---|---|
| **Content** | `news`, `events`, `pages`, `about_sections`, `categories`, `media`, `hero_slides`, `faqs`, `layout_blocks` | ✅ tenant_id |
| **Operations** | `event_registrations`, `contact_messages`, `newsletter_subscribers` | ✅ tenant_id |
| **Finance** | `donations`, `donation_campaigns`, `bank_accounts` | ✅ tenant_id |
| **Management** | `user_roles`, `role_permissions`, `audit_logs`, `site_settings` | ✅ tenant_id |
| **System** | `tenants`, `organizations` | 🔒 Admin-only |

### 2.3 Auto-set `tenant_id` Trigger: `auto_set_tenant_id`

```sql
-- Trigger BEFORE INSERT: Automatically set tenant_id from user context
CREATE OR REPLACE FUNCTION auto_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> **Meaning:** Developers do not need to manually pass `tenant_id` — the trigger automatically sets it from the JWT context. Reduces the risk of forgetting `tenant_id`.

---

## 3) RLS Model — Data Isolation Mechanism at the Database Level

### 3.1 Design Principles

1. **Deny by default:** Each table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`.
2. **Explicit allow:** Only allow access through explicit CREATE POLICY.
3. **Context resolution:** Use `SECURITY DEFINER` functions to get `tenant_id`/role from JWT.
4. **No application bypass:** RLS works at the PostgreSQL level — application code cannot bypass it.

### 3.2 Standard Policy Chain for Each Table

```sql
-- 1. SELECT: Tenant reads its own data + Global admin reads all
CREATE POLICY "tenant_select_own" ON public.{table}
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        OR get_current_user_role() IN ('super_admin', 'company_editor')
    );

-- 2. INSERT: Write to its own tenant + ABAC constraint
CREATE POLICY "tenant_insert_own" ON public.{table}
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin', 'tenant_editor')
    );

-- 3. UPDATE: Modify its own tenant's data
CREATE POLICY "tenant_update_own" ON public.{table}
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin', 'tenant_editor')
    );

-- 4. DELETE: Only admin
CREATE POLICY "tenant_delete_admin" ON public.{table}
    FOR DELETE USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin')
    );
```

### 3.3 RLS for Broadcast Table (`published_to`)

Some content (news, media) can be **broadcast** to multiple tenants via the `published_to UUID[]` column:

```sql
CREATE POLICY "broadcast_read" ON public.news
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() = ANY(published_to)
        OR get_current_user_role() IN ('super_admin', 'company_editor')
    );
```

### 3.4 RLS for Audit Logs — Immutable Design

```sql
-- Only allow INSERT (log writing), NO UPDATE/DELETE
CREATE POLICY "audit_insert_only" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- SELECT: Admin reads all, tenant only reads its own logs
CREATE POLICY "audit_select" ON public.audit_logs
    FOR SELECT USING (
        get_current_user_role() IN ('super_admin', 'tenant_admin')
        AND (
            tenant_id = get_current_tenant_id()
            OR get_current_user_role() = 'super_admin'
        )
    );

-- NO UPDATE/DELETE policy → RLS deny by default → immutable
```

---

## 4) ABAC (Attribute-Based Access Control) — Supplementing RLS

### 4.1 Time-based Access Control

```sql
-- Function: Check if within business hours 07:00-22:00 ICT
CREATE OR REPLACE FUNCTION is_within_business_hours()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        BETWEEN 7 AND 21;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

**Application:** INSERT policy for `tenant_editor` and `tenant_accountant` only works during business hours.

### 4.2 Audit-enhanced DELETE Trigger

```sql
-- Trigger BEFORE DELETE: Log before deleting the record
CREATE OR REPLACE FUNCTION audit_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_email, action, resource, record_id, old_data, tenant_id)
    VALUES (auth.uid(), ..., 'delete', TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD), OLD.tenant_id);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to sensitive tables: news, events, transactions
```

**Meaning:** Deleted data is still stored permanently in `audit_logs.old_data` — ensuring non-repudiation.

### 4.3 Migration Reference

→ `supabase/migrations/20260516100000_abac_time_ip_policies.sql`

---

## 5) RLS Policy Registry

### 5.1 List of Deployed RLS Policies

| Table | SELECT | INSERT | UPDATE | DELETE | ABAC |
|---|:---:|:---:|:---:|:---:|:---:|
| `news` | ✅ | ✅ | ✅ | ✅ | ⏰ Time |
| `events` | ✅ | ✅ | ✅ | ✅ | — |
| `donation_campaigns` | ✅ | ✅ | ✅ | ✅ | — |
| `donations` | ✅ | ✅ | ✅ | ✅ | 🔒 Audit-controlled |
| `media` | ✅ | ✅ | ✅ | ✅ | — |
| `user_roles` | ✅ | ✅ | ✅ | ✅ | — |
| `audit_logs` | ✅ | ✅ | ❌ | ❌ | 🔒 Immutable |
| `site_settings` | ✅ | ✅ | ✅ | ❌ | — |
| `bank_accounts` | ✅ | ✅ | ✅ | ✅ | — |
| `cron_job_logs` | ✅ | ✅ | ❌ | ❌ | 🔒 Operational log |
| `rls_benchmark_results` | ✅ | ✅ | ❌ | ❌ | 🔒 Performance log |

### 5.2 RLS Coverage Score

Function `get_rls_coverage()` queries `pg_tables` + `pg_class.relrowsecurity` directly:

```
Goal: ≥ 90% of tables in the public schema have RLS enabled.
Current:  25/27 tables → 93% ✅
```

---

## 6) Audit & Traceability

### 6.1 `audit_logs` Schema

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | Log record ID |
| `user_id` | UUID | Who performed the action (auth.uid) |
| `user_email` | TEXT | Actor's email |
| `action` | TEXT | create/update/delete/approve/reject/login/... |
| `resource` | TEXT | Affected table/module |
| `table_name` | TEXT | Original table name |
| `record_id` | TEXT | Affected record ID |
| `old_data` | JSONB | Old data (before mutation) |
| `new_data` | JSONB | New data (after mutation) |
| `ip_address` | TEXT | Source IP |
| `tenant_id` | UUID | Tenant context |
| `created_at` | TIMESTAMPTZ | Log timestamp |

### 6.2 Immutable Nature

- **RLS:** Only INSERT policy, no UPDATE/DELETE policy.
- **Trigger:** `audit_before_delete` logs a copy BEFORE deleting the original record.
- **Service role:** Audit log is written via `createAdminClient()` (bypassing RLS) — ensuring logging cannot be disabled.

### 6.3 SOC Aggregation

Module `lib/audit/security-stats.ts` aggregates data from `audit_logs` for the SOC Dashboard:

- **Security Score** = RLS Coverage % − Anomaly Penalty
- **Anomaly Detection** = User with >20 actions/hour
- **Action Distribution** = CREATE/UPDATE/DELETE distribution over 24 hours
- **Tenant Distribution** = Activity by branch

---

## 7) Migration Strategy

### 7.1 Migration Source

`supabase/migrations/*.sql` — each file is timestamped, applied sequentially.

### 7.2 Notable Migration Phases

| Phase | Content | Reference |
|---|---|---|
| Foundation | Base schema + settings | Shared Schema Architecture |
| Multi-tenant | `tenant_id` FK, slug constraints | **Data Isolation Model** |
| RLS Hardening | Policies + SECURITY DEFINER | **RLS Focus** |
| RBAC | `user_roles`, `role_permissions` | **Role-based Access Control** |
| Broadcast | `published_to` UUID[] | Cross-tenant Content Sharing |
| ABAC | Time-based + DELETE triggers | **ABAC Supplement** |
| Security SOC & Operations | `cron_job_logs`, `rls_benchmark_results`, `tenant_lifecycle` | **Measurement, Monitoring, and Tenant Lifecycle** |
| Consolidated Patch | UUID donations, `user_roles` UNIQUE, array types, `bank_accounts` default index | **Security Patch and Optimization** |

### 7.3 Safe Migration Process

1. Create a new migration SQL file — **do not modify** files already applied to production.
2. Test on dev with sample tenant data.
3. Check backward compatibility for current actions.
4. Backup before applying to production.
5. After applying: regenerate types + smoke test admin/public.

---

## 8) DB Operational Runbook

### 8.1 Pre-production Migration

1. Create a backup (cron/manual).
2. Lock the release scope — avoid running concurrently.
3. Prepare a rollback plan according to affected tables.

### 8.2 Post-production Migration

1. Check new tables/indexes/constraints.
2. Check new RLS policies using `pg_policies`.
3. Test permissions by role: `super_admin`, `tenant_admin`, `tenant_editor`.
4. Monitor errors in Sentry + SOC Dashboard for the first 30-60 minutes.

---

## 9) Common Risks

### 9.1 RLS Policy Too Permissive → Cross-tenant Data Leak

- **Symptom:** User Tenant A sees Tenant B's data.
- **Solution:** Check `get_current_tenant_id()` returns the correct value. Review `pg_policies`.
- **Detailed Playbook:** → `docs/08_INCIDENT_RESPONSE_RUNBOOK.md` §10.

### 9.2 RLS Policy Too Restrictive → Legitimate Admin Blocked

- **Symptom:** Admin cannot CRUD despite correct login.
- **Solution:** Check `user_roles` has the correct record with `tenant_id` + role.

### 9.3 Migration Drift → Schema Mismatch

- **Symptom:** Action fails due to column/constraint mismatch.
- **Solution:** Synchronize migration state + update TypeScript types.

---

## 10) Checklist for Adding a New Table

1. ☐ Does it have a `tenant_id UUID REFERENCES tenants(id)`? If not, provide a reason.
2. ☐ Is `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` enabled?
3. ☐ Are there 4 policies (SELECT/INSERT/UPDATE/DELETE) with tenant scope?
4. ☐ Is the `auto_set_tenant_id` trigger present?
5. ☐ Are there suitable indexes (`tenant_id`, composite index)?
6. ☐ Have TypeScript types been updated?
7. ☐ Has cross-tenant access been tested?
8. ☐ Has the RLS Policy Registry (§5) been updated?