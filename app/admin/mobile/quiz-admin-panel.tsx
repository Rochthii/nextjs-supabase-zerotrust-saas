'use client';

/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE — JOINT INTELLECTUAL PROPERTY
 *
 * Component: Quiz Admin Panel
 * Màn hình quản lý trắc nghiệm cho Ban Tu Thư:
 * - Duyệt question PENDING (HITL)
 * - View bank question APPROVED
 * - Activate AI sinh question mới
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
  { key: 'pending',   label: 'Chờ Duyệt',           icon: ClipboardList   },
  { key: 'approved',  label: 'Bank Đề',        icon: BookCheck       },
  { key: 'generate',  label: 'Sinh Câu Hỏi AI',     icon: Sparkles        },
];

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  EASY:   { label: 'Dễ',           color: 'bg-green-100 text-green-700',  icon: Target     },
  MEDIUM: { label: 'Trung bình',   color: 'bg-yellow-100 text-yellow-700',icon: Flame      },
  HARD:   { label: 'Khó',          color: 'bg-orange-100 text-orange-700',icon: Zap        },
  EXPERT: { label: 'Chuyên gia',   color: 'bg-red-100 text-red-700',      icon: GraduationCap },
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
    await onReject?.(question.id, 'Không đạt standard giáo lý');
    setProcessing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Confirm delete question này?')) return;
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
          {/* 4 Lựa select */}
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

          {/* Giải thích */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">📖 Giải thích:</p>
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
                  Duyệt question
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={processing}
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 flex-1"
                >
                  <XCircle className="w-3 h-3" />
                  Rejected
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
          Sinh Câu Hỏi Trắc Nghiệm bằng AI
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          AI sẽ search trong kho kinh điển và tự động tạo question theo topic bạn select.
          Question sẽ cần được <strong>Ban Tu Thư duyệt</strong> trước khi vào bank chính thức.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Hệ phái */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Hệ phái</label>
          <Select value={tradition} onValueChange={setTradition}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All hệ phái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All hệ phái</SelectItem>
              <SelectItem value="THERAVADA">🏛️ Nam Tông Theravāda</SelectItem>
              <SelectItem value="MAHAYANA">🔵 Bắc Tông Đại Thừa</SelectItem>
              <SelectItem value="VAJRAYANA">🔔 Kim Cang Thừa Mật Tông</SelectItem>
              <SelectItem value="KHATTSI">🍀 Hệ Phái Khất Sĩ</SelectItem>
              <SelectItem value="GENERAL">📚 Phật Last namec Phổ Thông</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Topic mong muốn (Tùy select)</label>
          <input 
            type="text" 
            className="flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
            placeholder="VD: Từ bi, Tứ diệu đế..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Độ khó */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Độ khó</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">🟢 Dễ — Ghi nhớ cơ bản</SelectItem>
              <SelectItem value="MEDIUM">🟡 Trung bình — Hiểu nghĩa</SelectItem>
              <SelectItem value="HARD">🟠 Khó — Analytics, So sánh</SelectItem>
              <SelectItem value="EXPERT">🔴 Chuyên gia — Biện luận</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Số lượng */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Số question</label>
          <Select value={String(count)} onValueChange={v => setCount(Number(v))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 10, 15, 20].map(n => (
                <SelectItem key={n} value={String(n)}>{n} câu</SelectItem>
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
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang sinh question...</>
          : <><Sparkles className="w-4 h-4" /> Sinh question bằng AI</>
        }
      </Button>

      {result && (
        <Alert className={result.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={result.error ? 'text-red-700' : 'text-green-700'}>
            {result.error
              ? `❌ Error: ${result.error}`
              : `✅ Đã sinh ${result.generated || 0} question mới. Question pending duyệt trong tab "Chờ Duyệt".`
            }
            {result.message && <p className="mt-1 text-sm">{result.message}</p>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ── Overview Stats ──────────────────────────────────────────────────────
function QuizOverview({ stats }: { stats: any }) {
  if (!stats) return <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>;

  const cards = [
    { label: 'Tổng question',      value: stats.total_questions,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Pending Review',         value: stats.pending_count,    color: 'text-yellow-600', bg: 'bg-yellow-50', alert: stats.pending_count > 0 },
    { label: 'Approved',          value: stats.approved_count,   color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Lượt luyện tập',    value: stats.total_attempts,   color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Overview System Trắc Nghiệm AI
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          AI sinh question từ kho kinh điển, Ban Tu Thư kiểm duyệt, sinh viên luyện tập.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, color, bg, alert }) => (
          <div key={label} className={cn('rounded-xl border bg-white p-4 shadow-sm', alert && 'ring-2 ring-yellow-300')}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn('text-3xl font-bold mt-1', color)}>{(value ?? 0).toLocaleString()}</p>
            {alert && <p className="text-xs text-yellow-600 mt-1">⚠️ Cần duyệt</p>}
          </div>
        ))}
      </div>

      {/* By Tradition */}
      {stats.by_tradition && stats.by_tradition.length > 0 && (
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Phân bố theo Hệ phái</h3>
          <div className="space-y-2">
            {stats.by_tradition.map((t: any) => {
              const max = Math.max(...stats.by_tradition.map((x: any) => x.count));
              const pct = max > 0 ? Math.round((t.count / max) * 100) : 0;
              const labels: Record<string, string> = {
                THERAVADA: '🏛️ Nam Tông',
                MAHAYANA:  '🔵 Bắc Tông',
                VAJRAYANA: '🔔 Mật Tông',
                KHATTSI:   '🍀 Khất Sĩ',
                GENERAL:   '📚 Phổ Thông',
              };
              return (
                <div key={t.tradition_id} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{labels[t.tradition_id] || t.tradition_id}</span>
                    <span className="font-medium">{t.count} câu</span>
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
                  Question pending approval
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Check content và tính chính xác giáo lý trước khi duyệt.
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {quiz.pendingQuestions.length} câu
              </Badge>
            </div>

            {quiz.pendingQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-300" />
                <p>None question nào pending approval. Tốt lắm!</p>
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
                  Bank question approved
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Các question này đang phục vụ sinh viên trong section luyện tập.
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {quiz.approvedQuestions.length} câu
              </Badge>
            </div>

            {quiz.approvedQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Chưa có question nào được duyệt.</p>
                <p className="text-sm mt-1">Hãy sinh question và duyệt trong tab "Chờ Duyệt".</p>
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
              <span>Luyện tập</span>
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
