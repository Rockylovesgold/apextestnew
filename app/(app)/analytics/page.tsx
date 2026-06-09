'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AreaChartComponent from '@/components/charts/AreaChartComponent'
import BarChartComponent from '@/components/charts/BarChartComponent'
import type { Trade } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

type DateRange = '7d' | '30d' | '90d' | 'all'

interface AnalyticsSummary {
  totalPnL: number
  winRate: number
  profitFactor: number
  avgRR: number
  totalTrades: number
}

interface SessionStats {
  session: Trade['session']
  label: string
  wins: number
  total: number
  winRate: number
}

interface StrategyStats {
  strategy: string
  trades: number
  wins: number
  winRate: number
  totalPnL: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateCutoff(range: DateRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

function filterByRange(trades: Trade[], range: DateRange): Trade[] {
  const cutoff = getDateCutoff(range)
  if (!cutoff) return trades
  return trades.filter((t) => new Date(t.opened_at) >= cutoff)
}

function calcSummary(trades: Trade[]): AnalyticsSummary {
  const closed = trades.filter((t) => t.status === 'closed')
  const wins = closed.filter((t) => (t.profit_loss ?? 0) > 0)
  const losses = closed.filter((t) => (t.profit_loss ?? 0) < 0)

  const totalPnL = closed.reduce((s, t) => s + (t.profit_loss ?? 0), 0)
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0

  const grossProfit = wins.reduce((s, t) => s + (t.profit_loss ?? 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.profit_loss ?? 0), 0))
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss

  // R:R from stop loss / take profit or entry/exit
  const rrs = closed
    .filter((t) => t.stop_loss != null && t.take_profit != null && t.entry_price > 0)
    .map((t) => {
      const risk = Math.abs(t.entry_price - t.stop_loss!)
      const reward = Math.abs((t.take_profit ?? t.entry_price) - t.entry_price)
      return risk > 0 ? reward / risk : 0
    })
    .filter((r) => r > 0)

  const avgRR = rrs.length > 0 ? rrs.reduce((s, r) => s + r, 0) / rrs.length : 0

  return {
    totalPnL,
    winRate,
    profitFactor: isFinite(profitFactor) ? profitFactor : 0,
    avgRR,
    totalTrades: closed.length,
  }
}

function buildEquityCurve(trades: Trade[]): { time: string; price: number }[] {
  const closed = [...trades]
    .filter((t) => t.status === 'closed' && t.closed_at)
    .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime())

  let cumulative = 0
  return closed.map((t) => {
    cumulative += t.profit_loss ?? 0
    return {
      time: new Date(t.closed_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(cumulative.toFixed(2)),
    }
  })
}

function buildDailyPnL(trades: Trade[]): { month: string; pips: number }[] {
  const closed = trades.filter((t) => t.status === 'closed' && t.closed_at)
  const dayMap = new Map<string, number>()

  for (const t of closed) {
    const key = new Date(t.closed_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dayMap.set(key, (dayMap.get(key) ?? 0) + (t.profit_loss ?? 0))
  }

  return Array.from(dayMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([key, val]) => ({
      month: key,
      pips: parseFloat(val.toFixed(2)),
    }))
}

function buildSessionStats(trades: Trade[]): SessionStats[] {
  const sessions: { session: Trade['session']; label: string }[] = [
    { session: 'london', label: 'London' },
    { session: 'new_york', label: 'New York' },
    { session: 'asian', label: 'Asian' },
    { session: 'overlap', label: 'Overlap' },
  ]

  const closed = trades.filter((t) => t.status === 'closed')

  return sessions.map(({ session, label }) => {
    const sessionTrades = closed.filter((t) => t.session === session)
    const wins = sessionTrades.filter((t) => (t.profit_loss ?? 0) > 0)
    return {
      session,
      label,
      wins: wins.length,
      total: sessionTrades.length,
      winRate: sessionTrades.length > 0 ? (wins.length / sessionTrades.length) * 100 : 0,
    }
  })
}

function buildStrategyStats(trades: Trade[]): StrategyStats[] {
  const closed = trades.filter((t) => t.status === 'closed')
  const strategyMap = new Map<string, { wins: number; total: number; pnl: number }>()

  for (const t of closed) {
    const key = t.strategy ?? 'No Strategy'
    const existing = strategyMap.get(key) ?? { wins: 0, total: 0, pnl: 0 }
    strategyMap.set(key, {
      wins: existing.wins + ((t.profit_loss ?? 0) > 0 ? 1 : 0),
      total: existing.total + 1,
      pnl: existing.pnl + (t.profit_loss ?? 0),
    })
  }

  return Array.from(strategyMap.entries())
    .map(([strategy, s]) => ({
      strategy,
      trades: s.total,
      wins: s.wins,
      winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
      totalPnL: s.pnl,
    }))
    .sort((a, b) => b.trades - a.trades)
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: '20px 24px',
      }}
    >
      <div
        className="animate-pulse"
        style={{
          height: 10,
          width: '45%',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 5,
          marginBottom: 12,
        }}
      />
      <div
        className="animate-pulse"
        style={{
          height: 26,
          width: '65%',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 5,
        }}
      />
    </div>
  )
}

function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{
        height,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
      }}
    />
  )
}

// ─── Summary Stat Card ────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  positive: _positive,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
}) {
  const color = 'var(--color-text-primary)'

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-text-muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.1, letterSpacing: '-0.02em' }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Date Range Filter ────────────────────────────────────────────────────────

const RANGES: { label: string; value: DateRange }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [range, setRange] = useState<DateRange>('30d')

  const { data: allTrades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ['trades-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('opened_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const trades = useMemo(() => filterByRange(allTrades, range), [allTrades, range])

  const summary = useMemo(() => calcSummary(trades), [trades])
  const equityCurve = useMemo(() => buildEquityCurve(trades), [trades])
  const dailyPnL = useMemo(() => buildDailyPnL(trades), [trades])
  const sessionStats = useMemo(() => buildSessionStats(trades), [trades])
  const strategyStats = useMemo(() => buildStrategyStats(trades), [trades])

  const isEmpty = !isLoading && allTrades.length === 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        padding: '32px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-gold)',
            margin: '0 0 6px',
          }}
        >
          Performance
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
          Review your trading performance and patterns.
        </p>
      </div>

      {/* ── Date Range Filter ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 28,
          padding: 4,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={{
              padding: '8px 18px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
              background:
                range === r.value
                  ? 'rgba(54,128,255,0.15)'
                  : 'transparent',
              color:
                range === r.value
                  ? 'var(--color-accent-gold)'
                  : 'var(--color-text-secondary)',
              outline: range === r.value ? '1px solid rgba(54,128,255,0.3)' : 'none',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {isEmpty && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px',
            }}
          >
            No trade data yet
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            Start logging your trades to unlock performance analytics.
          </p>
          <a
            href="/trades"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 8,
              background: 'var(--color-accent-gold)',
              color: '#070C1C',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Log your first trade →
          </a>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* ── Summary Stats ─────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <SummaryCard
                  label="Total P&L"
                  value={`${summary.totalPnL >= 0 ? '+' : ''}$${summary.totalPnL.toFixed(2)}`}
                  sub={`${summary.totalTrades} closed trades`}
                  positive={summary.totalPnL === 0 ? null : summary.totalPnL > 0}
                />
                <SummaryCard
                  label="Win Rate"
                  value={`${summary.winRate.toFixed(1)}%`}
                  positive={summary.winRate === 0 ? null : summary.winRate >= 50}
                />
                <SummaryCard
                  label="Profit Factor"
                  value={summary.profitFactor === 0 ? '—' : summary.profitFactor.toFixed(2)}
                  sub="Gross profit / gross loss"
                  positive={
                    summary.profitFactor === 0
                      ? null
                      : summary.profitFactor >= 1
                  }
                />
                <SummaryCard
                  label="Avg R:R"
                  value={summary.avgRR === 0 ? '—' : `1:${summary.avgRR.toFixed(2)}`}
                  positive={summary.avgRR === 0 ? null : summary.avgRR >= 1}
                />
              </>
            )}
          </div>

          {/* ── Equity Curve ──────────────────────────────────────────── */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 20px',
              }}
            >
              Equity Curve
            </h2>
            {isLoading ? (
              <SkeletonChart height={280} />
            ) : equityCurve.length < 2 ? (
              <div
                style={{
                  height: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                }}
              >
                Not enough closed trades to display equity curve.
              </div>
            ) : (
              <AreaChartComponent
                data={equityCurve}
                color="var(--color-accent-gold)"
                height={280}
              />
            )}
          </div>

          {/* ── Daily P&L Bar Chart ────────────────────────────────────── */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 20px',
              }}
            >
              Daily P&L
            </h2>
            {isLoading ? (
              <SkeletonChart height={280} />
            ) : dailyPnL.length === 0 ? (
              <div
                style={{
                  height: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                }}
              >
                No daily P&L data for this period.
              </div>
            ) : (
              <BarChartComponent data={dailyPnL} />
            )}
          </div>

          {/* ── Win Rate by Session ────────────────────────────────────── */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 20px',
              }}
            >
              Win Rate by Session
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
              }}
            >
              {isLoading
                ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
                : sessionStats.map((s) => {
                    return (
                      <div
                        key={s.session}
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: `1px solid ${s.total > 0 ? 'var(--color-border-emphasis)' : 'var(--color-border-subtle)'}`,
                          borderRadius: 10,
                          padding: '16px',
                          boxShadow: s.total > 0 ? 'var(--shadow-card)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase' as const,
                            color: s.total > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            marginBottom: 8,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: s.total > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            lineHeight: 1,
                            marginBottom: 4,
                          }}
                        >
                          {s.total > 0 ? `${s.winRate.toFixed(1)}%` : '—'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {s.total > 0
                            ? `${s.wins}W / ${s.total - s.wins}L (${s.total} trades)`
                            : 'No trades'}
                        </div>
                        {/* Progress bar */}
                        {s.total > 0 && (
                          <div
                            style={{
                              marginTop: 10,
                              height: 4,
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.06)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${s.winRate}%`,
                                background: 'var(--color-accent-gold)',
                                opacity: s.total > 0 ? 0.8 : 0.3,
                                borderRadius: 2,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
            </div>
          </div>

          {/* ── Win Rate by Strategy ───────────────────────────────────── */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 24,
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Win Rate by Strategy
              </h2>
            </div>

            {isLoading ? (
              <div style={{ padding: '20px 24px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      height: 44,
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  />
                ))}
              </div>
            ) : strategyStats.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                }}
              >
                No closed trades in this period.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="data-table"
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr>
                      {['Strategy', 'Trades', 'Win Rate', 'Total P&L'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--color-text-muted)',
                            borderBottom: '1px solid var(--color-border-subtle)',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {strategyStats.map((s) => {
                      const isPos = s.totalPnL >= 0
                      const winRateColor = 'var(--color-text-primary)'
                      return (
                        <tr
                          key={s.strategy}
                          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                        >
                          <td
                            style={{
                              padding: '14px 16px',
                              color: 'var(--color-text-primary)',
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {s.strategy}
                          </td>
                          <td
                            style={{
                              padding: '14px 16px',
                              color: 'var(--color-text-secondary)',
                              fontSize: 14,
                            }}
                          >
                            {s.trades}
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 11,
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              ({s.wins}W / {s.trades - s.wins}L)
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: winRateColor,
                                  minWidth: 44,
                                }}
                              >
                                {s.winRate.toFixed(1)}%
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  maxWidth: 100,
                                  height: 4,
                                  borderRadius: 2,
                                  background: 'rgba(255,255,255,0.06)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${s.winRate}%`,
                                    background: 'var(--color-accent-gold)',
                                    opacity: Math.max(0.3, s.winRate / 100),
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '14px 16px',
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {isPos ? '+' : ''}${s.totalPnL.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
