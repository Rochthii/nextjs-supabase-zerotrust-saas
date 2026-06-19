'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Newspaper, Calendar, Folder, Tag, FileText, Search, X, Mic, History, Filter, ChevronRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchResult } from '@/lib/search';

const RECENT_SEARCHES_KEY = 'saas_recent_searches';

// ─── Constants ───────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    news: 'bg-blue-100 text-blue-700',
    event: 'bg-green-100 text-green-700',
    media: 'bg-amber-100 text-amber-800',
    category: 'bg-purple-100 text-purple-700',
    dharma_talk: 'bg-orange-100 text-orange-700',
    tag: 'bg-teal-100 text-teal-800',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalize(s: string) {
    if (!s) return '';
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

function highlightText(text: string, query: string) {
    if (!query || !text) return text;
    const nText = normalize(text);
    const nQuery = normalize(query);
    const idx = nText.indexOf(nQuery);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-gold-primary/20 text-gold-dark font-bold not-italic rounded px-0.5">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ─── Components ─────────────────────────────────────────────────────────────
function ResultItem({
    result,
    isActive,
    query,
    onClick,
}: {
    result: SearchResult;
    isActive: boolean;
    query: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={result.url as any}
            target={result.type === 'media' ? '_blank' : undefined}
            rel={result.type === 'media' ? 'noopener noreferrer' : undefined}
            onClick={onClick}
            className={`flex items-start gap-4 px-6 py-4 transition-all group border-l-2 ${
                isActive ? 'bg-amber-50/80 border-gold-primary' : 'hover:bg-gray-50 border-transparent'
            }`}
        >
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-white shadow-sm border border-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
                {result.imageUrl ? (
                    <Image src={result.imageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                ) : (
                    <span className="text-gold-primary opacity-80">
                        {result.type === 'news' ? <Newspaper className="w-6 h-6" /> :
                            result.type === 'event' ? <Calendar className="w-6 h-6" /> :
                                result.type === 'category' ? <Folder className="w-6 h-6" /> :
                                    result.type === 'dharma_talk' ? <GraduationCap className="w-6 h-6" /> :
                                        result.type === 'tag' ? <Tag className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${TYPE_COLORS[result.type] || 'bg-gray-100 text-gray-600'}`}>
                        {result.badge}
                    </span>
                </div>
                <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-gold-dark transition-colors truncate">
                    {highlightText(result.title, query)}
                </h4>
                {result.description && (
                    <p className="text-xs text-gray-500 truncate mt-1 leading-relaxed opacity-80">
                        {highlightText(result.description, query)}
                    </p>
                )}
            </div>

            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold-primary transition-all group-hover:translate-x-1" />
        </Link>
    );
}

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'news' | 'dharma_talk' | 'media' | 'event'>('all');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const locale = useLocale();

    // ─── Lifecycle ───
    useEffect(() => {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
            try { setRecentSearches(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 150);
            setQuery('');
            setResults([]);
            setActiveIndex(-1);
            setError('');
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // ─── Search Logic ───
    const doSearch = useCallback(async (q: string) => {
        if (!q || q.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const tenant = urlParams.get('tenant');
            let apiUrl = `/api/search?q=${encodeURIComponent(q)}&limit=8`;
            if (tenant) apiUrl += `&tenant=${tenant}`;

            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setResults(data.results || []);
        } catch {
            setError('Connect gián đoạn. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setActiveIndex(-1);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!val.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        timerRef.current = setTimeout(() => doSearch(val), 350);
    };

    const saveRecentSearch = (q: string) => {
        if (!q.trim() || q.length < 2) return;
        const newRecent = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    };

    const removeRecent = (e: React.MouseEvent, s: string) => {
        e.stopPropagation();
        const newReg = recentSearches.filter(i => i !== s);
        setRecentSearches(newReg);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newReg));
    };

    const handleSelect = (r: SearchResult) => {
        saveRecentSearch(query || r.title);
        if (r.type === 'media') window.open(r.url, '_blank');
        else router.push(r.url as any);
        onClose();
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ search giọng nói.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = locale === 'vi' ? 'vi-VN' : (locale === 'km' ? 'km-KH' : 'en-US');
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setQuery(transcript);
            doSearch(transcript);
        };
        recognition.start();
    };

    const filteredResults = activeTab === 'all' 
        ? results 
        : results.filter(r => r.type === activeTab);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'news', label: 'News' },
        { id: 'dharma_talk', label: 'Document & SOP' },
        { id: 'media', label: 'Thư viện' },
        { id: 'event', label: 'Event' },
    ];

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 z-[1001] overflow-y-auto pointer-events-none">
                        <div className="flex min-h-full items-start justify-center p-4 pt-12 sm:p-6 md:p-24">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="w-full max-w-2xl pointer-events-auto"
                            >
                                <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/40 ring-1 ring-black/5 flex flex-col">
                                    
                                    {/* Mobile X Button */}
                                    <button 
                                        onClick={onClose}
                                        className="absolute right-3 top-3 p-3 text-gray-400 hover:text-red-500 sm:hidden z-[1002] transition-colors"
                                    >
                                        <X className="w-7 h-7" />
                                    </button>

                                    {/* Toolbar */}
                                    <div className="relative flex items-center gap-4 px-7 py-6 border-b border-gray-100/50">
                                        <Search className={`w-7 h-7 transition-all ${loading ? 'text-gold-primary scale-110' : 'text-gray-300'}`} />
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={query}
                                            onChange={handleChange}
                                            onKeyDown={(e) => {
                                                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filteredResults.length - 1)); }
                                                else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
                                                else if (e.key === 'Enter') {
                                                    if (activeIndex >= 0 && filteredResults[activeIndex]) handleSelect(filteredResults[activeIndex]);
                                                    else if (query.trim().length >= 2) { saveRecentSearch(query); router.push({ pathname: '/tim-kiem', query: { q: query } } as any); onClose(); }
                                                }
                                            }}
                                            placeholder="Bạn muốn tìm gì..."
                                            className="flex-1 text-xl text-gray-800 placeholder-gray-300 outline-none bg-transparent font-medium"
                                            autoComplete="off"
                                        />
                                        
                                        <div className="flex items-center gap-2.5">
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleVoiceSearch}
                                                        className={`p-2.5 rounded-2xl transition-all ${isListening ? 'bg-red-50 text-red-600 scale-110 shadow-sm' : 'text-gray-300 hover:text-gold-dark hover:bg-gray-50'}`}
                                                        title="Giọng nói"
                                                    >
                                                        <Mic className="w-6 h-6" />
                                                    </button>
                                                    {query && (
                                                        <button
                                                            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                                                            className="p-2.5 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all"
                                                        >
                                                            <X className="w-6 h-6" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <div className="hidden sm:flex items-center justify-center min-w-[36px] h-8 bg-gray-50 rounded-xl text-[10px] font-black text-gray-300 border border-gray-100 uppercase tracking-tighter">
                                                ESC
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    {(query || results.length > 0) && (
                                        <div className="flex items-center gap-1.5 px-6 py-3 bg-gray-50/30 border-b border-gray-100/50 overflow-x-auto no-scrollbar">
                                            {tabs.map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                                        activeTab === tab.id 
                                                            ? 'bg-gold-primary text-white shadow-md' 
                                                            : 'text-gray-400 hover:bg-white hover:text-gray-600'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Results / Empty View */}
                                    <div className="flex-1 overflow-y-auto max-h-[50vh] custom-scrollbar bg-white/50">
                                        {error ? (
                                            <div className="px-8 py-16 text-center text-sm text-red-400">{error}</div>
                                        ) : query.trim().length >= 2 && !loading && filteredResults.length === 0 ? (
                                            <div className="px-8 py-20 text-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                                    <Search className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-700">None results</h3>
                                                <p className="text-gray-400 text-sm mt-1 px-12">Chúng tôi not found content phù hợp với từ khóa &quot;{query}&quot;</p>
                                            </div>
                                        ) : filteredResults.length > 0 ? (
                                            <div className="divide-y divide-gray-50/50">
                                                {filteredResults.map((r, i) => (
                                                    <ResultItem
                                                        key={`${r.id}-${i}`}
                                                        result={r}
                                                        isActive={i === activeIndex}
                                                        query={query}
                                                        onClick={() => handleSelect(r)}
                                                    />
                                                ))}
                                            </div>
                                        ) : !query && (
                                            <div className="px-8 py-8 pt-6">
                                                {recentSearches.length > 0 && (
                                                    <div className="mb-10">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                                                <History className="w-4 h-4" /> Recent
                                                            </div>
                                                            <button 
                                                                onClick={() => { setRecentSearches([]); localStorage.removeItem(RECENT_SEARCHES_KEY); }}
                                                                className="text-[10px] text-gray-300 hover:text-red-500 font-bold uppercase transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {recentSearches.map(s => (
                                                                <div 
                                                                    key={s}
                                                                    onClick={() => { setQuery(s); doSearch(s); }}
                                                                    className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-gray-100 hover:bg-amber-50/50 hover:border-gold-primary/20 cursor-pointer transition-all"
                                                                >
                                                                    <span className="text-sm text-gray-600 font-medium truncate">{s}</span>
                                                                    <button 
                                                                        onClick={(e) => removeRecent(e, s)}
                                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-5">
                                                    <Tag className="w-4 h-4" /> Xu hướng
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Quy trình SOP', 'Chính sách nhân sự', 'Đào tạo internally', 'Report finance', 'ESG & Sáng kiến', 'Chuyển đổi số'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setQuery(s); doSearch(s); }}
                                                            className="flex items-center gap-2 text-sm bg-white border border-gray-100 hover:border-gold-primary hover:text-gold-dark text-gray-500 px-5 py-3 rounded-2xl transition-all shadow-sm font-medium hover:shadow-md active:scale-95"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hint Footer */}
                                    {filteredResults.length > 0 && (
                                        <div className="border-t border-gray-100/50 px-8 py-5 flex items-center justify-between bg-white/80">
                                            <div className="flex items-center gap-6 text-[10px] text-gray-300 font-black uppercase tracking-widest hidden sm:flex">
                                                <span className="flex items-center gap-2">
                                                    <kbd className="px-1.5 py-1 bg-gray-50 border border-gray-100 rounded-lg min-w-[24px]">↵</kbd> Select
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <kbd className="px-1.5 py-1 bg-gray-50 border border-gray-100 rounded-lg min-w-[24px]">↑↓</kbd> Duyệt
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { router.push({ pathname: '/tim-kiem', query: { q: query } } as any); onClose(); }}
                                                className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-gold-primary transition-all active:scale-95"
                                            >
                                                All results →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
