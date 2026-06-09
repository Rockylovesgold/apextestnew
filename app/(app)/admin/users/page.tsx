'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Profile, Trade } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleFilter = 'all' | 'admin' | 'manager' | 'member'
type StatusFilter = 'all' | 'active' | 'inactive'

interface UserDetailModalProps {
  user: Profile
  onClose: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roleBadge(role: Profile['role']) {
  const styles: Record<string, React.CSSProperties> = {
    admin: { background: 'rgba(54,128,255,0.15)', color: 'var(--color-accent-gold)' },
    manager: { background: 'rgba(99,102,241,0.15)', color: '#818CF8' },
    member: { background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' },
  }
  return (
    <span style={{
      ...styles[role],
      padding: '2px 10px', borderRadius: '99px',
      fontSize: 'var(--text-xs)', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {role}
    </span>
  )
}

function Avatar({ name, email }: { name: string | null; email: string }) {
  const letter = (name ?? email)[0].toUpperCase()
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 'var(--text-sm)', fontWeight: 700,
      color: 'var(--color-accent-gold)', flexShrink: 0,
    }}>
      {letter}
    </div>
  )
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const supabase = createClient()

  const { data: trades, isLoading: loadingTrades } = useQuery({
    queryKey: ['admin', 'userTrades', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      return (data ?? []) as Trade[]
    },
  })

  const { data: tradeStats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'userTradeStats', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('trades')
        .select('profit_loss, status')
        .eq('user_id', user.id)
      const all = data ?? []
      const closed = all.filter((t) => t.status === 'closed')
      const wins = closed.filter((t) => (t.profit_loss ?? 0) > 0)
      const totalPnL = closed.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0)
      const winRate = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0
      return { total: all.length, pnl: totalPnL, winRate }
    },
  })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '16px', padding: 'var(--space-4)',
        maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar name={user.display_name} email={user.email} />
            <div>
              <h2 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                {user.display_name ?? 'Unnamed User'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '20px', padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Profile Info */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)', marginBottom: 'var(--space-3)',
        }}>
          {[
            { label: 'Role', value: roleBadge(user.role) },
            { label: 'Status', value: user.is_active ? '✅ Active' : '❌ Inactive' },
            { label: 'Joined', value: new Date(user.created_at).toLocaleDateString() },
            { label: 'Account Balance', value: `$${user.account_balance.toFixed(2)}` },
            { label: 'Referral Code', value: user.referral_code ?? '—' },
            { label: 'Referred By', value: user.referred_by ? user.referred_by.slice(0, 8) + '…' : 'Direct' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px', padding: '12px',
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Trade Stats */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p className="label-eyebrow" style={{ marginBottom: '12px' }}>Trade Summary</p>
          {loadingStats ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                { label: 'Total Trades', value: tradeStats?.total ?? 0 },
                { label: 'Total P&L', value: `$${(tradeStats?.pnl ?? 0).toFixed(2)}` },
                { label: 'Win Rate', value: `${tradeStats?.winRate ?? 0}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '8px', padding: '12px', textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last 5 Trades */}
        <div>
          <p className="label-eyebrow" style={{ marginBottom: '12px' }}>Last 5 Trades</p>
          {loadingTrades ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</p>
          ) : !trades || trades.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No trades yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trades.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '8px', padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: 'var(--text-xs)', fontWeight: 700,
                      background: t.direction === 'buy' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.direction === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
                    }}>
                      {t.direction.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{t.instrument}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      color: (t.profit_loss ?? 0) >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                      fontWeight: 600, margin: 0, fontSize: 'var(--text-sm)',
                    }}>
                      {t.profit_loss != null ? `$${t.profit_loss.toFixed(2)}` : '—'}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  // Guard
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

  // ── Fetch all profiles ─────────────────────────────────────────────────────

  const { data: allProfiles, isLoading } = useQuery({
    queryKey: ['admin', 'allProfiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      return (data ?? []) as Profile[]
    },
  })

  // ── Stats derived from profiles ───────────────────────────────────────────

  const stats = useMemo(() => {
    if (!allProfiles) return { total: 0, admins: 0, managers: 0, members: 0, inactive: 0 }
    return {
      total: allProfiles.length,
      admins: allProfiles.filter((p) => p.role === 'admin').length,
      managers: allProfiles.filter((p) => p.role === 'manager').length,
      members: allProfiles.filter((p) => p.role === 'member').length,
      inactive: allProfiles.filter((p) => !p.is_active).length,
    }
  }, [allProfiles])

  // ── Filtered profiles ─────────────────────────────────────────────────────

  const filteredProfiles = useMemo(() => {
    if (!allProfiles) return []
    return allProfiles.filter((p) => {
      const matchesSearch =
        !search ||
        (p.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'all' || p.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active) ||
        (statusFilter === 'inactive' && !p.is_active)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [allProfiles, search, roleFilter, statusFilter])

  // ── Trade counts per user ─────────────────────────────────────────────────

  const { data: tradeCounts } = useQuery({
    queryKey: ['admin', 'tradeCounts'],
    queryFn: async () => {
      const { data } = await supabase.from('trades').select('user_id')
      const counts: Record<string, number> = {}
      ;(data ?? []).forEach((t: { user_id: string }) => {
        counts[t.user_id] = (counts[t.user_id] ?? 0) + 1
      })
      return counts
    },
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Profile['role'] }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: (_, { role }) => {
      toast.success(`Role updated to ${role}`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'allProfiles'] })
    },
    onError: () => toast.error('Failed to update role'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'User activated' : 'User deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'allProfiles'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p className="label-eyebrow">Admin Panel</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
          Users
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Manage platform users, roles, and access
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--space-2)', marginBottom: 'var(--space-4)',
      }}>
        {[
          { label: 'Total Users', value: stats.total, color: 'var(--color-text-primary)' },
          { label: 'Admins', value: stats.admins, color: 'var(--color-accent-gold)' },
          { label: 'Managers', value: stats.managers, color: '#818CF8' },
          { label: 'Members', value: stats.members, color: 'var(--color-text-secondary)' },
          { label: 'Inactive', value: stats.inactive, color: 'var(--color-negative)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ color, fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        marginBottom: 'var(--space-3)',
      }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1', minWidth: '240px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px', padding: '10px 14px',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px', padding: '10px 14px',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)', cursor: 'pointer',
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px', padding: '10px 14px',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)', cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Trades</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div style={{ height: '16px', borderRadius: '4px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedUser(p)}
                  >
                    {/* Avatar + Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={p.display_name} email={p.email} />
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {p.display_name ?? '—'}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ color: 'var(--color-text-secondary)' }} onClick={(e) => e.stopPropagation()}>
                      {p.email}
                    </td>

                    {/* Role dropdown */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.role}
                        onChange={(e) => changeRoleMutation.mutate({ userId: p.id, role: e.target.value as Profile['role'] })}
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: '6px', padding: '4px 8px',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-xs)', cursor: 'pointer',
                        }}
                      >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* Status toggle */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleActiveMutation.mutate({ userId: p.id, isActive: !p.is_active })}
                        style={{
                          padding: '4px 12px', borderRadius: '99px',
                          border: 'none', cursor: 'pointer',
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          background: p.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: p.is_active ? 'var(--color-positive)' : 'var(--color-negative)',
                        }}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Joined */}
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>

                    {/* Trade count */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {tradeCounts?.[p.id] ?? 0} trades
                      </span>
                    </td>

                    {/* Actions */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedUser(p)}
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '12px' }}>
        Showing {filteredProfiles.length} of {allProfiles?.length ?? 0} users
      </p>
    </div>
  )
}
