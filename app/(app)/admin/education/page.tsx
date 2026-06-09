'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { EducationModule, EducationQuestion } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewModuleForm {
  title: string
  description: string
  difficulty: EducationModule['difficulty']
  estimated_minutes: number
  order_index: number
}

interface NewQuestionForm {
  question: string
  question_type: EducationQuestion['question_type']
  options: [string, string, string, string]
  correct_answer: string
  explanation: string
  order_index: number
}

interface ModuleAnalytics {
  totalStudents: number
  completionRate: number
  avgScore: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyQuestion = (): NewQuestionForm => ({
  question: '',
  question_type: 'multiple_choice',
  options: ['', '', '', ''],
  correct_answer: '',
  explanation: '',
  order_index: 1,
})

function DifficultyBadge({ difficulty }: { difficulty: EducationModule['difficulty'] }) {
  const styles: Record<string, React.CSSProperties> = {
    beginner: { background: 'rgba(34,197,94,0.12)', color: 'var(--color-positive)' },
    intermediate: { background: 'rgba(54,128,255,0.15)', color: 'var(--color-accent-gold)' },
    advanced: { background: 'rgba(239,68,68,0.12)', color: 'var(--color-negative)' },
  }
  return (
    <span style={{ ...styles[difficulty], padding: '2px 10px', borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'capitalize' }}>
      {difficulty}
    </span>
  )
}

// ─── Create / Edit Module Form ────────────────────────────────────────────────

function ModuleForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  title,
}: {
  initial?: Partial<NewModuleForm>
  onSubmit: (data: NewModuleForm) => void
  onCancel: () => void
  isLoading: boolean
  title: string
}) {
  const [form, setForm] = useState<NewModuleForm>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    difficulty: initial?.difficulty ?? 'beginner',
    estimated_minutes: initial?.estimated_minutes ?? 10,
    order_index: initial?.order_index ?? 1,
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '8px', padding: '10px 14px',
    color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div>
      <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Module title…" />
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Short description…"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as EducationModule['difficulty'] }))} style={inputStyle}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Minutes</label>
            <input type="number" min={1} value={form.estimated_minutes} onChange={(e) => setForm((f) => ({ ...f, estimated_minutes: parseInt(e.target.value, 10) || 10 }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Index</label>
            <input type="number" min={1} value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value, 10) || 1 }))} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => form.title.trim() && onSubmit(form)}
            disabled={!form.title.trim() || isLoading}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)',
              fontWeight: 600, fontSize: 'var(--text-sm)', opacity: (!form.title.trim() || isLoading) ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Saving…' : 'Save Module'}
          </button>
          <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Question Form ────────────────────────────────────────────────────────

function AddQuestionForm({
  moduleId,
  existingCount,
  onDone,
}: {
  moduleId: string
  existingCount: number
  onDone: () => void
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<NewQuestionForm>({ ...emptyQuestion(), order_index: existingCount + 1 })

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '8px', padding: '10px 14px',
    color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
    boxSizing: 'border-box',
  }

  const addMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        module_id: moduleId,
        question: form.question.trim(),
        question_type: form.question_type,
        correct_answer: form.correct_answer.trim(),
        explanation: form.explanation.trim() || null,
        order_index: form.order_index,
      }
      if (form.question_type === 'multiple_choice') {
        payload.options = form.options.filter((o) => o.trim())
      }
      const { error } = await supabase.from('education_questions').insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Question added')
      queryClient.invalidateQueries({ queryKey: ['admin', 'moduleQuestions', moduleId] })
      setForm({ ...emptyQuestion(), order_index: existingCount + 2 })
      onDone()
    },
    onError: () => toast.error('Failed to add question'),
  })

  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: '12px', padding: 'var(--space-3)',
      marginTop: '12px',
    }}>
      <h4 style={{ color: 'var(--color-text-primary)', fontWeight: 700, margin: '0 0 16px' }}>Add Question</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Question Text *</label>
          <textarea
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Enter question…"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</label>
            <select
              value={form.question_type}
              onChange={(e) => setForm((f) => ({ ...f, question_type: e.target.value as EducationQuestion['question_type'] }))}
              style={inputStyle}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="tap_reveal">Tap to Reveal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Index</label>
            <input type="number" min={1} value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value, 10) || 1 }))} style={inputStyle} />
          </div>
        </div>

        {form.question_type === 'multiple_choice' && (
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {form.options.map((opt, idx) => (
                <input
                  key={idx}
                  value={opt}
                  onChange={(e) => {
                    const next = [...form.options] as [string, string, string, string]
                    next[idx] = e.target.value
                    setForm((f) => ({ ...f, options: next }))
                  }}
                  style={inputStyle}
                  placeholder={`Option ${idx + 1}…`}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Correct Answer *</label>
          <input value={form.correct_answer} onChange={(e) => setForm((f) => ({ ...f, correct_answer: e.target.value }))} style={inputStyle} placeholder="Correct answer…" />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Explanation</label>
          <textarea
            value={form.explanation}
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Explain the correct answer…"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => (form.question.trim() && form.correct_answer.trim()) && addMutation.mutate()}
            disabled={!form.question.trim() || !form.correct_answer.trim() || addMutation.isPending}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)',
              fontWeight: 600, fontSize: 'var(--text-sm)',
              opacity: (!form.question.trim() || !form.correct_answer.trim() || addMutation.isPending) ? 0.5 : 1,
            }}
          >
            {addMutation.isPending ? 'Adding…' : 'Add Question'}
          </button>
          <button onClick={onDone} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Module Detail Panel ──────────────────────────────────────────────────────

function ModuleDetailPanel({
  module,
  onClose,
}: {
  module: EducationModule
  onClose: () => void
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [editingModule, setEditingModule] = useState(false)

  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['admin', 'moduleQuestions', module.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('education_questions')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true })
      return (data ?? []) as EducationQuestion[]
    },
  })

  const { data: analytics } = useQuery<ModuleAnalytics>({
    queryKey: ['admin', 'moduleAnalytics', module.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('education_progress')
        .select('is_completed, questions_answered, questions_correct')
        .eq('module_id', module.id)
      const rows = data ?? []
      const total = rows.length
      const completed = rows.filter((r) => r.is_completed).length
      const avgScore = total > 0
        ? rows.reduce((sum, r) => {
            const pct = r.questions_answered > 0 ? (r.questions_correct / r.questions_answered) * 100 : 0
            return sum + pct
          }, 0) / total
        : 0
      return {
        totalStudents: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgScore: Math.round(avgScore),
      }
    },
  })

  const updateModuleMutation = useMutation({
    mutationFn: async (form: NewModuleForm) => {
      const { error } = await supabase
        .from('education_modules')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', module.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Module updated')
      setEditingModule(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'educationModules'] })
    },
    onError: () => toast.error('Failed to update module'),
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from('education_questions').delete().eq('id', questionId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Question deleted')
      queryClient.invalidateQueries({ queryKey: ['admin', 'moduleQuestions', module.id] })
    },
    onError: () => toast.error('Failed to delete question'),
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', zIndex: 1,
        width: '580px', maxWidth: '100vw',
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border-default)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="label-eyebrow" style={{ marginBottom: '4px' }}>Module</p>
            <h2 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>{module.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
          {/* Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: 'var(--space-3)' }}>
            {[
              { label: 'Students', value: analytics?.totalStudents ?? 0 },
              { label: 'Completion', value: `${analytics?.completionRate ?? 0}%` },
              { label: 'Avg Score', value: `${analytics?.avgScore ?? 0}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                <p style={{ color: 'var(--color-accent-gold)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Edit Module */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            {editingModule ? (
              <ModuleForm
                initial={module}
                title="Edit Module"
                onSubmit={(data) => updateModuleMutation.mutate(data)}
                onCancel={() => setEditingModule(false)}
                isLoading={updateModuleMutation.isPending}
              />
            ) : (
              <button
                onClick={() => setEditingModule(true)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
              >
                ✏️ Edit Module Info
              </button>
            )}
          </div>

          {/* Questions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p className="label-eyebrow">Questions ({questions?.length ?? 0})</p>
              {!showAddQuestion && (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'rgba(54,128,255,0.15)', color: 'var(--color-accent-gold)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add Question
                </button>
              )}
            </div>

            {showAddQuestion && (
              <AddQuestionForm
                moduleId={module.id}
                existingCount={questions?.length ?? 0}
                onDone={() => setShowAddQuestion(false)}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: showAddQuestion ? '12px' : 0 }}>
              {loadingQuestions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: '72px', borderRadius: '8px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))
              ) : !questions || questions.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '16px' }}>
                  No questions yet. Add your first question above.
                </p>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '10px', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Q{idx + 1}</span>
                          <span style={{
                            padding: '1px 8px', borderRadius: '4px',
                            fontSize: 'var(--text-xs)', fontWeight: 600,
                            background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)',
                            textTransform: 'capitalize',
                          }}>
                            {q.question_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', margin: '0 0 6px', fontWeight: 500 }}>{q.question}</p>
                        <p style={{ color: 'var(--color-positive)', fontSize: 'var(--text-xs)', margin: 0 }}>
                          ✓ {q.correct_answer}
                        </p>
                        {q.explanation && (
                          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '4px 0 0', fontStyle: 'italic' }}>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                        disabled={deleteQuestionMutation.isPending}
                        style={{
                          padding: '4px 10px', borderRadius: '6px',
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'transparent', color: 'var(--color-negative)',
                          cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600, flexShrink: 0,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEducationPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null)

  if (!authLoading && profile && profile.role !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '16px' }}>🔒</p>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ['admin', 'educationModules'],
    queryFn: async () => {
      const { data } = await supabase
        .from('education_modules')
        .select('*')
        .order('order_index', { ascending: true })
      return (data ?? []) as EducationModule[]
    },
  })

  // Per-module stats (completions, avg score)
  const { data: progressData } = useQuery({
    queryKey: ['admin', 'allEducationProgress'],
    queryFn: async () => {
      const { data } = await supabase
        .from('education_progress')
        .select('module_id, is_completed, questions_answered, questions_correct')
      return data ?? []
    },
  })

  const moduleStatsMap = useMemo(() => {
    const map: Record<string, ModuleAnalytics> = {}
    if (!progressData) return map
    const grouped: Record<string, typeof progressData> = {}
    progressData.forEach((r) => {
      if (!grouped[r.module_id]) grouped[r.module_id] = []
      grouped[r.module_id].push(r)
    })
    Object.entries(grouped).forEach(([moduleId, rows]) => {
      const total = rows.length
      const completed = rows.filter((r) => r.is_completed).length
      const avgScore = total > 0
        ? rows.reduce((sum, r) => {
            const pct = r.questions_answered > 0 ? (r.questions_correct / r.questions_answered) * 100 : 0
            return sum + pct
          }, 0) / total
        : 0
      map[moduleId] = {
        totalStudents: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgScore: Math.round(avgScore),
      }
    })
    return map
  }, [progressData])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createModuleMutation = useMutation({
    mutationFn: async (form: NewModuleForm) => {
      const { error } = await supabase.from('education_modules').insert({
        title: form.title,
        description: form.description || null,
        difficulty: form.difficulty,
        estimated_minutes: form.estimated_minutes,
        order_index: form.order_index,
        is_published: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Module created')
      setShowCreateForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'educationModules'] })
    },
    onError: () => toast.error('Failed to create module'),
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from('education_modules')
        .update({ is_published: published, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, { published }) => {
      toast.success(published ? 'Module published' : 'Module unpublished')
      queryClient.invalidateQueries({ queryKey: ['admin', 'educationModules'] })
    },
    onError: () => toast.error('Failed to toggle publish'),
  })

  // ── Render ────────────────────────────────────────────────────────────────

  const published = modules?.filter((m) => m.is_published).length ?? 0
  const unpublished = (modules?.length ?? 0) - published

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {selectedModule && (
        <ModuleDetailPanel
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="label-eyebrow">Admin Panel</p>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
            Education Builder
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Create and manage learning modules and questions</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="btn-primary"
          style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: 'var(--text-sm)' }}
        >
          {showCreateForm ? '✕ Cancel' : '+ New Module'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Total Modules', value: modules?.length ?? 0 },
          { label: 'Published', value: published },
          { label: 'Drafts', value: unpublished },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <ModuleForm
            title="Create New Module"
            onSubmit={(data) => createModuleMutation.mutate(data)}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createModuleMutation.isPending}
          />
        </div>
      )}

      {/* Module List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {loadingModules ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '100px', borderRadius: '12px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : !modules || modules.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📚</p>
            <p style={{ color: 'var(--color-text-secondary)' }}>No modules yet. Create your first module above.</p>
          </div>
        ) : (
          modules.map((mod) => {
            const stats = moduleStatsMap[mod.id]
            return (
              <div
                key={mod.id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', padding: '20px 24px' }}
                onClick={() => setSelectedModule(mod)}
              >
                {/* Published indicator */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: mod.is_published ? 'var(--color-positive)' : 'var(--color-text-muted)',
                  boxShadow: mod.is_published ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 700, margin: 0, fontSize: 'var(--text-base)' }}>
                      {mod.title}
                    </h3>
                    <DifficultyBadge difficulty={mod.difficulty} />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      ~{mod.estimated_minutes}m · Order #{mod.order_index}
                    </span>
                  </div>
                  {mod.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mod.description}
                    </p>
                  )}
                  {stats && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                        {stats.totalStudents} students
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                        {stats.completionRate}% completion
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                        {stats.avgScore}% avg score
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: mod.id, published: !mod.is_published })}
                    disabled={togglePublishMutation.isPending}
                    style={{
                      padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: 'var(--text-xs)',
                      background: mod.is_published ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                      color: mod.is_published ? 'var(--color-negative)' : 'var(--color-positive)',
                    }}
                  >
                    {mod.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setSelectedModule(mod)}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
