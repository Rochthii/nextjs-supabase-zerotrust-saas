'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportCSVButtonProps {
    data: any[];
}

export function ExportCSVButton({ data }: ExportCSVButtonProps) {
    const exportToCSV = () => {
        if (!data || data.length === 0) return;

        // CSV headers
        const headers = ['Full Name', 'Event', 'Guests', 'Phone', 'Email', 'Status', 'Registration Date'];

        // CSV rows
        const rows = data.map((reg) => [
            reg.full_name || '',
            reg.events?.title_vi || 'N/A',
            reg.num_participants || 0,
            reg.phone || '',
            reg.email || '',
            reg.status === 'confirmed' ? 'Confirmed' :
                reg.status === 'pending' ? 'Pending' : 'Cancelled',
            new Date(reg.registration_date || reg.created_at).toLocaleString('en-US'),
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `event-registrations-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}
