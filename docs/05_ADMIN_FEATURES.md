# 05 — Admin Features Specification

> **Standard Admin Functional Documentation — PTIT Graduation Project**  
> **Topic:** Secure Multi-tenant SaaS: Applying RLS and Audit Log in Information Risk Management.  
> **Updated:** 2026-05-23

---

## 1) Scope

Describes the entire admin surface according to the actual route in `app/admin/**`, including mapping to corresponding server actions and permission/tenant mechanisms.

---

## 2) Admin Architecture

### 2.1 Two Layers of Admin Routes

- Global admin zone: `app/admin/**` (system dashboard, SOC, users, tenants, organizations...).
- Tenant admin zone: `app/admin/t/[tenant_id]/**` (content management for each branch/organization).

### 2.2 Main Guards

- Role guard: `requireAdmin`, `requireEditor`, `requireVolunteer`, `requirePermission`.
- Tenant guard: `requireTenantAccess`, `enforceTenantScopeForRecord`.

---

## 3) Admin Module Catalog

### 3.1 Global/System Modules

- `admin/dashboard`
- `admin/analytics`
- `admin/tenants`, `admin/tenants/new`, `admin/tenants/[id]`, `admin/tenants/[id]/theme`
- `admin/tenants/[id]/lifecycle` — **Tenant Lifecycle:** Manage lifecycle (Suspend/Reactivate), classify Plan Badge (`Free`/`Pro`/`Enterprise`).
- `admin/users`, `admin/users/invite`, `admin/users/[id]`
- `admin/organizations`, `admin/organizations/new`, `admin/organizations/[id]`
- `admin/approvals`, `admin/pending`
- **Security & Monitoring (SOC):**
  - `admin/security-center` — **SOC Dashboard:** Security Score, Activity Timeline, Anomaly Alerts, RLS Coverage
  - `admin/audit-logs` — **Audit Trail:** System-wide action logs
- `admin/page-builder`
- `admin/backup` — **Backup & Restore (DR):** Advanced backup and restore with filtering by tenant and viewing backup history via `cron_job_logs`
- `admin/performance` — **RLS Performance Benchmarking:** Experimental measurement of RLS custom claims performance
- `admin/threat-simulator` — **Threat Simulator:** Simulated attack tool for testing security against Noisy Neighbor & cross-tenant leaks
- **Finance & Budget:**
  - `admin/finance/transactions` (Review, Approval, Export)
  - `admin/finance/projects` (Project & Campaign Management)
  - `admin/finance/bank-accounts` (Bank Accounts & QR)
- **Content & Documentation:**
  - `admin/media` (Digital Library)
  - `admin/categories` (Classification & Catalog)
  - `admin/documents` (Internal Documents)

### 3.2 Tenant-Scoped Modules (`admin/t/[tenant_id]/*`)

- Branch dashboard
- **Tenant Security SOC:** Local SOC interface for configuring branch security (2FA, IP Whitelist, Force Logout, Anomaly Alerts).
- Internal notifications (News)
- Events & Schedules
- Internal documents
- Digital library (Media)
- Management pages (Pages)
- Categories
- FAQ
- Branch introduction
- Home page + Slides + Preview
- Budget + Projects
- Settings (general/domain/bank)

---

## 4) Main Business Flows by Module

### 4.1 News Management

Main actions: `createNews`, `updateNews`, `deleteNews`, approve/reject-related actions.

Features:

- Editors/volunteers can create articles based on the permission matrix.
- Status has a `draft` → `pending_review` → `published` flow.
- Supports `scheduled_at` and `published_to` (multi-tenant broadcast).
- Saves revision + audit log + notifications + revalidation for multiple tenants.

### 4.2 Events Management

Actions: `createEvent`, `updateEvent`, `deleteEvent`, `approveEvent`, `rejectEvent`.

Features:

- Tenant scope is enforced according to the user context when needed.
- Revalidates page/metrics by tenant after mutation.
- Saves revision/audit similar to news.

### 4.3 Budget & Internal Fund (Unified Project Flow)

Actions: `confirmTransaction`, `cancelTransaction`, `updateTransactionStatus`, export reports, `createProject`, `updateProject`.

Features:

- Centrally manages the entire budget through the **Project/Campaign** system.
- Combines purpose and project into a single `transaction_projects` table.
- Supports assigning a specific bank account to each campaign.
- Automatically adds/subtracts `current_amount` based on the confirmed status.
- Branch admins (`tenant_admin`) have **Read Only** access to ensure transparency.
- Dynamic Excel/PDF report export filtered by campaign and time.
- **Audit Trail:** All financial status changes are logged in `audit_logs`.
- Revalidates tag dashboard + transactions list.

### 4.4 Pages/CMS Structure

Actions: `createPage`, `updatePage`, `deletePage`, `updatePageStructure`.

Features:

- Manages page tree via `parent_id` + `order_index`.
- Saves revision when updating.

### 4.5 Media Management

Actions/API: `updateMediaMetadata`, `deleteMedia`, API link/youtube upload helpers.

Features:

- Metadata update according to schema.
- Deletes media by cleaning up Cloudinary before deleting the DB record.
- **Digital Library Broadcasting (New):**
  - Supports `published_to` (UUID[]) to share documents/videos with multiple branches.
  - Automatically displays on the dashboard of the shared branch.
  - Only allows Super Admin to adjust broadcast targets.

### 4.6 Tenant/System Settings

Actions: `updateSettings`, tenant CRUD actions.

Features:

- Cross-tenant modifications are blocked via context guard.
- Synchronizes theme/site settings + tenant config.
- Revalidates layout-level cache.

### 4.7 Visual Page Builder Enhancements
- **Mapping Key Overrides**: Allows Admin to customize content mapping keys (introKey, abbotKey, architectureKey) directly in the block settings interface, enabling precise control over which articles are displayed in automatic Mosaic blocks.
- **Standardized Category System (V3)**:
  - **Component**: `CustomCategorySelect` supports hierarchical category selection.
  - **Tab Separation**: Automatically separates categories into "System" (Global) and "Organization/Branch" (Local).
  - **Smart Filter**: Category filter on the list page (Events, Media) supports URL params, remembers filter state, and displays source labels (distinguishes between branches in Global Admin mode).
- **Modernized Projects UI (V2)**:
  - **Editor Interface**: Upgrades the add/edit project screen with a professional layout (content on the left, metadata on the right), similar to the news and dharma modules.
  - **Optimized Input**: Uses modern input fields for project name, description, financial goal, and deadline, reducing input errors.
  - **Branding Consistency**: Integrates the display of the source branch's logo and information directly into the editor to increase brand recognition.
- **AI & RAG Knowledge Management (New):**
  - **PDF Parser**: Functionality to extract text from ancient book PDF files (using the 2026 processing library).
  - **Semantic Indexing**: Automatically converts text segments into 768-dimensional vectors (Gemini) and stores them in the `dharma_embeddings` table.
  - **Validation**: Allows Admin to verify the context segments before they are used in the chatbot.
  - **RBAC Security Restriction**:
    - Only **Super Admin** has the right to configure the `ai_portal` layout.
    - Creating/updating a tenant with an AI layout is protected by server action validation (`requireSuperAdmin`).

### 4.8 New Security & Operational Features (Updated 21/05/2026)
- **Tenant Security Operations Center (Local SOC)**:
  - **Component**: Interface `/app/admin/t/[tenant_id]/security/page.tsx` and client form `security-settings-form.tsx`.
  - **Function**: Allows Tenant Admin to configure security policies including 2FA, IP Whitelist (for "Intranet Lockdown").
  - **Emergency Force Logout**: API `/api/admin/security/force-logout` revokes JWT sessions of all accounts belonging to the tenant in case of an incident, logging audit_logs.
  - **Authority**: Protected by RBAC at the `'users'` level, allowing Tenant Admin to manage branch security without needing Super Admin privileges.
- **Tenant Lifecycle Management**:
  - **Component**: Management screen `/app/admin/tenants/[id]/lifecycle/page.tsx`.
  - **Function**: Allows Super Admin to suspend or reactivate a tenant.
  - **Plan Type Badge**: Displays a visual badge (`Free` - gray, `Pro` - gold, `Enterprise` - purple) and a lifecycle status label ("Suspended" in red) on the tenant list page.
  - **Server Actions**: `suspendTenant` and `reactivateTenant` safely update `modules_config`, logging audit logs.
- **Enhanced Backup & Cron History**:
  - **Tenant Filtering**: Backup export supports filtering data by individual tenant and automatically adds the tenant name to the downloaded file name.
  - **Cron Logs Integration**: Reads directly from the `cron_job_logs` table to display the history of the last 10 backup processes (time, status, size, number of records).
- **RLS Performance Benchmarking**:
  - **Component**: Experimental screen `/admin/performance` compares the performance of three filtering mechanisms: App Filtering, RLS JOIN/SELECT, and RLS with Custom Claims JWT.
  - **Experimental Results**: Demonstrates the superior performance of RLS Custom Claims in reducing latency compared to traditional RLS JOIN.
- **Threat Simulator (Simulated Attack)**:
  - **Component**: Simulated access screen `/admin/threat-simulator` combined with API `/api/admin/security/simulate-attack` to demonstrate the robustness of RLS.
- **WORM Audit Vault (New v1.4.0)**:
  - **Component**: Widget `WormVaultWidget` in `/admin/security-center`.
  - **Backend**: `lib/security/worm-vault.ts` + API `GET/POST /api/admin/security/worm-vault`.
  - **Function**: Logs audit logs into an immutable ledger with SHA-256 hash-chaining. Each entry is cryptographically linked to the previous one — if any entry is altered, the system detects it.
  - **Display Status**: `VERIFIED` (green) or `CORRUPTED` (orange warning).
  - **ISO Mapping**: CLD.12.4.2 — Protection of Log Information.
- **Tenant Connection Pooler (New v1.4.0)**:
  - **Component**: Widget `TenantPoolerWidget` in `/admin/security-center`.
  - **Backend**: `lib/security/tenant-pooler.ts` + API `GET/POST /api/admin/security/tenant-pooler`.
  - **Function**: Limits DB connections by tier (Free=3, Pro=10, Enterprise=25) — protects healthy tenants from Noisy Neighbor DDoS.
  - **Simulation**: "Simulate Flood" button analyzes heuristic and marks violating tenants.
  - **ISO Mapping**: CLD.17.1.1 — Availability of Security Resources.

---

## 5) Mandatory Cross-Cutting Concerns in Admin Actions

1. AuthN/AuthZ guard at the beginning of the action.
2. Payload validation (schema-based).
3. Tenant scope enforcement for record mutation.
4. Audit log recording actor + old/new data.
5. Revalidate cache/path as appropriate.

---

## 6) Approval & Collaboration Flows

- Collaborators/editors create content in a pending state.
- High-level admins perform approve/reject actions.
- Successful publishing can trigger user/admin notifications based on the workflow.

---

## 7) Mini Runbook for Admin Incidents

### 7.1 Admin Cannot See Their Tenant Data

- Check `user_roles.tenant_id`.
- Check if the route is correctly set to `tenant_id`.
- Check the `requireTenantAccess` guard.

### 7.2 Saved Successfully but Interface Not Updated

- Check if the action called revalidate tag/path.
- Check if the cache tag matches the tenant key.

### 7.3 Cannot Delete/Update Record

- Likely blocked by `enforceTenantScopeForRecord` or permission matrix.

---

## 8) Checklist When Adding a New Admin Module

1. Clearly place the module in either the global or tenant zone.
2. Define `resource/action` permissions before building the UI.
3. Create server-first actions (do not call service roles directly from the client).
4. Add audit + revalidate.
5. Update admin docs + API/actions catalog.