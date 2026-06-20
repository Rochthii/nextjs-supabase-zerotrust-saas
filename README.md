<div align="center">

# TenantShield – Zero Trust Multi-Tenant SaaS Framework for Next.js & Supabase

### Built with Next.js 16 - Supabase FORCE RLS - WORM Audit Logs - Edge Active Defense

**Save 3+ months of complex backend engineering.**  
Ship a production-grade, secure B2B SaaS platform in under 15 minutes.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash&logoColor=black)](https://upstash.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## Why does this exist?

Most SaaS boilerplates solve the easy problems — authentication, Stripe subscriptions, basic CRUD.

They leave the hardest part to you:

- How do you guarantee **tenant A can never see tenant B's data** — even if a developer forgets a query filter?
- How do you keep **audit logs that cannot be deleted** — even by a compromised admin account?
- How do you **block a malicious IP at the network edge** without taking down your database under DDoS?

This starter kit solves all three. Out of the box.

---

## What you get vs. what it costs to build yourself

| Module | Build from scratch | This kit | Time saved |
| :--- | :---: | :---: | :---: |
| Multi-tenant RLS & JWT Claims | ~4 weeks | Pre-configured | 4 weeks |
| WORM Immutable Audit Ledger | ~2 weeks | Postgres trigger ready | 2 weeks |
| Edge SOAR Active IP Defense | ~2 weeks | Redis Edge Middleware | 2 weeks |
| AI RAG Copilot & Semantic Cache | ~3 weeks | pgvector + Gemini wired | 3 weeks |
| Dynamic Custom Domain Routing | ~2 weeks | Vercel DNS API integrated | 2 weeks |
| **Total** | **~13 weeks** | **15-min deploy** | **3+ months** |

---

## Database at a glance

| Metric | Value |
| :--- | :--- |
| Tables | 42+ |
| RLS Policies | 35+ |
| Database Functions / RPCs | 22+ |
| Optimized Indexes | 30+ (GIN, GiST, HNSW/IVFFlat) |
| RLS Coverage | 100% (verified via get_rls_coverage()) |
| Vector Dimensions | 1536 (compatible with OpenAI & Gemini) |

---

## Architecture

```
Request
  └─ DNS Wildcard (*.yourdomain.com)
       └─ Next.js Edge Middleware
            ├─ Upstash Redis          <- IP blocklist check, tenant config cache
            └─ Next.js App Router
                 ├─ Supabase Supavisor (port 6543, Transaction Mode)
                 │    └─ PostgreSQL
                 │         ├─ Row-Level Security Policies   <- tenant isolation
                 │         └─ WORM Audit Trigger            <- immutable logs
                 ├─ Telegram Bot                            <- real-time SOAR alerts
                 └─ Gemini / Groq                           <- AI RAG + semantic cache
```

---

## Core capabilities

### Database-level tenant isolation (RLS)
Application-level `WHERE tenant_id = ?` is fragile — one missed filter leaks data. This kit enforces isolation inside Postgres itself via Row-Level Security and JWT custom claims. Developers cannot accidentally break it.

### WORM immutable audit ledger
Every insert, update, and delete is logged. The `audit_logs` table is protected by a Postgres trigger that raises an exception on any `UPDATE` or `DELETE` — even from a `service_role` admin key. Meets ISO 27017 and SOC2 audit requirements.

### SOAR edge active defense
Suspicious IPs are blocked at the CDN edge before they touch your database. Upstash Redis caches blocklists globally. Safe IPs are negative-cached for 15 seconds to prevent DB spam under load.

### Hybrid AI RAG engine
Combines PostgreSQL full-text search with `pgvector` cosine similarity. Semantic caching stores past answers — similar queries return cached results instead of calling the LLM API again.

### Dynamic multi-tenant routing & Marketing Landing Page
One codebase serves both the main marketing platform and unlimited tenants. The main domain serves a conversion-optimized Landing Page to pitch and sell the SaaS. Subdomains automatically resolve to specific isolated tenant workspaces, dynamically configured from the database.

---

## What's included (screenshots)

| Screen | Path |
| :--- | :--- |
| Landing Page Marketing | `/` |
| Real-Time SOC Dashboard | `/admin/security-center` |
| Tenant & Lifecycle Management | `/admin/tenants` |
| Immutable Audit Log Explorer | `/admin/audit-logs` |
| Finance Ledger & Donations | `/admin/finance` |
| AI Knowledge Base & Chat | `/admin/documents` |
| CMS: News, Events, Media | `/admin/news`, `/admin/events`, `/admin/media` |
| Role & User Management | `/admin/users` |

> *Live demo screenshots available on the product page.*

---

## Package contents

```
.
├── app/                    # Next.js 16 App Router (landing page + admin + tenant public pages)
├── components/             # UI component library (Radix UI + shadcn/ui)
├── public/
│   └── docs/
│       └── docs.html       # Offline interactive HTML installation documentation
├── lib/
│   ├── permissions.ts      # Full RBAC system with per-resource overrides
│   ├── security/           # Edge defense engine + Redis client
│   └── audit/              # WORM audit logger + anomaly detection
├── supabase/
│   ├── 001_extensions.sql  # Database extensions config
│   ├── 003_auth_rbac.sql   # RBAC v2 architecture DDL
│   ├── 006_rls.sql         # RLS isolation policy definitions
│   ├── 008_grants.sql      # Database RPC grants configuration
│   └── seed_demo_preview.sql # Full mock data for instant live preview
└── .env.example            # All required environment variables, pre-documented
```

---

## Quick start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# -> Fill in Supabase, Upstash Redis, and Telegram keys

# 3. Run the database setup
# -> Run files under supabase/ in order in Supabase SQL Editor
# -> Import supabase/seed_demo_preview.sql for preview data

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the main Landing Page, or [http://localhost:3000/login](http://localhost:3000/login) to access the control panel.

---

## Demo accounts (seeded)

| Email | Password | Role |
| :--- | :--- | :--- |
| `superadmin@tenantshield.dev` | `SuperAdmin@123` | SuperAdmin — full system access, SOC dashboard, tenant management |
| `member@acme.tenantshield.dev` | `Member@123` | TenantAdmin — isolated to Acme tenant only (`?tenant=acme`) |

---

## Tech stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v3, shadcn/ui, Radix UI |
| Database | Supabase (PostgreSQL 15+, pgvector) |
| Auth | Supabase Auth + JWT Custom Claims |
| Edge Cache | Upstash Redis (Serverless) |
| AI / RAG | Google Gemini API, Groq (Llama 3 fallback), pgvector |
| Email | Resend |
| Monitoring | Sentry, PostHog, Vercel Analytics |
| Testing | Vitest (unit), Playwright (E2E) |

---

## Documentation

| Document | Description |
| :--- | :--- |
| [docs.html](public/docs/docs.html) | Interactive step-by-step offline deployment guide (HTML format) |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | Standard deployment guide (local + Vercel production) |
| [COMMERCIAL_PRODUCT_DOCS.md](docs/COMMERCIAL_PRODUCT_DOCS.md) | Architecture diagrams, ERD, environment reference, maintenance runbook |
| [03_SECURITY_PERMISSIONS.md](docs/03_SECURITY_PERMISSIONS.md) | Full RBAC matrix and permission system documentation |

---

## FAQ

**Does this work without the AI features?**  
Yes. The AI modules (RAG, vector search, Gemini) are fully optional. The core multi-tenant infrastructure runs independently without any AI API keys.

**Can I use a different database than Supabase?**  
The architecture is tightly coupled to Supabase's RLS and Auth system. Migrating to another Postgres host is possible, but Supabase Auth would need to be replaced.

**Is this production-ready?**  
The architecture and database layer are production-grade. You are responsible for your own Vercel, Supabase, and third-party service configurations before going live with real users.

**What is the license?**  
Single-project commercial license. You may use this kit to build and ship one SaaS product. Redistribution or resale of the source code is prohibited.

---

<div align="center">

*Built by engineers who got tired of rebuilding the same infrastructure from scratch.*

</div>