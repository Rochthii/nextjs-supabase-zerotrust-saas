"use client";

import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { createClient } from '@/lib/supabase/client';
import { getVietnamTime } from '@/lib/utils/date';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PushNotificationManager handles:
 * 1. Requesting user permission for notifications
 * 2. Getting FCM Token from Firebase
 * 3. Saving the token to Supabase fcm_tokens table
 */
export function PushNotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            if (Notification.permission === 'granted') {
                registerToken();
            }
        }
    }, []);

    const registerToken = async () => {
        if (!messaging) return;

        try {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });

            if (token) {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                // Save or update token in Supabase
                const { error: upsertError } = await supabase
                    .from('fcm_tokens' as any)
                    .upsert({
                        user_id: user?.id || null,
                        token: token,
                        device_type: 'web',
                        last_used_at: new Date().toISOString(),
                    }, { onConflict: 'token' });

                if (upsertError) {
                    console.error('Error saving FCM token:', upsertError);
                }
            }
        } catch (err) {
            console.error('Error getting FCM token:', err);
        }
    };

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.error("Trình duyệt của bạn không hỗ trợ notification.");
            return;
        }

        setLoading(true);
        try {
            const status = await Notification.requestPermission();
            setPermission(status);

            if (status === 'granted') {
                await registerToken();
                toast.success("Notification đã được activate.");
            } else if (status === 'denied') {
                toast.error("Bạn đã rejected nhận notification. Hãy enable lại trong settings trình duyệt.");
            }
        } catch (err) {
            setError("Error khi yêu cầu quyền.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Only show if messaging is supported and permission is not denied
    if (!messaging || permission === 'denied' || permission === 'granted') {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
            <button
                onClick={requestPermission}
                disabled={loading}
                className="bg-gold-primary text-white p-4 rounded-full shadow-2xl hover:bg-gold-dark transition-all flex items-center gap-3 group"
                title="Nhận notification Phật sự"
            >
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span className="hidden group-hover:block text-sm font-bold whitespace-nowrap pr-2">
                            Nhận notification
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}

// Background listening logic (can be expanded)
if (typeof window !== 'undefined' && messaging) {
    onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        if (payload.notification) {
            toast(payload.notification.title, {
                description: payload.notification.body,
                icon: <Bell className="w-4 h-4" />,
            });
        }
    });
}
