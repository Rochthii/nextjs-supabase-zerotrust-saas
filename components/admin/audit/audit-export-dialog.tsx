'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileDown, Loader2, FileSpreadsheet } from 'lucide-react';
import { getAuditLogExportData } from '@/app/actions/admin/audit';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AuditExportDialogProps {
    tenantId?: string;
    currentFilters?: {
        resource?: string;
        action?: string;
        search?: string;
    };
}

export function AuditExportDialog({ tenantId, currentFilters }: AuditExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = async () => {
        try {
            setIsLoading(true);
            const result = await getAuditLogExportData({
                startDate,
                endDate,
                resource: currentFilters?.resource === 'all' ? undefined : currentFilters?.resource,
                action: currentFilters?.action === 'all' ? undefined : currentFilters?.action,
                search: currentFilters?.search || undefined,
                tenant_id: tenantId,
            });

            if (!result.success || !result.data) {
                toast.error(result.error || 'Không lấy được dữ liệu log');
                return;
            }

            if (result.data.length === 0) {
                toast.warning('No data available log trong khoảng time này');
                return;
            }

            exportExcel(result.data);
            setIsOpen(false);
            toast.success('Dữ liệu log đã được xuất successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error on xuất log');
        } finally {
            setIsLoading(false);
        }
    };

    const exportExcel = (data: any[]) => {
        const worksheetData = data.map((d, index) => {
            // Format changes for Excel
            let changesStr = '-';
            if (d.changes) {
                if (d.changes.before && d.changes.after) {
                    const updates = [];
                    for (const key in d.changes.after) {
                        if (key === 'updated_at' || key === 'created_at') continue;
                        const beforeVal = d.changes.before[key];
                        const afterVal = d.changes.after[key];
                        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
                            updates.push(`${key}: ${beforeVal ?? 'trống'} -> ${afterVal ?? 'trống'}`);
                        }
                    }
                    changesStr = updates.join(' | ') || 'Update';
                } else if (typeof d.changes === 'object') {
                    changesStr = JSON.stringify(d.changes);
                }
            }

            return {
                'STT': index + 1,
                'Time': new Date(d.created_at).toLocaleString('vi-VN'),
                'Người thực hiện': d.user_email || 'System',
                'Hành động': d.action.toUpperCase(),
                'Tài nguyên': d.resource,
                'ID Records': d.resource_id || '',
                'Content thay đổi': changesStr,
                'Address IP': d.ip_address || '',
                'User Agent': d.user_agent || '',
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        
        // Auto-width for columns
        const wscols = [
            { wch: 5 },  // STT
            { wch: 20 }, // Time
            { wch: 25 }, // Người thực hiện
            { wch: 15 }, // Hành động
            { wch: 20 }, // Tài nguyên
            { wch: 36 }, // ID Records
            { wch: 60 }, // Content thay đổi
            { wch: 15 }, // IP
            { wch: 40 }, // User Agent
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');
        XLSX.writeFile(wb, `nhat-ky-hoat-dong-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="!border !border-indigo-500/30 !text-indigo-200 !bg-indigo-500/10 hover:!bg-indigo-500/20 hover:!text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold">
                    <FileDown className="mr-2 h-4 w-4" />
                    Xuất Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xuất log system</DialogTitle>
                    <DialogDescription>
                        Select khoảng time để tải về lịch sử hoạt động. Bộ filter current (Email/Resource/Action) sẽ được áp dụng tự động.
                    </DialogDescription>
                </DialogHeader>
 
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="start">Từ ngày</Label>
                            <Input
                                id="start"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="end">Đến ngày</Label>
                            <Input
                                id="end"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {currentFilters && (currentFilters.resource || currentFilters.action || currentFilters.search) && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                            <strong>Đang áp dụng filter:</strong>
                            <ul className="mt-1 list-disc list-inside space-y-0.5">
                                {currentFilters.search && <li>Search: {currentFilters.search}</li>}
                                {currentFilters.resource && currentFilters.resource !== 'all' && <li>Tài nguyên: {currentFilters.resource}</li>}
                                {currentFilters.action && currentFilters.action !== 'all' && <li>Hành động: {currentFilters.action}</li>}
                            </ul>
                        </div>
                    )}
                </div>
 
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleExport} 
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang process...
                            </>
                        ) : (
                            'Download Excel'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
