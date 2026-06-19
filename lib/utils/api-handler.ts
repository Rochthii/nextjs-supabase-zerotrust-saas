import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin } from '@/lib/permissions';

export type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse> | Promise<Response>;

/**
 * Higher-Order Function (HOC) wrapping API Routes for Admin.
 * - Validate Global Admin permissions (`isGlobalAdmin`)
 * - Automatically catch errors with try-catch, write detailed logs, and return JSON Response with status 500.
 */
export function withAdminAuth(handler: RouteHandler) {
    return async function (request: NextRequest, ...args: any[]) {
        try {
            // 1. Validate system Admin permissions
            const hasAccess = await isGlobalAdmin();
            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized. Access denied.' }, 
                    { status: 401 }
                );
            }

            // 2. Run the main handler
            return await handler(request, ...args);
        } catch (error: any) {
            console.error(`[API Admin Error - ${request.nextUrl?.pathname || 'Unknown'}]:`, error);
            return NextResponse.json(
                { error: error.message || 'Internal Server Error' }, 
                { status: 500 }
            );
        }
    };
}
