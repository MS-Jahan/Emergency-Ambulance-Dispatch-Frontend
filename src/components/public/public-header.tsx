import Link from 'next/link'
import { Phone } from 'lucide-react'
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
    <header className="sticky top-0 z-40 border-b border-hairline bg-gauze/90 backdrop-blur supports-[backdrop-filter]:bg-gauze/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-heading text-2xl leading-none text-brand rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            RapidAid
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate transition-colors hover:bg-brand-soft hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:999"
            aria-label="Call 999 emergency line"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-signal px-3.5 text-sm font-bold text-white hover:bg-signal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden /> 999
          </a>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            className="h-9 px-4"
          >
            Sign in
          </Button>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-1 px-3 pb-2.5 overflow-x-auto" aria-label="Primary mobile">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-1 text-sm text-slate whitespace-nowrap hover:bg-brand-soft hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
