/**
 * Utility for interacting with Vercel API to manage custom domains.
 */


interface VercelDomainResponse {
    name: string;
    apexName: string;
    hasParent: boolean;
    isExternal: boolean;
    redirect?: string;
    redirectStatusCode?: number;
    gitBranch?: string;
    updatedAt: number;
    createdAt: number;
    verified: boolean;
    verification?: {
        type: string;
        domain: string;
        value: string;
        reason: string;
    }[];
}

interface VercelError {
    error: {
        code: string;
        message: string;
    };
}

/**
 * Adds a custom domain to the Vercel project using the Vercel API.
 * 
 * @param domain The custom domain to add (e.g., chuakhleang.com)
 * @returns Result object with success status and potential error message
 */
export async function addDomainToVercel(domain: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
        console.error('[VercelAPI] Missing VERCEL_API_TOKEN or VERCEL_PROJECT_ID');
        return { success: false, error: 'Missing Vercel API configuration (Token/Project ID).' };
    }

    const cleanDomain = domain.trim().toLowerCase();
    
    // Skip if it is a vercel subdomain (automated) or localhost
    if (cleanDomain.endsWith('.vercel.app') || cleanDomain === 'localhost') {
        console.log(`[VercelAPI] Domain ${cleanDomain} is a local or vercel domain, skipping API call.`);
        return { success: true };
    }

    try {
        const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
        const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${teamParam}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: cleanDomain }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorData = data as VercelError;
            console.error('[VercelAPI] Error adding domain:', errorData.error);
            
            // Domain already exists in this project - practically a success for us
            if (errorData.error.code === 'domain_already_in_use') {
                 return { success: true, data: data };
            }

            return { 
                success: false, 
                error: `Vercel Error: ${errorData.error.message}` 
            };
        }

        console.log(`[VercelAPI] Successfully added domain: ${cleanDomain}`);
        return { success: true, data: data as VercelDomainResponse };

    } catch (err: any) {
        console.error('[VercelAPI] Network error:', err);
        return { success: false, error: 'Failed to connect to the Vercel API.' };
    }
}
