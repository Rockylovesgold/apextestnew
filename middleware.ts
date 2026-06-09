import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/trades',
  '/analytics',
  '/leaderboard',
  '/learn',
  '/support',
  '/settings',
  '/manager',
  '/admin',
]

const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Detect Supabase session cookie (format: sb-<project-ref>-auth-token)
  const allCookies = request.cookies.getAll()
  const hasSession = allCookies.some(
    (c) =>
      c.name.includes('-auth-token') ||
      c.name === 'sb-access-token' ||
      c.name === 'supabase-auth-token'
  )

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users to login
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
