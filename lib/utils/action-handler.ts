export type ActionResponse = {
    success: boolean;
    id?: string;
    message?: string;
    error?: string;
    unauthorized?: boolean;
};

/**
 * Server Action Wrapper for centralized error management (try-catch).
 * - Automatically catches UnauthorizedError or other Unauthorized messages from the system.
 * - Standardizes the response format returned to the Client.
 * - Eliminates manual try-catch boilerplate in Server Actions.
 */
export function executeSafeAction<Args extends any[]>(
    action: (...args: Args) => Promise<ActionResponse | any>
) {
    return async function (...args: Args): Promise<ActionResponse> {
        try {
            return await action(...args);
        } catch (error: any) {
            const isUnauthorized = 
                error.name === 'UnauthorizedError' || 
                error.message?.includes('Unauthorized') ||
                error.message?.includes('Permission denied');

            console.error('[Server Action Error]:', error);

            return {
                success: false,
                error: error.message || 'An unexpected system error occurred',
                unauthorized: isUnauthorized ? true : undefined
            };
        }
    };
}
