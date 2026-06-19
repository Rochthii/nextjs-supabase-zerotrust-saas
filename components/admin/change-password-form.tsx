'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await updatePassword(formData);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            // Reset form
            const form = document.getElementById('change-password-form') as HTMLFormElement;
            if (form) form.reset();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Đổi password
                </CardTitle>
                <CardDescription>
                    Đổi password sign in của bạn (Password mới phải có ít nhất 6 characters)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="change-password-form" action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password mới</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm password</Label>
                            <Input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang save...
                                </>
                            ) : (
                                'Save password mới'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
