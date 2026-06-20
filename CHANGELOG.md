# Changelog

All notable changes to **TenantShield** will be documented in this file.

## [1.0.0] - 2026-06-20

### Added
- **Zero Trust Multi-Tenancy:** Row-Level Security (RLS) configured directly in Supabase schema.
- **WORM Immutable Audit Vault:** Database triggers enforcing immutability of system activity ledger.
- **SOAR Active Threat Defense:** Real-time edge threat blocklist checked via Vercel Edge Middleware and cached in Upstash Redis.
- **AI Security Copilot & Semantic Cache:** Dynamic RAG audit parser leveraging `pgvector` and Gemini models.
- **B2B Analytics Dashboard:** Core SOC metrics, anomaly detection notifications, and Telegram instant alarms.
- **Commercial Landing Page:** Pitch deck section layouts (10 sections) ready to launch at `/`.
- **Custom Domains Setup:** Pre-configured Vercel domain alias hooks for buyers to assign custom URLs to tenants.

### Changed
- Refactored brand identity to **TenantShield**.
- Normalized seed data configurations to general templates (Acme Corp / Chicago Branch).

### Removed
- Removed unused local payment helpers and external locale dependencies.
- Disabled Firebase FCM integration to reduce setup complexity and dependency drag.
