'use client';

import React from 'react';
import { Role, getRoleDisplayName, getRoleBadgeColor } from '@/lib/permissions-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RoleSelectorProps {
    currentRole: Role;
    onChange: (role: Role) => void;
    disabled?: boolean;
    allowedRoles?: Role[];
}

const ALL_ROLES: Role[] = [
    'super_admin',
    'agency_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'admin',
    'moderator',
    'editor',
    'volunteer',
    'viewer',
];

const roleDescriptions: Partial<Record<Role, string>> = {
    super_admin: 'Toàn quyền system — Platform Owner',
    agency_admin: 'Agency Admin — Quản lý nhiều Workspace đối tác',
    company_editor: 'Network Editor — Đăng content trên nhiều Workspace',
    tenant_admin: 'Workspace Admin — Toàn quyền trong 1 Workspace',
    tenant_editor: 'Content Editor — Tạo/edit content trong Workspace',
    tenant_accountant: 'Accountant — View và quản lý dữ liệu finance',
    admin: 'Duyệt bài, quản lý users, settings',
    moderator: 'Moderator — Kiểm duyệt content',
    editor: 'Editor — Tạo/edit news, event, upload ảnh',
    volunteer: 'Contributor — Close góp content',
    viewer: 'Viewer — Chỉ đọc content',
};

export function RoleSelector({ currentRole, onChange, disabled = false, allowedRoles }: RoleSelectorProps) {
    const renderRoles = allowedRoles ? ALL_ROLES.filter(r => allowedRoles.includes(r)) : ALL_ROLES;

    return (
        <div className="space-y-4">
            <Label>User Role</Label>
            <RadioGroup
                value={currentRole}
                onValueChange={(value: string) => onChange(value as Role)}
                disabled={disabled}
            >
                {renderRoles.map((role) => (
                    <div
                        key={role}
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                        <RadioGroupItem value={role} id={role} />
                        <div className="flex-1">
                            <label
                                htmlFor={role}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(role)}`}>
                                    {getRoleDisplayName(role)}
                                </span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                {roleDescriptions[role]}
                            </p>
                        </div>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}
