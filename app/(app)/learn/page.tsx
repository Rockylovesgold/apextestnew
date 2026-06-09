'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { EducationModule, EducationProgress } from '@/lib/database.types'
import { BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react'

// ─── Difficulty badge ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<EducationModule['difficulty'], { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className: 'badge-beginner',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'badge-intermediate',
  },
  advanced: {
    label: 'Advanced',
    className: 'badge-advanced',
  },
}

// ─── Module card ─────────────────────────────────────────────────────────────

interface ModuleCardProps {
  module: EducationModule
  progress: EducationProgress | undefined
  onClick: () => void
}

function ModuleCard({ module, progress, onClick }: ModuleCardProps) {
  const diff = DIFFICULTY_STYLES[module.difficulty]
  const _totalQuestions = progress
    ? Math.max(progress.questions_answered, 1)
    : 1
  const answered = progress?.questions_answered ?? 0
  const correct = progress?.questions_correct ?? 0
  const isCompleted = progress?.is_completed ?? false
  const progressPct = answered > 0 ? Math.round((correct / answered) * 100) : 0
  const hasStarted = answered > 0 || isCompleted

  return (
    <button
      onClick={onClick}
      className="card module-card"
      style={{ textAlign: 'left', width: '100%', cursor: 'pointer', padding: 'var(--space-4)' }}
    >
      {/* Completion badge */}
      {isCompleted && (
        <span className="module-completed-badge">
          <CheckCircle size={18} />
          Completed
        </span>
      )}

      {/* Thumbnail / placeholder */}
      {module.thumbnail_url ? (
        <div className="module-thumbnail" style={{ backgroundImage: `url(${module.thumbnail_url})` }} />
      ) : (
        <div className="module-thumbnail-placeholder">
          <BookOpen size={32} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
      )}

      <div style={{ marginTop: 'var(--space-3)' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className={`difficulty-badge ${diff.className}`}>{diff.label}</span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Clock size={12} />
            {module.estimated_minutes} min
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 6,
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {module.title}
        </h3>

        {/* Description */}
        {module.description && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 16,
              lineHeight: 'var(--leading-normal)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {module.description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {hasStarted
                ? isCompleted
                  ? `${correct}/${answered} correct`
                  : `${answered} answered`
                : 'Not started'}
            </span>
            {hasStarted && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {progressPct}%
              </span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: hasStarted ? `${progressPct}%` : '0%' }}
            />
          </div>
        </div>

        {/* CTA row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: isCompleted ? 'var(--color-positive)' : 'var(--color-accent-gold)',
            }}
          >
            {isCompleted ? 'Review module' : hasStarted ? 'Continue' : 'Start module'}
          </span>
          <ChevronRight
            size={16}
            style={{ color: isCompleted ? 'var(--color-positive)' : 'var(--color-accent-gold)' }}
          />
        </div>
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        gap: 'var(--space-3)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BookOpen size={32} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        No modules available yet
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: 360 }}>
        Education content is being prepared. Check back soon for trading lessons and quizzes.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const { data: modules = [], isLoading: modulesLoading } = useQuery<EducationModule[]>({
    queryKey: ['education_modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education_modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const { data: progressList = [], isLoading: progressLoading } = useQuery<EducationProgress[]>({
    queryKey: ['education_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('education_progress')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const progressMap = new Map<string, EducationProgress>(
    progressList.map((p) => [p.module_id, p])
  )

  const completedCount = progressList.filter((p) => p.is_completed).length
  const totalCount = modules.length
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const isLoading = modulesLoading || progressLoading

  return (
    <>
      <style>{`
        .module-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }
        @media (max-width: 1024px) {
          .module-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .module-grid { grid-template-columns: 1fr; }
        }

        .module-card {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          position: relative;
          overflow: hidden;
        }
        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(54, 128, 255, 0.20);
        }
        .module-card:focus-visible {
          outline: 2px solid var(--color-accent-gold);
          outline-offset: 2px;
        }

        .module-completed-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(34, 197, 94, 0.15);
          color: var(--color-positive);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: var(--radius-pill);
          padding: 3px 10px;
          font-size: var(--text-xs);
          font-weight: 600;
          z-index: 1;
        }

        .module-thumbnail {
          width: 100%;
          height: 140px;
          border-radius: var(--radius-md);
          background-size: cover;
          background-position: center;
          margin-bottom: 4px;
        }
        .module-thumbnail-placeholder {
          width: 100%;
          height: 140px;
          border-radius: var(--radius-md);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .difficulty-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .badge-beginner {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.20);
        }
        .badge-intermediate {
          background: rgba(54, 128, 255, 0.12);
          color: var(--color-accent-gold);
          border: 1px solid rgba(54, 128, 255, 0.22);
        }
        .badge-advanced {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.22);
        }

        .progress-track {
          width: 100%;
          height: 4px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-accent-gold), #7ab3ff);
          border-radius: var(--radius-pill);
          transition: width 0.5s ease;
        }

        .overall-progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-pill);
          overflow: hidden;
          margin-top: 8px;
        }
        .overall-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-accent-gold), #7ab3ff);
          border-radius: var(--radius-pill);
          transition: width 0.8s ease;
        }

        .skeleton-card {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          height: 320px;
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={{ padding: 'var(--space-4)', maxWidth: 'var(--max-width-wide)', margin: '0 auto' }}>
        {/* ── Page header ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <span className="label-eyebrow">Education</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <h1
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: 'var(--tracking-tight)',
                lineHeight: 'var(--leading-tight)',
              }}
            >
              Education Hub
            </h1>

            {!isLoading && totalCount > 0 && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0,
                }}
              >
                {completedCount} / {totalCount} modules completed
              </span>
            )}
          </div>

          {/* Overall progress bar */}
          {!isLoading && totalCount > 0 && (
            <div>
              <div className="overall-progress-bar">
                <div className="overall-progress-fill" style={{ width: `${overallPct}%` }} />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {overallPct}% overall progress
              </p>
            </div>
          )}
        </div>

        {/* ── Module grid ── */}
        <div className="module-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))
          ) : modules.length === 0 ? (
            <EmptyState />
          ) : (
            modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                progress={progressMap.get(mod.id)}
                onClick={() => router.push(`/learn/${mod.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
