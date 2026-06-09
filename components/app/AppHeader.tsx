'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/trades': 'Trade Tracker',
  '/analytics': 'Analytics',
  '/leaderboard': 'Leaderboard',
  '/learn': 'Education',
  '/support': 'Support',
  '/settings': 'Settings',
  '/manager': 'Manager Dashboard',
  '/manager/referrals': 'My Referrals',
  '/manager/tickets': 'My Tickets',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Users',
  '/admin/referrals': 'Referrals',
  '/admin/managers': 'Managers',
  '/admin/tickets': 'Tickets',
  '/admin/education': 'Education Builder',
}

export default function AppHeader() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const title = Object.entries(pageTitles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname.startsWith(key))?.[1] || 'AIOV Capital'

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(10, 11, 13, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
      className="lg:pl-[280px]"
    >
      {/* Left: Mobile logo + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link
          href="/"
          className="lg:hidden"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            border: '1px solid var(--color-border-emphasis)',
            background: 'var(--color-bg-elevated)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--color-accent-gold)',
            }}
          >
            AG
          </span>
        </Link>

        <h1
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          aria-label="Notifications"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-elevated)'
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <Bell size={16} strokeWidth={1.75} />
        </button>

        <Link
          href="/settings"
          aria-label="Profile settings"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--color-border-emphasis)',
            background: 'var(--color-bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-accent-gold)',
            letterSpacing: '0.02em',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(54,128,255,0.4)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(54,128,255,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-emphasis)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {initials}
        </Link>
      </div>
    </header>
  )
}
