'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { updateTenantDomain } from '@/app/actions/admin/tenants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DomainFormProps {
    tenantId: string;
    currentDomain: string;
}

export function DomainForm({ tenantId, currentDomain }: DomainFormProps) {
    const router = useRouter();
    const [domain, setDomain] = useState(currentDomain);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!domain.trim()) {
            toast.error('Please nhập name miền');
            return;
        }

        if (domain === currentDomain) {
            toast.info('Name miền none thay đổi');
            return;
        }

        try {
            setIsLoading(true);
            const { success, error } = await updateTenantDomain(tenantId, domain);

            if (success) {
                toast.success('Đã update name miền successfully!');
                router.refresh();
            } else {
                toast.error(error || 'Đã có error xảy ra khi update name miền');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error connect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl border-gold-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gold-primary/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-dark">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold font-playfair text-coffee-dark">
                            Name Miền Tùy Chỉnh (Custom Domain)
                        </CardTitle>
                        <CardDescription>
                            Configuration address truy cập cho portal của organization
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="pt-6 space-y-6">
                    {/* Hướng dẫn */}
                    <Alert className="bg-blue-50 border-blue-200">
                        <InfoIcon className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 font-semibold">Name miền là gì?</AlertTitle>
                        <AlertDescription className="text-blue-700 mt-1">
                            Name miền là address để nhân sự, đối tác truy cập portal (VD: <b>ten-to-chuc.vn</b>).
                            Bạn cần trỏ DNS của name miền về server system trước khi website có thể hoạt động qua name miền này.
                        </AlertDescription>
                    </Alert>

                    {/* Input Field */}
                    <div className="space-y-3">
                        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 font-bold">
                            Name miền current
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                https://
                            </span>
                            <Input
                                id="domain"
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="pl-16 font-mono text-lg border-gray-300 focus:ring-gold-primary focus:border-gold-primary"
                                placeholder="congtycuaban.com"
                            />
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Đã loại bỏ tự động <i>http://</i> và <i>https://</i>
                        </p>
                    </div>

                    {/* Preview Warning */}
                    {domain !== currentDomain && domain.length > 3 && (
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-orange-800">Save ý khi đổi name miền</h4>
                                    <ul className="text-sm text-orange-700 mt-2 space-y-2 list-disc pl-4">
                                        <li>Name miền cũ <b><a href={`https://${currentDomain}`} className="underline">{currentDomain}</a></b> sẽ không còn trỏ về website này.</li>
                                        <li>Đảm bảo name miền <b>{domain}</b> đã được configuration trỏ DNS (A Record / CNAME) đúng system.</li>
                                        <li>Sau khi save, website có thể mất vài phút để system update SSL tự động.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Website sẽ khả dụng tại:</span>
                        <a
                            href={`https://${domain || currentDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-gold-dark hover:underline flex items-center gap-1"
                        >
                            {domain || currentDomain}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || domain === currentDomain || !domain.trim()}
                        className="bg-gold-primary hover:bg-gold-dark text-white font-medium px-6 shadow-sm"
                    >
                        {isLoading ? 'Đang save...' : 'Save Thay Đổi'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

function InfoIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
