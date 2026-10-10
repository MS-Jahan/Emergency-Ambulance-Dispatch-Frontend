'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
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
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/rapidaid-logo.svg"
        alt="RapidAid"
        width={32}
        height={32}
        className="rounded-lg shadow-sm"
      />
      <span className="font-bold text-ink hidden sm:inline">RapidAid</span>
    </Link>
  )
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLinks({
  items,
  onNavigate,
  layout,
}: {
  items: NavItem[]
  onNavigate?: () => void
  layout: 'stack' | 'tabs' | 'rail'
}) {
  const pathname = usePathname()

  if (layout === 'rail') {
    return (
      <nav className="flex flex-col items-center gap-1 py-4">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                active
                  ? 'bg-ink text-paper'
                  : 'text-slate hover:bg-gauze hover:text-ink'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>
    )
  }

  const base =
    layout === 'tabs'
      ? 'flex flex-col items-center gap-1 px-3 py-2 text-xs'
      : 'flex items-center gap-3 px-3 py-2 text-sm'

  return (
    <nav className={layout === 'tabs' ? 'contents' : 'space-y-1'}>
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`${base} rounded-lg transition-colors ${
              active
                ? 'bg-ink text-paper font-medium'
                : 'text-slate hover:bg-gauze hover:text-ink'
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
            className="h-9 px-3 gap-2 text-sm text-ink hover:bg-gauze"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-oxygen text-white text-xs font-bold">
              {(user?.name ?? '?').charAt(0).toUpperCase()}
            </span>
            <span className="hidden md:inline max-w-[160px] truncate">
              {user?.name ?? 'Account'}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{user?.name ?? 'Signed in'}</p>
          <p className="text-xs font-normal text-slate truncate">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-signal focus:text-signal"
        >
          <LogOut className="w-4 h-4 mr-2" />
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

  const showSidebar = variant !== 'minimal'
  const bottomTabs = variant === 'sidebar'

  return (
    <div className="min-h-screen bg-gauze">
      {/* Top bar */}
      <header
        className={`sticky top-0 z-30 bg-paper border-b border-hairline ${
          variant === 'rail' ? 'pl-16 lg:pl-0' : ''
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {showSidebar && (
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
          </div>
          <UserMenu user={user} />
        </div>
      </header>

      <div className={variant === 'rail' ? 'flex' : ''}>
        {/* Desktop sidebar / rail */}
        {showSidebar && variant === 'sidebar' && (
          <aside className="hidden lg:flex fixed inset-y-14 left-0 w-60 flex-col bg-paper border-r border-hairline p-3 overflow-y-auto">
            <NavLinks items={nav} layout="stack" />
          </aside>
        )}
        {variant === 'rail' && (
          <aside className="hidden lg:flex fixed inset-y-14 left-0 w-16 flex-col items-center bg-paper border-r border-hairline">
            <NavLinks items={nav} layout="rail" />
          </aside>
        )}

        {/* Mobile drawer */}
        {showSidebar && mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-20" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-ink/40" />
            <aside
              className="absolute top-14 left-0 bottom-14 w-60 bg-paper border-r border-hairline p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <NavLinks items={nav} layout="stack" onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main
          className={`min-w-0 flex-1 pb-20 lg:pb-8 ${
            variant === 'sidebar' ? 'lg:pl-60' : variant === 'rail' ? 'lg:pl-16' : ''
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tabs (patient shell) */}
      {bottomTabs && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-paper border-t border-hairline flex justify-around py-1">
          <NavLinks items={nav} layout="tabs" />
        </nav>
      )}
    </div>
  )
}
