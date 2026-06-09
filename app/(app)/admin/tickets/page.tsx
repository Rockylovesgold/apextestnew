'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Ticket, Profile } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_staff: boolean
  created_at: string
}

type StatusFilter = 'all' | Ticket['status']
type PriorityFilter = 'all' | Ticket['priority']
type CategoryFilter = 'all' | Ticket['category']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0]
}

function priorityBadge(priority: Ticket['priority']) {
  const styles: Record<string, React.CSSProperties> = {
    urgent: { background: 'rgba(239,68,68,0.2)', color: '#FF6B6B' },
    high: { background: 'rgba(239,68,68,0.12)', color: 'var(--color-negative)' },
    medium: { background: 'rgba(54,128,255,0.15)', color: 'var(--color-accent-gold)' },
    low: { background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' },
  }
  return (
    <span style={{ ...styles[priority], padding: '2px 10px', borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' }}>
      {priority}
    </span>
  )
}

function statusBadge(status: Ticket['status']) {
  const styles: Record<string, React.CSSProperties> = {
    open: { background: 'rgba(34,197,94,0.12)', color: 'var(--color-positive)' },
    in_progress: { background: 'rgba(99,102,241,0.15)', color: '#818CF8' },
    resolved: { background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' },
    closed: { background: 'rgba(107,100,96,0.2)', color: 'var(--color-text-muted)' },
  }
  const labels: Record<string, string> = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }
  return (
    <span style={{ ...styles[status], padding: '2px 10px', borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
      {labels[status]}
    </span>
  )
}

// ─── Ticket Detail Side Panel ─────────────────────────────────────────────────

function TicketDetailPanel({
  ticket,
  managers,
  profilesMap,
  currentUserId,
  onClose,
}: {
  ticket: Ticket
  managers: Profile[]
  profilesMap: Record<string, { display_name: string | null; email: string }>
  currentUserId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState('')

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['admin', 'ticketMessages', ticket.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true })
      return (data ?? []) as TicketMessage[]
    },
  })

  const updateTicketMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<Ticket, 'status' | 'assigned_to'>>) => {
      const { error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Ticket updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to update ticket'),
  })

  const replyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        user_id: currentUserId,
        message: replyText.trim(),
        is_staff: true,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Reply sent')
      setReplyText('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticketMessages', ticket.id] })
    },
    onError: () => toast.error('Failed to send reply'),
  })

  function getUserName(id: string) {
    const p = profilesMap[id]
    return p ? (p.display_name ?? p.email) : id.slice(0, 8) + '…'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '480px', maxWidth: '100vw',
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border-default)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="label-eyebrow" style={{ marginBottom: '4px' }}>{ticket.category} · #{ticket.id.slice(0, 8)}</p>
            <h2 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ticket.subject}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '20px', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: 'var(--space-3) var(--space-4)', flex: 1 }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 'var(--space-3)' }}>
            <div style={{ background: 'var(--color-bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Submitted By</p>
              <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', margin: 0, fontWeight: 500 }}>{getUserName(ticket.user_id)}</p>
            </div>
            <div style={{ background: 'var(--color-bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Priority</p>
              <div>{priorityBadge(ticket.priority)}</div>
            </div>
            <div style={{ background: 'var(--color-bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Created</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
            <div style={{ background: 'var(--color-bg-elevated)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Updated</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{new Date(ticket.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</label>
            <select
              defaultValue={ticket.status}
              onChange={(e) => updateTicketMutation.mutate({ status: e.target.value as Ticket['status'] })}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
              }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Assign To */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assign To</label>
            <select
              defaultValue={ticket.assigned_to ?? ''}
              onChange={(e) => updateTicketMutation.mutate({ assigned_to: e.target.value || null })}
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
              }}
            >
              <option value="">— Unassigned —</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.display_name ?? m.email}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <p className="label-eyebrow" style={{ marginBottom: '12px' }}>Messages</p>
            {loadingMessages ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</p>
            ) : !messages || messages.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No messages yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    padding: '12px 14px', borderRadius: '10px',
                    background: msg.is_staff ? 'rgba(54,128,255,0.08)' : 'var(--color-bg-elevated)',
                    border: `1px solid ${msg.is_staff ? 'rgba(54,128,255,0.2)' : 'var(--color-border-subtle)'}`,
                    alignSelf: msg.is_staff ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px' }}>
                      {msg.is_staff ? '🛡️ Staff' : getUserName(msg.user_id)} · {new Date(msg.created_at).toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', margin: 0 }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div>
            <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Reply as Staff</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder="Type your reply…"
              style={{
                width: '100%', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px', padding: '10px 14px',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => replyText.trim() && replyMutation.mutate()}
              disabled={!replyText.trim() || replyMutation.isPending}
              style={{
                marginTop: '8px', padding: '10px 20px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)',
                fontWeight: 600, fontSize: 'var(--text-sm)',
                opacity: (!replyText.trim() || replyMutation.isPending) ? 0.5 : 1,
              }}
            >
              {replyMutation.isPending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTicketsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [assignedFilter, setAssignedFilter] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<Ticket['status']>('in_progress')
  const [bulkManager, setBulkManager] = useState<string>('')

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

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      return (data ?? []) as Ticket[]
    },
  })

  const { data: managers } = useQuery({
    queryKey: ['admin', 'managersForTickets'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'manager')
      return (data ?? []) as Profile[]
    },
  })

  const { data: profilesMap } = useQuery({
    queryKey: ['admin', 'profilesMapTickets'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, display_name, email')
      const map: Record<string, { display_name: string | null; email: string }> = {}
      ;(data ?? []).forEach((p: { id: string; display_name: string | null; email: string }) => { map[p.id] = p })
      return map
    },
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const t = tickets ?? []
    const resolvedToday = t.filter((tk) => tk.status === 'resolved' && tk.updated_at.startsWith(today())).length
    const unassigned = t.filter((tk) => !tk.assigned_to).length
    return {
      open: t.filter((tk) => tk.status === 'open').length,
      inProgress: t.filter((tk) => tk.status === 'in_progress').length,
      resolvedToday,
      unassigned,
    }
  }, [tickets])

  // ── Filtered ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!tickets) return []
    return tickets.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      const matchAssigned =
        assignedFilter === 'all' ||
        (assignedFilter === 'unassigned' && !t.assigned_to) ||
        t.assigned_to === assignedFilter
      return matchStatus && matchPriority && matchCategory && matchAssigned
    })
  }, [tickets, statusFilter, priorityFilter, categoryFilter, assignedFilter])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<Ticket, 'status' | 'assigned_to'>> }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Failed to update ticket'),
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Pick<Ticket, 'status' | 'assigned_to'>> }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(`${selectedIds.size} tickets updated`)
      setSelectedIds(new Set())
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    },
    onError: () => toast.error('Bulk update failed'),
  })

  function getUserName(id: string | null) {
    if (!id || !profilesMap) return '—'
    const p = profilesMap[id]
    return p ? (p.display_name ?? p.email) : id.slice(0, 8) + '…'
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)))
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1400px', margin: '0 auto' }}>

      {selectedTicket && profile && profilesMap && (
        <TicketDetailPanel
          ticket={selectedTicket}
          managers={managers ?? []}
          profilesMap={profilesMap}
          currentUserId={profile.id}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p className="label-eyebrow">Admin Panel</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '8px 0 4px' }}>
          Support Tickets
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage and respond to user support requests</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Open', value: stats.open, color: 'var(--color-positive)' },
          { label: 'In Progress', value: stats.inProgress, color: '#818CF8' },
          { label: 'Resolved Today', value: stats.resolvedToday, color: 'var(--color-text-secondary)' },
          { label: 'Unassigned', value: stats.unassigned, color: 'var(--color-negative)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ color, fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
        {[
          {
            value: statusFilter, onChange: (v: string) => setStatusFilter(v as StatusFilter),
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ],
          },
          {
            value: priorityFilter, onChange: (v: string) => setPriorityFilter(v as PriorityFilter),
            options: [
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
          {
            value: categoryFilter, onChange: (v: string) => setCategoryFilter(v as CategoryFilter),
            options: [
              { value: 'all', label: 'All Categories' },
              { value: 'technical', label: 'Technical' },
              { value: 'billing', label: 'Billing' },
              { value: 'trading', label: 'Trading' },
              { value: 'account', label: 'Account' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            value: assignedFilter, onChange: (v: string) => setAssignedFilter(v),
            options: [
              { value: 'all', label: 'All Assigned' },
              { value: 'unassigned', label: 'Unassigned' },
              ...(managers ?? []).map((m) => ({ value: m.id, label: m.display_name ?? m.email })),
            ],
          },
        ].map(({ value, onChange, options }, i) => (
          <select
            key={i}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px', padding: '10px 14px',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}
          >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', gap: '10px', alignItems: 'center',
          background: 'rgba(54,128,255,0.08)',
          border: '1px solid rgba(54,128,255,0.2)',
          borderRadius: '10px', padding: '12px 16px',
          marginBottom: 'var(--space-3)', flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--color-accent-gold)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {selectedIds.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as Ticket['status'])}
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '6px', padding: '6px 10px', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => bulkUpdateMutation.mutate({ ids: [...selectedIds], updates: { status: bulkStatus } })}
            disabled={bulkUpdateMutation.isPending}
            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
          >
            Set Status
          </button>
          <select
            value={bulkManager}
            onChange={(e) => setBulkManager(e.target.value)}
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '6px', padding: '6px 10px', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}
          >
            <option value="">Assign to…</option>
            {(managers ?? []).map((m) => <option key={m.id} value={m.id}>{m.display_name ?? m.email}</option>)}
          </select>
          <button
            onClick={() => bulkManager && bulkUpdateMutation.mutate({ ids: [...selectedIds], updates: { assigned_to: bulkManager } })}
            disabled={!bulkManager || bulkUpdateMutation.isPending}
            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'rgba(129,140,248,0.2)', color: '#818CF8', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer', opacity: !bulkManager ? 0.5 : 1 }}
          >
            Assign
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: 'var(--color-accent-gold)' }}
                  />
                </th>
                <th>Subject</th>
                <th>User</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loadingTickets ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div style={{ height: '16px', borderRadius: '4px', background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
                    No tickets match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-accent-gold)' }}
                      />
                    </td>
                    <td onClick={() => setSelectedTicket(t)} style={{ color: 'var(--color-text-primary)', fontWeight: 500, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject}
                    </td>
                    <td onClick={() => setSelectedTicket(t)} style={{ color: 'var(--color-text-secondary)' }}>
                      {getUserName(t.user_id)}
                    </td>
                    <td onClick={() => setSelectedTicket(t)}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>{t.category}</span>
                    </td>
                    <td onClick={() => setSelectedTicket(t)}>{priorityBadge(t.priority)}</td>
                    <td onClick={() => setSelectedTicket(t)}>{statusBadge(t.status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        defaultValue={t.assigned_to ?? ''}
                        onChange={(e) => updateTicketMutation.mutate({ id: t.id, updates: { assigned_to: e.target.value || null } })}
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: '6px', padding: '4px 8px',
                          color: 'var(--color-text-primary)', fontSize: 'var(--text-xs)', cursor: 'pointer',
                        }}
                      >
                        <option value="">Unassigned</option>
                        {(managers ?? []).map((m) => <option key={m.id} value={m.id}>{m.display_name ?? m.email}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      {new Date(t.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '12px' }}>
        Showing {filtered.length} of {tickets?.length ?? 0} tickets
      </p>
    </div>
  )
}
