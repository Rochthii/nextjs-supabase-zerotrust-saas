'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/constants/transaction';
import { Newspaper, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
    news: any[];
    transactions: any[];
}

export function RecentActivity({ news, transactions }: RecentActivityProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent News */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-playfair flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-blue-600" />
                        News latest
                    </CardTitle>
                    <Link href="/admin/news" className="text-sm text-blue-600 hover:underline">
                        View all
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {news.length === 0 ? (
                            <p className="text-sm text-gray-500">Chưa có news nào.</p>
                        ) : (
                            news.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                                    <div>
                                        <p className="font-medium text-[13px] text-gray-800 line-clamp-1">
                                            {item.title_vi}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {formatDate(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${item.status === 'published' ? 'bg-green-100 text-green-700' :
                                                item.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status === 'published' ? 'Published' : item.status === 'draft' ? 'Draft' : 'Save trữ'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-playfair flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-gold-primary" />
                        Payment latest
                    </CardTitle>
                    <Link href="/admin/transactions" className="text-sm text-gold-primary hover:underline">
                        View all
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-sm text-gray-500">Chưa có khoản payment nào.</p>
                        ) : (
                            transactions.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-gold-primary shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-[13px] text-gray-800">
                                                {item.is_anonymous ? 'Anonymous' : item.donor_name}
                                            </p>
                                            <span className="font-semibold text-[13px] text-gold-primary">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500">
                                            {formatDate(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })} -
                                            <span className="ml-1 italic">
                                                {item.transaction_projects?.title_vi || (
                                                    <>
                                                        {item.purpose === 'construction' && 'Xây dựng'}
                                                        {item.purpose === 'education' && 'Giáo dục'}
                                                        {item.purpose === 'charity' && 'Từ thiện'}
                                                        {item.purpose === 'general' && 'Chung'}
                                                        {!item.purpose && 'Category chung'}
                                                    </>
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
