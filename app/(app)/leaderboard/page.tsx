'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeFilter = 'week' | 'month' | 'all'
type MetricKey = 'total_pnl' | 'win_rate' | 'total_pips'

type LeaderboardRow = {
  user_id: string
  display_name: string
  avatar_url: string | null
  total_trades: number
  winning_trades: number
  win_rate: number
  total_pnl: number
  total_pips: number
  profit_factor: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPnL(n: number) {
  const abs = Math.abs(n).toFixed(2)
  return (n >= 0 ? '+$' : '-$') + abs
}

function formatWinRate(n: number) {
  return n.toFixed(1) + '%'
}

function formatPips(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(1)
}

function getInitials(name: string | null) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function metricLabel(key: MetricKey) {
  if (key === 'total_pnl') return 'Total P&L'
  if (key === 'win_rate') return 'Win Rate'
  return 'Total Pips'
}

function formatMetric(key: MetricKey, row: LeaderboardRow) {
  if (key === 'total_pnl') return formatPnL(row.total_pnl)
  if (key === 'win_rate') return formatWinRate(row.win_rate)
  return formatPips(row.total_pips)
}

function metricColor(_key: MetricKey, _row: LeaderboardRow) {
  return 'var(--color-text-primary)'
}

// ─── Skeleton components ──────────────────────────────────────────────────────

function PodiumSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap' }}>
      {[2, 1, 3].map((pos) => (
        <div
          key={pos}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '28px 24px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: pos === 1 ? 200 : 170,
            marginBottom: pos === 1 ? 0 : 24,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ height: 14, width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ height: 20, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
        </div>
      ))}
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite', width: i === 1 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Podium Card ──────────────────────────────────────────────────────────────

function PodiumCard({
  rank,
  row,
  metric,
  isCurrentUser,
}: {
  rank: 1 | 2 | 3
  row: LeaderboardRow
  metric: MetricKey
  isCurrentUser: boolean
}) {
  const medals = { 1: '👑', 2: '🥈', 3: '🥉' }
  const sizes = { 1: { width: 210, avatarSize: 64, fontSize: 'var(--text-2xl)' }, 2: { width: 180, avatarSize: 52, fontSize: 'var(--text-xl)' }, 3: { width: 180, avatarSize: 52, fontSize: 'var(--text-xl)' } }
  const cfg = sizes[rank]
  const isFirst = rank === 1

  // Avatar color by rank
  const avatarColors: Record<number, { bg: string; text: string }> = {
    1: { bg: 'rgba(54,128,255,0.15)', text: 'var(--color-accent-gold)' },
    2: { bg: 'rgba(192,192,192,0.12)', text: '#C0C0C0' },
    3: { bg: 'rgba(205,127,50,0.12)', text: '#CD7F32' },
  }
  const av = avatarColors[rank]

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: isFirst ? '32px 28px' : '24px 20px',
        background: isFirst
          ? 'linear-gradient(160deg, rgba(54,128,255,0.08) 0%, var(--color-bg-surface) 60%)'
          : 'var(--color-bg-surface)',
        border: `1px solid ${isCurrentUser ? 'var(--color-accent-gold)' : isFirst ? 'rgba(54,128,255,0.20)' : 'var(--color-border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: isFirst ? 'var(--shadow-glow-gold)' : 'var(--shadow-card)',
        width: cfg.width,
        alignSelf: isFirst ? 'flex-end' : 'flex-end',
        marginBottom: isFirst ? 0 : 24,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Crown / medal */}
      <div style={{ fontSize: isFirst ? 28 : 22, lineHeight: 1, marginBottom: 2 }}>{medals[rank]}</div>

      {/* Avatar */}
      <div style={{ width: cfg.avatarSize, height: cfg.avatarSize, borderRadius: '50%', background: av.bg, border: `2px solid ${isFirst ? 'rgba(54,128,255,0.35)' : 'var(--color-border-default)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {row.avatar_url ? (
          <img src={row.avatar_url} alt={row.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: isFirst ? 22 : 18, color: av.text }}>
            {getInitials(row.display_name)}
          </span>
        )}
      </div>

      {/* Name */}
      <p style={{ fontWeight: 700, fontSize: isFirst ? 'var(--text-base)' : 'var(--text-sm)', color: 'var(--color-text-primary)', textAlign: 'center', margin: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.display_name || 'Anonymous'}
        {isCurrentUser && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--color-accent-gold)', fontWeight: 600, background: 'rgba(54,128,255,0.12)', padding: '1px 6px', borderRadius: 4 }}>You</span>}
      </p>

      {/* Metric value */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: cfg.fontSize as string, fontWeight: 700, color: metricColor(metric, row), margin: 0, textAlign: 'center' }}>
        {formatMetric(metric, row)}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>{metricLabel(metric)}</p>

      {/* Rank badge */}
      <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', background: isFirst ? 'var(--color-accent-gold)' : 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isFirst ? 'var(--color-text-inverse)' : 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}>
        {rank}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const supabase = createClient()
  const { user } = useAuth()

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [metric, setMetric] = useState<MetricKey>('total_pnl')

  const { data: rows = [], isLoading } = useQuery<LeaderboardRow[]>({
    queryKey: ['leaderboard', timeFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', { time_filter: timeFilter })
      if (error) throw error
      return (data ?? []) as LeaderboardRow[]
    },
  })

  // Sort by selected metric descending
  const sorted = [...rows].sort((a, b) => b[metric] - a[metric])

  const top3 = sorted.slice(0, 3)
  const _rest = sorted.slice(3)

  const rankMedals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  // ── Filter tab style ──

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    borderColor: active ? 'var(--color-accent-gold)' : 'var(--color-border-default)',
    background: active ? 'rgba(54,128,255,0.10)' : 'transparent',
    color: active ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
    fontWeight: active ? 700 : 500,
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap' as const,
  })

  // ── Render ──

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <p className="label-eyebrow" style={{ marginBottom: 4 }}>Community</p>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, var(--text-3xl))', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Leaderboard</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 8, fontSize: 'var(--text-sm)', maxWidth: 480 }}>
          See how your trading performance stacks up against the community.
        </p>
      </div>

      {/* ── Time filter + Metric toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
        {/* Time filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { key: 'week' as TimeFilter, label: 'This Week' },
            { key: 'month' as TimeFilter, label: 'This Month' },
            { key: 'all' as TimeFilter, label: 'All Time' },
          ]).map(opt => (
            <button key={opt.key} onClick={() => setTimeFilter(opt.key)} style={tabStyle(timeFilter === opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Metric toggle */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
          {([
            { key: 'total_pnl' as MetricKey, label: 'P&L' },
            { key: 'win_rate' as MetricKey, label: 'Win Rate' },
            { key: 'total_pips' as MetricKey, label: 'Pips' },
          ]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setMetric(opt.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: metric === opt.key ? 'var(--color-accent-gold)' : 'transparent',
                color: metric === opt.key ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                fontWeight: metric === opt.key ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Podium ── */}
      {isLoading ? (
        <PodiumSkeleton />
      ) : sorted.length === 0 ? null : (
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginBottom: 48,
            flexWrap: 'wrap',
          }}
        >
          {/* Render in order: 2nd, 1st, 3rd for podium visual */}
          {([1, 0, 2] as const).map((idx) => {
            const row = top3[idx]
            if (!row) return null
            const rank = (idx + 1) as 1 | 2 | 3
            return (
              <PodiumCard
                key={row.user_id}
                rank={rank}
                row={row}
                metric={metric}
                isCurrentUser={row.user_id === user?.id}
              />
            )
          })}
        </div>
      )}

      {/* ── Full table ── */}
      {isLoading ? (
        <div className="data-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Rank', 'Trader', 'Trades', 'Win Rate', 'Total P&L', 'Total Pips', 'Profit Factor'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      ) : sorted.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🏆</div>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 8, fontSize: 'var(--text-xl)' }}>
            No trades logged yet for this period
          </h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Be the first to appear on the leaderboard by logging your trades.
          </p>
          <a
            href="/trades"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 'var(--radius-pill)',
              background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)',
              fontWeight: 700, fontSize: 'var(--text-sm)', textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            + Log your first trade
          </a>
        </div>
      ) : (
        <div className="data-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Trader</th>
                <th>Trades</th>
                <th
                  onClick={() => setMetric('win_rate')}
                  style={{ cursor: 'pointer', color: metric === 'win_rate' ? 'var(--color-accent-gold)' : undefined, whiteSpace: 'nowrap' }}
                  title="Sort by Win Rate"
                >
                  Win Rate {metric === 'win_rate' && '↓'}
                </th>
                <th
                  onClick={() => setMetric('total_pnl')}
                  style={{ cursor: 'pointer', color: metric === 'total_pnl' ? 'var(--color-accent-gold)' : undefined, whiteSpace: 'nowrap' }}
                  title="Sort by P&L"
                >
                  Total P&amp;L {metric === 'total_pnl' && '↓'}
                </th>
                <th
                  onClick={() => setMetric('total_pips')}
                  style={{ cursor: 'pointer', color: metric === 'total_pips' ? 'var(--color-accent-gold)' : undefined, whiteSpace: 'nowrap' }}
                  title="Sort by Pips"
                >
                  Total Pips {metric === 'total_pips' && '↓'}
                </th>
                <th style={{ whiteSpace: 'nowrap' }}>Profit Factor</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => {
                const rank = idx + 1
                const isCurrentUser = row.user_id === user?.id
                const isTop3 = rank <= 3

                return (
                  <tr
                    key={row.user_id}
                    style={{
                      outline: isCurrentUser ? '1px solid var(--color-accent-gold)' : undefined,
                      outlineOffset: '-1px',
                      background: isCurrentUser ? 'rgba(54,128,255,0.04)' : undefined,
                      position: 'relative',
                    }}
                  >
                    {/* Rank */}
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {isTop3 ? (
                        <span style={{ fontSize: 18 }}>{rankMedals[rank]}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>#{rank}</span>
                      )}
                    </td>

                    {/* Trader */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isCurrentUser ? 'rgba(54,128,255,0.12)' : 'var(--color-bg-elevated)',
                          border: `1px solid ${isCurrentUser ? 'rgba(54,128,255,0.30)' : 'var(--color-border-default)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {row.avatar_url ? (
                            <img src={row.avatar_url} alt={row.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: isCurrentUser ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)' }}>
                              {getInitials(row.display_name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: isCurrentUser ? 'var(--color-accent-gold)' : 'var(--color-text-primary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {row.display_name || 'Anonymous'}
                            {isCurrentUser && (
                              <span style={{ fontSize: 10, color: 'var(--color-accent-gold)', fontWeight: 600, background: 'rgba(54,128,255,0.12)', padding: '1px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Trades */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                      {row.total_trades}
                    </td>

                    {/* Win Rate */}
                    <td style={{
                      fontFamily: 'var(--font-mono)', fontWeight: metric === 'win_rate' ? 700 : 400,
                      color: metric === 'win_rate' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{formatWinRate(row.win_rate)}</span>
                        {/* Win rate bar */}
                        <div style={{ width: 48, height: 4, background: 'var(--color-bg-elevated)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ height: '100%', width: `${Math.min(row.win_rate, 100)}%`, background: 'var(--color-accent-gold)', opacity: Math.max(0.3, row.win_rate / 100), borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    </td>

                    {/* Total P&L */}
                    <td style={{
                      fontFamily: 'var(--font-mono)', fontWeight: metric === 'total_pnl' ? 700 : 400,
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      {formatPnL(row.total_pnl)}
                    </td>

                    {/* Total Pips */}
                    <td style={{
                      fontFamily: 'var(--font-mono)', fontWeight: metric === 'total_pips' ? 700 : 400,
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      {formatPips(row.total_pips)}
                    </td>

                    {/* Profit Factor */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: row.profit_factor >= 1.5 ? 'var(--color-positive)' : row.profit_factor >= 1 ? 'var(--color-text-secondary)' : 'var(--color-negative)' }}>
                      {row.profit_factor > 0 ? row.profit_factor.toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Result count */}
      {!isLoading && sorted.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {sorted.length} trader{sorted.length !== 1 ? 's' : ''} ranked · {timeFilter === 'week' ? 'This week' : timeFilter === 'month' ? 'This month' : 'All time'}
        </p>
      )}

      {/* Pulse animation for skeletons */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
