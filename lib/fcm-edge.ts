import { SignJWT, importPKCS8 } from 'jose';

// Send Push Notifications via FCM HTTP v1 API compatible with Edge Runtime (Cloudflare)
export async function sendNotification({
    title,
    body,
    tokens,
    data = {},
    url = '',
}: {
    title: string;
    body: string;
    tokens?: string[];
    data?: Record<string, string>;
    url?: string;
}) {
    if (!tokens || tokens.length === 0) {
        return { success: false, message: 'No target tokens' };
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Missing Firebase configuration for Edge/Cloudflare Push.');
        return { success: false, message: 'Firebase credentials missing' };
    }

    try {
        // 1. Create JWT Token to retrieve access token for FCM HTTP v1
        const privateKeyObj = await importPKCS8(privateKey, 'RS256');
        const jwt = await new SignJWT({
            iss: clientEmail,
            sub: clientEmail,
            aud: 'https://oauth2.googleapis.com/token',
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
        })
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(privateKeyObj);

        // 2. Fetch Access Token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to obtain Firebase access token');
        }

        const { access_token } = await tokenResponse.json();

        // 3. Send notification to each token
        const successCount = [];
        const failureCount = [];

        for (const token of tokens) {
            const payload = {
                message: {
                    token,
                    notification: { title, body },
                    data: { ...data, click_action: url },
                },
            };

            const sendRes = await fetch(
                `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${access_token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (sendRes.ok) successCount.push(token);
            else failureCount.push(token);
        }

        return {
            success: true,
            successCount: successCount.length,
            failureCount: failureCount.length,
        };
    } catch (error: any) {
        console.error('Edge FCM Error:', error);
        return { success: false, message: error.message };
    }
}
