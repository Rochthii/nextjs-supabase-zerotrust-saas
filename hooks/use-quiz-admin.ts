/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE
 * JOINT INTELLECTUAL PROPERTY
 *
 * Hook: use-quiz-admin
 * Purpose: Manage Quiz data for Admin Dashboard
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnon);

export interface QuizQuestion {
  id: string;
  tradition_id: string | null;
  category_id: string | null;
  question_text: string;
  difficulty: string;
  bloom_level: string | null;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  explanation: string;
  source_citation: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  times_served: number;
  times_correct: number;
  created_at: string;
}

export interface QuizAdminStats {
  total_questions: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_attempts: number;
  by_tradition: Array<{ tradition_id: string; count: number }> | null;
}

export function useQuizAdmin() {
  const [stats, setStats]             = useState<QuizAdminStats | null>(null);
  const [pendingQuestions, setPending]= useState<QuizQuestion[]>([]);
  const [approvedQuestions, setApproved] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);

  // ── Fetch Stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { data } = await supabase.rpc('get_quiz_admin_stats');
    if (data && data[0]) setStats(data[0]);
  }, []);

  // ── Fetch Pending Questions ───────────────────────────────
  const fetchPending = useCallback(async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(50);
    setPending(data || []);
  }, []);

  // ── Fetch Approved Questions ──────────────────────────────
  const fetchApproved = useCallback(async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .limit(100);
    setApproved(data || []);
  }, []);

  // ── Approve ───────────────────────────────────────────────
  const approveQuestion = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      // W5 FIX: Log question approval action
      await supabase.rpc('log_quiz_admin_action', { p_action: 'APPROVE', p_question_id: id });
      setPending(prev => prev.filter(q => q.id !== id));
      fetchStats();
    }
    return !error;
  }, [fetchStats]);

  // ── Reject ────────────────────────────────────────────────
  const rejectQuestion = useCallback(async (id: string, reason?: string) => {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ status: 'REJECTED', rejection_reason: reason || null })
      .eq('id', id);
    if (!error) {
      // W5 FIX: Log rejection action
      await supabase.rpc('log_quiz_admin_action', { p_action: 'REJECT', p_question_id: id, p_reason: reason });
      setPending(prev => prev.filter(q => q.id !== id));
      fetchStats();
    }
    return !error;
  }, [fetchStats]);

  // ── Delete Question ───────────────────────────────────────
  const deleteQuestion = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);
    if (!error) {
      // W5 FIX: Log deletion action
      await supabase.rpc('log_quiz_admin_action', { p_action: 'DELETE', p_question_id: id });
      setApproved(prev => prev.filter(q => q.id !== id));
      fetchStats();
    }
    return !error;
  }, [fetchStats]);

  // ── Trigger AI Generation ─────────────────────────────────
  const generateQuestions = useCallback(async (
    tradition_id: string | null,
    category_id:  string | null,
    difficulty:   string,
    count:        number
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnon;

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tradition_id, category_id, difficulty, count }),
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }
      const data = await res.json();
      
      // W5 FIX: Log generation initialization
      await supabase.rpc('log_quiz_admin_action', { 
        p_action: 'GENERATE', 
        p_metadata: { tradition_id, difficulty, count, generated: data.generated || 0 } 
      });

      await fetchPending();
      await fetchStats();
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPending, fetchStats]);

  // ── Init ──────────────────────────────────────────────────
  const refetchAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchPending(), fetchApproved()]);
  }, [fetchStats, fetchPending, fetchApproved]);

  useEffect(() => { refetchAll(); }, []);

  return {
    stats, pendingQuestions, approvedQuestions,
    isLoading,
    approveQuestion, rejectQuestion, deleteQuestion,
    generateQuestions, refetchAll,
  };
}
