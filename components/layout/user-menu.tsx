'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu({ isCompany = false }: { isCompany?: boolean }) {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setRole(user.app_metadata?.role || user.user_metadata?.role || 'user');
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        router.refresh();
        router.push('/');
    };

    if (loading) {
        return <div className={`w-9 h-9 animate-pulse rounded-full ${isCompany ? 'bg-slate-200 dark:bg-slate-800' : 'bg-white/10'}`} />;
    }

    if (!user) {
        return (
            <button
                onClick={() => router.push('/login')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg transition-all active:scale-95 ${
                    isCompany 
                        ? 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 shadow-sm dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800'
                        : 'text-gold-light border-gold-primary/50 hover:bg-gold-primary/10'
                }`}
            >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
            </button>
        );
    }

    const isAdmin = role && ['admin', 'super_admin', 'editor', 'moderator'].includes(role);
    const isVolunteer = role === 'volunteer';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={`flex items-center justify-center h-9 w-9 rounded-full border transition-all ${
                        isCompany
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900 shadow-sm'
                            : 'bg-gold-primary/20 text-gold-light border-gold-primary/50 hover:bg-gold-primary/30'
                    }`}
                    title={user.email}
                >
                    <span className="text-sm font-bold uppercase">{user.email?.charAt(0) || 'U'}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 border ${
                isCompany
                    ? 'bg-white text-slate-800 border-slate-200 shadow-lg dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800'
                    : 'bg-coffee-dark/95 text-white border-gold-dark/20 backdrop-blur-md'
            }`}>
                <div className="flex items-center justify-start gap-2 p-2 px-3 pb-3">
                    <div className="flex flex-col space-y-0.5 leading-none">
                        {user.user_metadata?.full_name && (
                            <p className={`font-medium text-sm ${isCompany ? 'text-slate-900 dark:text-slate-100' : 'text-gold-light'}`}>{user.user_metadata.full_name}</p>
                        )}
                        <p className={`w-[180px] truncate text-xs ${isCompany ? 'text-slate-500 dark:text-slate-400' : 'text-gray-400'}`}>
                            {user.email}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator className={isCompany ? 'bg-slate-100 dark:bg-slate-800' : 'bg-gold-dark/20'} />

                {(isAdmin || isVolunteer) && (
                    <DropdownMenuItem
                        onClick={() => router.push(isAdmin ? '/admin' : '/collaborator')}
                        className={`cursor-pointer ${
                            isCompany 
                                ? 'hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800' 
                                : 'hover:bg-white/10 focus:bg-white/10'
                        }`}
                    >
                        <LayoutDashboard className={`mr-2 h-4 w-4 ${isCompany ? 'text-indigo-600 dark:text-indigo-400' : 'text-gold-primary'}`} />
                        <span>Bảng điều khiển</span>
                    </DropdownMenuItem>
                )}

                {!isAdmin && !isVolunteer && (
                    <DropdownMenuItem
                        onClick={() => router.push('/profile')}
                        className={`cursor-pointer ${
                            isCompany 
                                ? 'hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800' 
                                : 'hover:bg-white/10 focus:bg-white/10'
                        }`}
                    >
                        <Settings className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Hồ sơ cá nhân</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className={isCompany ? 'bg-slate-100 dark:bg-slate-800' : 'bg-gold-dark/20'} />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className={`cursor-pointer text-red-500 ${
                        isCompany
                            ? 'hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 dark:hover:bg-red-950 dark:focus:bg-red-950'
                            : 'hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10'
                    }`}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
