'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserCheck, ShieldOff } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';

interface PortalUser {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
    user_metadata: {
        full_name?: string;
        source?: string;
    };
}

export function PortalUsersPanel() {
    const [users, setUsers] = useState<PortalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Because auth.users is restricted to super_admin or service_role in Postgres by default,
            // we will fetch user_roles joined with user_profiles.
            // For full admin user management, we would use an edge function if we need to see auth.users.
            // For now, we query `user_profiles` directly, joining `user_roles` to filter 'portal_user'.
            
            // Query tenant_member_roles joining tenant_members to filter 'portal_user'
            const { data: rolesData, error: rolesError } = await supabase
                .from('tenant_member_roles' as any)
                .select(`
                    role_id,
                    created_at,
                    tenant_members:member_id (
                        user_id
                    )
                `)
                .eq('role_id', 'portal_user')
                .order('created_at', { ascending: false });

            if (rolesError) throw rolesError;

            // Collect user IDs
            const userIds = (rolesData || [])
                .map((ur: any) => ur.tenant_members?.user_id)
                .filter(Boolean);

            // Fetch profiles
            let profilesMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('user_profiles' as any)
                    .select('id, full_name, phone, avatar_url')
                    .in('id', userIds);

                if (profilesError) {
                    console.error('Failed to fetch user profiles:', profilesError);
                } else {
                    profilesData.forEach((p: any) => {
                        profilesMap[p.id] = p;
                    });
                }
            }

            // Map data securely
            const mappedUsers = (rolesData || [])
                .map((ur: any) => {
                    const userId = ur.tenant_members?.user_id;
                    const profile = profilesMap[userId] || {};
                    return {
                        id: userId,
                        email: 'N/A (Security)', 
                        created_at: ur.created_at,
                        user_metadata: {
                            full_name: profile.full_name || 'Học viên ẩn danh',
                        }
                    };
                })
                .filter((u: any) => u.id);

            setUsers(mappedUsers);
        } catch (err: any) {
            console.error('Error khi tải danh sách user portal:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    Danh sách những last namec viên đã registration account tham gia đàm đạo qua Dharma Portal.
                </p>
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Tải lại
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    Error: {error}
                </div>
            )}

            <div className="border rounded-md">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Last namec viên / Pháp danh</TableHead>
                            <TableHead>ID (UUID)</TableHead>
                            <TableHead>Ngày registration</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <InlineSpinner className="w-6 h-6 mx-auto text-amber-500" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    Chưa có last namec viên nào registration qua Cổng thông tin (Portal).
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                            {user.user_metadata.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-400 font-mono">
                                        {user.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            Đã validate
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                Save ý: Vì lý do security dữ liệu cá nhân theo tiêu standard quốc tế và quy định của Kiến trúc sư, Email và thông tin nhạy cảm của user được hidden khỏi bảng điều khiển CMS thông thường. Only Super Admin (có khóa Service Role) mới view được toàn bộ trên Supabase Dashboard.
            </p>
        </div>
    );
}
