import { redirect } from 'next/navigation';

/**
 * Route /auth/login fallback redirect
 * Tự động chuyển hướng từ /auth/login về trang đăng nhập chuẩn /login để tránh xung đột với Dynamic Tenant Routing
 */
export default function AuthLoginRedirectPage() {
    redirect('/login');
}
