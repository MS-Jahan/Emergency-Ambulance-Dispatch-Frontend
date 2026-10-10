'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, Phone } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/store'
import { useLogout } from '@/lib/hooks'
import type { User } from '@/types/api'
import { adminNav, driverNav, patientNav, type NavItem } from './nav-config'

const NAV_BY_VARIANT = {
  sidebar: patientNav,
  minimal: driverNav,
  rail: adminNav,
} as const

function Brand() {
  return (
    <Link
      href="/"
      className="font-heading text-2xl leading-none text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      RapidAid
    </Link>
  )
}

function EmergencyPill() {
  return (
    <a
      href="tel:999"
      aria-label="Call 999 emergency line"
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-signal px-3.5 text-sm font-extrabold text-white transition-colors hover:bg-signal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Phone className="h-4 w-4" aria-hidden />
      999
    </a>
  )
}

function matches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

// The most specific nav item wins, so /dashboard/profile does not also
// light up the /dashboard tab.
function isActive(pathname: string, href: string, items: NavItem[]) {
  if (!matches(pathname, href)) return false
  return !items.some(
    (other) =>
      other.href.length > href.length && matches(pathname, other.href),
  )
}

function NavLinks({
  items,
  onNavigate,
  layout,
}: {
  items: NavItem[]
  onNavigate?: () => void
  layout: 'stack' | 'tabs' | 'rail' | 'pills'
}) {
  const pathname = usePathname()

  if (layout === 'rail') {
    return (
      <nav className="flex flex-col items-center gap-1 py-4">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href, items)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'text-slate hover:bg-brand-soft hover:text-ink'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>
    )
  }

  if (layout === 'pills') {
    return (
      <nav aria-label="Main" className="flex items-center gap-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href, items)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'text-ink hover:bg-brand-soft'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  const base =
    layout === 'tabs'
      ? 'flex flex-col items-center gap-1 px-4 py-1.5 text-xs'
      : 'flex items-center gap-3 px-4 py-2.5 text-sm'

  return (
    <nav className={layout === 'tabs' ? 'contents' : 'space-y-1'}>
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href, items)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`${base} rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? 'bg-brand text-brand-foreground'
                : 'text-slate hover:bg-brand-soft hover:text-ink'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function UserMenu({ user }: { user: User | null }) {
  const logoutMutation = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-full px-1.5 text-sm font-bold text-ink hover:bg-brand-soft md:pr-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-brand-foreground">
              {(user?.name ?? '?').charAt(0).toUpperCase()}
            </span>
            <span className="hidden md:inline max-w-[160px] truncate">
              {user?.name ?? 'Account'}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* GroupLabel must live inside a Group, otherwise Base UI throws error #31 */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate">{user?.name ?? 'Signed in'}</p>
            <p className="text-xs font-normal text-slate truncate">
              {user?.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          >
          <LogOut className="w-4 h-4 mr-2 text-signal" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface RoleShellProps {
  variant: keyof typeof NAV_BY_VARIANT
  children: React.ReactNode
}

// Nav item configs live in client land: icon components cannot cross the
// server/client boundary as props.
export function RoleShell({ variant, children }: RoleShellProps) {
  const nav = NAV_BY_VARIANT[variant]
  const user = useAuth((s) => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isRail = variant === 'rail'
  // Patient and driver shells use pill tabs in the top bar; admin keeps its rail.
  const topPills = !isRail
  const bottomTabs = variant === 'sidebar'

  return (
    <div className="min-h-screen bg-gauze print:bg-white print:min-h-0">
      {/* Top bar */}
      <header
        className={`sticky top-0 z-30 border-b border-hairline bg-paper print:hidden ${
          isRail ? 'pl-16 lg:pl-0' : ''
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            {isRail && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <Brand />
            {topPills && (
              <div className="hidden md:block">
                <NavLinks items={nav} layout="pills" />
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <EmergencyPill />
            <UserMenu user={user} />
          </div>
        </div>
        {/* Driver on phones: scrollable pill row (patient uses bottom tabs) */}
        {variant === 'minimal' && (
          <div className="overflow-x-auto px-4 pb-2.5 md:hidden">
            <NavLinks items={nav} layout="pills" />
          </div>
        )}
      </header>

      <div className={isRail ? 'flex' : ''}>
        {isRail && (
          <aside className="hidden lg:flex fixed inset-y-16 left-0 w-16 flex-col items-center bg-paper border-r border-hairline print:hidden">
            <NavLinks items={nav} layout="rail" />
          </aside>
        )}

        {/* Mobile drawer (admin rail) */}
        {isRail && mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-20 print:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-ink/40" />
            <aside
              className="absolute top-16 left-0 bottom-0 w-60 bg-paper border-r border-hairline p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <NavLinks items={nav} layout="stack" onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main
          className={`min-w-0 flex-1 pb-24 lg:pb-8 print:p-0 print:pb-0 ${isRail ? 'lg:pl-16 print:pl-0' : ''}`}
        >
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 print:max-w-none print:p-0 print:m-0">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tabs (patient shell) */}
      {bottomTabs && (
        <nav
          aria-label="Main"
          className="lg:hidden md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around border-t border-hairline bg-paper px-2 py-2 print:hidden"
        >
          <NavLinks items={nav} layout="tabs" />
        </nav>
      )}
    </div>
  )
}
