'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import AreaChartComponent from '@/components/charts/AreaChartComponent'
import BarChartComponent from '@/components/charts/BarChartComponent'
import type { Profile, Trade } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  loading?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function nDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function firstDayOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="label-eyebrow" style={{ marginBottom: '8px' }}>{label}</p>
          {loading ? (
            <div style={{
              height: '32px', width: '80px', borderRadius: '6px',
              background: 'var(--color-bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ) : (
            <p style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>{value}</p>
          )}
        </div>
        <div className="card-icon">
          <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Recent Signups Table ────────────────────────────────────────────────────

function RecentSignupsTable({ profiles, loading }: { profiles: Profile[], loading: boolean }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Recent Signups
        </h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j}>
                      <div style={{
                        height: '16px', borderRadius: '4px',
                        background: 'var(--color-bg-elevated)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
                  No signups yet
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-sm)', fontWeight: 600,
                        color: 'var(--color-accent-gold)',
                        flexShrink: 0,
                      }}>
                        {(p.display_name ?? p.email)[0].toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {p.display_name ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.email}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: '99px', fontSize: 'var(--text-xs)',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: p.role === 'admin' ? 'rgba(54,128,255,0.15)' : p.role === 'manager' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                      color: p.role === 'admin' ? 'var(--color-accent-gold)' : p.role === 'manager' ? '#818CF8' : 'var(--color-text-secondary)',
                    }}>
                      {p.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  // Guard: admin only
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

  const { data: totalUsers, isLoading: loadingTotal } = useQuery({
    queryKey: ['admin', 'totalUsers'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const { data: activeUsers, isLoading: loadingActive } = useQuery({
    queryKey: ['admin', 'activeUsers'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
      return count ?? 0
    },
  })

  const { data: tradesToday, isLoading: loadingTrades } = useQuery({
    queryKey: ['admin', 'tradesToday'],
    queryFn: async () => {
      const { count } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', `${todayISO()}T00:00:00.000Z`)
      return count ?? 0
    },
  })

  const { data: openTickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['admin', 'openTickets'],
    queryFn: async () => {
      const { count } = await supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')
      return count ?? 0
    },
  })

  const { data: referralsMonth, isLoading: loadingReferrals } = useQuery({
    queryKey: ['admin', 'referralsMonth'],
    queryFn: async () => {
      const { count } = await supabase
        .from('referral_uses')
        .select('id', { count: 'exact', head: true })
        .gte('used_at', `${firstDayOfMonth()}T00:00:00.000Z`)
      return count ?? 0
    },
  })

  // ── User Growth Chart (last 90 days, cumulative) ───────────────────────────

  const { data: profilesGrowthRaw, isLoading: loadingGrowth } = useQuery({
    queryKey: ['admin', 'profilesGrowth'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', `${nDaysAgo(90)}T00:00:00.000Z`)
        .order('created_at', { ascending: true })
      return data ?? []
    },
  })

  const userGrowthChartData = useMemo(() => {
    if (!profilesGrowthRaw) return []
    const counts: Record<string, number> = {}
    profilesGrowthRaw.forEach((p) => {
      const day = p.created_at.split('T')[0]
      counts[day] = (counts[day] ?? 0) + 1
    })
    const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
    let cumulative = 0
    return sorted.map(([date, count]) => {
      cumulative += count
      return { time: date.slice(5), price: cumulative }
    })
  }, [profilesGrowthRaw])

  // ── Daily Trades Chart (last 30 days) ─────────────────────────────────────

  const { data: dailyTradesRaw, isLoading: loadingDailyTrades } = useQuery({
    queryKey: ['admin', 'dailyTrades'],
    queryFn: async () => {
      const { data } = await supabase
        .from('trades')
        .select('created_at')
        .gte('created_at', `${nDaysAgo(30)}T00:00:00.000Z`)
        .order('created_at', { ascending: true })
      return data ?? []
    },
  })

  const dailyTradesChartData = useMemo(() => {
    if (!dailyTradesRaw) return []
    const counts: Record<string, number> = {}
    dailyTradesRaw.forEach((t: Pick<Trade, 'created_at'>) => {
      const day = t.created_at.split('T')[0]
      counts[day] = (counts[day] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ month: date.slice(5), pips: count }))
  }, [dailyTradesRaw])

  // ── Recent Signups ─────────────────────────────────────────────────────────

  const { data: recentSignups, isLoading: loadingSignups } = useQuery({
    queryKey: ['admin', 'recentSignups'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      return (data ?? []) as Profile[]
    },
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p className="label-eyebrow">Admin Panel</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Platform overview and key metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        <StatCard label="Total Users" value={totalUsers ?? 0} icon="👥" loading={loadingTotal} />
        <StatCard label="Active Users" value={activeUsers ?? 0} icon="🟢" loading={loadingActive} />
        <StatCard label="Trades Today" value={tradesToday ?? 0} icon="📊" loading={loadingTrades} />
        <StatCard label="Open Tickets" value={openTickets ?? 0} icon="🎫" loading={loadingTickets} />
        <StatCard label="Total Revenue" value="N/A" icon="💰" />
        <StatCard label="Referrals This Month" value={referralsMonth ?? 0} icon="🔗" loading={loadingReferrals} />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        {/* User Growth */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              User Growth
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              Cumulative signups — last 90 days
            </p>
          </div>
          <div style={{ padding: 'var(--space-3)' }}>
            {loadingGrowth ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading chart…</p>
              </div>
            ) : userGrowthChartData.length === 0 ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>No data available</p>
              </div>
            ) : (
              <AreaChartComponent data={userGrowthChartData} height={240} color="#3680FF" />
            )}
          </div>
        </div>

        {/* Daily Trades */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Daily Trades
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              Trades per day — last 30 days
            </p>
          </div>
          <div style={{ padding: 'var(--space-3)' }}>
            {loadingDailyTrades ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading chart…</p>
              </div>
            ) : dailyTradesChartData.length === 0 ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>No data available</p>
              </div>
            ) : (
              <BarChartComponent data={dailyTradesChartData} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <RecentSignupsTable profiles={recentSignups ?? []} loading={loadingSignups} />
    </div>
  )
}
