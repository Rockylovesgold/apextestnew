'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Profile } from '@/lib/database.types'

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '16px', padding: 'var(--space-4)',
        maxWidth: '400px', width: '100%', textAlign: 'center',
      }}>
        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</p>
        <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)', cursor: 'pointer', fontWeight: 600 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminManagersPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [memberSearch, setMemberSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'promote' | 'demote'
    user: Profile
  } | null>(null)

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

  const { data: managers, isLoading: loadingManagers } = useQuery({
    queryKey: ['admin', 'managersPage'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'manager')
        .order('created_at', { ascending: false })
      return (data ?? []) as Profile[]
    },
  })

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['admin', 'membersPage'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('display_name', { ascending: true })
      return (data ?? []) as Profile[]
    },
  })

  // ── Referral codes per manager ────────────────────────────────────────────

  const { data: codesData } = useQuery({
    queryKey: ['admin', 'referralCodesForManagers'],
    queryFn: async () => {
      const { data } = await supabase.from('referral_codes').select('id, assigned_to, current_uses')
      const assigned: Record<string, number> = {}
      const referrals: Record<string, number> = {}
      ;(data ?? []).forEach((c: { id: string; assigned_to: string | null; current_uses: number }) => {
        if (c.assigned_to) {
          assigned[c.assigned_to] = (assigned[c.assigned_to] ?? 0) + 1
          referrals[c.assigned_to] = (referrals[c.assigned_to] ?? 0) + c.current_uses
        }
      })
      return { assigned, referrals, totalCodes: (data ?? []).length, totalReferrals: (data ?? []).reduce((sum: number, c: { current_uses: number }) => sum + c.current_uses, 0) }
    },
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    totalManagers: managers?.length ?? 0,
    totalCodesAssigned: codesData?.totalCodes ?? 0,
    totalReferrals: codesData?.totalReferrals ?? 0,
  }), [managers, codesData])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'manager' | 'member' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: (_, { role }) => {
      toast.success(role === 'manager' ? 'User promoted to Manager' : 'User demoted to Member')
      queryClient.invalidateQueries({ queryKey: ['admin', 'managersPage'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'membersPage'] })
      setConfirmAction(null)
    },
    onError: () => {
      toast.error('Failed to update role')
      setConfirmAction(null)
    },
  })

  // ── Filtered members ──────────────────────────────────────────────────────

  const filteredMembers = useMemo(() => {
    if (!members) return []
    if (!memberSearch) return members
    const q = memberSearch.toLowerCase()
    return members.filter((m) =>
      (m.display_name ?? '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  }, [members, memberSearch])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {confirmAction && (
        <ConfirmDialog
          message={
            confirmAction.type === 'promote'
              ? `Promote "${confirmAction.user.display_name ?? confirmAction.user.email}" to Manager?`
              : `Demote "${confirmAction.user.display_name ?? confirmAction.user.email}" to Member?`
          }
          onConfirm={() => changeRoleMutation.mutate({
            userId: confirmAction.user.id,
            role: confirmAction.type === 'promote' ? 'manager' : 'member',
          })}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p className="label-eyebrow">Admin Panel</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
          Managers
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Manage manager roles and referral assignments
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {[
          { label: 'Total Managers', value: stats.totalManagers },
          { label: 'Total Codes Assigned', value: stats.totalCodesAssigned },
          { label: 'Total Referrals via Managers', value: stats.totalReferrals },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>

        {/* Current Managers */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Current Managers ({managers?.length ?? 0})
            </h2>
          </div>
          <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingManagers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: '72px', borderRadius: '10px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))
            ) : !managers || managers.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-3)' }}>No managers yet</p>
            ) : (
              managers.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '10px', padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'rgba(129,140,248,0.15)',
                      border: '1px solid rgba(129,140,248,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--text-sm)', fontWeight: 700, color: '#818CF8',
                    }}>
                      {(m.display_name ?? m.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, margin: 0, fontSize: 'var(--text-sm)' }}>
                        {m.display_name ?? '—'}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '2px 0 0' }}>
                        {m.email}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '2px 0 0' }}>
                        {codesData?.assigned[m.id] ?? 0} codes · {codesData?.referrals[m.id] ?? 0} referrals · Since {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmAction({ type: 'demote', user: m })}
                    style={{
                      padding: '6px 14px', borderRadius: '6px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'transparent', color: 'var(--color-negative)',
                      cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Demote
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Promote a Member */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Promote to Manager
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              Select a member to promote
            </p>
          </div>
          <div style={{ padding: 'var(--space-3)' }}>
            <input
              type="text"
              placeholder="Search members…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
                marginBottom: '12px', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {loadingMembers ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: '56px', borderRadius: '8px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))
              ) : filteredMembers.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px' }}>
                  {memberSearch ? 'No members match your search' : 'No members available'}
                </p>
              ) : (
                filteredMembers.map((m) => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '8px', padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)',
                      }}>
                        {(m.display_name ?? m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'var(--color-text-primary)', fontWeight: 500, margin: 0, fontSize: 'var(--text-sm)' }}>
                          {m.display_name ?? '—'}
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>{m.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmAction({ type: 'promote', user: m })}
                      style={{
                        padding: '6px 14px', borderRadius: '6px',
                        border: 'none', cursor: 'pointer',
                        background: 'rgba(54,128,255,0.15)',
                        color: 'var(--color-accent-gold)',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Promote
                    </button>
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
