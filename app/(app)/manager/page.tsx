'use client'

import { useState } from 'react' // eslint-disable-line @typescript-eslint/no-unused-vars
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { ReferralCode } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReferralUseRow {
  id: string
  used_at: string
  code_id: string
  profiles: { display_name: string | null } | null
  referral_codes: { code: string } | null
}

interface ManagerStats {
  activeCodes: number
  totalReferrals: number
  thisMonth: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
      }}
    >
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--color-accent-gold)',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        background: active ? 'rgba(34, 197, 94, 0.12)' : 'rgba(107, 100, 96, 0.18)',
        color: active ? 'var(--color-positive)' : 'var(--color-text-muted)',
        border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'rgba(107,100,96,0.25)'}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: active ? 'var(--color-positive)' : 'var(--color-text-muted)',
          display: 'inline-block',
        }}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: 'var(--color-bg-elevated)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 100 ? 'var(--color-negative)' : 'var(--color-accent-gold)',
            borderRadius: 999,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {value}/{max === 0 ? '∞' : max}
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const supabase = createClient()

  // Fetch manager's referral codes
  const { data: codes, isLoading: codesLoading } = useQuery<ReferralCode[]>({
    queryKey: ['manager-codes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('assigned_to', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  // Fetch recent referral uses for all manager codes
  const { data: recentUses, isLoading: usesLoading } = useQuery<ReferralUseRow[]>({
    queryKey: ['manager-referral-uses', user?.id],
    queryFn: async () => {
      if (!codes || codes.length === 0) return []
      const codeIds = codes.map(c => c.id)
      const { data, error } = await supabase
        .from('referral_uses')
        .select('id, used_at, code_id, profiles!used_by(display_name), referral_codes!code_id(code)')
        .in('code_id', codeIds)
        .order('used_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return (data ?? []) as unknown as ReferralUseRow[]
    },
    enabled: !!codes && codes.length > 0,
  })

  // Compute stats
  const stats: ManagerStats = {
    activeCodes: codes?.filter(c => c.is_active).length ?? 0,
    totalReferrals: codes?.reduce((sum, c) => sum + c.current_uses, 0) ?? 0,
    thisMonth: (() => {
      if (!recentUses) return 0
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 30)
      return recentUses.filter(u => new Date(u.used_at) >= cutoff).length
    })(),
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied: ${code}`)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '2px solid var(--color-border-default)',
            borderTopColor: 'var(--color-accent-gold)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
        Access denied.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-eyebrow" style={{ marginBottom: '0.375rem' }}>Manager Portal</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Manager Dashboard
        </h1>
        {profile.display_name && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {profile.display_name}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <StatCard label="My Active Codes" value={stats.activeCodes} />
        <StatCard label="Total Referrals" value={stats.totalReferrals} />
        <StatCard label="This Month" value={stats.thisMonth} />
      </div>

      {/* Referral Codes Table */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Referral Codes
        </h2>

        <div
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          {codesLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Loading codes...
            </div>
          ) : !codes || codes.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              No referral codes assigned.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    {['Code', 'Max Uses', 'Current Uses', 'Status', 'Expires', 'Usage'].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                    <th style={{ padding: '0.75rem 1rem', width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code, idx) => (
                    <tr
                      key={code.id}
                      style={{
                        borderBottom: idx < codes.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-bg-elevated)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-accent-gold)',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {code.code}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {code.max_uses === 0 ? '∞' : code.max_uses}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {code.current_uses}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <StatusBadge active={code.is_active} />
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {code.expires_at ? formatDate(code.expires_at) : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', minWidth: 140 }}>
                        <ProgressBar value={code.current_uses} max={code.max_uses} />
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleCopyCode(code.code)}
                          style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.625rem' }}
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Recent Referrals Table */}
      <section>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Recent Referrals
        </h2>

        <div
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          {usesLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Loading referrals...
            </div>
          ) : !recentUses || recentUses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              No referrals yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    {['User', 'Joined Date', 'Code Used'].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUses.map((use, idx) => (
                    <tr
                      key={use.id}
                      style={{
                        borderBottom: idx < recentUses.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-bg-elevated)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-gold-dim, #1E50B3))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 700,
                              color: '#070C1C',
                              flexShrink: 0,
                            }}
                          >
                            {(use.profiles?.display_name || 'U')[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {use.profiles?.display_name ?? 'Unknown User'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {formatDate(use.used_at)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-accent-gold)',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {use.referral_codes?.code ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
