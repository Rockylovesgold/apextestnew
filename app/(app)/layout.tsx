import AppSidebar from '@/components/app/AppSidebar'
import AppHeader from '@/components/app/AppHeader'
import MobileNav from '@/components/app/MobileNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6" style={{ maxWidth: '100%' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
