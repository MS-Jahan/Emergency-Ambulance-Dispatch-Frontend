import Link from 'next/link'
import { Phone, Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-white">
            <Siren className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">RapidAid</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="tel:999"
            className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-signal px-2"
          >
            <Phone className="h-4 w-4" /> 999
          </a>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="outline"
            className="h-9 px-4 border-ink/30 bg-transparent text-ink hover:bg-muted"
          >
            Sign in
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/register" />}
            className="hidden sm:inline-flex h-9 px-4 bg-signal text-white hover:bg-signal/90"
          >
            Get started
          </Button>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-5 px-4 pb-2.5 overflow-x-auto" aria-label="Primary mobile">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm text-slate hover:text-ink whitespace-nowrap">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
