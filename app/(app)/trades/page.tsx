'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Trade } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type TradeFormData = {
  instrument: string
  direction: 'buy' | 'sell'
  entry_price: string
  stop_loss: string
  take_profit: string
  lot_size: string
  status: 'open' | 'closed' | 'cancelled'
  exit_price: string
  profit_loss: string
  pips: string
  session: '' | 'london' | 'new_york' | 'asian' | 'overlap'
  strategy: string
  opened_at: string
  notes: string
  pnl_manual_override: boolean
}

type SortField = 'opened_at' | 'profit_loss' | 'pips'
type SortDir = 'asc' | 'desc'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM: TradeFormData = {
  instrument: 'XAU/USD',
  direction: 'buy',
  entry_price: '',
  stop_loss: '',
  take_profit: '',
  lot_size: '0.01',
  status: 'open',
  exit_price: '',
  profit_loss: '',
  pips: '',
  session: '',
  strategy: '',
  opened_at: new Date().toISOString().slice(0, 16),
  notes: '',
  pnl_manual_override: false,
}

function calcPips(direction: 'buy' | 'sell', entry: number, exit: number, instrument: string): number {
  const diff = direction === 'buy' ? exit - entry : entry - exit
  // XAU/USD uses 0.1 pip value (price move of 0.1 = 1 pip)
  const multiplier = instrument.includes('JPY') ? 100 : instrument.includes('XAU') ? 10 : 10000
  return Math.round(diff * multiplier * 10) / 10
}

function calcPnL(pips: number, lotSize: number, instrument: string): number {
  // For XAU/USD: 1 pip = $1 per 0.01 lot (approx $100/lot for 1 pip)
  const pipValue = instrument.includes('JPY') ? 9.1 : instrument.includes('XAU') ? 100 : 10
  return Math.round(pips * pipValue * lotSize * 100) / 100
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(n: number | null) {
  if (n === null) return '—'
  const abs = Math.abs(n).toFixed(2)
  return (n >= 0 ? '+$' : '-$') + abs
}

function downloadCSV(trades: Trade[]) {
  const headers = ['Date', 'Instrument', 'Direction', 'Entry', 'Exit', 'Stop Loss', 'Take Profit', 'Lot Size', 'Pips', 'P&L', 'Status', 'Session', 'Strategy', 'Notes']
  const rows = trades.map(t => [
    formatDate(t.opened_at),
    t.instrument,
    t.direction,
    t.entry_price,
    t.exit_price ?? '',
    t.stop_loss ?? '',
    t.take_profit ?? '',
    t.lot_size,
    t.pips ?? '',
    t.profit_loss ?? '',
    t.status,
    t.session ?? '',
    t.strategy ?? '',
    (t.notes ?? '').replace(/,/g, ';'),
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 160 }}>
      <p className="label-eyebrow" style={{ marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: 'var(--tracking-tight)' }}>{value}</p>
      {sub && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="card" style={{ flex: 1, minWidth: 160 }}>
      <div style={{ height: 10, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 28, width: '80%', borderRadius: 6, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

// ─── Form Component ───────────────────────────────────────────────────────────

function TradeForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial: TradeFormData
  onSubmit: (data: TradeFormData) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [form, setForm] = useState<TradeFormData>(initial)
  const [mobileStep, setMobileStep] = useState<1 | 2>(1)

  const set = useCallback((key: keyof TradeFormData, val: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }

      // Auto-calculate pips and P&L when entry/exit/lot change
      if (!next.pnl_manual_override && next.entry_price && next.exit_price && next.status === 'closed') {
        const entry = parseFloat(next.entry_price)
        const exit = parseFloat(next.exit_price)
        const lot = parseFloat(next.lot_size) || 0.01
        if (!isNaN(entry) && !isNaN(exit)) {
          const pips = calcPips(next.direction, entry, exit, next.instrument)
          const pnl = calcPnL(pips, lot, next.instrument)
          next.pips = String(pips)
          next.profit_loss = String(pnl)
        }
      }

      return next
    })
  }, [])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wide)',
    marginBottom: 6,
  }

  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0 }

  const ColOne = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Instrument */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Instrument</label>
        <input style={inputStyle} value={form.instrument} onChange={e => set('instrument', e.target.value)} placeholder="XAU/USD" />
      </div>

      {/* Direction */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Direction</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['buy', 'sell'] as const).map(dir => (
            <button
              key={dir}
              type="button"
              onClick={() => set('direction', dir)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: form.direction === dir
                  ? dir === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)'
                  : 'var(--color-border-default)',
                background: form.direction === dir
                  ? dir === 'buy' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'
                  : 'var(--color-bg-elevated)',
                color: form.direction === dir
                  ? dir === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)'
                  : 'var(--color-text-secondary)',
                fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {dir === 'buy' ? '▲ Buy' : '▼ Sell'}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Price */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Entry Price</label>
        <input style={inputStyle} type="number" step="any" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} placeholder="2650.00" />
      </div>

      {/* Stop Loss */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Stop Loss <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
        <input style={inputStyle} type="number" step="any" value={form.stop_loss} onChange={e => set('stop_loss', e.target.value)} placeholder="2640.00" />
      </div>

      {/* Take Profit */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Take Profit <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
        <input style={inputStyle} type="number" step="any" value={form.take_profit} onChange={e => set('take_profit', e.target.value)} placeholder="2670.00" />
      </div>

      {/* Lot Size */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Lot Size</label>
        <input style={inputStyle} type="number" step="0.01" min="0.01" value={form.lot_size} onChange={e => set('lot_size', e.target.value)} placeholder="0.01" />
      </div>
    </div>
  )

  const ColTwo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Status</label>
        <select style={{ ...inputStyle, appearance: 'none' }} value={form.status} onChange={e => set('status', e.target.value as 'open' | 'closed')}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Exit Price (only when closed) */}
      {form.status === 'closed' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Exit Price</label>
          <input style={inputStyle} type="number" step="any" value={form.exit_price} onChange={e => set('exit_price', e.target.value)} placeholder="2670.00" />
        </div>
      )}

      {/* P&L */}
      <div style={fieldStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>P&amp;L ($)</label>
          <button
            type="button"
            onClick={() => set('pnl_manual_override', !form.pnl_manual_override)}
            style={{ fontSize: 10, color: form.pnl_manual_override ? 'var(--color-accent-gold)' : 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {form.pnl_manual_override ? 'Auto' : 'Manual'}
          </button>
        </div>
        <input
          style={{ ...inputStyle, color: form.profit_loss ? (parseFloat(form.profit_loss) >= 0 ? 'var(--color-positive)' : 'var(--color-negative)') : 'var(--color-text-primary)' }}
          type="number"
          step="any"
          value={form.profit_loss}
          readOnly={!form.pnl_manual_override && form.status === 'closed'}
          onChange={e => { if (form.pnl_manual_override) set('profit_loss', e.target.value) }}
          placeholder="Auto-calculated"
        />
      </div>

      {/* Pips */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Pips</label>
        <input
          style={inputStyle}
          type="number"
          step="0.1"
          value={form.pips}
          readOnly={!form.pnl_manual_override && form.status === 'closed'}
          onChange={e => { if (form.pnl_manual_override) set('pips', e.target.value) }}
          placeholder="Auto-calculated"
        />
      </div>

      {/* Session */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Session</label>
        <select style={{ ...inputStyle, appearance: 'none' }} value={form.session} onChange={e => set('session', e.target.value)}>
          <option value="">— Select —</option>
          <option value="london">London</option>
          <option value="new_york">New York</option>
          <option value="asian">Asian</option>
          <option value="overlap">Overlap</option>
        </select>
      </div>

      {/* Strategy */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Strategy</label>
        <input style={inputStyle} value={form.strategy} onChange={e => set('strategy', e.target.value)} placeholder="Breakout, Reversal…" />
      </div>

      {/* Opened At */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Opened At</label>
        <input style={{ ...inputStyle, colorScheme: 'dark' }} type="datetime-local" value={form.opened_at} onChange={e => set('opened_at', e.target.value)} />
      </div>

      {/* Notes */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Trade rationale, observations…"
        />
      </div>
    </div>
  )

  return (
    <div
      className="card"
      style={{ marginBottom: 24, border: '1px solid var(--color-border-default)' }}
    >
      {/* Mobile step indicator */}
      <div className="lg:hidden" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([1, 2] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setMobileStep(s)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: mobileStep === s ? 'var(--color-accent-gold)' : 'var(--color-border-default)',
              background: mobileStep === s ? 'rgba(54,128,255,0.1)' : 'var(--color-bg-elevated)',
              color: mobileStep === s ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            {s === 1 ? 'Step 1: Setup' : 'Step 2: Details'}
          </button>
        ))}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); onSubmit(form) }}
        noValidate
      >
        {/* Desktop: 2-col grid | Mobile: step-based */}
        <div className="hidden lg:grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {ColOne}
          {ColTwo}
        </div>

        <div className="lg:hidden">
          {mobileStep === 1 ? ColOne : ColTwo}
        </div>

        {/* Mobile: next/prev */}
        <div className="lg:hidden" style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {mobileStep === 2 && (
            <button type="button" onClick={() => setMobileStep(1)} style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          {mobileStep === 1 && (
            <button type="button" onClick={() => setMobileStep(2)} style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-pill)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Next →
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '10px 24px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-base btn-primary btn-md"
            style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Saving…' : 'Save Trade'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ trade, onConfirm, onCancel, isLoading }: { trade: Trade; onConfirm: () => void; onCancel: () => void; isLoading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 8, fontSize: 'var(--text-lg)' }}>Delete Trade?</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 24, maxWidth: 'none' }}>
          This will permanently delete the <strong style={{ color: 'var(--color-text-primary)' }}>{trade.instrument}</strong> {trade.direction} trade from {formatDate(trade.opened_at)}.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border-default)', background: 'transparent', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--color-negative)', color: '#fff', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ trade, onSave, onClose, isLoading }: { trade: Trade; onSave: (data: TradeFormData) => void; onClose: () => void; isLoading: boolean }) {
  const initial: TradeFormData = {
    instrument: trade.instrument,
    direction: trade.direction,
    entry_price: String(trade.entry_price),
    stop_loss: trade.stop_loss !== null ? String(trade.stop_loss) : '',
    take_profit: trade.take_profit !== null ? String(trade.take_profit) : '',
    lot_size: String(trade.lot_size),
    status: trade.status === 'cancelled' ? 'cancelled' : trade.status,
    exit_price: trade.exit_price !== null ? String(trade.exit_price) : '',
    profit_loss: trade.profit_loss !== null ? String(trade.profit_loss) : '',
    pips: trade.pips !== null ? String(trade.pips) : '',
    session: (trade.session ?? '') as TradeFormData['session'],
    strategy: trade.strategy ?? '',
    opened_at: trade.opened_at.slice(0, 16),
    notes: trade.notes ?? '',
    pnl_manual_override: false,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', maxWidth: 800, width: '100%', padding: 32, marginTop: 40, marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>Edit Trade</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>✕</button>
        </div>
        <TradeForm initial={initial} onSubmit={onSave} onCancel={onClose} isLoading={isLoading} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TradesPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
  const [deleteTrade, setDeleteTrade] = useState<Trade | null>(null)

  // Filters + sort
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'cancelled'>('all')
  const [filterDirection, setFilterDirection] = useState<'all' | 'buy' | 'sell'>('all')
  const [filterSession, setFilterSession] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('opened_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('opened_at', { ascending: false })
      if (error) throw error
      return data as Trade[]
    },
    enabled: !!user,
  })

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = trades.length
    const closed = trades.filter(t => t.status === 'closed')
    const totalPnL = closed.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0)
    const wins = closed.filter(t => (t.profit_loss ?? 0) > 0).length
    const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0
    return { total, totalPnL, winRate, closedCount: closed.length }
  }, [trades])

  // ── Filtered + sorted trades ───────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...trades]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.instrument.toLowerCase().includes(q) ||
        (t.strategy ?? '').toLowerCase().includes(q) ||
        (t.notes ?? '').toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus)
    if (filterDirection !== 'all') list = list.filter(t => t.direction === filterDirection)
    if (filterSession !== 'all') list = list.filter(t => t.session === filterSession)

    list.sort((a, b) => {
      let aVal: number, bVal: number
      if (sortField === 'opened_at') {
        aVal = new Date(a.opened_at).getTime()
        bVal = new Date(b.opened_at).getTime()
      } else if (sortField === 'profit_loss') {
        aVal = a.profit_loss ?? 0
        bVal = b.profit_loss ?? 0
      } else {
        aVal = a.pips ?? 0
        bVal = b.pips ?? 0
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })

    return list
  }, [trades, search, filterStatus, filterDirection, filterSession, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Mutations ──────────────────────────────────────────────────────────────

  const formDataToInsert = (data: TradeFormData, userId: string) => ({
    user_id: userId,
    instrument: data.instrument || 'XAU/USD',
    direction: data.direction,
    entry_price: parseFloat(data.entry_price) || 0,
    exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
    stop_loss: data.stop_loss ? parseFloat(data.stop_loss) : null,
    take_profit: data.take_profit ? parseFloat(data.take_profit) : null,
    lot_size: parseFloat(data.lot_size) || 0.01,
    pips: data.pips ? parseFloat(data.pips) : null,
    profit_loss: data.profit_loss ? parseFloat(data.profit_loss) : null,
    status: data.status,
    session: data.session || null,
    strategy: data.strategy || null,
    notes: data.notes || null,
    opened_at: data.opened_at ? new Date(data.opened_at).toISOString() : new Date().toISOString(),
  })

  const createMutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('trades').insert(formDataToInsert(data, user.id))
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.id] })
      toast.success('Trade logged successfully')
      setShowForm(false)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save trade'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TradeFormData }) => {
      if (!user) throw new Error('Not authenticated')
      const payload = formDataToInsert(data, user.id)
      const { error } = await supabase.from('trades').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.id] })
      toast.success('Trade updated')
      setEditTrade(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update trade'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('trades').delete().eq('id', id).eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.id] })
      toast.success('Trade deleted')
      setDeleteTrade(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete trade'),
  })

  // ── Sort toggle ────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>
    return <span style={{ color: 'var(--color-accent-gold)' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectStyle: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="label-eyebrow" style={{ marginBottom: 4 }}>Performance</p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, var(--text-3xl))', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Trade Tracker</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => downloadCSV(trades)}
            disabled={trades.length === 0}
            style={{ ...selectStyle, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, opacity: trades.length === 0 ? 0.4 : 1 }}
          >
            ↓ Export CSV
          </button>
          <button
            onClick={() => { setShowForm(s => !s); setEditTrade(null) }}
            className="btn-base btn-primary btn-md"
          >
            {showForm ? '✕ Cancel' : '+ Log Trade'}
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {tradesLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Trades" value={String(stats.total)} sub={`${stats.closedCount} closed`} />
            <StatCard
              label="Total P&L"
              value={formatCurrency(stats.totalPnL)}
              sub="Closed trades"
            />
            <StatCard
              label="Win Rate"
              value={stats.closedCount > 0 ? `${stats.winRate.toFixed(1)}%` : '—'}
              sub={stats.closedCount > 0 ? `${Math.round(stats.winRate / 100 * stats.closedCount)}/${stats.closedCount} wins` : 'No closed trades'}
            />
          </>
        )}
      </div>

      {/* ── Inline Form (new trade) ── */}
      {showForm && (
        <TradeForm
          initial={EMPTY_FORM}
          onSubmit={data => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search instrument, strategy, notes…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ ...selectStyle, flex: '1 1 220px', minWidth: 180 }}
        />
        <select style={selectStyle} value={filterStatus} onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select style={selectStyle} value={filterDirection} onChange={e => { setFilterDirection(e.target.value as typeof filterDirection); setPage(1) }}>
          <option value="all">All Directions</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <select style={selectStyle} value={filterSession} onChange={e => { setFilterSession(e.target.value); setPage(1) }}>
          <option value="all">All Sessions</option>
          <option value="london">London</option>
          <option value="new_york">New York</option>
          <option value="asian">Asian</option>
          <option value="overlap">Overlap</option>
        </select>
        <select style={selectStyle} value={`${sortField}:${sortDir}`} onChange={e => { const [f, d] = e.target.value.split(':'); setSortField(f as SortField); setSortDir(d as SortDir) }}>
          <option value="opened_at:desc">Date (newest)</option>
          <option value="opened_at:asc">Date (oldest)</option>
          <option value="profit_loss:desc">P&L (highest)</option>
          <option value="profit_loss:asc">P&L (lowest)</option>
          <option value="pips:desc">Pips (highest)</option>
          <option value="pips:asc">Pips (lowest)</option>
        </select>
      </div>

      {/* ── Table ── */}
      {tradesLoading ? (
        <div className="data-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Instrument', 'Direction', 'Entry', 'Exit', 'Pips', 'P&L', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>📊</div>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 8, fontSize: 'var(--text-xl)' }}>
            {search || filterStatus !== 'all' || filterDirection !== 'all' || filterSession !== 'all'
              ? 'No trades match your filters'
              : 'No trades yet'}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            {search || filterStatus !== 'all' || filterDirection !== 'all' || filterSession !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Start tracking your performance by logging your first trade.'}
          </p>
          {trades.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-base btn-primary btn-md"
            >
              + Log your first trade
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="data-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('opened_at')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Date <SortIcon field="opened_at" /></th>
                  <th>Instrument</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th onClick={() => handleSort('pips')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Pips <SortIcon field="pips" /></th>
                  <th onClick={() => handleSort('profit_loss')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>P&amp;L <SortIcon field="profit_loss" /></th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(trade => {
                  const isProfit = (trade.profit_loss ?? 0) > 0
                  const isLoss = (trade.profit_loss ?? 0) < 0

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => setEditTrade(trade)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-xs)' }}>{formatDate(trade.opened_at)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{trade.instrument}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                          background: trade.direction === 'buy' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: trade.direction === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
                          border: `1px solid ${trade.direction === 'buy' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        }}>
                          {trade.direction === 'buy' ? '▲ Buy' : '▼ Sell'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{trade.entry_price.toFixed(2)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: trade.exit_price ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {trade.exit_price ? trade.exit_price.toFixed(2) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: trade.pips !== null ? (trade.pips >= 0 ? 'var(--color-positive)' : 'var(--color-negative)') : 'var(--color-text-muted)' }}>
                        {trade.pips !== null ? (trade.pips >= 0 ? `+${trade.pips}` : String(trade.pips)) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isProfit ? 'var(--color-positive)' : isLoss ? 'var(--color-negative)' : 'var(--color-text-muted)' }}>
                        {formatCurrency(trade.profit_loss)}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: trade.status === 'open' ? 'rgba(54,128,255,0.12)' : trade.status === 'closed' ? 'rgba(100,116,139,0.15)' : 'rgba(107,100,96,0.12)',
                          color: trade.status === 'open' ? 'var(--color-accent-gold)' : trade.status === 'closed' ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                          border: `1px solid ${trade.status === 'open' ? 'rgba(54,128,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                          {trade.status}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => setEditTrade(trade)}
                            title="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 15, padding: '4px 6px', borderRadius: 6, transition: 'color var(--transition-fast)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-gold)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeleteTrade(trade)}
                            title="Delete"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 15, padding: '4px 6px', borderRadius: 6, transition: 'color var(--transition-fast)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-negative)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} trades
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 'var(--text-sm)' }}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid', borderColor: page === p ? 'var(--color-accent-gold)' : 'var(--color-border-default)', background: page === p ? 'rgba(54,128,255,0.12)' : 'var(--color-bg-elevated)', color: page === p ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: page === p ? 700 : 400 }}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: 'var(--text-sm)' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Edit Modal ── */}
      {editTrade && (
        <EditModal
          trade={editTrade}
          onSave={data => updateMutation.mutate({ id: editTrade.id, data })}
          onClose={() => setEditTrade(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* ── Delete Modal ── */}
      {deleteTrade && (
        <DeleteModal
          trade={deleteTrade}
          onConfirm={() => deleteMutation.mutate(deleteTrade.id)}
          onCancel={() => setDeleteTrade(null)}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Pulse animation for skeletons */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
