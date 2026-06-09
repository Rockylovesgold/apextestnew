'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReferralRow {
  id: string
  used_at: string
  code_id: string
  profiles: {
    display_name: string | null
    email: string
  } | null
  referral_codes: {
    code: string
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
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
      <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-accent-gold)', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function escapeCSV(val: unknown): string {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagerReferralsPage() {
  const { user, profile, loading } = useAuth()
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  // Fetch all referral uses for this manager's codes
  const { data: referrals, isLoading } = useQuery<ReferralRow[]>({
    queryKey: ['manager-all-referrals', user?.id],
    queryFn: async () => {
      // Step 1: get code IDs assigned to this manager
      const { data: codes, error: codesErr } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('assigned_to', user!.id)
      if (codesErr) throw codesErr
      if (!codes || codes.length === 0) return []

      const codeIds = codes.map(c => c.id)

      // Step 2: fetch referral uses with joined data
      const { data, error } = await supabase
        .from('referral_uses')
        .select('id, used_at, code_id, profiles!used_by(display_name, email), referral_codes!code_id(code)')
        .in('code_id', codeIds)
        .order('used_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ReferralRow[]
    },
    enabled: !!user,
  })

  // Search filter
  const filtered = useMemo(() => {
    if (!referrals) return []
    if (!search.trim()) return referrals
    const q = search.toLowerCase()
    return referrals.filter(r => {
      const name = (r.profiles?.display_name ?? '').toLowerCase()
      const email = (r.profiles?.email ?? '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [referrals, search])

  // Stats
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const total = referrals?.length ?? 0
  const thisWeek = referrals?.filter(r => new Date(r.used_at) >= oneWeekAgo).length ?? 0
  const thisMonth = referrals?.filter(r => new Date(r.used_at) >= oneMonthAgo).length ?? 0

  const handleExport = async () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No data to export')
      return
    }
    setExporting(true)
    try {
      const headers = ['User Name', 'Email', 'Code Used', 'Date Joined']
      const rows = filtered.map(r => [
        r.profiles?.display_name ?? 'Unknown',
        r.profiles?.email ?? '',
        r.referral_codes?.code ?? '',
        formatDate(r.used_at),
      ])
      const csv = [headers.map(escapeCSV).join(','), ...rows.map(row => row.map(escapeCSV).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `manager-referrals-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported successfully')
    } finally {
      setExporting(false)
    }
  }

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
          All Referrals
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Complete history of users who joined via your referral codes.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Total Referrals" value={total} />
        <StatCard label="This Week" value={thisWeek} />
        <StatCard label="This Month" value={thisMonth} />
      </div>

      {/* Search + Export bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              width: '100%',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '0.5rem',
              padding: '0.625rem 0.875rem',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-gold)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-default)' }}
          />
        </div>
        <button
          className="btn-secondary"
          onClick={handleExport}
          disabled={exporting}
          style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Loading referrals...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {search ? 'No results match your search.' : 'No referrals found.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  {['User', 'Email', 'Code Used', 'Date Joined'].map(col => (
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
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
                            background: 'linear-gradient(135deg, var(--color-accent-gold), #1E50B3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            color: '#070C1C',
                            flexShrink: 0,
                          }}
                        >
                          {(row.profiles?.display_name || row.profiles?.email || 'U')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {row.profiles?.display_name ?? 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {row.profiles?.email ?? '—'}
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
                        {row.referral_codes?.code ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {formatDate(row.used_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row count footer */}
      {!isLoading && filtered.length > 0 && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'right' }}>
          Showing {filtered.length} of {total} referrals
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
