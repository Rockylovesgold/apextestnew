'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Trade } from '@/lib/database.types'
import { TrendingUp, BookOpen, BarChart3, ArrowRight, type LucideIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoldPrice {
  price: number | null
  loading: boolean
  error: boolean
}

interface MarketSession {
  name: string
  active: boolean
  hours: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getUTCHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getActiveSessions(): MarketSession[] {
  const utcHour = new Date().getUTCHours()
  const utcMinutes = new Date().getUTCMinutes()
  const utcTime = utcHour + utcMinutes / 60

  const isOverlap = utcTime >= 13 && utcTime < 17
  const isLondon = utcTime >= 8 && utcTime < 17
  const isNewYork = utcTime >= 13 && utcTime < 22
  const isAsian = utcTime >= 0 && utcTime < 9

  return [
    { name: 'Asian', active: isAsian && !isLondon, hours: '00:00–09:00 UTC' },
    { name: 'London', active: isLondon && !isOverlap, hours: '08:00–17:00 UTC' },
    { name: 'New York', active: isNewYork && !isOverlap, hours: '13:00–22:00 UTC' },
    { name: 'Overlap', active: isOverlap, hours: '13:00–17:00 UTC' },
  ]
}

function calcStats(trades: Trade[]) {
  const closed = trades.filter((t) => t.status === 'closed')
  const open = trades.filter((t) => t.status === 'open')
  const wins = closed.filter((t) => (t.profit_loss ?? 0) > 0)
  const totalPnL = closed.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0)
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0

  return {
    totalTrades: trades.length,
    winRate,
    totalPnL,
    openPositions: open.length,
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="depth-raised" style={{ borderRadius: '12px', padding: '24px' }}>
      <div
        className="skeleton"
        style={{ height: '11px', width: '48%', borderRadius: '4px', marginBottom: '16px' }}
      />
      <div
        className="skeleton"
        style={{ height: '28px', width: '60%', borderRadius: '4px' }}
      />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div
      className="skeleton"
      style={{ height: '48px', borderRadius: '6px', marginBottom: '6px' }}
    />
  )
}

// ─── Gold Price Ticker ────────────────────────────────────────────────────────

function GoldPriceTicker() {
  const { data, isLoading, isError } = useQuery<GoldPrice>({
    queryKey: ['gold-price'],
    queryFn: async () => {
      const res = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/XAUUSD=X?interval=1d',
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to fetch gold price')
      const json = await res.json()
      const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null
      return { price, loading: false, error: false }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return (
    <div className="depth-raised" style={{ borderRadius: '12px', padding: '20px 24px' }}>
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '12px',
        }}
      >
        XAU/USD — Spot Gold
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        {isLoading ? (
          <div className="skeleton" style={{ height: '32px', width: '140px', borderRadius: '4px' }} />
        ) : isError || !data?.price ? (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>Unavailable</span>
        ) : (
          <>
            <span
              className="gold-gradient-text"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              USD / troy oz
            </span>
          </>
        )}
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-text-muted)',
            opacity: 0.6,
          }}
        />
        Delayed data
      </p>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="depth-raised" style={{ borderRadius: '12px', padding: '24px' }}>
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Market Session Indicator ─────────────────────────────────────────────────

function MarketSessionIndicator() {
  const [sessions, setSessions] = useState<MarketSession[]>(getActiveSessions())

  useEffect(() => {
    const id = setInterval(() => setSessions(getActiveSessions()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="depth-raised" style={{ borderRadius: '12px', padding: '20px 24px' }}>
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
        }}
      >
        Market Sessions
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sessions.map((session) => (
          <div
            key={session.name}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${session.active ? 'var(--color-border-emphasis)' : 'var(--color-border-subtle)'}`,
              background: session.active ? 'var(--color-bg-elevated)' : 'transparent',
              boxShadow: session.active ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: session.active ? 700 : 450,
                color: session.active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                letterSpacing: '-0.01em',
              }}
            >
              {session.name}
              {session.active && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent-gold)',
                    opacity: 0.9,
                  }}
                >
                  live
                </span>
              )}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
              {session.hours}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Trades Table ──────────────────────────────────────────────────────

function RecentTradesTable({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '56px 24px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-elevated)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <TrendingUp size={20} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          No trades yet
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 24px', maxWidth: '280px', marginLeft: 'auto', marginRight: 'auto' }}>
          Start tracking your performance by logging your first trade.
        </p>
        <Link
          href="/trades"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-emphasis)',
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          Log your first trade
          <ArrowRight size={13} />
        </Link>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Instrument', 'Direction', 'Entry', 'Exit', 'P&L', 'Date'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-elevated)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => {
            const pnl = trade.profit_loss ?? 0
            const isPos = pnl >= 0
            const isOdd = i % 2 === 1
            return (
              <tr
                key={trade.id}
                style={{
                  background: isOdd ? 'rgba(255,255,255,0.01)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isOdd ? 'rgba(255,255,255,0.01)' : 'transparent' }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--color-border-subtle)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {trade.instrument}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      border: '1px solid var(--color-border-default)',
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {trade.direction}
                  </span>
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {trade.entry_price.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {trade.exit_price != null ? trade.exit_price.toFixed(2) : '—'}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    color: trade.profit_loss == null ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {trade.profit_loss == null
                    ? '—'
                    : `${isPos ? '+' : ''}$${pnl.toFixed(2)}`}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {new Date(trade.opened_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string
  icon: LucideIcon
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        textDecoration: 'none',
        transition: 'all var(--transition-base)',
        flex: 1,
        minWidth: '180px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-emphasis)'
        e.currentTarget.style.background = 'var(--color-bg-elevated)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
        e.currentTarget.style.background = 'var(--color-bg-surface)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid var(--color-border-default)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} strokeWidth={1.75} color="var(--color-text-secondary)" />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {description}
        </div>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  const displayName =
    profile?.display_name ||
    user?.email?.split('@')[0] ||
    'Trader'

  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('opened_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const stats = calcStats(trades)
  const recentClosed = trades.filter((t) => t.status === 'closed').slice(0, 5)

  const pnlSign = stats.totalPnL > 0 ? '+' : ''

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            {getGreeting()},{' '}
            <span className="gold-gradient-text">{displayName}</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '6px 0 0', letterSpacing: '0.01em' }}>
            {formatDate()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/trades"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'var(--color-accent-gold)',
              color: '#070C1C',
              letterSpacing: '-0.005em',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.08)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(54,128,255,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = ''
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            + Log Trade
          </Link>
          <Link
            href="/learn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.005em',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-elevated)'
              e.currentTarget.style.borderColor = 'var(--color-border-emphasis)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--color-border-default)'
            }}
          >
            Start Learning
          </Link>
        </div>
      </div>

      {/* ── Market Overview Row ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <GoldPriceTicker />
        <MarketSessionIndicator />
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
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
            <StatCard
              label="Total Trades"
              value={stats.totalTrades.toString()}
              sub={`${recentClosed.length} closed`}
            />
            <StatCard
              label="Win Rate"
              value={`${stats.winRate.toFixed(1)}%`}
              sub={stats.totalTrades === 0 ? 'No data yet' : undefined}
            />
            <StatCard
              label="Total P&L"
              value={stats.totalPnL === 0
                ? '$0.00'
                : `${pnlSign}$${stats.totalPnL.toFixed(2)}`}
            />
            <StatCard
              label="Open Positions"
              value={stats.openPositions.toString()}
            />
          </>
        )}
      </div>

      {/* ── Recent Trades ───────────────────────────────────────── */}
      <div
        className="depth-raised"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Recent Trades
          </h2>
          <Link
            href="/trades"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '16px 24px' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <RecentTradesTable trades={recentClosed} />
        )}
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '12px',
          }}
        >
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <QuickAction
            href="/trades"
            icon={TrendingUp}
            label="Log Trade"
            description="Record a new position"
          />
          <QuickAction
            href="/learn"
            icon={BookOpen}
            label="Start Learning"
            description="Browse education modules"
          />
          <QuickAction
            href="/analytics"
            icon={BarChart3}
            label="View Analytics"
            description="Review your performance"
          />
        </div>
      </div>
    </div>
  )
}
