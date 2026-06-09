'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Trophy, BookOpen, Settings } from 'lucide-react'

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: TrendingUp },
  { href: '/leaderboard', label: 'Board', icon: Trophy },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10, 11, 13, 0.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                height: '56px',
                minHeight: '44px',
                position: 'relative',
                textDecoration: 'none',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                opacity: isActive ? 1 : 0.65,
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* Active top indicator */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '2px',
                    borderRadius: '0 0 2px 2px',
                    background: 'var(--color-accent-gold)',
                  }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 450,
                  letterSpacing: '0.03em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
