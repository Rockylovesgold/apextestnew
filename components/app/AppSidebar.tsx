'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, BarChart3, Trophy,
  BookOpen, LifeBuoy, Settings, LogOut,
  Users, Tag, MessageSquare, GraduationCap, ShieldCheck,
  type LucideIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const memberNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trade Tracker', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/learn', label: 'Education', icon: BookOpen },
  { href: '/support', label: 'Support', icon: LifeBuoy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const managerNav = [
  { href: '/manager', label: 'Manager Dashboard', icon: ShieldCheck },
  { href: '/manager/referrals', label: 'My Referrals', icon: Tag },
  { href: '/manager/tickets', label: 'My Tickets', icon: MessageSquare },
]

const adminNav = [
  { href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/referrals', label: 'Referrals', icon: Tag },
  { href: '/admin/managers', label: 'Managers', icon: Users },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  { href: '/admin/education', label: 'Education', icon: GraduationCap },
]

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: LucideIcon
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '44px',
        padding: '0 12px',
        borderRadius: '10px',
        borderLeft: isActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
        background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 450,
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
        letterSpacing: '0.005em',
        boxShadow: isActive ? 'var(--shadow-card)' : 'none',
        marginLeft: isActive ? '-1px' : '0',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-bg-elevated)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }
      }}
    >
      <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
      <span style={{ flex: 1 }}>{label}</span>
    </Link>
  )
}

function NavGroup({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string; icon: LucideIcon }[]
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p
        style={{
          padding: '0 12px',
          marginBottom: '4px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          opacity: 0.6,
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {items.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const { profile, signOut, isAdmin, isManager } = useAuth()

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const roleName = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Member'

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '256px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border-subtle)',
        zIndex: 100,
      }}
      className="hidden lg:flex"
    >
      {/* Logo lockup */}
      <div
        style={{
          padding: '0 20px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--color-border-emphasis)',
              background: 'var(--color-bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--color-accent-gold)',
              }}
            >
              AIOV
            </span>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              AIOV Capital
            </div>
            <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Trading
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
        <NavGroup label="Platform" items={memberNav} />

        {isManager && !isAdmin && (
          <NavGroup label="Manager" items={managerNav} />
        )}

        {isAdmin && (
          <NavGroup label="Administration" items={adminNav} />
        )}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}
      >
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            height: '48px',
            padding: '0 10px',
            borderRadius: '10px',
            textDecoration: 'none',
            transition: 'background var(--transition-fast)',
            marginBottom: '2px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-elevated)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-border-emphasis)',
              background: 'var(--color-bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-accent-gold)',
              letterSpacing: '0.02em',
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile?.display_name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {roleName}
            </div>
          </div>
        </Link>

        <button
          onClick={signOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            height: '40px',
            padding: '0 10px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontWeight: 450,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            letterSpacing: '0.005em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-elevated)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <LogOut size={15} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
