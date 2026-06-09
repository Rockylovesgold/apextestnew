'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { EducationModule, EducationQuestion, EducationProgress } from '@/lib/database.types'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, Eye, Trophy } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerState = 'unanswered' | 'correct' | 'incorrect' | 'revealed'

interface QuestionSession {
  questionId: string
  result: 'correct' | 'incorrect' | 'revealed'
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#3680FF', '#7AB3FF', '#22C55E', '#60A5FA', '#F472B6', '#A78BFA']
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
      rotation: `${Math.random() * 360}deg`,
    }))
  }, [])

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          top: 0;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </>
  )
}

// ─── Completion screen ────────────────────────────────────────────────────────

interface CompletionScreenProps {
  module: EducationModule
  sessions: QuestionSession[]
  onBack: () => void
}

function CompletionScreen({ module, sessions, onBack }: CompletionScreenProps) {
  const scorableSessions = sessions.filter((s) => s.result !== 'revealed')
  const correctCount = scorableSessions.filter((s) => s.result === 'correct').length
  const totalScored = scorableSessions.length
  const scorePercent = totalScored > 0 ? Math.round((correctCount / totalScored) * 100) : 0

  return (
    <>
      <Confetti />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: 'var(--space-6) var(--space-4)',
          textAlign: 'center',
          gap: 'var(--space-3)',
        }}
      >
        {/* Trophy */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(54, 128, 255, 0.12)',
            border: '2px solid rgba(54, 128, 255, 0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Trophy size={40} style={{ color: 'var(--color-accent-gold)' }} />
        </div>

        <h1
          className="gold-gradient-text"
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          Module Complete!
        </h1>

        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', maxWidth: 380 }}>
          You&apos;ve finished <strong style={{ color: 'var(--color-text-primary)' }}>{module.title}</strong>
        </p>

        {totalScored > 0 && (
          <div
            className="card"
            style={{
              padding: 'var(--space-4)',
              marginTop: 8,
              minWidth: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Your Score
            </span>
            <span
              style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 700,
                color:
                  scorePercent >= 80
                    ? 'var(--color-positive)'
                    : scorePercent >= 50
                    ? 'var(--color-accent-gold)'
                    : 'var(--color-negative)',
              }}
            >
              {correctCount}
              <span style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-muted)' }}>
                /{totalScored}
              </span>
            </span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {scorePercent}% correct
            </span>
          </div>
        )}

        <button
          onClick={onBack}
          className="btn-primary"
          style={{ marginTop: 'var(--space-2)' }}
        >
          Back to Education
        </button>
      </div>
    </>
  )
}

// ─── Question: Multiple choice ────────────────────────────────────────────────

interface MultipleChoiceProps {
  question: EducationQuestion
  onAnswer: (isCorrect: boolean) => void
  answerState: AnswerState
  selectedOption: string | null
  onSelect: (option: string) => void
}

function MultipleChoice({ question, onAnswer, answerState, selectedOption, onSelect }: MultipleChoiceProps) {
  const options: string[] = Array.isArray(question.options)
    ? (question.options as string[])
    : []

  const handleSelect = (opt: string) => {
    if (answerState !== 'unanswered') return
    onSelect(opt)
    onAnswer(opt === question.correct_answer)
  }

  const getOptionStyle = (opt: string): React.CSSProperties => {
    if (answerState === 'unanswered') {
      return {
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        color: 'var(--color-text-primary)',
      }
    }
    if (opt === question.correct_answer) {
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        color: 'var(--color-positive)',
      }
    }
    if (opt === selectedOption) {
      return {
        background: 'rgba(239, 68, 68, 0.10)',
        border: '1px solid rgba(239, 68, 68, 0.30)',
        color: 'var(--color-negative)',
      }
    }
    return {
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-subtle)',
      color: 'var(--color-text-muted)',
      opacity: 0.6,
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleSelect(opt)}
          disabled={answerState !== 'unanswered'}
          style={{
            ...getOptionStyle(opt),
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            fontSize: 'var(--text-base)',
            textAlign: 'left',
            cursor: answerState === 'unanswered' ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all var(--transition-fast)',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              color: 'var(--color-text-muted)',
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          {opt}
          {answerState !== 'unanswered' && opt === question.correct_answer && (
            <CheckCircle size={18} style={{ marginLeft: 'auto', color: 'var(--color-positive)', flexShrink: 0 }} />
          )}
          {answerState !== 'unanswered' && opt === selectedOption && opt !== question.correct_answer && (
            <XCircle size={18} style={{ marginLeft: 'auto', color: 'var(--color-negative)', flexShrink: 0 }} />
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Question: True / False ───────────────────────────────────────────────────

interface TrueFalseProps {
  question: EducationQuestion
  onAnswer: (isCorrect: boolean) => void
  answerState: AnswerState
  selectedOption: string | null
  onSelect: (option: string) => void
}

function TrueFalse({ question, onAnswer, answerState, selectedOption, onSelect }: TrueFalseProps) {
  const handleSelect = (val: string) => {
    if (answerState !== 'unanswered') return
    onSelect(val)
    onAnswer(val.toLowerCase() === question.correct_answer.toLowerCase())
  }

  const getBtnStyle = (val: string): React.CSSProperties => {
    const isCorrect = val.toLowerCase() === question.correct_answer.toLowerCase()
    if (answerState === 'unanswered') {
      return {
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        color: 'var(--color-text-primary)',
      }
    }
    if (isCorrect) {
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        color: 'var(--color-positive)',
      }
    }
    if (val === selectedOption) {
      return {
        background: 'rgba(239, 68, 68, 0.10)',
        border: '1px solid rgba(239, 68, 68, 0.30)',
        color: 'var(--color-negative)',
      }
    }
    return {
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-subtle)',
      color: 'var(--color-text-muted)',
      opacity: 0.6,
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {['True', 'False'].map((val) => (
        <button
          key={val}
          onClick={() => handleSelect(val)}
          disabled={answerState !== 'unanswered'}
          style={{
            ...getBtnStyle(val),
            borderRadius: 'var(--radius-md)',
            padding: '18px 24px',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            cursor: answerState === 'unanswered' ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all var(--transition-fast)',
          }}
        >
          {val === 'True' ? '✓' : '✗'} {val}
        </button>
      ))}
    </div>
  )
}

// ─── Question: Tap reveal ─────────────────────────────────────────────────────

interface TapRevealProps {
  question: EducationQuestion
  answerState: AnswerState
  onReveal: () => void
}

function TapReveal({ question, answerState, onReveal }: TapRevealProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {answerState === 'unanswered' ? (
        <button
          onClick={onReveal}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px dashed var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all var(--transition-fast)',
          }}
        >
          <Eye size={20} />
          Tap to reveal answer
        </button>
      ) : (
        <div
          style={{
            background: 'rgba(54, 128, 255, 0.06)',
            border: '1px solid rgba(54, 128, 255, 0.20)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-relaxed)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {question.correct_answer}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModulePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const moduleId = params.id as string

  // ── State ──
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [sessions, setSessions] = useState<QuestionSession[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // ── Queries ──
  const { data: module, isLoading: moduleLoading } = useQuery<EducationModule | null>({
    queryKey: ['education_module', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education_modules')
        .select('*')
        .eq('id', moduleId)
        .single()
      if (error) throw error
      return data
    },
  })

  const { data: questions = [], isLoading: questionsLoading } = useQuery<EducationQuestion[]>({
    queryKey: ['education_questions', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const { data: _existingProgress } = useQuery<EducationProgress | null>({
    queryKey: ['education_progress_module', user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id) return null
      const { data } = await supabase
        .from('education_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle()
      return data ?? null
    },
    enabled: !!user?.id,
  })

  // ── Save progress mutation ──
  const saveProgressMutation = useMutation({
    mutationFn: async ({
      questionsAnswered,
      questionsCorrect,
      completed,
    }: {
      questionsAnswered: number
      questionsCorrect: number
      completed: boolean
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      const payload = {
        user_id: user.id,
        module_id: moduleId,
        questions_answered: questionsAnswered,
        questions_correct: questionsCorrect,
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      }
      const { error } = await supabase
        .from('education_progress')
        .upsert(payload, { onConflict: 'user_id,module_id' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education_progress'] })
      queryClient.invalidateQueries({ queryKey: ['education_progress_module'] })
    },
    onError: () => {
      toast.error('Failed to save progress')
    },
  })

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0

  const handleAnswer = (isCorrect: boolean) => {
    setAnswerState(isCorrect ? 'correct' : 'incorrect')
    setShowExplanation(true)
    setSessions((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        result: isCorrect ? 'correct' : 'incorrect',
      },
    ])
  }

  const handleReveal = () => {
    setAnswerState('revealed')
    setShowExplanation(true)
    setSessions((prev) => [
      ...prev,
      { questionId: currentQuestion.id, result: 'revealed' },
    ])
  }

  const handleNext = async () => {
    if (isLastQuestion) {
      // Calculate final stats
      const allSessions = [
        ...sessions,
        // currentQuestion already pushed in handleAnswer/handleReveal
      ]
      const scorable = allSessions.filter((s) => s.result !== 'revealed')
      const correct = scorable.filter((s) => s.result === 'correct').length

      await saveProgressMutation.mutateAsync({
        questionsAnswered: scorable.length,
        questionsCorrect: correct,
        completed: true,
      })

      setIsCompleted(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setAnswerState('unanswered')
      setSelectedOption(null)
      setShowExplanation(false)
    }
  }

  const isLoading = moduleLoading || questionsLoading

  // ── Render loading ──
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div className="loading-spinner" />
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading module...</span>
        <style>{`
          .loading-spinner {
            width: 36px; height: 36px;
            border: 3px solid var(--color-border-default);
            border-top-color: var(--color-accent-gold);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (!module) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Module not found.</p>
        <button onClick={() => router.push('/learn')} className="btn-primary" style={{ marginTop: 16 }}>
          Back to Education
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No questions available for this module yet.</p>
        <button onClick={() => router.push('/learn')} className="btn-primary" style={{ marginTop: 16 }}>
          Back to Education
        </button>
      </div>
    )
  }

  // ── Completion screen ──
  if (isCompleted) {
    return (
      <CompletionScreen
        module={module}
        sessions={sessions}
        onBack={() => router.push('/learn')}
      />
    )
  }

  // ── Question player ──
  return (
    <>
      <style>{`
        .player-wrapper {
          max-width: 680px;
          margin: 0 auto;
          padding: var(--space-4);
        }
        .question-card {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          box-shadow: var(--shadow-card);
        }
        .feedback-banner {
          border-radius: var(--radius-md);
          padding: 14px 18px;
          font-size: var(--text-sm);
          line-height: var(--leading-normal);
          margin-top: 16px;
        }
        .feedback-correct {
          background: rgba(34, 197, 94, 0.10);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #4ade80;
        }
        .feedback-incorrect {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.22);
          color: #f87171;
        }
        .feedback-info {
          background: rgba(54, 128, 255, 0.06);
          border: 1px solid rgba(54, 128, 255, 0.18);
          color: var(--color-text-secondary);
        }
        .next-btn {
          margin-top: var(--space-3);
          width: 100%;
        }
      `}</style>

      <div className="player-wrapper">
        {/* Back link */}
        <button
          onClick={() => router.push('/learn')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          Back to Education
        </button>

        {/* Module title */}
        <h2
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          {module.title}
        </h2>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progressPct}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, var(--color-accent-gold), #7ab3ff)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="question-card">
          {/* Question type eyebrow */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: 12,
            }}
          >
            {currentQuestion.question_type === 'multiple_choice'
              ? 'Multiple Choice'
              : currentQuestion.question_type === 'true_false'
              ? 'True or False'
              : 'Tap to Reveal'}
          </span>

          {/* Question text */}
          <p
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-snug)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {currentQuestion.question}
          </p>

          {/* Answer input */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <MultipleChoice
              question={currentQuestion}
              onAnswer={handleAnswer}
              answerState={answerState}
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
            />
          )}
          {currentQuestion.question_type === 'true_false' && (
            <TrueFalse
              question={currentQuestion}
              onAnswer={handleAnswer}
              answerState={answerState}
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
            />
          )}
          {currentQuestion.question_type === 'tap_reveal' && (
            <TapReveal
              question={currentQuestion}
              answerState={answerState}
              onReveal={handleReveal}
            />
          )}

          {/* Feedback / explanation */}
          {showExplanation && (
            <div>
              {answerState === 'correct' && (
                <div className="feedback-banner feedback-correct">
                  <strong>Correct!</strong>
                  {currentQuestion.explanation && (
                    <p style={{ marginTop: 6, color: 'inherit', opacity: 0.85 }}>
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
              {answerState === 'incorrect' && (
                <div className="feedback-banner feedback-incorrect">
                  <strong>Incorrect.</strong> The correct answer is:{' '}
                  <span style={{ fontWeight: 600 }}>{currentQuestion.correct_answer}</span>
                  {currentQuestion.explanation && (
                    <p style={{ marginTop: 6, color: 'inherit', opacity: 0.85 }}>
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
              {answerState === 'revealed' && currentQuestion.explanation && (
                <div className="feedback-banner feedback-info">
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
          )}

          {/* Next button — shown after answering */}
          {answerState !== 'unanswered' && (
            <button
              onClick={handleNext}
              className="btn-primary next-btn"
              disabled={saveProgressMutation.isPending}
            >
              {saveProgressMutation.isPending
                ? 'Saving...'
                : isLastQuestion
                ? 'Complete Module'
                : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
