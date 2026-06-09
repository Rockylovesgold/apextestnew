'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Ticket, TicketMessage } from '@/lib/database.types'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Plus,
  X,
  Send,
  Inbox,
  MessageSquare,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<Ticket['status'], { label: string; style: React.CSSProperties }> = {
  open: {
    label: 'Open',
    style: { background: 'rgba(96, 165, 250, 0.12)', color: '#93C5FD', border: '1px solid rgba(96, 165, 250, 0.22)' },
  },
  in_progress: {
    label: 'In Progress',
    style: { background: 'rgba(251, 191, 36, 0.10)', color: '#FCD34D', border: '1px solid rgba(251, 191, 36, 0.22)' },
  },
  resolved: {
    label: 'Resolved',
    style: { background: 'rgba(34, 197, 94, 0.10)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.22)' },
  },
  closed: {
    label: 'Closed',
    style: { background: 'rgba(107, 100, 96, 0.15)', color: 'var(--color-text-muted)', border: '1px solid rgba(107, 100, 96, 0.20)' },
  },
}

const PRIORITY_META: Record<Ticket['priority'], { label: string; style: React.CSSProperties }> = {
  urgent: {
    label: 'Urgent',
    style: { background: 'rgba(239, 68, 68, 0.10)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.22)' },
  },
  high: {
    label: 'High',
    style: { background: 'rgba(249, 115, 22, 0.10)', color: '#FB923C', border: '1px solid rgba(249, 115, 22, 0.22)' },
  },
  medium: {
    label: 'Medium',
    style: { background: 'rgba(251, 191, 36, 0.10)', color: '#FCD34D', border: '1px solid rgba(251, 191, 36, 0.20)' },
  },
  low: {
    label: 'Low',
    style: { background: 'rgba(107, 100, 96, 0.15)', color: 'var(--color-text-muted)', border: '1px solid rgba(107, 100, 96, 0.20)' },
  },
}

const CATEGORY_LABELS: Record<Ticket['category'], string> = {
  technical: 'Technical',
  billing: 'Billing',
  trading: 'Trading',
  account: 'Account',
  other: 'Other',
}

function Badge({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {label}
    </span>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Create ticket form / modal ───────────────────────────────────────────────

interface CreateTicketFormProps {
  userId: string
  onClose: () => void
  onCreated: (ticket: Ticket) => void
}

function CreateTicketForm({ userId, onClose, onCreated }: CreateTicketFormProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<Ticket['category']>('technical')
  const [priority, setPriority] = useState<Ticket['priority']>('medium')
  const [message, setMessage] = useState('')

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create ticket
      const { data: ticket, error: ticketErr } = await supabase
        .from('tickets')
        .insert({
          user_id: userId,
          subject: subject.trim(),
          category,
          priority,
          status: 'open',
        })
        .select()
        .single()
      if (ticketErr) throw ticketErr

      // 2. Create initial message
      const { error: msgErr } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        user_id: userId,
        message: message.trim(),
        is_staff: false,
      })
      if (msgErr) throw msgErr

      return ticket as Ticket
    },
    onSuccess: (ticket) => {
      toast.success('Support ticket created!')
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      onCreated(ticket)
    },
    onError: () => {
      toast.error('Failed to create ticket. Please try again.')
    },
  })

  const canSubmit =
    subject.trim().length > 0 &&
    message.trim().length >= 20 &&
    !createMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    createMutation.mutate()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 540,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          zIndex: 51,
          boxShadow: 'var(--shadow-elevated)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            New Support Ticket
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Subject */}
          <div>
            <label className="form-label">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="form-input"
              maxLength={120}
              required
            />
          </div>

          {/* Category + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Ticket['category'])}
                className="form-select"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="trading">Trading</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="form-label">
              Initial Message *{' '}
              <span
                style={{
                  color: message.trim().length < 20 ? 'var(--color-negative)' : 'var(--color-positive)',
                  fontSize: 11,
                }}
              >
                ({message.trim().length}/20 min)
              </span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
              className="form-textarea"
              rows={5}
              required
              minLength={20}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={!canSubmit}
            style={{ marginTop: 4, opacity: !canSubmit ? 0.5 : 1 }}
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </>
  )
}

// ─── Ticket list ──────────────────────────────────────────────────────────────

interface TicketListProps {
  tickets: Ticket[]
  onSelect: (id: string) => void
  onNew: () => void
}

function TicketList({ tickets, onSelect, onNew }: TicketListProps) {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span className="label-eyebrow">Support</span>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginTop: 4,
            }}
          >
            My Tickets
          </h1>
        </div>
        <button onClick={onNew} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Empty state */}
      {tickets.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12) var(--space-4)',
            gap: 'var(--space-3)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inbox size={32} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No tickets yet
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: 320 }}>
            Need help? Submit a support request and our team will get back to you.
          </p>
          <button onClick={onNew} className="btn-primary" style={{ marginTop: 4 }}>
            Submit a support request
          </button>
        </div>
      ) : (
        <div className="data-table" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Subject', 'Category', 'Priority', 'Status', 'Created'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      textAlign: 'left',
                      background: 'var(--color-bg-elevated)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, i) => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelect(ticket.id)}
                  style={{
                    cursor: 'pointer',
                    background: i % 2 === 0 ? 'var(--color-bg-surface)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background =
                      'var(--color-bg-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? 'var(--color-bg-surface)' : 'transparent'
                  }}
                >
                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 500,
                      borderBottom: '1px solid var(--color-border-subtle)',
                      maxWidth: 260,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ticket.subject}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '2px 8px',
                      }}
                    >
                      {CATEGORY_LABELS[ticket.category]}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <Badge {...PRIORITY_META[ticket.priority]} />
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <Badge {...STATUS_META[ticket.status]} />
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Ticket thread ────────────────────────────────────────────────────────────

interface TicketThreadProps {
  ticketId: string
  userId: string
  onBack: () => void
}

function TicketThread({ ticketId, userId, onBack }: TicketThreadProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState('')

  // Fetch ticket
  const { data: ticket } = useQuery<Ticket | null>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      if (error) throw error
      return data
    },
  })

  // Fetch messages
  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: ['ticket_messages', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`ticket_messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ticket_messages', ticketId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, supabase, queryClient])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        user_id: userId,
        message: text.trim(),
        is_staff: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setNewMessage('')
      queryClient.invalidateQueries({ queryKey: ['ticket_messages', ticketId] })
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.')
    },
  })

  const handleSend = () => {
    const text = newMessage.trim()
    if (!text || sendMutation.isPending) return
    sendMutation.mutate(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  if (!ticket) return null

  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Back + ticket header */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          Back to tickets
        </button>

        <div
          className="card"
          style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-snug)',
              }}
            >
              {ticket.subject}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
              <Badge {...STATUS_META[ticket.status]} />
              <Badge {...PRIORITY_META[ticket.priority]} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '2px 8px',
              }}
            >
              {CATEGORY_LABELS[ticket.category]}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Opened {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '8px 0',
          minHeight: 240,
          maxHeight: 480,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-5)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              gap: 8,
            }}
          >
            <MessageSquare size={18} />
            No messages yet.
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.user_id === userId && !msg.is_staff
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {/* Sender label */}
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    paddingLeft: isOwn ? 0 : 4,
                    paddingRight: isOwn ? 4 : 0,
                    textAlign: isOwn ? 'right' : 'left',
                  }}
                >
                  {msg.is_staff ? 'Support Team' : 'You'} · {formatTime(msg.created_at)}
                </span>

                {/* Bubble */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: isOwn
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-normal)',
                    background: isOwn
                      ? 'rgba(54, 128, 255, 0.15)'
                      : 'var(--color-bg-elevated)',
                    border: isOwn
                      ? '1px solid rgba(54, 128, 255, 0.25)'
                      : '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {!isClosed ? (
        <div
          style={{
            marginTop: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Ctrl+Enter to send)"
            className="form-textarea"
            rows={3}
            disabled={sendMutation.isPending}
            style={{ resize: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSend}
              className="btn-primary"
              disabled={!newMessage.trim() || sendMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: !newMessage.trim() || sendMutation.isPending ? 0.5 : 1,
              }}
            >
              <Send size={16} />
              {sendMutation.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 'var(--space-3)',
            padding: '12px 16px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          This ticket is {ticket.status}. Replies are no longer accepted.
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const handleTicketCreated = (ticket: Ticket) => {
    setShowCreateForm(false)
    setSelectedTicketId(ticket.id)
  }

  return (
    <>
      <style>{`
        .form-label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          background: var(--color-bg-base);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          outline: none;
          transition: border-color var(--transition-fast);
          font-family: inherit;
          box-sizing: border-box;
        }
        .form-input::placeholder, .form-textarea::placeholder {
          color: var(--color-text-muted);
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--color-accent-gold);
          box-shadow: 0 0 0 3px rgba(54, 128, 255, 0.08);
        }
        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6460' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          cursor: pointer;
        }
        .form-select option {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .support-skeleton {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          height: 52px;
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ padding: 'var(--space-4)', maxWidth: 960, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="support-skeleton" />
            ))}
          </div>
        ) : selectedTicketId ? (
          <TicketThread
            ticketId={selectedTicketId}
            userId={user?.id ?? ''}
            onBack={() => setSelectedTicketId(null)}
          />
        ) : (
          <TicketList
            tickets={tickets}
            onSelect={setSelectedTicketId}
            onNew={() => setShowCreateForm(true)}
          />
        )}
      </div>

      {/* Create ticket modal */}
      {showCreateForm && user?.id && (
        <CreateTicketForm
          userId={user.id}
          onClose={() => setShowCreateForm(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </>
  )
}
