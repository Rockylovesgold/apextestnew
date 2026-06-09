'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Ticket, TicketMessage } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

type TicketStatus = Ticket['status']
type TicketFilter = 'all' | TicketStatus

interface TicketWithProfile extends Ticket {
  profiles: { display_name: string | null; email: string } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const STATUS_COLORS: Record<TicketStatus, { bg: string; text: string; border: string }> = {
  open: { bg: 'rgba(54, 128, 255, 0.12)', text: '#3680FF', border: 'rgba(54, 128, 255, 0.3)' },
  in_progress: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  resolved: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  closed: { bg: 'rgba(107, 100, 96, 0.12)', text: '#6B6460', border: 'rgba(107, 100, 96, 0.3)' },
}

const PRIORITY_COLORS: Record<Ticket['priority'], { bg: string; text: string; border: string }> = {
  low: { bg: 'rgba(107, 100, 96, 0.12)', text: '#A8A29E', border: 'rgba(107, 100, 96, 0.3)' },
  medium: { bg: 'rgba(54, 128, 255, 0.12)', text: '#3680FF', border: 'rgba(54, 128, 255, 0.3)' },
  high: { bg: 'rgba(249, 115, 22, 0.12)', text: '#FB923C', border: 'rgba(249, 115, 22, 0.3)' },
  urgent: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
}

function Badge({
  label,
  colors,
}: {
  label: string
  colors: { bg: string; text: string; border: string }
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 999,
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Ticket Detail Panel ──────────────────────────────────────────────────────

function TicketDetail({
  ticket,
  onClose,
  onStatusChange,
}: {
  ticket: TicketWithProfile
  onClose: () => void
  onStatusChange: (id: string, status: TicketStatus) => void
}) {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const { data: messages, isLoading: messagesLoading } = useQuery<TicketMessage[]>({
    queryKey: ['ticket-messages', ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const handleSendReply = async () => {
    if (!reply.trim() || !user) return
    setSendingReply(true)
    try {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        user_id: user.id,
        message: reply.trim(),
        is_staff: true,
      })
      if (error) throw error
      setReply('')
      await queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] })
      toast.success('Reply sent')
    } catch (err) {
      toast.error('Failed to send reply')
      console.error(err)
    } finally {
      setSendingReply(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)
      if (error) throw error
      onStatusChange(ticket.id, newStatus)
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`)
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
              #{ticket.id.slice(0, 8).toUpperCase()} &middot; {ticket.category.replace('_', ' ')}
            </p>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {ticket.subject}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Badge label={STATUS_LABELS[ticket.status]} colors={STATUS_COLORS[ticket.status]} />
              <Badge label={ticket.priority} colors={PRIORITY_COLORS[ticket.priority]} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--text-xl)',
              lineHeight: 1,
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)' }}
          >
            &times;
          </button>
        </div>

        {/* User info + status control */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Submitted by</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {ticket.profiles?.display_name ?? 'Unknown User'}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {ticket.profiles?.email ?? ''}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Update Status</p>
            <select
              value={ticket.status}
              onChange={e => handleStatusChange(e.target.value as TicketStatus)}
              disabled={updatingStatus}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '0.375rem',
                padding: '0.375rem 0.625rem',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {(Object.keys(STATUS_LABELS) as TicketStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messagesLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>Loading messages...</p>
          ) : !messages || messages.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>No messages yet.</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.is_staff ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: msg.is_staff ? '0.75rem 0.75rem 0 0.75rem' : '0.75rem 0.75rem 0.75rem 0',
                    background: msg.is_staff
                      ? 'rgba(54, 128, 255, 0.15)'
                      : 'var(--color-bg-elevated)',
                    border: msg.is_staff
                      ? '1px solid rgba(54, 128, 255, 0.25)'
                      : '1px solid var(--color-border-subtle)',
                  }}
                >
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.message}
                  </p>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {msg.is_staff ? 'Staff' : 'User'} &middot; {formatDate(msg.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Reply box */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            style={{
              flex: 1,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '0.5rem',
              padding: '0.625rem 0.875rem',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent-gold)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border-default)' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSendReply()
              }
            }}
          />
          <button
            className="btn-primary"
            onClick={handleSendReply}
            disabled={sendingReply || !reply.trim()}
            style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
          >
            {sendingReply ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_TABS: { id: TicketFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
]

export default function ManagerTicketsPage() {
  const { user, profile, loading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<TicketFilter>('all')
  const [selectedTicket, setSelectedTicket] = useState<TicketWithProfile | null>(null)
  const [localStatuses, setLocalStatuses] = useState<Record<string, TicketStatus>>({})

  const { data: tickets, isLoading } = useQuery<TicketWithProfile[]>({
    queryKey: ['manager-tickets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, profiles!user_id(display_name, email)')
        .eq('assigned_to', user!.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as TicketWithProfile[]
    },
    enabled: !!user,
  })

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setLocalStatuses(prev => ({ ...prev, [ticketId]: newStatus }))
    queryClient.invalidateQueries({ queryKey: ['manager-tickets', user?.id] })
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const filtered = tickets?.filter(t => {
    const status = localStatuses[t.id] ?? t.status
    if (filter === 'all') return true
    return status === filter
  }) ?? []

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
          Support Tickets
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Tickets assigned to you. Click a row to view details and reply.
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.125rem',
          background: 'var(--color-bg-elevated)',
          borderRadius: '0.5rem',
          padding: '0.25rem',
          marginBottom: '1.5rem',
          width: 'fit-content',
          flexWrap: 'wrap',
        }}
      >
        {FILTER_TABS.map(tab => {
          const count = tab.id === 'all'
            ? (tickets?.length ?? 0)
            : (tickets?.filter(t => (localStatuses[t.id] ?? t.status) === tab.id).length ?? 0)
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                transition: 'all 0.15s',
                background: filter === tab.id ? 'var(--color-bg-overlay, #1a1c21)' : 'transparent',
                color: filter === tab.id ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  style={{
                    background: filter === tab.id ? 'rgba(54, 128, 255, 0.2)' : 'rgba(255,255,255,0.06)',
                    color: filter === tab.id ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                    borderRadius: 999,
                    padding: '0 0.375rem',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    lineHeight: '1.4',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tickets table */}
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
            Loading tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {filter === 'all' ? 'No tickets assigned to you.' : `No ${STATUS_LABELS[filter as TicketStatus]} tickets.`}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  {['Subject', 'User', 'Category', 'Priority', 'Status', 'Created', 'Updated'].map(col => (
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
                {filtered.map((ticket, idx) => {
                  const currentStatus = (localStatuses[ticket.id] ?? ticket.status) as TicketStatus
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-bg-elevated)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '0.875rem 1rem', maxWidth: 220 }}>
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {ticket.subject}
                        </p>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
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
                            {(ticket.profiles?.display_name || ticket.profiles?.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {ticket.profiles?.display_name ?? 'Unknown'}
                            </p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                              {ticket.profiles?.email ?? ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {ticket.category.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <Badge
                          label={ticket.priority}
                          colors={PRIORITY_COLORS[ticket.priority]}
                        />
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <Badge
                          label={STATUS_LABELS[currentStatus]}
                          colors={STATUS_COLORS[currentStatus]}
                        />
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatShortDate(ticket.created_at)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatShortDate(ticket.updated_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket detail panel */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
