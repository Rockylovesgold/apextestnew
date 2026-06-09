'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
// import GoldGradientText from '@/components/ui/GoldGradientText'

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithApple, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await signIn(email, password)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-base)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--color-accent-gold-glow), transparent)' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-accent-gold)' }}>
              <span className="text-black font-bold text-sm">AG</span>
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>AIOV Capital</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to your trading account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}>
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
            >
              {/* Google icon */}
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={signInWithApple}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
            >
              {/* Apple icon */}
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.4-150.9-99.6C113.6 862.5 55.6 760 55.6 648.2c0-191.6 124.5-292.7 247.5-292.7 77 0 141 50.5 188.9 50.5 45.8 0 117.7-53.5 204.7-53.5zm-87.4-227.5c37.2-44.4 64.2-106.2 64.2-168 0-8.9-.6-17.9-2.2-25.8-59.9 2.2-131.2 40-176.7 91.9-34.4 39.2-66.2 105.2-66.2 168.1 0 9.5 1.7 19.1 2.2 22.2 4.5.6 11.7 1.7 18.9 1.7 53.3 0 120.4-35.6 159.8-90z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>or email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Password
                </label>
                <Link href="/auth/reset-password" className="text-xs hover:underline" style={{ color: 'var(--color-accent-gold)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-text-inverse)',
                boxShadow: '0 4px 16px rgba(54,128,255,0.25)',
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium hover:underline" style={{ color: 'var(--color-accent-gold)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
