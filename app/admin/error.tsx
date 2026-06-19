'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Error:', error);
    }, [error]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Đã xảy ra error!</h2>
            </div>
            <p className="text-muted-foreground max-w-md text-center">
                {error.message || 'Không thể tải dữ liệu. Please try again sau.'}
            </p>
            <Button onClick={() => reset()} variant="outline">
                Try again
            </Button>
        </div>
    );
}
