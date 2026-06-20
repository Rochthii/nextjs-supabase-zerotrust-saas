'use client';

import React, { useState } from 'react';
import { Role } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// @ts-ignore - Module import cache
import { RoleSelector } from '@/components/admin/role-selector';
// @ts-ignore - Module import cache
import { updateUserRole, toggleUserBan } from '@/app/actions/admin/users';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ban, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UserFormProps {
    userId: string;
    currentRole: Role;
    currentTenantId?: string | null;
    tenants?: { id: string; name: string }[];
    isBanned: boolean;
    canEdit: boolean;
    metadata?: any;
    currentUserRole?: string | null;
}

export function UserForm({ userId, currentRole, currentTenantId, tenants = [], isBanned, canEdit, metadata, currentUserRole }: UserFormProps) {
    const router = useRouter();
    const [role, setRole] = useState<Role>(currentRole);
    const [tenantId, setTenantId] = useState<string>(currentTenantId || '');
    const [banned, setBanned] = useState(isBanned);
    const [loading, setLoading] = useState(false);

    const handleUpdateRole = async () => {
        if (!canEdit) return;

        const isTenantRole = ['tenant_admin', 'tenant_editor', 'tenant_accountant'].includes(role);
        if (isTenantRole && !tenantId) {
            toast.error('Please select a branch for this Tenant permission.');
            return;
        }

        setLoading(true);

        const result = await updateUserRole(userId, role, isTenantRole ? tenantId : null);

        if (result.success) {
            toast.success('User role updated successfully!');
            router.refresh();
        } else {
            toast.error(result.error || 'Could not update role');
        }

        setLoading(false);
    };

    const handleToggleBan = async () => {
        if (!canEdit) return;

        setLoading(true);

        const result = await toggleUserBan(userId, !banned);

        if (result.success) {
            setBanned(!banned);
            toast.success(banned ? 'User activated successfully!' : 'User banned successfully!');
            router.refresh();
        } else {
            toast.error(result.error || 'Update status failed');
        }

        setLoading(false);
    };

    if (!canEdit) {
        return (
            <Alert>
                <AlertDescription>
                    You don't have permission to edit users. Only Super Admins can manage user roles.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* New User Request Info */}
            {currentRole === 'viewer' && metadata?.requested_tenant_name && (
                <Alert className="bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                            <p className="font-bold text-blue-900">New Join Request</p>
                            <AlertDescription className="text-blue-800">
                                This member registered from the administration page of: <span className="font-bold">{metadata.requested_tenant_name}</span>.
                                <br />Please grant permissions and select the corresponding branch below.
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Role Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RoleSelector
                        currentRole={role}
                        onChange={setRole}
                        disabled={loading}
                        allowedRoles={currentUserRole === 'tenant_admin' ? ['tenant_editor', 'moderator', 'editor', 'volunteer', 'viewer'] : undefined}
                    />

                    {['tenant_admin', 'tenant_editor', 'tenant_accountant'].includes(role) && (
                        <div className="space-y-2 mt-4">
                            <Label>Select Branch to Manage <span className="text-red-500">*</span></Label>
                            <Select
                                value={tenantId}
                                onValueChange={setTenantId}
                                disabled={loading || currentUserRole === 'tenant_admin'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Select Branch --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentUserRole === 'tenant_admin' ? (
                                        <SelectItem key={tenantId} value={tenantId}>
                                            {tenants.find(t => t.id === tenantId)?.name || 'Your Branch'}
                                        </SelectItem>
                                    ) : (
                                        tenants.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}



                    <Button
                        onClick={handleUpdateRole}
                        disabled={loading || (role === currentRole && tenantId === (currentTenantId || ''))}
                        className="w-full mt-4"
                    >
                        {loading ? 'Updating...' : 'Update Role'}
                    </Button>
                </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            {banned ? (
                                <Ban className="h-5 w-5 text-red-500" />
                            ) : (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {banned ? 'User is banned' : 'User is active'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {banned ? 'User cannot sign in' : 'User can sign in normally'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant={banned ? 'default' : 'destructive'}
                            onClick={handleToggleBan}
                            disabled={loading}
                        >
                            {banned ? 'Activate User' : 'Ban User'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
