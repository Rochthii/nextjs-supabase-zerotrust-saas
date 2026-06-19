import { requireSuperAdmin } from '@/lib/permissions';

export default async function MobileAdminLayout({ children }: { children: React.ReactNode }) {
    // ─── SUPER ADMIN GUARD ──────────────────────────────────────────────
    // Block hoàn toàn mọi role (trừ super_admin) ngay từ Server (Backend)
    // Các role khác sẽ tự động nhận error 404 (để hidden đi sự tồn tại của chức năng)
    await requireSuperAdmin();

    return <>{children}</>;
}
