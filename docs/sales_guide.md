# 🚀 Hướng dẫn Bán Source Code Chuyên nghiệp trên Marketplace

---

## I. Phân tích Đối thủ Cạnh tranh Thực tế

### A. Đối thủ trực tiếp đang bán trên Chợ (Chợ Script)

| Tên sản phẩm | Nền tảng | Giá Regular | Điểm mạnh | **Điểm yếu so với dự án của anh** |
|:---|:---|:---|:---|:---|
| **31SaaS** (Next.js 14) | CodeCanyon | **$81** | Landing page đẹp | ❌ Không có FORCE RLS, không có Audit WORM, không chặn IP |
| **SaasPilot** | CodeCanyon | **$59** | Hỗ trợ Supabase + Stripe | ❌ Multi-tenancy chỉ ở tầng API Node.js (có thể bị bypass) |
| **Jampack** | CodeCanyon | **$69** | Billing + AI Chat | ❌ Không có Security Dashboard, không SOC2 compliance |
| **BoilerPro** | Codester | **$49** | AWS-focused | ❌ Không có Edge Defense, Telegram Alerts |

### B. Đối thủ Premium (Bán trực tiếp, không qua chợ)

| Tên sản phẩm | Giá | Điểm mạnh | **Điểm yếu so với dự án của anh** |
|:---|:---|:---|:---|
| **MakerKit** | $299 – $599 | Multi-tenancy mạnh nhất thị trường | ❌ RLS ở tầng code, không phải database — vẫn có thể rò rỉ nếu quên điều kiện WHERE |
| **Supastarter** | $349 | Docs tốt, i18n | ❌ Không có WORM Audit, không có Active Defense |
| **ShipFast** | $169 – $199 | Tốc độ triển khai cực nhanh | ❌ Thiết kế cho B2C, không hỗ trợ multi-tenancy |

### C. Kết luận Vị thế Cạnh tranh

> **Dự án của anh nằm trong một khoảng trống thị trường (Market Gap) rất rõ ràng:**  
> Không có bất kỳ sản phẩm nào trên các chợ script có đủ 3 tính năng: **FORCE RLS tầng database** + **WORM Audit Trail** + **Edge Active Defense với Telegram SOAR**

**Định vị:** *"Bộ duy nhất trên thị trường có kiến trúc bảo mật zero-trust đạt chuẩn SOC2/ISO 27001 cho B2B SaaS xây dựng trên Next.js và Supabase."*

---

## II. Chiến lược Định giá cho Chợ Script (Thụ động 100%)

| License | Mức giá | Giải thích |
|:---|:---|:---|
| **Regular License** | **$79** | Phù hợp cho 1 dự án cá nhân. Đây là "impulse buy zone" của lập trình viên quốc tế (họ mua ngay không cần suy nghĩ). |
| **Extended License** | **$349** | Cho phép embed vào sản phẩm thương mại để bán lại cho khách. Đây là nguồn thu chính khi Agency mua. |

**Dự báo ước tính nếu lên top trang của CodeCanyon:**
- 200 Regular License × $79 × 70% (sau phí chợ) = **$11,060**
- 15 Extended License × $349 × 70% = **$3,664**
- **Tổng thụ động: ~$14,700 (~370 triệu VNĐ) mỗi năm đầu**

---

## III. Checklist Nộp bài lên CodeCanyon/Codester

### A. Yêu cầu bắt buộc kỹ thuật (Hard Requirements)

- [ ] `npm run build` và `npm start` chạy sạch không lỗi ✅ (đã hoàn thành)
- [ ] TypeScript 100%, không có `@ts-ignore` không cần thiết
- [ ] Không hardcode API key, URL, secret — chỉ dùng `.env.example` ✅
- [ ] Xóa file `.env` thực tế (có secret thật) trước khi nén zip ✅
- [ ] Cấu trúc thư mục rõ ràng, chuyên nghiệp ✅
- [ ] Tất cả dependencies trong `package.json`, không link CDN ngoài ✅
- [ ] Có file `README.md` tiếng Anh cơ bản ✅
- [ ] Cung cấp **Live Demo URL** đang hoạt động thực tế (bắt buộc)

### B. Yêu cầu tài liệu (Documentation — Cực kỳ quan trọng)

- [ ] **Tài liệu HTML hoặc PDF tiếng Anh** bao gồm:
  - Hướng dẫn cài đặt step-by-step (Supabase, Upstash, Vercel)
  - Danh sách dependencies và license của từng thư viện
  - Hướng dẫn tùy biến (thêm bảng, tùy chỉnh role)
  - FAQ và Troubleshooting phổ biến

### C. Yêu cầu Marketing Visual (Phần quan trọng nhất để bán được)

- [ ] **Cover Image** (590×300px): Ảnh nền tối chuyên nghiệp, nổi bật 3 keyword chính
- [ ] **Screenshots** (tối thiểu 8–10 ảnh): Chụp từng màn hình quan trọng của Admin Panel
- [ ] **Preview Video** (60–90 giây): Quay màn hình thao tác thực tế
- [ ] **Live Demo URL**: Deploy lên Vercel với tài khoản demo sẵn sàng đăng nhập

---

## IV. Nội dung Marketing — Copy Bán Hàng Tiếng Anh

### A. Tiêu đề sản phẩm (Title) — Chuẩn SEO cho CodeCanyon

```
Zero Trust Multi-Tenant B2B SaaS — Next.js 16 + Supabase FORCE RLS 
+ WORM Audit + Edge IP Defense — SOC2 Ready Boilerplate
```

### B. Mô tả ngắn (Tagline — 1 dòng)

```
The only Next.js SaaS boilerplate with database-level tenant isolation, 
tamper-proof audit logs, and real-time Edge threat blocking — built for 
compliance-critical B2B applications.
```

### C. Mô tả sản phẩm chi tiết (Description Body)

#### 🔒 Why This Is Different From Every Other Boilerplate

Most Next.js SaaS starters filter tenant data at the **API layer**. 
If a developer forgets one `WHERE tenant_id = ?`, tenant A can read tenant B's data. 
This is a critical security flaw that has caused real-world data breaches.

**This boilerplate enforces isolation at the database layer.** 
Even if application code is buggy, PostgreSQL Row-Level Security (FORCE RLS) 
blocks cross-tenant access automatically — no exceptions, no bypass.

#### ✅ Key Features

**🏗️ Database Architecture — Enterprise-Grade:**
- `FORCE ROW LEVEL SECURITY` on all tenant tables (even table owners cannot bypass)
- RBAC v2: `tenant_members` + `tenant_member_roles` — multi-role per user per tenant
- Security Definer functions locked with `SET search_path` against SQL injection
- Dynamic permission engine `has_permission_for_tenant()` for policy evaluation
- 9 sequential SQL migration files, clean and production-ready

**🛡️ WORM Immutable Audit Trail (SOC2/ISO 27001):**
- Tamper-proof audit logs — UPDATE and DELETE throw a database exception
- Even `service_role` cannot modify audit records
- Severity-based logging with tenant and user context

**⚡ Edge Active Defense (SOAR):**
- Upstash Redis negative caching: blocked IPs stopped at CDN edge in <4ms
- Sliding-window rate limiting via Postgres RPC
- Automatic IP blocking + real-time Telegram security alerts
- Tenant suspension enforcement at the edge

**🎛️ Admin Control Plane:**
- Security Center with SOC dashboard
- Audit Log Explorer with full filtering
- Blocked IP Manager
- Multi-tenant Branch Management (CRUD + lifecycle)
- RBAC user management with role assignment
- Analytics: tenant distribution, security event volume

**🌐 Multi-Tenant Routing:**
- Dynamic subdomain routing: `tenant.yourdomain.com`
- Custom domain support via middleware rewrite
- Locale-aware i18n routing (Next-intl)

#### 📦 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL with native FORCE RLS)
- **Edge Cache:** Upstash Redis
- **UI:** Tailwind CSS + shadcn/ui + Glassmorphism Design
- **State:** React Server Components + Server Actions

#### 👥 Who Is This For?

- **Developers** building B2B SaaS that handles sensitive multi-tenant data
- **Agencies** that need to pass security audits for enterprise clients
- **Startups** targeting customers in finance, healthcare, or legal sectors
- Anyone building on Supabase who wants enterprise security without hiring a dedicated security engineer

#### 🚫 Who Is This NOT For?

- B2C single-user applications (use ShipFast for that)
- Projects that don't need multi-tenancy or security compliance

---

## V. Screenshots & Demo Cần Chuẩn bị

### Thứ tự Screenshots (theo thứ tự tác động tâm lý)

1. **Security Center Dashboard** — Màn hình "wow" nhất, hiển thị RLS coverage 100%, threat timeline
2. **Multi-Tenant Branch Management** — Danh sách tenant với status, domain, lifecycle
3. **RBAC User Management** — Bảng nhân sự với role badge đẹp, phân quyền rõ ràng
4. **Audit Log Explorer** — Bảng logs WORM với filter, severity badge
5. **Blocked IP Dashboard** — Real-time IP block list, map nguồn tấn công
6. **Tenant Security Center** — 2FA compliance monitor, anomaly detection
7. **Analytics Dashboard** — Security events chart, tenant distribution
8. **SQL Migration Files** — Screenshot folder `supabase/` sạch sẽ, chuyên nghiệp
9. **Architecture Diagram** — Sơ đồ minh họa Zero Trust flow
10. **Code Snippet** — RLS policy code đẹp, `FORCE ROW LEVEL SECURITY`

### Script cho Preview Video (60 giây)

```
0-5s: Title card — "Zero Trust B2B SaaS — Built for Compliance"
5-15s: Security Center dashboard — live data, real-time threat feed
15-25s: Demo đăng nhập bằng 2 tài khoản tenant khác nhau,
        chứng minh dữ liệu cô lập hoàn toàn
25-35s: Simulate attack → IP bị block tự động → Telegram alert nhận được
35-45s: WORM Audit Log — thử DELETE → database throw exception
45-55s: Folder structure + SQL migrations — professional and clean
55-60s: CTA: "Get it on CodeCanyon — Link in description"
```

---

## VI. Lộ trình Triển khai (Timeline)

| Tuần | Việc cần làm |
|:---|:---|
| **Tuần 1** | Deploy Live Demo lên Vercel với dữ liệu demo sẵn sàng. Đảm bảo tài khoản demo có thể đăng nhập mà không cần config gì. |
| **Tuần 2** | Chụp Screenshots + Quay Preview Video. Viết Documentation HTML tiếng Anh hoàn chỉnh. Nén file ZIP chuẩn theo yêu cầu Envato. |
| **Tuần 3** | Submit lên CodeCanyon (thời gian review 5–10 ngày làm việc). Song song đó đăng lên Codester (review nhanh hơn, 2–3 ngày). |
| **Tuần 4+** | Sau khi được duyệt: Chia sẻ link trên Reddit `/r/nextjs`, `/r/supabase`, Hacker News (Show HN), Twitter/X để kéo traffic về trang chợ. |

---

## VII. Những gì CẦN LÀM NGAY trước khi Submit

1. **Deploy Live Demo:** Tạo một tài khoản Vercel/Supabase riêng cho demo, seed dữ liệu giả lập. Đây là điều bắt buộc của CodeCanyon.
2. **Tạo Documentation HTML:** Viết file `docs.html` tiếng Anh chi tiết, tối thiểu 1,000 từ.
3. **Thiết kế Cover Image:** Thuê trên Fiverr (~$20) hoặc tự làm bằng Figma/Canva Pro. Đây là ảnh thumbnail khách nhìn đầu tiên.
4. **Quay Preview Video:** OBS Studio (miễn phí) quay màn hình + giọng đọc tiếng Anh.
5. **Nén file ZIP sạch:** Xóa `.env`, `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` trước khi nén.
