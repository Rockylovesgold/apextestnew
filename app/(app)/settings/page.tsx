'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'account' | 'referrals' | 'security' | 'data'

interface TradeRow {
  id: string
  instrument: string
  direction: string
  entry_price: number
  exit_price: number | null
  lot_size: number
  pips: number | null
  profit_loss: number | null
  status: string
  opened_at: string
  closed_at: string | null
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{description}</p>
      )}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="label-eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '0.5rem',
        padding: '0.625rem 0.875rem',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        fontSize: 'var(--text-sm)',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--color-accent-gold)' }}
      onBlur={e => { e.target.style.borderColor = 'var(--color-border-default)' }}
    />
  )
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: Profile }) {
  const { user, updateProfile } = useAuth()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const initial = (profile.display_name || profile.email || 'U')[0].toUpperCase()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      toast.success('Avatar uploaded')
    } catch (err: unknown) {
      toast.error('Failed to upload avatar')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ display_name: displayName, avatar_url: avatarUrl || undefined })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Profile" description="Manage your public display information." />

      {/* Avatar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <FieldLabel>Avatar</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border-default)' }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-gold-dim))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: '#070C1C',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <button
              className="btn-secondary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {uploading ? 'Uploading...' : 'Upload photo'}
            </button>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              JPG, PNG or WebP. Max 2MB.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
      </div>

      {/* Display Name */}
      <div style={{ marginBottom: '1.25rem' }}>
        <FieldLabel>Display Name</FieldLabel>
        <TextInput value={displayName} onChange={setDisplayName} placeholder="Your display name" />
      </div>

      {/* Email (read-only) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <FieldLabel>Email Address</FieldLabel>
        <TextInput value={profile.email} disabled />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
          Email cannot be changed here. Contact support if needed.
        </p>
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}

// ─── Account Tab ─────────────────────────────────────────────────────────────

function AccountTab({ profile }: { profile: Profile }) {
  const { updateProfile } = useAuth()
  const [balance, setBalance] = useState(String(profile.account_balance ?? 0))
  const [risk, setRisk] = useState(String(profile.risk_percentage ?? 1))
  const [saving, setSaving] = useState(false)

  const balanceNum = parseFloat(balance) || 0
  const riskNum = parseFloat(risk) || 0
  const riskAmount = ((balanceNum * riskNum) / 100).toFixed(2)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        account_balance: parseFloat(balance) || 0,
        risk_percentage: parseFloat(risk) || 1,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Account Settings" description="Configure your trading account parameters." />

      <div style={{ marginBottom: '1.25rem' }}>
        <FieldLabel>Account Balance (USD)</FieldLabel>
        <TextInput
          type="number"
          value={balance}
          onChange={setBalance}
          placeholder="10000"
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <FieldLabel>Risk Percentage per Trade</FieldLabel>
        <div style={{ position: 'relative' }}>
          <TextInput
            type="number"
            value={risk}
            onChange={setRisk}
            placeholder="1"
          />
          <span
            style={{
              position: 'absolute',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              pointerEvents: 'none',
            }}
          >
            %
          </span>
        </div>
      </div>

      {/* Calculated example */}
      <div
        className="card"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
          Calculated Risk
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
          With{' '}
          <span style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>
            ${balanceNum.toLocaleString()}
          </span>{' '}
          balance at{' '}
          <span style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>
            {riskNum}%
          </span>{' '}
          risk ={' '}
          <span style={{ color: 'var(--color-positive)', fontWeight: 600 }}>
            ${riskAmount}
          </span>{' '}
          risk per trade
        </p>
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Account Settings'}
      </button>
    </div>
  )
}

// ─── Referrals Tab ───────────────────────────────────────────────────────────

function ReferralsTab({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const code = profile.referral_code ?? ''

  const { data: referralCount } = useQuery({
    queryKey: ['referral-count', profile.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', code)
      return count ?? 0
    },
    enabled: !!code,
  })

  const handleCopyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    toast.success('Referral code copied!')
  }

  const handleCopyShareText = () => {
    const text = `Join AIOV Capital with my code: ${code}`
    navigator.clipboard.writeText(text)
    toast.success('Share text copied!')
  }

  return (
    <div>
      <SectionHeader title="Referrals" description="Share your referral code and track sign-ups." />

      {code ? (
        <>
          {/* Code display */}
          <div style={{ marginBottom: '1.5rem' }}>
            <FieldLabel>Your Referral Code</FieldLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 700,
                  color: 'var(--color-accent-gold)',
                  letterSpacing: '0.1em',
                  flex: 1,
                }}
              >
                {code}
              </span>
              <button className="btn-secondary" onClick={handleCopyCode} style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                Copy Code
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div
              className="card"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                {referralCount ?? '—'}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Members referred
              </p>
            </div>
          </div>

          {/* Share text */}
          <div>
            <FieldLabel>Share Message</FieldLabel>
            <div
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
                marginBottom: '0.75rem',
              }}
            >
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                &ldquo;Join AIOV Capital with my code: <span style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>{code}</span>&rdquo;
              </p>
            </div>
            <button className="btn-secondary" onClick={handleCopyShareText} style={{ fontSize: 'var(--text-sm)' }}>
              Copy Share Text
            </button>
          </div>
        </>
      ) : (
        <div
          className="card"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            You do not have a referral code assigned. Contact support to get yours.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { updatePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      const result = await updatePassword(newPassword)
      if (!result?.error) {
        setNewPassword('')
        setConfirmPassword('')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Security" description="Manage your account password and security settings." />

      <div
        className="card"
        style={{
          background: 'rgba(54, 128, 255, 0.06)',
          border: '1px solid rgba(54, 128, 255, 0.18)',
          borderRadius: '0.5rem',
          padding: '0.875rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          For Google or Apple sign-in accounts, password changes are managed through your provider.
        </p>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <FieldLabel>New Password</FieldLabel>
          <TextInput
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <FieldLabel>Confirm New Password</FieldLabel>
          <TextInput
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter new password"
          />
        </div>

        <button className="btn-primary" onClick={handleChangePassword} disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}

// ─── Data Tab ─────────────────────────────────────────────────────────────────

function DataTab({ profile }: { profile: Profile }) {
  const { signOut } = useAuth()
  const supabase = createClient()
  const [exporting, setExporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const { data: tradeCount } = useQuery({
    queryKey: ['trade-count', profile.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
      return count ?? 0
    },
  })

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', profile.id)
        .order('opened_at', { ascending: false })

      if (error) throw error

      const rows = trades as TradeRow[]

      const headers = [
        'ID', 'Instrument', 'Direction', 'Entry Price', 'Exit Price',
        'Stop Loss', 'Take Profit', 'Lot Size', 'Pips', 'P&L',
        'Status', 'Session', 'Strategy', 'Notes', 'Opened At', 'Closed At',
      ]

      const csvRows = [
        headers.join(','),
        ...rows.map(t => [
          t.id,
          t.instrument,
          t.direction,
          t.entry_price,
          t.exit_price ?? '',
          '',
          '',
          t.lot_size,
          t.pips ?? '',
          t.profit_loss ?? '',
          t.status,
          '',
          '',
          '',
          t.opened_at,
          t.closed_at ?? '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ]

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aiov-capital-trades-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Trades exported successfully')
    } catch (err) {
      toast.error('Failed to export trades')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Data & Privacy" description="Export your data or manage your account." />

      {/* Account Info */}
      <div
        className="card"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Member Since</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '0.25rem', fontWeight: 500 }}>
            {memberSince}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Total Trades</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '0.25rem', fontWeight: 500 }}>
            {tradeCount ?? '—'}
          </p>
        </div>
      </div>

      {/* Export */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          Export Data
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.875rem' }}>
          Download all your trading history as a CSV file.
        </p>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export All Trades (CSV)'}
        </button>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
        }}
      >
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-negative)', marginBottom: '0.5rem' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.875rem' }}>
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            color: 'var(--color-negative)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: 440,
              width: '100%',
            }}
          >
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Account deletion is handled by our support team to ensure proper data removal. Please contact{' '}
              <a href="mailto:support@aiovcapital.com" style={{ color: 'var(--color-accent-gold)' }}>
                support@aiovcapital.com
              </a>{' '}
              with your request.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <FieldLabel>Type DELETE to confirm you understand</FieldLabel>
              <TextInput
                value={deleteText}
                onChange={setDeleteText}
                placeholder="DELETE"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowDeleteDialog(false); setDeleteText('') }}
              >
                Cancel
              </button>
              <button
                disabled={deleteText !== 'DELETE'}
                onClick={async () => {
                  toast.success('Request noted. Contact support@aiovcapital.com to complete deletion.')
                  setShowDeleteDialog(false)
                  setDeleteText('')
                  await signOut()
                }}
                style={{
                  background: deleteText === 'DELETE' ? 'var(--color-negative)' : 'rgba(239,68,68,0.3)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  color: '#fff',
                  fontSize: 'var(--text-sm)',
                  cursor: deleteText === 'DELETE' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data' },
]

export default function SettingsPage() {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '2px solid var(--color-border-default)',
              borderTopColor: 'var(--color-accent-gold)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
        You must be signed in to view settings.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-eyebrow" style={{ marginBottom: '0.375rem' }}>Configuration</p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.125rem',
          background: 'var(--color-bg-elevated)',
          borderRadius: '0.5rem',
          padding: '0.25rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: 80,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              transition: 'all 0.15s',
              background: activeTab === tab.id ? 'var(--color-bg-overlay, #1a1c21)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="card"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.75rem',
        }}
      >
        {activeTab === 'profile' && <ProfileTab profile={profile} />}
        {activeTab === 'account' && <AccountTab profile={profile} />}
        {activeTab === 'referrals' && <ReferralsTab profile={profile} />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'data' && <DataTab profile={profile} />}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
