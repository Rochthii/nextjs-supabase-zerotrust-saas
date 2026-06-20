# 03 — Security & Permissions

> **Standard Security/Permission Documentation — TenantShield Enterprise Core**  
> **Topic:** Secure Multi-tenant SaaS: Applying RLS and Audit Log in Risk Management.  
> **Updated:** 2026-05-23  
> **Reference:** ISO/IEC 27017 §CLD.9.5.1 — Privileged Access Control

---

## 1) Overall Security Model — Defense-in-depth (4 layers)

The system applies **Defense-in-depth** — each layer operates independently, ensuring that even if one layer is compromised, the remaining layers still protect the data.

```markdown
Layer 1: Middleware Layer
├── Host/Domain resolution → determine tenant
├── Locale routing (vi/km/en)
└── Security headers (HSTS, X-Frame-Options, etc.)

Layer 2: Auth + RBAC (Application Layer)
├── Supabase Auth (JWT token, session management)
├── Role-based Access Control (6 roles)
└── Permission matrix: resource × action × role

Layer 3: Server Action Guards
├── requireTenantAccess(tenantIdFromUrl) → tenant scope check
├── enforceTenantScopeForRecord(table, recordId) → cross-tenant mutation block
├── requirePermission(resource, action) → fine-grained permission
└── Audit log records all mutations

Layer 4: Database-Level RLS (PostgreSQL)
├── RLS Policies → tenant_id enforcement
├── SECURITY DEFINER functions → context resolution
├── ABAC policies → time-based, operation-type constraints
└── Triggers → auto_set_tenant_id, audit_before_delete

Layer 5: Post-Storage Integrity (v1.4.0)
├── WORM Vault → SHA-256 hash-chaining immutable on file ledger
├── Tenant Connection Pooler → isolating connection slot by tier
└── Threat Simulator → testing 4 automated attack scenarios
```

> **Key point of the topic:** Layer 4 (Database RLS) is a **non-bypassable** security layer from the application code. Even if the developer writes incorrect queries or forgets to guard in Layers 2-3, RLS still blocks cross-tenant access. Layer 5 (Post-Storage) adds immutability to the audit log and protects DB resources from Noisy Neighbor attacks.

---

## 2) RBAC (Role-Based Access Control) System

### 2.1 Role Catalog

According to `lib/permissions.ts` and the `user_roles` table:

| Role | Scope | Description |
|---|---|---|
| `super_admin` | **System-wide** | Highest privilege — manages all tenants, users, RLS monitoring |
| `company_editor` | **System-wide** | Manages cross-tenant content (broadcast/publish_to) |
| `tenant_admin` | **Tenant-scoped** | Branch administrator — full CRUD within their tenant |
| `tenant_editor` | **Tenant-scoped** | Content editor — creates/edits articles, waits for approval |
| `tenant_accountant` | **Tenant-scoped** | Budget/fund manager — read-only content |
| `dharma_ai_role` | **Restricted** | AI Edge Functions — read-only embeddings/knowledge base |

### 2.2 Principle of Least Privilege

- Each user has **only 1 unique role** (UNIQUE constraint on `user_roles`).
- Tenant-scoped roles **cannot** access other tenants' data.
- `service_role` is only used in backend routes with controlled auth — **not exposed** to clients.

### 2.3 Permission Source

1. **Priority:** `user_roles` table (multi-tenant aware).
2. **Fallback legacy:** `auth.users.app_metadata` (only used when `user_roles` has no record).

> **Note:** Do not rely on metadata as the primary source, as it may be stale and cause tenant isolation issues.

---

## 3) ABAC (Attribute-Based Access Control) Model — Supplement

ABAC is implemented **in addition to** RBAC (not replacing it) to enhance context-based control.

### 3.1 Implemented Context Attributes

| Attribute | Function | Description |
|---|---|---|
| **Time** | `is_within_business_hours()` | Limits editing to 07:00–22:00 ICT for editors/accountants |
| **Operation Type** | RLS policy per operation | INSERT/UPDATE have separate constraints |
| **Tenant Context** | `get_current_tenant_id()` | Determines the current tenant from JWT claim |
| **Role Context** | `get_current_user_role()` | Determines the role from JWT/user_roles |

### 3.2 ABAC Matrix

```
┌──────────────────────┬──────────────┬──────────────┬──────────────┐
│ Role              │ SELECT (Read) │ INSERT (Create) │ DELETE (Delete) │
├──────────────────────┼──────────────┼──────────────┼──────────────┤
│ super_admin          │ ✅ Always   │ ✅ Always   │ ✅ Always   │
│ tenant_admin         │ ✅ Always   │ ✅ Always   │ ✅ Always   │
│ tenant_editor        │ ✅ Always   │ ⚠️ Business Hours │ ❌ Not Allowed │
│ tenant_accountant    │ ✅ Always   │ ⚠️ Business Hours │ ❌ Not Allowed │
│ dharma_ai_role       │ ✅ Only AI  │ ❌ Not Allowed │ ❌ Not Allowed │
└──────────────────────┴──────────────┴──────────────┴──────────────┘
⚠️ Business Hours = 07:00–22:00 ICT
```

### 3.3 Migration Reference

→ `supabase/migrations/20260516100000_abac_time_ip_policies.sql`

---

## 4) RLS Policies — Mechanism of Action

### 4.1 Context Resolution Functions

| Function | Return | Description |
|---|---|---|
| `get_current_tenant_id()` | UUID | Gets tenant_id from JWT claim `user_metadata.tenant_id` |
| `get_current_user_role()` | TEXT | Gets role from `user_roles` table (priority) or `user_metadata` |
| `is_within_business_hours()` | BOOLEAN | Checks 07:00–22:00 ICT |
| `auto_set_tenant_id()` | TRIGGER | Automatically sets tenant_id in new records based on user context |

### 4.2 Standard RLS Policy Template

```sql
-- SELECT: Tenant can only read their own data
CREATE POLICY "tenant_read_own" ON public.news
    FOR SELECT USING (
        tenant_id = public.get_current_tenant_id()
        OR public.get_current_user_role() IN ('super_admin', 'company_editor')
    );

-- INSERT: Can only write to their own tenant + ABAC time constraint
CREATE POLICY "ABAC_time_restrict_editor_write" ON public.news
    FOR INSERT WITH CHECK (
        public.get_current_user_role() IN ('super_admin', 'company_editor', 'tenant_admin')
        OR (
            public.get_current_user_role() IN ('tenant_editor', 'tenant_accountant')
            AND public.is_within_business_hours()
            AND tenant_id = public.get_current_tenant_id()
        )
    );
```

### 4.3 RLS Coverage Monitoring

Function `get_rls_coverage()` (SOC Dashboard) checks the percentage of tables with RLS:

```sql
-- Query pg_tables + pg_class.relrowsecurity
SELECT
    COUNT(CASE WHEN c.relrowsecurity THEN 1 END) AS protected,
    COUNT(*) AS total,
    (COUNT(CASE WHEN c.relrowsecurity THEN 1 END) * 100 / COUNT(*)) AS percentage
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public';
```

---

## 5) Guard Patterns (Application Layer)

### 5.1 Tenant Guard

```typescript
// Route: /admin/t/[tenant_id]/*
await requireTenantAccess(tenantIdFromUrl);
// → Checks user.tenant_id === tenantIdFromUrl (or super_admin bypass)
// → Returns notFound() if mismatch (reduces information disclosure)
```

### 5.2 Role Guard

```typescript
// System-level features
await requireSuperAdmin();

// Admin actions
await requireAdmin();

// Fine-grained permission
await requirePermission('news', 'create');
```

### 5.3 Record Mutation Guard

```typescript
// Before update/delete — blocks cross-tenant tampering
await enforceTenantScopeForRecord('news', recordId);
```

---

## 6) Data Classification

| Level | Label | Example | Protection |
|---|---|---|---|
| **L4** | Secret | `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` | Env vars only on server, not logged |
| **L3** | Sensitive | `audit_logs`, `user_roles`, `bank_accounts` | RLS + admin-only + immutable |
| **L2** | Internal | `news (draft)`, `transactions`, `settings` | RLS + tenant-scoped |
| **L1** | Public | `news (published)`, `events`, `media` | RLS read for authenticated/anon |

---

## 7) Revalidation API Security

`/api/revalidate` has 5 layers of protection:

1. **Rate limit:** 15 req/min/IP.
2. **Required Header:** `x-signature`, `x-timestamp`.
3. **Replay protection:** 5-minute window.
4. **HMAC SHA-256:** `timingSafeEqual` — prevents timing attacks.
5. **Schema validation:** Zod — prevents payload injection.

---

## 8) Security Headers

Set in `next.config.ts`:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS |
| `X-Frame-Options` | `DENY` | Prevents Clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Limits browser APIs |

---

## 9) ISO/IEC 27017 Mapping

| Control | Description | Technical Evidence |
|---|---|---|
| **CLD.6.3.1** | Shared Roles & Responsibilities | Shared Responsibility Table (§8.1 Runbook) |
| **CLD.8.1.5** | Asset Handling upon Termination | Offboard tenant process (§8.2 Runbook) |
| **CLD.9.5.1** | Privileged Access Control | RBAC 6 roles + ABAC time constraint |
| **CLD.9.5.2** | Management of Privileged Utilities | `SECURITY DEFINER` functions, service_role restriction |
| **CLD.12.4.1** | Event Logging | Immutable audit_logs + auto DELETE trigger |
| **CLD.12.4.2** | Protection of Log Information | **WORM Vault** SHA-256 hash-chaining — detects tampering |
| **CLD.12.4.3** | Administrator & Operator Logs | SOC Dashboard: Top Users, Activity Timeline |
| **CLD.16.1.2** | Notification of Security Events | Cross-tenant breach notification (§10 Runbook) |
| **CLD.17.1.1** | Availability of Security Resources | **Tenant Pooler** limits connections to prevent Noisy Neighbor DoS |

---

## 10) Checklist for Adding New Features

1. ☐ Is there appropriate auth guard (`require*`)?
2. ☐ Is there a tenant/record mutation guard?
3. ☐ Is input validated (Zod) and unnecessary fields stripped?
4. ☐ Is revalidation correct after mutation?
5. ☐ Are audit logs created for sensitive actions?
6. ☐ Is there an RLS policy on the new table?
7. ☐ Does the new table have a `tenant_id` FK? If not, is there a reason documented?
8. ☐ Has cross-tenant access been checked?
9. ☐ Are audit logs pushed to the WORM Vault (`/api/admin/security/worm-vault` POST)?
10. ☐ Are high-load actions checked for tenant connection slots?

---

## 11) WORM Audit Vault — Cryptographic Immutability (v1.4.0)

### 11.1 Mechanism of Action

The system uses **SHA-256 Hash Chaining** to ensure the immutability of audit logs even if an attacker has write access to the file system:

```
Entry[0]: { data, hash: SHA256(data + "GENESIS") }
Entry[1]: { data, hash: SHA256(data + entry[0].hash) }   ← prev_hash
Entry[N]: { data, hash: SHA256(data + entry[N-1].hash) } ← tamper-evident chain
```

- File ledger: `storage/worm_vault/immutable_ledger.json`
- File permissions: `0o444` (read-only after writing)
- Integrity check: `GET /api/admin/security/worm-vault` → `{ integrity: "VERIFIED" | "CORRUPTED" }`

### 11.2 Limitations (for academic purposes)

| Mechanism | Protects Against | Does Not Protect Against |
|---|---|---|
| Hash chaining | Modifying/deleting any entry | Root access deleting the entire file ledger |
| `chmod 0o444` | Random overwrites from the app | Root user on the OS |
| **Future Goal** | AWS S3 Object Lock (true WORM) | — |

---

## 12) Tenant Connection Pooler — Noisy Neighbor Protection (v1.4.0)

### 12.1 Mechanism of Action

```typescript
// Tier-based connection limits
const TIER_LIMITS = { free: 3, pro: 10, enterprise: 25 }

// When a tenant requests a DB connection:
await pooler.acquireSlot(tenantId, tier)  // Throws if limit exceeded
// ... performs query ...
await pooler.releaseSlot(tenantId)        // Releases the slot
```

### 12.2 Resource Allocation by Tier

| Plan | Max Connections | Behavior When Exceeded |
|---|---|---|
| Free | 3 | 429 Too Many Requests |
| Pro | 10 | 429 Too Many Requests |
| Enterprise | 25 | 429 Too Many Requests |
| **Super Admin** | ∞ | No limit |

### 12.3 Control API

- `GET /api/admin/security/tenant-pooler` — returns stats for all tenants
- `POST { action: "simulate_flood" }` — tests DDoS simulation
- `POST { action: "release", tenantId }` — manually releases a slot