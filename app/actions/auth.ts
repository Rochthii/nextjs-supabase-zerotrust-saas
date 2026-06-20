'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!newPassword || !confirmPassword) {
        return { success: false, error: 'Please enter all required information' };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'Password confirmation does not match' };
    }

    // Strong password policy
    if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(newPassword)) {
        return { success: false, error: 'Password must contain at least 1 uppercase letter' };
    }
    if (!/[a-z]/.test(newPassword)) {
        return { success: false, error: 'Password must contain at least 1 lowercase letter' };
    }
    if (!/[0-9]/.test(newPassword)) {
        return { success: false, error: 'Password must contain at least 1 number' };
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Log action
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'auth.users',
            recordId: user.id,
            newData: { action: 'change_password', success: true }
        });

        return { success: true, message: 'Password updated successfully' };
    } catch (error: any) {
        return { success: false, error: error.message || 'An error occurred' };
    }
}
