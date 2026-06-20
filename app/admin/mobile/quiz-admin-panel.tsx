'use client';

/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE — JOINT INTELLECTUAL PROPERTY
 *
 * Component: Quiz Admin Panel
 * Quiz management screen for the Editorial Board:
 * - Approve PENDING questions (HITL)
 * - View APPROVED question bank
 * - Trigger AI to generate new questions
 * - Statistics overview
 */

import React, { useState } from 'react';
import { useQuizAdmin } from '@/hooks/use-quiz-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, XCircle, Sparkles, LayoutDashboard,
  ClipboardList, BookCheck, Loader2, ChevronDown, ChevronUp,
  Flame, Target, Zap, GraduationCap, Brain,
} from 'lucide-react';

type QuizSection = 'overview' | 'pending' | 'approved' | 'generate';

const NAV_ITEMS: { key: QuizSection; label: string; icon: React.ElementType }[] = [
  { key: 'overview',  label: 'Overview',          icon: LayoutDashboard },
  { key: 'pending',   label: 'Pending Review',    icon: ClipboardList   },
  { key: 'approved',  label: 'Question Bank',     icon: BookCheck       },
  { key: 'generate',  label: 'AI Generator',      icon: Sparkles        },
];

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  EASY:   { label: 'Easy',         color: 'bg-green-100 text-green-700',  icon: Target     },
  MEDIUM: { label: 'Medium',       color: 'bg-yellow-100 text-yellow-700',icon: Flame      },
  HARD:   { label: 'Hard',         color: 'bg-orange-100 text-orange-700',icon: Zap        },
  EXPERT: { label: 'Expert',       color: 'bg-red-100 text-red-700',      icon: GraduationCap },
};

// ── Question Card (display 1 question) ─────────────────────────────────
function QuestionCard({
  question,
  mode,
  onApprove,
  onReject,
  onDelete,
}: {
  question: any;
  mode: 'pending' | 'approved';
  onApprove?: (id: string) => Promise<boolean>;
  onReject?: (id: string, reason?: string) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejected, setRejected]     = useState(false);

  const diff = DIFFICULTY_LABELS[question.difficulty] || DIFFICULTY_LABELS.MEDIUM;
  const DiffIcon = diff.icon;

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove?.(question.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    setRejected(true);
    await onReject?.(question.id, 'Does not meet doctrine standards');
    setProcessing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setProcessing(true);
    await onDelete?.(question.id);
    setProcessing(false);
  };

  const answerLabels = ['A', 'B', 'C', 'D'];
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-1.5">
            <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', diff.color)}>
              <DiffIcon className="w-3 h-3" />
              {diff.label}
            </span>
            {question.bloom_level && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {question.bloom_level}
              </span>
            )}
            {question.source_citation && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                {question.source_citation}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
            {question.question_text}
          </p>
        </div>
        <div className="shrink-0 mt-0.5 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-slate-50">
          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {answerLabels.map((label, i) => {
              if (!options[i]) return null;
              const isCorrect = label === question.correct_answer;
              return (
                <div
                  key={label}
                  className={cn(
                    'flex items-start gap-2 px-3 py-2 rounded-lg text-sm border',
                    isCorrect
                      ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                      : 'bg-white border-gray-200 text-gray-600'
                  )}
                >
                  <span className={cn(
                    'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                    isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {label}
                  </span>
                  <span>{options[i]}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-green-500" />}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">📖 Explanation:</p>
            <p className="text-xs text-amber-700 leading-relaxed">{question.explanation}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {mode === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5 flex-1"
                >
                  {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  Approve Question
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={processing}
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 flex-1"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </Button>
              </>
            )}
            {mode === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={processing}
                className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs"
              >
                <XCircle className="w-3 h-3" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Generator Form ───────────────────────────────────────────────────
function GenerateForm({ onGenerate, isLoading }: {
  onGenerate: (t: string | null, c: string | null, d: string, n: number) => Promise<any>;
  isLoading: boolean;
}) {
  const [tradition, setTradition] = useState<string>('ALL');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    const res = await onGenerate(tradition === 'ALL' ? null : tradition, topic.trim() || null, difficulty, count);
    setResult(res);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Generate Quiz Questions using AI
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          AI will search the scriptures database and automatically generate questions based on your selected topic.
          Questions must be <strong>approved by the Editorial Board</strong> before entering the official bank.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Tradition */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Tradition</label>
          <Select value={tradition} onValueChange={setTradition}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All traditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All traditions</SelectItem>
              <SelectItem value="THERAVADA">🏛️ Theravada</SelectItem>
              <SelectItem value="MAHAYANA">🔵 Mahayana</SelectItem>
              <SelectItem value="VAJRAYANA">🔔 Vajrayana</SelectItem>
              <SelectItem value="KHATTSI">🍀 Mendicant (Khatsi)</SelectItem>
              <SelectItem value="GENERAL">📚 General Buddhist Studies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Desired Topic (Optional)</label>
          <input 
            type="text" 
            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
            placeholder="e.g. Compassion, Four Noble Truths..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">🟢 Easy — Basic Recall</SelectItem>
              <SelectItem value="MEDIUM">🟡 Medium — Comprehension</SelectItem>
              <SelectItem value="HARD">🟠 Hard — Analysis & Comparison</SelectItem>
              <SelectItem value="EXPERT">🔴 Expert — Reasoning & Discussion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Count */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Number of Questions</label>
          <Select value={String(count)} onValueChange={v => setCount(Number(v))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 10, 15, 20].map(n => (
                <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
      >
        {isLoading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating questions...</>
          : <><Sparkles className="w-4 h-4" /> Generate Questions with AI</>
        }
      </Button>

      {result && (
        <Alert className={result.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={result.error ? 'text-red-700' : 'text-green-700'}>
            {result.error
              ? `❌ Error: ${result.error}`
              : `✅ Generated ${result.generated || 0} new questions. Questions are pending approval in the "Pending Review" tab.`
            }
            {result.message && <p className="mt-1 text-sm">{result.message}</p>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ── Overview Stats ──────────────────────────────────────────────────────
      {/* Overview Stats */}
function QuizOverview({ stats }: { stats: any }) {
  if (!stats) return <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>;

  const cards = [
    { label: 'Total Questions',    value: stats.total_questions,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Pending Review',     value: stats.pending_count,    color: 'text-yellow-600', bg: 'bg-yellow-50', alert: stats.pending_count > 0 },
    { label: 'Approved',           value: stats.approved_count,   color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Practice Attempts',  value: stats.total_attempts,   color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Quiz System Overview
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          AI generates questions from scriptures, the Editorial Board reviews them, and students practice.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, color, bg, alert }) => (
          <div key={label} className={cn('rounded-xl border bg-white p-4 shadow-sm', alert && 'ring-2 ring-yellow-300')}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn('text-3xl font-bold mt-1', color)}>{(value ?? 0).toLocaleString()}</p>
            {alert && <p className="text-xs text-yellow-600 mt-1">⚠️ Needs Review</p>}
          </div>
        ))}
      </div>

      {/* By Tradition */}
      {stats.by_tradition && stats.by_tradition.length > 0 && (
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Distribution by Buddhist Tradition</h3>
          <div className="space-y-2">
            {stats.by_tradition.map((t: any) => {
              const max = Math.max(...stats.by_tradition.map((x: any) => x.count));
              const pct = max > 0 ? Math.round((t.count / max) * 100) : 0;
              const labels: Record<string, string> = {
                THERAVADA: '🏛️ Theravada',
                MAHAYANA:  '🔵 Mahayana',
                VAJRAYANA: '🔔 Vajrayana',
                KHATTSI:   '🍀 Mendicant',
                GENERAL:   '📚 General',
              };
              return (
                <div key={t.tradition_id} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{labels[t.tradition_id] || t.tradition_id}</span>
                    <span className="font-medium">{t.count} questions</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ──────────────────────────────────────────────────────────
export function QuizAdminPanel() {
  const [activeSection, setActiveSection] = useState<QuizSection>('overview');
  const quiz = useQuizAdmin();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <QuizOverview stats={quiz.stats} />;

      case 'pending':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-yellow-500" />
                  Questions Pending Approval
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Verify content and doctrinal accuracy before approving.
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {quiz.pendingQuestions.length} questions
              </Badge>
            </div>

            {quiz.pendingQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-300" />
                <p>No questions pending approval. Great job!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.pendingQuestions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    mode="pending"
                    onApprove={quiz.approveQuestion}
                    onReject={quiz.rejectQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'approved':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookCheck className="w-5 h-5 text-green-500" />
                  Approved Question Bank
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  These questions are currently available to students in the practice section.
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {quiz.approvedQuestions.length} questions
              </Badge>
            </div>

            {quiz.approvedQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No approved questions yet.</p>
                <p className="text-sm mt-1">Generate questions and approve them in the "Pending Review" tab.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.approvedQuestions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    mode="approved"
                    onDelete={quiz.deleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'generate':
        return (
          <GenerateForm
            onGenerate={quiz.generateQuestions}
            isLoading={quiz.isLoading}
          />
        );
    }
  };

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = activeSection === key;
            const isPendingAlert = key === 'pending' && (quiz.stats?.pending_count ?? 0) > 0;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-amber-600' : 'text-gray-400')} />
                <span className="flex-1 text-left">{label}</span>
                {isPendingAlert && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {quiz.stats?.pending_count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick stats */}
        {quiz.stats && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Approved</span>
              <span className="font-semibold text-green-700">{quiz.stats.approved_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Review</span>
              <span className="font-semibold text-yellow-700">{quiz.stats.pending_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Practice</span>
              <span className="font-semibold text-purple-700">{quiz.stats.total_attempts}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {renderContent()}
      </main>
    </div>
  );
}
