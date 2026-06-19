import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK for server-side operations.
 */
if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : undefined;

        if (serviceAccount || process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('Firebase Admin credentials missing. Push notifications will not work.');
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

export const messaging = admin.apps.length ? admin.messaging() : null;

/**
 * Helper to send a push notification to specific tokens or a target group.
 */
export async function sendNotification({
    title,
    body,
    tokens,
    data,
    url
}: {
    title: string;
    body: string;
    tokens?: string[];
    data?: Record<string, string>;
    url?: string;
}) {
    if (!messaging || (!tokens?.length)) {
        return { success: false, message: 'No messaging service or tokens' };
    }

    try {
        const payload = {
            notification: { title, body },
            data: {
                ...data,
                click_action: url || '',
            },
            tokens: tokens,
        };

        const response = await messaging.sendEachForMulticast(payload);
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        };
    } catch (error) {
        console.error('FCM send error:', error);
        return { success: false, error };
    }
}

export default admin;
