'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map as MapIcon, Bell, BarChart3, Info, PenBox, UsersRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuizAdminPanel } from './quiz-admin-panel';
import { PortalUsersPanel } from './portal-users-panel';

export default function MobileManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold">Quản lý App Mobile</h1>
                    <p className="text-gray-500 mt-1">
                        Configuration và tinh chỉnh các tính năng cốt lõi của ứng dụng di động
                    </p>
                </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Notification từ Kiến trúc sư</AlertTitle>
                <AlertDescription className="text-blue-700">
                    Khu vực này được tách biệt hoàn toàn để bảo vệ bản quyền dữ liệu Mobile App. 
                    Mọi thay đổi tại đây không ảnh hưởng đến system Web của đối tác.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="quiz" className="w-full">
                <TabsList className="grid grid-cols-5 bg-slate-100 p-1 rounded-xl h-12">
                    <TabsTrigger value="quiz" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <PenBox className="w-4 h-4" /> Trắc Nghiệm
                    </TabsTrigger>
                    <TabsTrigger value="gis" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <MapIcon className="w-4 h-4" /> GIS Monitor
                    </TabsTrigger>
                    <TabsTrigger value="push" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Bell className="w-4 h-4" /> Push Noti
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BarChart3 className="w-4 h-4" /> Analytics
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <UsersRound className="w-4 h-4" /> Portal Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quiz" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PenBox className="w-5 h-5 text-amber-600" />
                                Quản lý Trắc Nghiệm Phật học (AI Quiz Engine)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <QuizAdminPanel />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gis" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-green-600" />
                                Bản đồ Hệ sinh thái (GIS Monitor)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-100 rounded-xl h-[400px] flex items-center justify-center text-gray-400">
                                <p className="flex items-center gap-2">
                                    <MapIcon className="w-5 h-5" />
                                    Display 50-100 ngôi chùa App-only trên Google Maps...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="push" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-500" />
                                Push Notification (FCM)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 py-8 text-center">Submit notification tới toàn bộ user app...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                App Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 py-8 text-center">Statistics count tải và user active...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UsersRound className="w-5 h-5 text-emerald-600" />
                                Quản lý User Portal (Học viên)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <PortalUsersPanel />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
