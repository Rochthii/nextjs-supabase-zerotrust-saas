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
    super_admin: 'Full system control — Platform Owner',
    agency_admin: 'Agency Admin — Manage multiple partner Workspaces',
    company_editor: 'Network Editor — Publish content across multiple Workspaces',
    tenant_admin: 'Workspace Admin — Full control within 1 Workspace',
    tenant_editor: 'Content Editor — Create/edit content within a Workspace',
    tenant_accountant: 'Accountant — View and manage financial data',
    admin: 'Approve posts, manage users, and adjust settings',
    moderator: 'Moderator — Moderate community content',
    editor: 'Editor — Create/edit news, events, and upload media',
    volunteer: 'Contributor — Contribute and submit content drafts',
    viewer: 'Viewer — Read-only access to content',
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
