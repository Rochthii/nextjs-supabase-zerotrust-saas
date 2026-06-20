import { requireSuperAdmin } from '@/lib/permissions';

export default async function MobileAdminLayout({ children }: { children: React.ReactNode }) {
    // ─── SUPER ADMIN GUARD ──────────────────────────────────────────────
    // Completely block all roles (except super_admin) at the Server level (Backend)
    // Other roles will automatically receive a 404 error (to hide the existence of the feature)
    await requireSuperAdmin();

    return <>{children}</>;
}
