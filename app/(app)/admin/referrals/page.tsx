'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Profile, ReferralCode } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReferralUseRow {
  id: string
  code_id: string
  used_by: string
  used_at: string
}

interface CreateCodeForm {
  code: string
  assignedTo: string
  maxUses: number
  expiresAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function firstDayOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

function StatusBadge({ isActive, expiresAt, maxUses, currentUses }: {
  isActive: boolean
  expiresAt: string | null
  maxUses: number
  currentUses: number
}) {
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false
  const maxed = maxUses > 0 && currentUses >= maxUses

  let label = 'Active'
  let style: React.CSSProperties = { background: 'rgba(34,197,94,0.15)', color: 'var(--color-positive)' }

  if (!isActive || expired || maxed) {
    label = expired ? 'Expired' : maxed ? 'Maxed' : 'Inactive'
    style = { background: 'rgba(239,68,68,0.15)', color: 'var(--color-negative)' }
  }

  return (
    <span style={{
      ...style, padding: '2px 10px', borderRadius: '99px',
      fontSize: 'var(--text-xs)', fontWeight: 600,
    }}>
      {label}
    </span>
  )
}

// ─── Create Code Modal ────────────────────────────────────────────────────────

function CreateCodeModal({
  managers,
  currentUserId,
  onClose,
}: {
  managers: Profile[]
  currentUserId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateCodeForm>({
    code: generateCode(),
    assignedTo: '',
    maxUses: 0,
    expiresAt: '',
  })
  const [managerSearch, setManagerSearch] = useState('')

  const filteredManagers = useMemo(() =>
    managers.filter((m) =>
      (m.display_name ?? m.email).toLowerCase().includes(managerSearch.toLowerCase())
    ), [managers, managerSearch])

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('referral_codes').insert({
        code: form.code.toUpperCase(),
        created_by: currentUserId,
        assigned_to: form.assignedTo || null,
        max_uses: form.maxUses,
        is_active: true,
        expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(`Code ${form.code} created successfully`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'referralCodes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'referralStats'] })
      onClose()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to create code'),
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '16px', padding: 'var(--space-4)',
        maxWidth: '480px', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
            Create Referral Code
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Code */}
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>Code</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                style={{
                  flex: 1, background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)', outline: 'none',
                }}
              />
              <button
                onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                className="btn-secondary"
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>Assign To (Manager)</label>
            <input
              type="text"
              placeholder="Search managers…"
              value={managerSearch}
              onChange={(e) => setManagerSearch(e.target.value)}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
                marginBottom: '6px', boxSizing: 'border-box',
              }}
            />
            <select
              value={form.assignedTo}
              onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
              size={4}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '8px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
              }}
            >
              <option value="">— Unassigned —</option>
              {filteredManagers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name ?? m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Max Uses */}
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>Max Uses <span style={{ color: 'var(--color-text-muted)' }}>(0 = unlimited)</span></label>
            <input
              type="number"
              min={0}
              value={form.maxUses}
              onChange={(e) => setForm((f) => ({ ...f, maxUses: parseInt(e.target.value, 10) || 0 }))}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Expires At */}
          <div>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>Expires At <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
                boxSizing: 'border-box',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.code || createMutation.isPending}
            className="btn-primary"
            style={{
              padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)',
              fontWeight: 600, fontSize: 'var(--text-sm)',
              opacity: createMutation.isPending ? 0.7 : 1,
            }}
          >
            {createMutation.isPending ? 'Creating…' : 'Create Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReferralsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const { data: managers } = useQuery({
    queryKey: ['admin', 'managers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'manager')
      return (data ?? []) as Profile[]
    },
  })

  const { data: allProfiles } = useQuery({
    queryKey: ['admin', 'allProfilesMap'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, display_name, email')
      const map: Record<string, { display_name: string | null; email: string }> = {}
      ;(data ?? []).forEach((p: { id: string; display_name: string | null; email: string }) => { map[p.id] = p })
      return map
    },
  })

  const { data: referralCodes, isLoading: loadingCodes } = useQuery({
    queryKey: ['admin', 'referralCodes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false })
      return (data ?? []) as ReferralCode[]
    },
  })

  const { data: referralUses, isLoading: loadingUses } = useQuery({
    queryKey: ['admin', 'referralUses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('referral_uses')
        .select('*')
        .order('used_at', { ascending: false })
      return (data ?? []) as ReferralUseRow[]
    },
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const codes = referralCodes ?? []
    const uses = referralUses ?? []
    const now = new Date()
    const activeCount = codes.filter((c) => {
      if (!c.is_active) return false
      if (c.expires_at && new Date(c.expires_at) < now) return false
      if (c.max_uses > 0 && c.current_uses >= c.max_uses) return false
      return true
    }).length
    const thisMonthUses = uses.filter((u) => new Date(u.used_at) >= new Date(`${firstDayOfMonth()}T00:00:00.000Z`)).length
    return { total: codes.length, active: activeCount, totalUses: uses.length, thisMonthUses }
  }, [referralCodes, referralUses])

  // ── Deactivate mutation ───────────────────────────────────────────────────

  const deactivateMutation = useMutation({
    mutationFn: async (codeId: string) => {
      const { error } = await supabase.from('referral_codes').update({ is_active: false }).eq('id', codeId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Code deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'referralCodes'] })
    },
    onError: () => toast.error('Failed to deactivate code'),
  })

  function getUserName(id: string | null) {
    if (!id) return '—'
    const p = allProfiles?.[id]
    return p ? (p.display_name ?? p.email) : id.slice(0, 8) + '…'
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {showCreateModal && profile && (
        <CreateCodeModal
          managers={managers ?? []}
          currentUserId={profile.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="label-eyebrow">Admin Panel</p>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
            Referrals
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage referral codes and track usage</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: 'var(--text-sm)' }}
        >
          + New Code
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Total Codes', value: stats.total },
          { label: 'Active Codes', value: stats.active },
          { label: 'Total Uses', value: stats.totalUses },
          { label: 'This Month', value: stats.thisMonthUses },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Referral Codes Table */}
      <div className="card" style={{ padding: 0, marginBottom: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Referral Codes</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Created By</th>
                <th>Assigned To</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingCodes ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div style={{ height: '16px', borderRadius: '4px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                    ))}
                  </tr>
                ))
              ) : !referralCodes || referralCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>No referral codes yet</td>
                </tr>
              ) : (
                referralCodes.map((rc) => (
                  <tr key={rc.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent-gold)', fontSize: 'var(--text-sm)' }}>
                        {rc.code}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{getUserName(rc.created_by)}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{getUserName(rc.assigned_to)}</td>
                    <td style={{ color: 'var(--color-text-primary)' }}>
                      {rc.current_uses} / {rc.max_uses === 0 ? '∞' : rc.max_uses}
                    </td>
                    <td>
                      <StatusBadge
                        isActive={rc.is_active}
                        expiresAt={rc.expires_at}
                        maxUses={rc.max_uses}
                        currentUses={rc.current_uses}
                      />
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      {rc.expires_at ? new Date(rc.expires_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(rc.code)
                            toast.success('Code copied!')
                          }}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                        >
                          Copy
                        </button>
                        {rc.is_active && (
                          <button
                            onClick={() => deactivateMutation.mutate(rc.id)}
                            disabled={deactivateMutation.isPending}
                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--color-negative)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Uses Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Referral Uses</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Used By</th>
                <th>Date Used</th>
              </tr>
            </thead>
            <tbody>
              {loadingUses ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j}><div style={{ height: '16px', borderRadius: '4px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                    ))}
                  </tr>
                ))
              ) : !referralUses || referralUses.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>No referral uses yet</td>
                </tr>
              ) : (
                referralUses.map((use) => {
                  const code = referralCodes?.find((c) => c.id === use.code_id)
                  return (
                    <tr key={use.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent-gold)', fontSize: 'var(--text-sm)' }}>
                          {code?.code ?? use.code_id.slice(0, 8) + '…'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{getUserName(use.used_by)}</td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        {new Date(use.used_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
