# ⚡ TenantShield Quickstart Guide
> **Launch your secure B2B SaaS Boilerplate in 5 Minutes.**

TenantShield is pre-configured to be deployed on **Gumroad, CodeCanyon, LemonSqueezy, or direct B2B sales**. Follow this quick guide to deploy it to production.

---

## 🚀 5-Step Deployment Checklist

### [ ] 1. Provision Supabase (Database & Auth)
1. Create a new project at [Supabase Console](https://supabase.com).
2. Go to **SQL Editor** -> Execute the SQL scripts in `supabase/` sequentially (from `001_` to `009_`).
3. Load the sample B2B tenants data by running the contents of `supabase/seed_saas_core.sql`.

### [ ] 2. Provision Upstash Redis (Edge Cache)
1. Create a Serverless Redis Database at [Upstash Console](https://upstash.com).
2. Copy the `REDIS_URL` connection string (e.g. `redis://default:password@host:port`).

### [ ] 3. Create Telegram Bot Alerts (SOAR Notification)
1. Text `@BotFather` on Telegram and send `/newbot` to create your alert notifier. Copy the **API Token**.
2. Resolve your chat ID by texting `@userinfobot` to get your numeric ID.

### [ ] 4. Local Run & Configuration
1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Copy `.env.example` to `.env.local` and fill in your keys (Supabase, Upstash Redis, Resend API key, Telegram bot info).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access: [http://localhost:3000](http://localhost:3000)

### [ ] 5. Vercel Production & Wildcard SSL
1. Import your private repository to [Vercel](https://vercel.com).
2. Populate the Environment Variables matching your `.env.local` parameters.
3. Under Vercel Settings > Domains:
   - Add your main domain (e.g., `yourdomain.com`).
   - Add wildcard subdomain (e.g., `*.yourdomain.com`).
4. Set up CNAME `*` pointing to `cname.vercel-dns.com` in your DNS provider (Cloudflare, AWS Route53, GoDaddy) for dynamic tenant routing.

---

## 🔐 Default Demo Credentials
Use these accounts to test after seeding the database:

* **Global SuperAdmin Portal:**
  - **URL:** `/login` on main domain
  - **Email:** `superadmin@tenantshield.dev`
  - **Password:** `SuperAdmin@123`
* **Isolated Tenant Member Portal:**
  - **URL:** `http://localhost:3000?tenant=acme` (or `acme.yourdomain.com` in production)
  - **Email:** `member@acme.tenantshield.dev`
  - **Password:** `Member@123`

---
*For complete technical architectural details, refer to [INSTALLATION_GUIDE.md](file:///docs/INSTALLATION_GUIDE.md).*
