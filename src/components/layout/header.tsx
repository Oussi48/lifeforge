'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Target, 
  Utensils, 
  BarChart3, 
  Settings,
  Flame,
  LogOut,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useHabitsStore } from '@/stores/habits-store'
import { Button } from '@/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/dashboard/habits', labelKey: 'habits' as const, icon: Target },
  { href: '/dashboard/nutrition', labelKey: 'nutrition' as const, icon: Utensils },
  { href: '/dashboard/analytics', labelKey: 'analytics' as const, icon: BarChart3 },
  { href: '/dashboard/settings', labelKey: 'settings' as const, icon: Settings },
]

function getNavLabel(t: any, key: string): string {
  return t?.nav?.[key] || key
}

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const { getTotalStreak } = useHabitsStore()
  const streak = getTotalStreak()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                LF
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">LifeForge</span>
            </Link>
            
            {streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium">
                <Flame className="h-4 w-4" />
                <span>{streak}</span>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {getNavLabel(t, item.labelKey)}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
                <Dialog.Content className="fixed right-0 top-0 bottom-0 w-64 bg-background z-50 p-4 animate-in slide-in-from-right duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-bold text-lg">{t.nav.menu}</span>
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon">✕</Button>
                    </Dialog.Close>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {getNavLabel(t, item.labelKey)}
                        </Link>
                      )
                    })}
                  </nav>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-sm text-muted-foreground mb-2 truncate">{user?.email}</div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t.auth.signOut}
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div className="hidden sm:block text-sm">
              <span className="text-muted-foreground hidden lg:inline">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
                <span className="text-xs">{getNavLabel(t, item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}