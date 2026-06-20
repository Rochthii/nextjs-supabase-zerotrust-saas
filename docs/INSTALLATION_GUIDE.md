# 🚀 QUICK START & DEPLOYMENT GUIDE
> **Product:** Enterprise Multi-Tenant SaaS Starter Kit  
> **Objective:** Spin up a local development server and push to production Vercel in under 15 minutes.

Follow this step-by-step setup guide to provision database schemas, configure edge caching, establish security alerts, and run the SaaS kit.

---

## 🛠️ STEP 1: PROVISION THE DATABASE (SUPABASE)

The system uses Supabase as a high-performance PostgreSQL engine, Auth provider, and File Storage.

1. Sign up or log in to the [Supabase Console](https://supabase.com/).
2. Click **New Project** -> Choose your Organization -> Enter a project name (e.g., `Enterprise SaaS Core`) -> Securely store the Database Password -> Choose a Region close to your users (e.g., `Singapore - ap-southeast-1`) -> Click **Create new project**.
3. **Run Schema Migrations**:
   - Navigate to the **SQL Editor** on the left sidebar.
   - Click **New Query** -> Rename it to `1. Schema Setup`.
   - Open and execute the SQL scripts under `supabase/` sequentially (from `001_extensions.sql` through `009_offboarding.sql`) in the editor.
   - Click **Run** for each. Verify that the console returns a `Success` message.
4. **Load Core Seed Data**:
   - Create a new query -> Rename it to `2. Seed Data`.
   - Copy the contents of [seed_saas_core.sql](file:///e:/Projects/Project_TN/_distribution_saas_core/supabase/seed_saas_core.sql) and paste it into the editor.
   - Click **Run**. This initializes the default corporate tenants and pre-configures testing roles.

---

## ⚡ STEP 2: PROVISION EDGE CACHE (UPSTASH REDIS)

Upstash Redis stores active IP blocklists and tenant routing configurations at Vercel Edge Runtime to optimize route-checking latency (< 4ms).

1. Log in to the [Upstash Console](https://upstash.com/).
2. Under the Redis tab, click **Create Database**:
   - **Name**: `nextsecure-cache`
   - **Region**: `ap-southeast-1` (Singapore - matching your Supabase region for minimal cross-service latency).
   - **Eviction**: Enabled (automatically clears expired keys when storage limit is reached).
   - Click **Create**.
3. Scroll down to the **REST API** section -> Click the **.env** tab -> Copy the values for `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

---

## 📢 STEP 3: CONFIGURE TELEGRAM BOT ALERTS (SOAR)

When threat indicators are triggered (e.g., cross-tenant queries, request flooding), the SOAR engine posts real-time alerts to your private Telegram channel.

1. Open Telegram and search for the official `@BotFather`.
2. Send the command `/newbot` -> Choose a display name (e.g., `SaaS SOC Alerts`) -> Choose a username ending in `_bot` (e.g., `saas_soc_alerts_bot`).
3. Copy the generated **HTTP API Token**.
4. **Retrieve your Chat ID**:
   - Search for `@userinfobot` on Telegram.
   - Send any message to the bot. It will return your numeric user ID (e.g., `987654321`). Save this ID.

---

## 💻 STEP 4: LOCAL DEVELOPMENT SETUP

1. Ensure Node.js (LTS version 20.x or higher) is installed on your machine.
2. In your terminal, navigate to the project root and install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: The `--legacy-peer-deps` flag is mandatory to resolve peer conflicts under React 19).*
3. Create your local environment configuration file:
   - Duplicate `.env.example` and name it `.env.local`
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and populate it with the credentials gathered from the previous steps:
     ```env
      # BRANDING & MAIN SETTINGS
      NEXT_PUBLIC_APP_NAME=TenantShield
      NEXT_PUBLIC_SITE_URL=http://localhost:3000

      # SUPABASE CONFIG
      NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
      SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]

      # UPSTASH REDIS CONNECTION
      REDIS_URL=redis://default:[password]@[your-redis-host]:6379

      # EMAIL INTEGRATION (RESEND)
      RESEND_API_KEY=re_[your-resend-key]

      # SECURITY SECRETS (Generate random 32-character strings)
      NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
      CRON_SECRET=cron_secure_secret_token_key_99
      REVALIDATE_SECRET=revalidate_secure_token_key_99

      # ACTIVE DEFENSE TELEGRAM NOTIFIER
      TELEGRAM_BOT_TOKEN=[your-telegram-token]
      TELEGRAM_CHAT_ID=[your-telegram-chat-id]

      # VERCEL DEPLOYMENT CONFIG (Leave blank in local development)
      VERCEL_PROJECT_ID=
      VERCEL_AUTH_TOKEN=
      VERCEL_TEAM_ID=
     ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to: [http://localhost:3000](http://localhost:3000).

---

## 🚀 STEP 5: PRODUCTION DEPLOYMENT & WILDCARD DNS

To support dynamic multi-tenant routing (e.g., `tenant1.yourdomain.com`), host on Vercel and establish a Wildcard DNS record.

### 5.1 Deploying to Vercel
1. Push your code to a private Git repository (GitHub / GitLab).
2. Log in to [Vercel](https://vercel.com/) -> Import your repository.
3. In the **Environment Variables** configuration, copy and paste all keys from your `.env.local` file.
4. Click **Deploy** and wait for the build pipeline to finish.

### 5.2 Configuring Wildcard DNS
1. On the Vercel project dashboard, go to **Settings** -> **Domains**.
2. Add your primary apex domain: `yourdomain.com`.
3. Add the wildcard domain: `*.yourdomain.com`.
4. In your DNS provider console (e.g., Cloudflare, GoDaddy, Route53), add these 2 records:
   - **A Record**: Host `@` -> Point to Vercel's IP address (e.g., `76.76.21.21`).
   - **CNAME Record**: Host `*` -> Point to `cname.vercel-dns.com`.
5. Once DNS propagates, Vercel will automatically provision a free Wildcard SSL certificate.

---

## 🧪 STEP 6: SMOKE TESTING & DEMO ACCOUNTS

Test the system role structure using the seeded accounts:

| Email | Role | Features to Test |
| :--- | :--- | :--- |
| **Email:** `superadmin@tenantshield.dev`<br>**Password:** `SuperAdmin@123` | **SuperAdmin** | Full access to the system. Navigate to `/admin/security-center` to view the Real-Time SOC dashboard, test the threat simulator, and check RLS database coverage. |
| **Email:** `member@acme.tenantshield.dev`<br>**Password:** `Member@123` | **TenantAdmin** (Acme Corp) | Isolated access. Navigate to the Acme tenant domain at `acme.yourdomain.com` (or `http://localhost:3000?tenant=acme` on local) to manage tenant-specific settings, users, and audit logs. |

---

## 🔍 7. TROUBLESHOOTING

### 7.1 "403 Forbidden" or Lockdown screen showing up
* **Issue**: Your client IP is blocked by the SOAR engine, or the tenant is suspended.
* **Resolution**: 
  - Ensure you are testing on `localhost:3000` (Middleware bypasses checks on local hosts).
  - On Production, run this SQL query in the Supabase Editor to unblock your IP:
    ```sql
    DELETE FROM public.blocked_ips WHERE ip = 'your-client-ip';
    ```

### 7.2 Subdomain routing not resolving locally
* **Issue**: Local desktop environments cannot route `tenant.localhost` automatically.
* **Resolution**:
  - Force tenant context by appending the query string: `http://localhost:3000?tenant=acme` to bypass domain rewrites during local UI testing.

---
*For advanced issues, please contact the repository system maintainer.*
