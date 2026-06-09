'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const { resetPassword, updatePassword } = useAuth()
  const searchParams = useSearchParams()
  const isRecovery = searchParams.get('type') === 'recovery'

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Failed to send reset email')
    } else {
      setSuccess(true)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    const result = await updatePassword(newPassword)
    setLoading(false)
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Failed to update password')
    } else {
      setSuccess(true)
    }
  }

  if (success && !isRecovery) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22C55E' }}>
          <CheckCircle size={32} color="#22C55E" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Email sent!</h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Check <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong> for a password reset link.
        </p>
        <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent-gold)' }}>
          Back to login
        </Link>
      </div>
    )
  }

  if (success && isRecovery) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22C55E' }}>
          <CheckCircle size={32} color="#22C55E" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Password updated!</h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Your password has been successfully updated.</p>
        <Link href="/auth/login"
          className="inline-block py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
          style={{ background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)' }}>
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-gold)' }}>
            <span className="text-black font-bold text-sm">AG</span>
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>AIOV Capital</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {isRecovery ? 'Set new password' : 'Reset password'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isRecovery ? 'Enter your new password below' : "Enter your email and we'll send a reset link"}
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}>
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isRecovery ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)' }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Confirm new password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--color-accent-gold)', color: 'var(--color-text-inverse)' }}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent-gold)' }}>
          ← Back to login
        </Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-base)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--color-accent-gold-glow), transparent)' }} />
      </div>
      <div className="w-full max-w-md relative">
        <Suspense fallback={<div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
