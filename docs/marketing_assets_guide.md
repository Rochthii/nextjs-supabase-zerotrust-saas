# 🎨 TenantShield Marketing Assets & Video Script Guide

This guide details how to construct high-converting visual assets and write/record a professional promo video for TenantShield to publish on CodeCanyon or Codester.

---

## 🖼️ 1. COVER IMAGE DESIGN SPECIFICATION
The **Cover Image** (Thumbnail) is the first element developers see when browsing the marketplace. It must look clean, authoritative, and stand out from generic boilerplates.

* **Marketplace Requirement:** `590 × 300 px` (PNG or JPG format).
* **Color Palette Theme:** Dark Slate Background (`#0f172a`), with glowing gradients of Indigo (`#6366f1`), Violet (`#a855f7`), and Emerald (`#10b981`).
* **Visual Hierarchy:**
  1. **Main Title (40% space):** "TenantShield" in large white bold font, next to a security shield icon.
  2. **Core Subtitle (20% space):** "Enterprise-Grade Next.js 16 + Supabase Boilerplate"
  3. **3 Glowing Badge Keywords (40% space):**
     * 🔒 `FORCE RLS Tenancy` (Purple Glow)
     * 🛡️ `WORM Audit Trail` (Blue Glow)
     * ⚡ `Edge Threat SOAR` (Green Glow)
* **Tip:** Avoid cluttering the cover image with screenshots. Keep it clean with sleek typography and vector badges. Use Canva, Figma, or hire a designer on Fiverr for $10-20.

---

## 📸 2. SCREENSHOTS FLOW (MINIMUM 8 IMAGES)
Prepare a ZIP file of screenshots (`900 × 503 px` or larger) showcasing actual pages with the seeded mock database from `seed_demo_preview.sql`.

| Image Order | Page Route | Primary Focus | Key Visuals to Highlight |
| :--- | :--- | :--- | :--- |
| **1. Primary** | `/admin/security-center` | **Security Center SOC** | Threat timeline feed, active blocked IPs count, green 100% RLS Coverage Badge. |
| **2. Routing** | `/admin/tenants` | **Tenant Lifecycle** | List of corporate tenants, status switch (Active/Suspended), custom domain mappings. |
| **3. Security** | `/admin/audit-logs` | **Compliance Ledger** | Immutable audit logs list with Severity badges (INFO, WARNING, CRITICAL) and risk scores. |
| **4. Isolation** | `nexus.domain.com` vs `hanoi.domain.com` | **Subdomain Isolation** | Browser windows side-by-side demonstrating data isolation (different transactions, members). |
| **5. Threat** | `/admin/security-center` | **IP Blocker UI** | IP Block list dashboard, manual Block/Unblock buttons, blocking reason columns. |
| **6. Copilot** | `/admin/documents` | **AI Vector RAG** | Document ingestion dashboard, semantic cache hit-rate metrics widget. |
| **7. Structure** | *IDE Screenshot* | **Clean Code & Schema** | Clean Next.js folder structure, clean SQL migration files under `supabase/`. |
| **8. Mobile** | `/admin/...` | **Responsive UI** | Beautiful responsive view of the security dashboard on an iPhone frame. |

---

## 📹 3. PROMO VIDEO SCRIPT (60 SECONDS)
> 🎬 **Active recorded Promo Video:** [Watch on YouTube](https://youtu.be/R5FtZ6kfNr4)

A 60-second video demo showing rapid actions, sleek screen transitions, and a clear English voiceover. Use a tool like **OBS Studio** or **Loom** to record in 1080p, and edit with transitions.

### ⏱️ Time-by-Time Breakdown:

#### [0:00 - 0:08] Hook: The Tenancy Security Problem
* **Screen:** Start on a dark slide: *"Most Next.js starters leak tenant data due to simple API bugs."* Transition to the TenantShield homepage.
* **Voiceover:** *"Most SaaS boilerplates leave multi-tenant database security entirely up to you, risking massive data leaks. Welcome to TenantShield."*

#### [0:08 - 0:20] Feature 1: Database-Level Isolation (FORCE RLS)
* **Screen:** Split-screen showing two browser windows (Tenant A and Tenant B). Try to query Tenant A's private data from Tenant B's session. Show PostgreSQL returning empty rows.
* **Voiceover:** *"TenantShield enforces strict multi-tenancy at the database engine level using PostgreSQL Row-Level Security. No application bugs can ever bypass it."*

#### [0:20 - 0:35] Feature 2: Immutable WORM Audit Logs & SOC
* **Screen:** Click into the `/admin/security-center` and show the SOC dashboard. Go to the Database console, try to run `DELETE FROM audit_logs`. Show the database throwing a red error: *"Audit logs are WORM and cannot be deleted."*
* **Voiceover:** *"For regulatory compliance, audit logs are fully immutable. Our WORM triggers block updates and deletions, even from administrators."*

#### [0:35 - 0:48] Feature 3: Active Defense & Edge SOAR
* **Screen:** Simulate an attack (brute force or cross-tenant scan). Show a real-time Telegram message notification pop up: *"CRITICAL: Threat detected. Blocking IP..."*. Go to `/admin/security-center` to show the IP added to the Blocked list.
* **Voiceover:** *"Threats are intercepted in under 4 milliseconds at the CDN Edge using Upstash Redis. Suspicious IPs are automatically blocked, and security alerts are piped directly to Telegram."*

#### [0:48 - 0:55] Developer Experience
* **Screen:** Scroll through the clean SQL migrations folder in VS Code, then run `npm run build` in the terminal to show a successful 100% Type-Safe build.
* **Voiceover:** *"Includes 9 structured migration files, strict TypeScript, and a responsive glassmorphism UI. Fully built for Next.js 16."*

#### [0:55 - 1:00] Call To Action (CTA)
* **Screen:** End slide with the logo: *"TenantShield — Launch Your Compliant B2B SaaS Today. Get it now on CodeCanyon."*
* **Voiceover:** *"Save 3 months of security engineering. Get TenantShield on CodeCanyon today."*

---

## 📣 4. TRAFFIC STRATEGY AFTER PUBLISHING
Once approved by CodeCanyon / Codester:
1. **Show HN (Hacker News):** Post a title like `Show HN: TenantShield – Next.js SaaS Boilerplate with DB-level FORCE RLS`. Focus on the architectural compliance aspect.
2. **Subreddits:** Share in `/r/nextjs`, `/r/supabase`, and `/r/reactjs`. Ask developers for feedback on your database RLS triggers.
3. **Twitter/X:** Post the 60-second video with tags like `#nextjs`, `#supabase`, `#saas`. Focus on the WORM log delete bypass error video clip — it gets high developer engagement.

